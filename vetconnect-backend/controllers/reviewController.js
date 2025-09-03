const { Review, User, Appointment } = require('../models');
const { Op } = require('sequelize');

// Create a review
const createReview = async (req, res) => {
  try {
    const { vet_id, rating, comment } = req.body;
    const client_id = req.user.id;

    // Check if vet exists and is actually a vet
    const vet = await User.findOne({
      where: { id: vet_id, user_type: 'vet' }
    });

    if (!vet) {
      return res.status(404).json({ message: 'Vet not found' });
    }

    // Check if client has had an appointment with this vet
    const hasAppointment = await Appointment.findOne({
      where: {
        client_id,
        vet_id,
        status: 'completed'
      }
    });

    if (!hasAppointment) {
      return res.status(400).json({ message: 'You can only review vets you have completed appointments with' });
    }

    // Check if client has already reviewed this vet
    const existingReview = await Review.findOne({
      where: { client_id, vet_id }
    });

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this vet' });
    }

    // Create review
    const review = await Review.create({
      client_id,
      vet_id,
      rating,
      comment
    });

    // Update vet's average rating
    await updateVetRating(vet_id);

    // Get review with client details
    const newReview = await Review.findByPk(review.id, {
      include: [{
        model: User,
        as: 'client',
        attributes: ['id', 'first_name', 'last_name', 'profile_picture']
      }]
    });

    res.status(201).json({
      message: 'Review created successfully',
      review: newReview
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ message: 'Server error while creating review' });
  }
};

// Get reviews for a vet
const getVetReviews = async (req, res) => {
  try {
    const { vet_id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // Check if vet exists
    const vet = await User.findOne({
      where: { id: vet_id, user_type: 'vet' }
    });

    if (!vet) {
      return res.status(404).json({ message: 'Vet not found' });
    }

    const reviews = await Review.findAndCountAll({
      where: { vet_id },
      include: [{
        model: User,
        as: 'client',
        attributes: ['id', 'first_name', 'last_name', 'profile_picture']
      }],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });

    // Calculate average rating
    const avgRating = await Review.findOne({
      where: { vet_id },
      attributes: [[sequelize.fn('AVG', sequelize.col('rating')), 'avg_rating']],
      raw: true
    });

    res.json({
      reviews: reviews.rows,
      averageRating: avgRating?.avg_rating ? parseFloat(avgRating.avg_rating) : 0,
      totalReviews: reviews.count,
      totalPages: Math.ceil(reviews.count / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ message: 'Server error while fetching reviews' });
  }
};

// Update a review
const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    const review = await Review.findByPk(id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user owns this review
    if (review.client_id !== req.user.id && req.user.user_type !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    await review.update({
      rating: rating || review.rating,
      comment: comment !== undefined ? comment : review.comment
    });

    // Update vet's average rating
    await updateVetRating(review.vet_id);

    res.json({
      message: 'Review updated successfully',
      review
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ message: 'Server error while updating review' });
  }
};

// Delete a review
const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findByPk(id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user owns this review or is admin
    if (review.client_id !== req.user.id && req.user.user_type !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const vet_id = review.vet_id;
    await review.destroy();

    // Update vet's average rating
    await updateVetRating(vet_id);

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ message: 'Server error while deleting review' });
  }
};

// Helper function to update vet's average rating
const updateVetRating = async (vet_id) => {
  try {
    const avgRating = await Review.findOne({
      where: { vet_id },
      attributes: [[sequelize.fn('AVG', sequelize.col('rating')), 'avg_rating']],
      raw: true
    });

    await User.update(
      { rating: avgRating?.avg_rating ? parseFloat(avgRating.avg_rating) : 0 },
      { where: { id: vet_id } }
    );
  } catch (error) {
    console.error('Update vet rating error:', error);
  }
};

module.exports = {
  createReview,
  getVetReviews,
  updateReview,
  deleteReview
};