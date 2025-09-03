const { Appointment, User, VetAvailability, Notification } = require('../models');
const { Op } = require('sequelize');
const { sendAppointmentConfirmation } = require('../utils/emailService');

// Create new appointment
const createAppointment = async (req, res) => {
  try {
    const {
      vet_id,
      appointment_date,
      start_time,
      end_time,
      reason
    } = req.body;

    const client_id = req.user.id;

    // Check if vet exists and is actually a vet
    const vet = await User.findOne({
      where: { id: vet_id, user_type: 'vet' }
    });

    if (!vet) {
      return res.status(404).json({ message: 'Vet not found' });
    }

    // Check if the requested time slot is available
    const appointmentDate = new Date(appointment_date);
    const dayOfWeek = appointmentDate.getDay(); // 0 (Sunday) to 6 (Saturday)
    
    // Check vet availability for this day
    const vetAvailability = await VetAvailability.findOne({
      where: {
        vet_id,
        day_of_week: dayOfWeek,
        is_available: true
      }
    });

    if (!vetAvailability) {
      return res.status(400).json({ message: 'Vet is not available on this day' });
    }

    // Check if the requested time is within vet's working hours
    const requestedStartTime = new Date(`1970-01-01T${start_time}`);
    const requestedEndTime = new Date(`1970-01-01T${end_time}`);
    const vetStartTime = new Date(`1970-01-01T${vetAvailability.start_time}`);
    const vetEndTime = new Date(`1970-01-01T${vetAvailability.end_time}`);

    if (requestedStartTime < vetStartTime || requestedEndTime > vetEndTime) {
      return res.status(400).json({ 
        message: `Vet is only available from ${vetAvailability.start_time} to ${vetAvailability.end_time} on this day` 
      });
    }

    // Check for overlapping appointments
    const existingAppointment = await Appointment.findOne({
      where: {
        vet_id,
        appointment_date,
        [Op.or]: [
          {
            start_time: { [Op.lt]: end_time },
            end_time: { [Op.gt]: start_time }
          }
        ],
        status: { [Op.ne]: 'cancelled' }
      }
    });

    if (existingAppointment) {
      return res.status(400).json({ message: 'Time slot is already booked' });
    }

    // Create appointment
    const appointment = await Appointment.create({
      client_id,
      vet_id,
      appointment_date,
      start_time,
      end_time,
      reason,
      status: 'scheduled'
    });

    // Send confirmation email
    await sendAppointmentConfirmation(req.user.email, {
      date: appointment_date,
      time: start_time,
      vetName: `${vet.first_name} ${vet.last_name}`,
      reason: reason
    });

    // Create notification for vet
    await Notification.create({
      user_id: vet_id,
      title: 'New Appointment',
      message: `You have a new appointment scheduled with ${req.user.first_name} ${req.user.last_name} on ${appointment_date} at ${start_time}`,
      type: 'appointment',
      related_id: appointment.id
    });

    // Get appointment with client and vet details
    const newAppointment = await Appointment.findByPk(appointment.id, {
      include: [
        {
          model: User,
          as: 'client',
          attributes: ['id', 'first_name', 'last_name', 'profile_picture']
        },
        {
          model: User,
          as: 'vet',
          attributes: ['id', 'first_name', 'last_name', 'profile_picture', 'specialty']
        }
      ]
    });

    res.status(201).json({
      message: 'Appointment created successfully',
      appointment: newAppointment
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ message: 'Server error while creating appointment' });
  }
};

// Get appointments for current user
const getUserAppointments = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    
    if (req.user.user_type === 'client') {
      whereClause.client_id = userId;
    } else if (req.user.user_type === 'vet') {
      whereClause.vet_id = userId;
    } else {
      // Admin can see all appointments
      whereClause[Op.or] = [
        { client_id: userId },
        { vet_id: userId }
      ];
    }

    if (status) {
      whereClause.status = status;
    }

    const appointments = await Appointment.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'client',
          attributes: ['id', 'first_name', 'last_name', 'profile_picture']
        },
        {
          model: User,
          as: 'vet',
          attributes: ['id', 'first_name', 'last_name', 'profile_picture', 'specialty']
        }
      ],
      order: [['appointment_date', 'DESC'], ['start_time', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });

    res.json({
      appointments: appointments.rows,
      totalPages: Math.ceil(appointments.count / limit),
      currentPage: parseInt(page),
      totalAppointments: appointments.count
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ message: 'Server error while fetching appointments' });
  }
};

