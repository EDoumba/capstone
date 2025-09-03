const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getAllAppointments
} = require('../controllers/adminController');
const { auth, adminAuth } = require('../middleware/auth');

router.get('/dashboard/stats', auth, adminAuth, getDashboardStats);
router.get('/users', auth, adminAuth, getAllUsers);
router.get('/users/:id', auth, adminAuth, getUserById);
router.put('/users/:id', auth, adminAuth, updateUser);
router.delete('/users/:id', auth, adminAuth, deleteUser);
router.get('/appointments', auth, adminAuth, getAllAppointments);

module.exports = router;