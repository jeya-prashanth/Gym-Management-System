import express from 'express';
import { protect, admin, gymOwner } from '../middleware/auth.js';
import {
  getGyms,
  getGymById,
  searchGyms,
  createGym,
  updateGym,
  deleteGym,
  getGymMembers,
  getGymClasses,
  getGymStats,
  getMyGym,
  updateMyGym,
  getMyGymStats
} from '../controllers/gymController.js';

const router = express.Router();

// Public routes
router.get('/', getGyms);
router.get('/search', searchGyms);
router.get('/:id', getGymById);

// Protected routes
router.use(protect);

// Member routes
router.get('/:id/classes', getGymClasses);

// Gym owner routes
router.get('/my/gym', gymOwner, getMyGym);
router.put('/my/gym', gymOwner, updateMyGym);
router.get('/my/gym/members', gymOwner, getGymMembers);
router.get('/my/gym/stats', gymOwner, getMyGymStats);

// Admin routes
router.post('/', admin, createGym);
router.put('/:id', admin, updateGym);
router.delete('/:id', admin, deleteGym);
router.get('/:id/members', admin, getGymMembers);
router.get('/:id/stats', admin, getGymStats);

export default router;
