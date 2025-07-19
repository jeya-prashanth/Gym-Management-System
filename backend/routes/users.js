import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus
} from '../controllers/userController.js';

const router = express.Router();

// Admin routes
router.use(protect);

// Get all users (admin only)
router.get('/', getUsers);

// Get single user (admin only)
router.get('/:id', getUserById);

// Create new user (admin only)
router.post('/', createUser);

// Update user (admin only)
router.put('/:id', updateUser);

// Delete user (admin only)
router.delete('/:id', deleteUser);

// Toggle user status (active/inactive)
router.patch('/:id/status', toggleUserStatus);

export default router;
