import User from '../Models/User.js';
import mongoose from 'mongoose';

/**
 * Get user's favorite books
 */
export const getUserFavorites = async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        error: 'Database not connected. Please check your MongoDB configuration.',
        favoriteBooks: []
      });
    }

    const { uid } = req.params;
    const { email } = req.query;

    if (!uid) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    let user = await User.findOne({ uid });

    // If user doesn't exist, create a new user
    if (!user) {
      if (!email) {
        return res.status(400).json({
          success: false,
          error: 'Email is required for new users'
        });
      }

      user = new User({
        uid,
        email,
        displayName: email.split('@')[0], // Use email prefix as display name
        favoriteBooks: []
      });
      await user.save();
    }

    res.status(200).json({
      success: true,
      favoriteBooks: user.favoriteBooks || []
    });
  } catch (error) {
    console.error('Error in getUserFavorites:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error'
    });
  }
};

/**
 * Add book to favorites
 */
export const addToFavorites = async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        error: 'Database not connected. Please check your MongoDB configuration.'
      });
    }

    const { uid } = req.params;
    const { bookId, email } = req.body;

    if (!uid || !bookId) {
      return res.status(400).json({
        success: false,
        error: 'User ID and Book ID are required'
      });
    }

    let user = await User.findOne({ uid });

    // If user doesn't exist, create a new user
    if (!user) {
      if (!email) {
        return res.status(400).json({
          success: false,
          error: 'Email is required for new users'
        });
      }

      user = new User({
        uid,
        email,
        displayName: email.split('@')[0],
        favoriteBooks: [bookId]
      });
    } else {
      // Check if book is already in favorites
      if (user.favoriteBooks.includes(bookId)) {
        return res.status(200).json({
          success: true,
          message: 'Book already in favorites',
          action: 'already_favorite'
        });
      }

      user.favoriteBooks.push(bookId);
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Book added to favorites',
      action: 'added',
      favoriteBooks: user.favoriteBooks
    });
  } catch (error) {
    console.error('Error in addToFavorites:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error'
    });
  }
};

/**
 * Remove book from favorites
 */
export const removeFromFavorites = async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        error: 'Database not connected. Please check your MongoDB configuration.'
      });
    }

    const { uid, bookId } = req.params;

    if (!uid || !bookId) {
      return res.status(400).json({
        success: false,
        error: 'User ID and Book ID are required'
      });
    }

    const user = await User.findOne({ uid });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check if book is in favorites
    if (!user.favoriteBooks.includes(bookId)) {
      return res.status(200).json({
        success: true,
        message: 'Book not in favorites',
        action: 'not_favorite'
      });
    }

    user.favoriteBooks = user.favoriteBooks.filter(id => id !== bookId);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Book removed from favorites',
      action: 'removed',
      favoriteBooks: user.favoriteBooks
    });
  } catch (error) {
    console.error('Error in removeFromFavorites:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error'
    });
  }
};

/**
 * Toggle favorite status (add if not present, remove if present)
 */
export const toggleFavorite = async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        error: 'Database not connected. Please check your MongoDB configuration.'
      });
    }

    const { uid } = req.params;
    const { bookId, email } = req.body;

    if (!uid || !bookId) {
      return res.status(400).json({
        success: false,
        error: 'User ID and Book ID are required'
      });
    }

    let user = await User.findOne({ uid });

    // If user doesn't exist, create a new user
    if (!user) {
      if (!email) {
        return res.status(400).json({
          success: false,
          error: 'Email is required for new users'
        });
      }

      user = new User({
        uid,
        email,
        displayName: email.split('@')[0],
        favoriteBooks: [bookId]
      });
      
      await user.save();

      return res.status(200).json({
        success: true,
        message: 'Book added to favorites',
        action: 'added',
        favoriteBooks: user.favoriteBooks
      });
    }

    // Check if book is in favorites
    const isFavorite = user.favoriteBooks.includes(bookId);
    
    if (isFavorite) {
      // Remove from favorites
      user.favoriteBooks = user.favoriteBooks.filter(id => id !== bookId);
      await user.save();

      res.status(200).json({
        success: true,
        message: 'Book removed from favorites',
        action: 'removed',
        favoriteBooks: user.favoriteBooks
      });
    } else {
      // Add to favorites
      user.favoriteBooks.push(bookId);
      await user.save();

      res.status(200).json({
        success: true,
        message: 'Book added to favorites',
        action: 'added',
        favoriteBooks: user.favoriteBooks
      });
    }
  } catch (error) {
    console.error('Error in toggleFavorite:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error'
    });
  }
};
