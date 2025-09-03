const { User, UserPreference, Language, Appointment, Review, Favorite, sequelize } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: UserPreference,
          as: 'preferences',
          include: [{
            model: Language,
            as: 'language',
            attributes: ['code', 'name']
          }]
        }
      ]
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Only allow users to view their own profile or admin to view any profile
    if (req.user.id !== parseInt(id) && req.user.user_type !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Server error while fetching user profile' });
  }
};

// Update user profile
const updateUserProfile = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user is updating their own profile or is admin
    if (req.user.id !== parseInt(id) && req.user.user_type !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const {
      first_name,
      last_name,
      profile_picture,
      bio,
      specialty,
      address,
      city,
      state,
      zip_code,
      latitude,
      longitude,
      preferences
    } = req.body;

    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user info
    await user.update({
      first_name: first_name || user.first_name,
      last_name: last_name || user.last_name,
      profile_picture: profile_picture || user.profile_picture,
      bio: bio !== undefined ? bio : user.bio,
      specialty: specialty !== undefined ? specialty : user.specialty,
      address: address || user.address,
      city: city || user.city,
      state: state || user.state,
      zip_code: zip_code || user.zip_code,
      latitude: latitude || user.latitude,
      longitude: longitude || user.longitude
    });

    // Update preferences if provided
    if (preferences) {
      const userPreference = await UserPreference.findOne({ where: { user_id: id } });
      
      if (userPreference) {
        await userPreference.update({
          language_code: preferences.language_code || userPreference.language_code,
          email_notifications: preferences.email_notifications !== undefined 
            ? preferences.email_notifications 
            : userPreference.email_notifications
        });
      } else {
        await UserPreference.create({
          user_id: id,
          language_code: preferences.language_code || 'en',
          email_notifications: preferences.email_notifications !== undefined 
            ? preferences.email_notifications 
            : true
        });
      }
    }

    // Get updated user with preferences
    const updatedUser = await User.findByPk(id, {
      attributes: { exclude: ['password'] },
      include: [{
        model: UserPreference,
        as: 'preferences',
        include: [{
          model: Language,
          as: 'language',
          attributes: ['code', 'name']
        }]
      }]
    });

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({ message: 'Server error while updating profile' });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await user.update({ password: hashedPassword });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error while changing password' });
  }
};

// Delete user account
const deleteUserAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    // Check if user is deleting their own account or is admin
    if (req.user.id !== parseInt(id) && req.user.user_type !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // For non-admin users, verify password
    if (req.user.user_type !== 'admin') {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Password is incorrect' });
      }
    }

    // Delete user (this will cascade delete related records due to foreign key constraints)
    await user.destroy();

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete user account error:', error);
    res.status(500).json({ message: 'Server error while deleting account' });
  }
};

// Get user dashboard
const getUserDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));
    const endOfToday = new Date(today.setHours(23, 59, 59, 999));

    const [
      totalAppointments,
      todayAppointments,
      upcomingAppointmentsCount,
      favoriteVetsCount
    ] = await Promise.all([
      Appointment.count({ where: { client_id: userId } }),
      Appointment.count({
        where: {
          client_id: userId,
          appointment_date: {
            [Op.between]: [startOfToday, endOfToday]
          }
        }
      }),
      Appointment.count({
        where: {
          client_id: userId,
          appointment_date: { [Op.gte]: startOfToday },
          status: 'scheduled'
        }
      }),
      Favorite.count({ where: { client_id: userId } })
    ]);

    // Get upcoming appointments
    const upcomingAppointments = await Appointment.findAll({
      where: {
        client_id: userId,
        appointment_date: { [Op.gte]: startOfToday },
        status: 'scheduled'
      },
      include: [{
        model: User,
        as: 'vet',
        attributes: ['id', 'first_name', 'last_name', 'profile_picture', 'specialty']
      }],
      order: [['appointment_date', 'ASC'], ['start_time', 'ASC']],
      limit: 5
    });

    // Get recent reviews
    const recentReviews = await Review.findAll({
      where: { client_id: userId },
      include: [{
        model: User,
        as: 'vet',
        attributes: ['id', 'first_name', 'last_name', 'profile_picture']
      }],
      order: [['created_at', 'DESC']],
      limit: 5
    });

    res.json({
      stats: {
        totalAppointments,
        todayAppointments,
        upcomingAppointmentsCount,
        favoriteVetsCount
      },
      upcomingAppointments,
      recentReviews
    });
  } catch (error) {
    console.error('Get user dashboard error:', error);
    res.status(500).json({ message: 'Server error while fetching user dashboard' });
  }
};

// Get all languages
const getLanguages = async (req, res) => {
  try {
    const languages = await Language.findAll({
      order: [['name', 'ASC']]
    });

    res.json(languages);
  } catch (error) {
    console.error('Get languages error:', error);
    res.status(500).json({ message: 'Server error while fetching languages' });
  }
};

// Update user preferences
const updateUserPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const { language_code, email_notifications } = req.body;

    let userPreference = await UserPreference.findOne({ where: { user_id: userId } });
    
    if (userPreference) {
      await userPreference.update({
        language_code: language_code || userPreference.language_code,
        email_notifications: email_notifications !== undefined 
          ? email_notifications 
          : userPreference.email_notifications
      });
    } else {
      userPreference = await UserPreference.create({
        user_id: userId,
        language_code: language_code || 'en',
        email_notifications: email_notifications !== undefined ? email_notifications : true
      });
    }

    // Get updated preferences with language details
    const updatedPreferences = await UserPreference.findOne({
      where: { user_id: userId },
      include: [{
        model: Language,
        as: 'language',
        attributes: ['code', 'name']
      }]
    });

    res.json({
      message: 'Preferences updated successfully',
      preferences: updatedPreferences
    });
  } catch (error) {
    console.error('Update user preferences error:', error);
    res.status(500).json({ message: 'Server error while updating preferences' });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  changePassword,
  deleteUserAccount,
  getUserDashboard,
  getLanguages,
  updateUserPreferences
};