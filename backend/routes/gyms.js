import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getGyms,
  getGymById,
  searchGyms,
  getNearbyGyms,
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

router.get('/', getGyms);
router.get('/search', searchGyms);
router.get('/nearby', getNearbyGyms);
router.get('/:id', getGymById);

router.use(protect);

router.get('/:id/classes', getGymClasses);

router.get('/my/gym', authorize('gym'), getMyGym);
router.put('/my/gym', authorize('gym'), updateMyGym);
router.get('/my/gym/members', authorize('gym'), getGymMembers);
router.get('/my/gym/stats', authorize('gym'), getMyGymStats);

router.post('/', authorize('admin'), createGym);
router.put('/:id', authorize('admin'), updateGym);
router.delete('/:id', authorize('admin'), deleteGym);
router.get('/:id/members', authorize('admin'), getGymMembers);
router.get('/:id/stats', authorize('admin'), getGymStats);

export default router;
