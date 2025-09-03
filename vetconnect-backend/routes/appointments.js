const express = require('express');
const router = express.Router();
const {
  createAppointment,
  getUserAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  getAvailableSlots
} = require('../controllers/appointmentController');
const { auth } = require('../middleware/auth');

router.post('/', auth, createAppointment);
router.get('/', auth, getUserAppointments);
router.get('/:id', auth, getAppointmentById);
router.put('/:id/status', auth, updateAppointmentStatus);
router.get('/:vet_id/available-slots/:date', auth, getAvailableSlots);

module.exports = router;