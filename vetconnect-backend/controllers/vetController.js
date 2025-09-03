const { User, VetAvailability, Review, Appointment, sequelize } = require('../models');
const { Op } = require('sequelize');

// Get all vets with filtering and pagination
const getAllVets = async (req, res) => {
  try {
    const { page = 1, limit = 10, specialty, city, state, minRating, search } = req.query;
    const offset = (page - 1) * limit;
    
    const whereClause = { user_type: 'vet' };
    
    if (specialty) whereClause.specialty = { [Op.like]: `%${specialty}%` };
    if (city) whereClause.city = { [Op.like]: `%${city}%` };
    if (state) whereClause.state = { [Op.like]: `%${state}%` };
    if (minRating) whereClause.rating = { [Op.gte]: parseFloat(minRating) };
    
    if (search) {
      whereClause[Op.or] = [
        { first_name: { [Op.like]: `%${search}%` } },
        { last_name: { [Op.like]: `%${search}%` } },
        { specialty: { [Op.like]: `%${search}%` } },
        { city: { [Op.like]: `%${search}%` } }
      ];
    }

    const vets = await User.findAndCountAll({
      where: whereClause,
      attributes: { 
        exclude: ['password'],
        include: [[
          sequelize.literal(`(
            SELECT COUNT(*) 
            FROM reviews 
            WHERE reviews.vet_id = User.id
          )`), 'review_count']]
      },
      include: [
        {
          model: VetAvailability,
          as: 'availabilities',
          attributes: ['day_of_week', 'start_time', 'end_time', 'is_available']
        }
      ],
      limit: parseInt(limit),
      offset: offset,
      order: [['rating', 'DESC']]
    });

    res.json({
      vets: vets.rows,
      totalPages: Math.ceil(vets.count / limit),
      currentPage: parseInt(page),
      totalVets: vets.count
    });
  } catch (error) {
    console.error('Get vets error:', error);
    res.status(500).json({ message: 'Server error while fetching vets' });
  }
};

// Get vet by ID
const getVetById = async (req, res) => {
  try {
    const { id } = req.params;

    const vet = await User.findOne({
      where: { id, user_type: 'vet' },
      attributes: { exclude: ['password'] },
      include: [
        { model: VetAvailability, as: 'availabilities', attributes: ['day_of_week', 'start_time', 'end_time', 'is_available'] },
        { model: Review, as: 'received_reviews', include: [{ model: User, as: 'client', attributes: ['id','first_name','last_name','profile_picture']}], order: [['created_at','DESC']], limit: 10 },
        { model: Appointment, as: 'vet_appointments', attributes: ['id','appointment_date','start_time','status'], limit: 5, order: [['appointment_date','DESC']] }
      ]
    });

    if (!vet) return res.status(404).json({ message: 'Vet not found' });
    res.json(vet);
  } catch (error) {
    console.error('Get vet error:', error);
    res.status(500).json({ message: 'Server error while fetching vet' });
  }
};

// Update vet profile
const updateVetProfile = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.id !== parseInt(id) && req.user.user_type !== 'admin') return res.status(403).json({ message: 'Access denied' });

    const { first_name,last_name,bio,specialty,address,city,state,zip_code,latitude,longitude,availabilities } = req.body;
    const vet = await User.findByPk(id);

    if (!vet || vet.user_type !== 'vet') return res.status(404).json({ message: 'Vet not found' });

    await vet.update({ first_name:first_name||vet.first_name, last_name:last_name||vet.last_name, bio:bio||vet.bio, specialty:specialty||vet.specialty, address:address||vet.address, city:city||vet.city, state:state||vet.state, zip_code:zip_code||vet.zip_code, latitude:latitude||vet.latitude, longitude:longitude||vet.longitude });

    if (availabilities && Array.isArray(availabilities)) {
      await VetAvailability.destroy({ where: { vet_id: id } });
      const availabilityData = availabilities.map(avail => ({
        vet_id: id,
        day_of_week: avail.day_of_week,
        start_time: avail.start_time,
        end_time: avail.end_time,
        is_available: avail.is_available !== false
      }));
      await VetAvailability.bulkCreate(availabilityData);
    }

    const updatedVet = await User.findByPk(id, { attributes: { exclude: ['password'] }, include: [{ model: VetAvailability, as: 'availabilities' }] });
    res.json({ message:'Vet profile updated successfully', vet: updatedVet });
  } catch (error) {
    console.error('Update vet error:', error);
    res.status(500).json({ message:'Server error while updating vet profile' });
  }
};

// Get vet dashboard stats
const getVetDashboard = async (req, res) => {
  try {
    const vetId = req.user.id;
    const today = new Date();
    const startOfToday = new Date(today.setHours(0,0,0,0));
    const endOfToday = new Date(today.setHours(23,59,59,999));

    const [totalAppointments, todayAppointments, pendingAppointments, averageRating, totalReviews] = await Promise.all([
      Appointment.count({ where: { vet_id: vetId } }),
      Appointment.count({ where: { vet_id: vetId, appointment_date: { [Op.between]: [startOfToday,endOfToday] } } }),
      Appointment.count({ where: { vet_id: vetId, status:'scheduled' } }),
      Review.findOne({ where:{vet_id:vetId}, attributes:[[sequelize.fn('AVG',sequelize.col('rating')),'avg_rating']], raw:true }),
      Review.count({ where:{vet_id:vetId} })
    ]);

    const upcomingAppointments = await Appointment.findAll({
      where: { vet_id:vetId, appointment_date:{[Op.gte]:startOfToday}, status:'scheduled' },
      include:[{ model:User, as:'client', attributes:['id','first_name','last_name','profile_picture'] }],
      order:[['appointment_date','ASC'],['start_time','ASC']],
      limit:5
    });

    const recentReviews = await Review.findAll({
      where:{vet_id:vetId},
      include:[{ model:User, as:'client', attributes:['id','first_name','last_name','profile_picture'] }],
      order:[['created_at','DESC']],
      limit:5
    });

    res.json({
      stats: { totalAppointments, todayAppointments, pendingAppointments, averageRating:averageRating?.avg_rating ? parseFloat(averageRating.avg_rating):0, totalReviews },
      upcomingAppointments,
      recentReviews
    });
  } catch (error) {
    console.error('Get vet dashboard error:', error);
    res.status(500).json({ message:'Server error while fetching vet dashboard' });
  }
};

module.exports = { getAllVets, getVetById, updateVetProfile, getVetDashboard };
