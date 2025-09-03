const { User, Appointment, Review, Favorite, sequelize } = require('../models');
const { Op } = require('sequelize');

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalVets,
      totalClients,
      totalAppointments,
      pendingAppointments,
      completedAppointments,
      totalReviews,
      totalFavorites
    ] = await Promise.all([
      User.count(),
      User.count({ where: { user_type: 'vet' } }),
      User.count({ where: { user_type: 'client' } }),
      Appointment.count(),
      Appointment.count({ where: { status: 'scheduled' } }),
      Appointment.count({ where: { status: 'completed' } }),
      Review.count(),
      Favorite.count()
    ]);

    // Get recent appointments
    const recentAppointments = await Appointment.findAll({
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
      order: [['created_at', 'DESC']],
      limit: 10
    });

    // Get monthly appointment data for charts
    const monthlyAppointments = await Appointment.findAll({
      attributes: [
        [sequelize.fn('YEAR', sequelize.col('appointment_date')), 'year'],
        [sequelize.fn('MONTH', sequelize.col('appointment_date')), 'month'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: {
        appointment_date: {
          [Op.gte]: new Date(new Date().setFullYear(new Date().getFullYear() - 1)) // Last 12 months
        }
      },
      group: ['year', 'month'],
      order: [['year', 'ASC'], ['month', 'ASC']],
      raw: true
    });

    // Get top rated vets
    const topRatedVets = await User.findAll({
      where: { user_type: 'vet', rating: { [Op.gt]: 0 } },
      attributes: ['id', 'first_name', 'last_name', 'specialty', 'rating', 'city', 'state'],
      order: [['rating', 'DESC']],
      limit: 5
    });

    res.json({
      stats: {
        totalUsers,
        totalVets,
        totalClients,
        totalAppointments,
        pendingAppointments,
        completedAppointments,
        totalReviews,
        totalFavorites
      },
      recentAppointments,
      monthlyAppointments,
      topRatedVets
    });
  } catch (error) {
    console.error('Get admin dashboard stats error:', error);
    res.status(500).json({ message: 'Server error while fetching dashboard statistics' });
  }
};

// Get all users with pagination
const getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      user_type,
      search
    } = req.query;

    const offset = (page - 1) * limit;
    
    // Build where clause for filters
    const whereClause = {};
    
    if (user_type) {
      whereClause.user_type = user_type;
    }
    
    if (search) {
      whereClause[Op.or] = [
        { first_name: { [Op.like]: `%${search}%` } },
        { last_name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { specialty: { [Op.like]: `%${search}%` } },
        { city: { [Op.like]: `%${search}%` } }
      ];
    }

    const users = await User.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ['password'] },
      limit: parseInt(limit),
      offset: offset,
      order: [['created_at', 'DESC']]
    });

    res.json({
      users: users.rows,
      totalPages: Math.ceil(users.count / limit),
      currentPage: parseInt(page),
      totalUsers: users.count
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Server error while fetching users' });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Appointment,
          as: 'client_appointments',
          include: [{
            model: User,
            as: 'vet',
            attributes: ['id', 'first_name', 'last_name', 'profile_picture', 'specialty']
          }],
          limit: 5,
          order: [['appointment_date', 'DESC']]
        },
        {
          model: Appointment,
          as: 'vet_appointments',
          include: [{
            model: User,
            as: 'client',
            attributes: ['id', 'first_name', 'last_name', 'profile_picture']
          }],
          limit: 5,
          order: [['appointment_date', 'DESC']]
        },
        {
          model: Review,
          as: 'written_reviews',
          include: [{
            model: User,
            as: 'vet',
            attributes: ['id', 'first_name', 'last_name', 'profile_picture']
          }],
          limit: 5,
          order: [['created_at', 'DESC']]
        },
        {
          model: Review,
          as: 'received_reviews',
          include: [{
            model: User,
            as: 'client',
            attributes: ['id', 'first_name', 'last_name', 'profile_picture']
          }],
          limit: 5,
          order: [['created_at', 'DESC']]
        }
      ]
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error while fetching user' });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Don't allow password updates through this endpoint
    if (updateData.password) {
      delete updateData.password;
    }

    await user.update(updateData);

    const updatedUser = await User.findByPk(id, {
      attributes: { exclude: ['password'] }
    });

    res.json({
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error while updating user' });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Don't allow self-deletion
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }

    await user.destroy();

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error while deleting user' });
  }
};

// Get all appointments with filtering
const getAllAppointments = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      vet_id,
      client_id,
      start_date,
      end_date
    } = req.query;

    const offset = (page - 1) * limit;
    
    // Build where clause for filters
    const whereClause = {};
    
    if (status) {
      whereClause.status = status;
    }
    
    if (vet_id) {
      whereClause.vet_id = vet_id;
    }
    
    if (client_id) {
      whereClause.client_id = client_id;
    }
    
    if (start_date && end_date) {
      whereClause.appointment_date = {
        [Op.between]: [start_date, end_date]
      };
    } else if (start_date) {
      whereClause.appointment_date = {
        [Op.gte]: start_date
      };
    } else if (end_date) {
      whereClause.appointment_date = {
        [Op.lte]: end_date
      };
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
    console.error('Get all appointments error:', error);
    res.status(500).json({ message: 'Server error while fetching appointments' });
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getAllAppointments
};