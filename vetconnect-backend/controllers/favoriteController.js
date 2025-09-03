const { Favorite, User } = require('../models');

// Add vet to favorites
const addFavorite = async (req, res) => {
  try {
    const { vet_id } = req.body;
    const client_id = req.user.id;

    // Check if vet exists and is actually a vet
    const vet = await User.findOne({
      where: { id: vet_id, user_type: 'vet' }
    });

    if (!vet) {
      return res.status(404).json({ message: 'Vet not found' });
    }

    // Check if already favorited
    const existingFavorite = await Favorite.findOne({
      where: { client_id, vet_id }
    });

    if (existingFavorite) {
      return res.status(400).json({ message: 'Vet is already in your favorites' });
    }

    // Add to favorites
    const favorite = await Favorite.create({
      client_id,
      vet_id
    });

    // Get favorite with vet details
    const newFavorite = await Favorite.findByPk(favorite.id, {
      include: [{
        model: User,
        as: 'vet',
        attributes: { exclude: ['password'] },
        include: [{
          model: User,
          as: 'received_reviews',
          attributes: [],
          duplicating: false
        }]
      }]
    });

    res.status(201).json({
      message: 'Vet added to favorites',
      favorite: newFavorite
    });
  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(500).json({ message: 'Server error while adding favorite' });
  }
};

// Remove vet from favorites
const removeFavorite = async (req, res) => {
  try {
    const { vet_id } = req.params;
    const client_id = req.user.id;

    const favorite = await Favorite.findOne({
      where: { client_id, vet_id }
    });

    if (!favorite) {
      return res.status(404).json({ message: 'Favorite not found' });
    }

    await favorite.destroy();

    res.json({ message: 'Vet removed from favorites' });
  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({ message: 'Server error while removing favorite' });
  }
};

// Get user's favorites
const getFavorites = async (req, res) => {
  try {
    const client_id = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const favorites = await Favorite.findAndCountAll({
      where: { client_id },
      include: [{
        model: User,
        as: 'vet',
        attributes: { exclude: ['password'] },
        include: [{
          model: User,
          as: 'received_reviews',
          attributes: [],
          duplicating: false
        }]
      }],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });

    res.json({
      favorites: favorites.rows,
      totalPages: Math.ceil(favorites.count / limit),
      currentPage: parseInt(page),
      totalFavorites: favorites.count
    });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ message: 'Server error while fetching favorites' });
  }
};

// Check if vet is favorited
const checkFavorite = async (req, res) => {
  try {
    const { vet_id } = req.params;
    const client_id = req.user.id;

    const favorite = await Favorite.findOne({
      where: { client_id, vet_id }
    });

    res.json({ isFavorited: !!favorite });
  } catch (error) {
    console.error('Check favorite error:', error);
    res.status(500).json({ message: 'Server error while checking favorite' });
  }
};

module.exports = {
  addFavorite,
  removeFavorite,
  getFavorites,
  checkFavorite
};