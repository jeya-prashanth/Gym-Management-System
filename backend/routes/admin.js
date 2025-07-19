import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import {
  getDashboardStats,
  createGym,
  updateGym,
  deleteGym,
  getGyms,
  getGymById,
  getMembers
} from '../controllers/adminController.js';

const router = express.Router();

// All routes in this file are protected and require admin role
router.use(protect, admin);

// Dashboard Stats
router.get('/stats', getDashboardStats);

// Gym Management
router.route('/gyms')
  .get(getGyms)
  .post(createGym);

router.route('/gyms/:id')
  .get(getGymById)
  .put(updateGym)
  .delete(deleteGym);

// Member Management
router.get('/members', getMembers);

export default router;
