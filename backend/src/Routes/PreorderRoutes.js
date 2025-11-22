import express from 'express';
import {
  CreatePreorder,
  GetUserPreorders,
  GetBookPreorders,
  GetPreorderById,
  UpdatePreorderStatus,
  DeletePreorder,
} from '../Controllers/PreorderController.js';

const router = express.Router();

// Create a new preorder
router.post('/', CreatePreorder);

// Get all preorders for a specific user
router.get('/user/:userId', GetUserPreorders);

// Get all preorders for a specific book
router.get('/book/:bookId', GetBookPreorders);

// Get a single preorder by ID
router.get('/:id', GetPreorderById);

// Update preorder status
router.put('/:id/status', UpdatePreorderStatus);

// Delete a preorder
router.delete('/:id', DeletePreorder);

export default router;

