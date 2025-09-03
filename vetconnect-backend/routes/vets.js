const express = require('express');
const router = express.Router();
const {
  getAllVets,
  getVetById,
  updateVetProfile,
  getVetDashboard
} = require('../controllers/vetController');
const { auth, vetAuth } = require('../middleware/auth');

// Dashboard doit venir avant la route /:id
router.get('/:id/dashboard', auth, vetAuth, getVetDashboard);

// Routes
router.get('/', getAllVets);
router.get('/:id', getVetById);
router.put('/:id', auth, updateVetProfile);

module.exports = router;
