import express from 'express';
import {
  getUserFavorites,
  addToFavorites,
  removeFromFavorites,
  toggleFavorite,
} from '../Controllers/FavoritesController.js';

const router = express.Router();

// GET /api/favorites/:uid - Get user's favorite books
router.get('/:uid', getUserFavorites);

// POST /api/favorites/:uid - Add book to favorites
router.post('/:uid', addToFavorites);

// DELETE /api/favorites/:uid/:bookId - Remove book from favorites
router.delete('/:uid/:bookId', removeFromFavorites);

// PUT /api/favorites/:uid/toggle - Toggle favorite status
router.put('/:uid/toggle', toggleFavorite);

export default router;
