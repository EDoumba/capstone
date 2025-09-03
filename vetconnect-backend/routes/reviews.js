const express = require('express');
const router = express.Router();
const {
  createReview,
  getVetReviews,
  updateReview,
  deleteReview
} = require('../controllers/reviewController');
const { auth } = require('../middleware/auth');

router.post('/', auth, createReview);
router.get('/vet/:vet_id', getVetReviews);
router.put('/:id', auth, updateReview);
router.delete('/:id', auth, deleteReview);

module.exports = router;