// Get appointment by ID
const getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findByPk(id, {
      include: [
        {
          model: User,
          as: 'client',
          attributes: { exclude: ['password'] }
        },
        {
          model: User,
          as: 'vet',
          attributes: { exclude: ['password'] }
        }
      ]
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if user has access to this appointment
    if (req.user.user_type !== 'admin' && 
        req.user.id !== appointment.client_id && 
        req.user.id !== appointment.vet_id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(appointment);
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({ message: 'Server error while fetching appointment' });
  }
};

// Update appointment status
const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const appointment = await Appointment.findByPk(id, {
      include: [
        {
          model: User,
          as: 'client',
          attributes: ['id', 'first_name', 'last_name', 'email']
        },
        {
          model: User,
          as: 'vet',
          attributes: ['id', 'first_name', 'last_name']
        }
      ]
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if user has permission to update this appointment
    const isVet = req.user.id === appointment.vet_id && req.user.user_type === 'vet';
    const isClient = req.user.id === appointment.client_id && req.user.user_type === 'client';
    const isAdmin = req.user.user_type === 'admin';

    if (!isVet && !isClient && !isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Clients can only cancel appointments
    if (isClient && status !== 'cancelled') {
      return res.status(403).json({ message: 'Clients can only cancel appointments' });
    }

    // Update appointment
    await appointment.update({
      status: status || appointment.status,
      notes: notes !== undefined ? notes : appointment.notes
    });

    // Create notification
    let notificationUserId, notificationTitle, notificationMessage;

    if (isVet || isAdmin) {
      // Notify client
      notificationUserId = appointment.client_id;
      notificationTitle = 'Appointment Updated';
      notificationMessage = `Your appointment with Dr. ${appointment.vet.last_name} has been updated to ${status}`;
    } else {
      // Notify vet
      notificationUserId = appointment.vet_id;
      notificationTitle = 'Appointment Cancelled';
      notificationMessage = `Your appointment with ${appointment.client.first_name} ${appointment.client.last_name} has been cancelled`;
    }

    await Notification.create({
      user_id: notificationUserId,
      title: notificationTitle,
      message: notificationMessage,
      type: 'appointment',
      related_id: appointment.id
    });

    res.json({
      message: 'Appointment updated successfully',
      appointment
    });
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({ message: 'Server error while updating appointment' });
  }
};

// Get available time slots for a vet on a specific date
const getAvailableSlots = async (req, res) => {
  try {
    const { vet_id, date } = req.params;
    
    const appointmentDate = new Date(date);
    const dayOfWeek = appointmentDate.getDay(); // 0 (Sunday) to 6 (Saturday)

    // Get vet's availability for this day
    const vetAvailability = await VetAvailability.findOne({
      where: {
        vet_id,
        day_of_week: dayOfWeek,
        is_available: true
      }
    });

    if (!vetAvailability) {
      return res.json({ availableSlots: [] });
    }

    // Get existing appointments for this date
    const existingAppointments = await Appointment.findAll({
      where: {
        vet_id,
        appointment_date: date,
        status: { [Op.ne]: 'cancelled' }
      },
      attributes: ['start_time', 'end_time']
    });

    // Generate available time slots (30-minute intervals)
    const availableSlots = [];
    const startTime = new Date(`1970-01-01T${vetAvailability.start_time}`);
    const endTime = new Date(`1970-01-01T${vetAvailability.end_time}`);
    const slotDuration = 30 * 60 * 1000; // 30 minutes in milliseconds

    let currentTime = startTime;
    
    while (currentTime < endTime) {
      const slotStart = currentTime.toTimeString().slice(0, 5);
      const slotEnd = new Date(currentTime.getTime() + slotDuration).toTimeString().slice(0, 5);

      // Check if this slot is already booked
      const isBooked = existingAppointments.some(appt => {
        const apptStart = new Date(`1970-01-01T${appt.start_time}`);
        const apptEnd = new Date(`1970-01-01T${appt.end_time}`);
        return currentTime < apptEnd && new Date(currentTime.getTime() + slotDuration) > apptStart;
      });

      if (!isBooked && new Date(currentTime.getTime() + slotDuration) <= endTime) {
        availableSlots.push({
          start_time: slotStart,
          end_time: slotEnd
        });
      }

      currentTime = new Date(currentTime.getTime() + slotDuration);
    }

    res.json({ availableSlots });
  } catch (error) {
    console.error('Get available slots error:', error);
    res.status(500).json({ message: 'Server error while fetching available slots' });
  }
};

module.exports = {
  createAppointment,
  getUserAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  getAvailableSlots
};