const express = require('express');
const router = express.Router();
const {
  addFavorite,
  removeFavorite,
  getFavorites,
  checkFavorite
} = require('../controllers/favoriteController');
const { auth } = require('../middleware/auth');

router.post('/', auth, addFavorite);
router.delete('/:vet_id', auth, removeFavorite);
router.get('/', auth, getFavorites);
router.get('/check/:vet_id', auth, checkFavorite);

module.exports = router;