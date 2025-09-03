const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateUserProfile,
  changePassword,
  deleteUserAccount,
  getUserDashboard,
  getLanguages,
  updateUserPreferences
} = require('../controllers/userController');
const { auth } = require('../middleware/auth');

// User profile routes
router.get('/profile/:id', auth, getUserProfile);
router.put('/profile/:id', auth, updateUserProfile);
router.put('/change-password', auth, changePassword);
router.delete('/:id', auth, deleteUserAccount);

// Dashboard routes
router.get('/dashboard', auth, getUserDashboard);

// Preferences routes
router.get('/languages', getLanguages);
router.get('/preferences', auth, async (req, res) => {
  // This will be handled by getUserProfile since preferences are included
  const { UserPreference, Language } = require('../models');
  try {
    const preferences = await UserPreference.findOne({
      where: { user_id: req.user.id },
      include: [{
        model: Language,
        as: 'language',
        attributes: ['code', 'name']
      }]
    });

    if (!preferences) {
      // Create default preferences if they don't exist
      const newPreferences = await UserPreference.create({
        user_id: req.user.id,
        language_code: 'en',
        email_notifications: true
      });

      const preferencesWithLanguage = await UserPreference.findOne({
        where: { id: newPreferences.id },
        include: [{
          model: Language,
          as: 'language',
          attributes: ['code', 'name']
        }]
      });

      return res.json(preferencesWithLanguage);
    }

    res.json(preferences);
  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({ message: 'Server error while fetching preferences' });
  }
});
router.put('/preferences', auth, updateUserPreferences);

module.exports = router;