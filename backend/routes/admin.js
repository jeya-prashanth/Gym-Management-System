import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  updateUserStatus,
  getDashboardStats,
  getTokenTransactions,
  manageTokenPackage,
  getTokenPackage,
  updateTokenPackage,
  deleteTokenPackage,
  getGymStats,
  getUserStats
} from '../controllers/adminController.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getDashboardStats);
router.get('/gym-stats', getGymStats);
router.get('/user-stats', getUserStats);

router.route('/users')
  .get(getUsers)
  .post(createUser);

router.route('/users/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

router.put('/users/:id/status', updateUserStatus);

router.get('/tokens/transactions', getTokenTransactions);

router.route('/tokens/packages')
  .post(manageTokenPackage)
  .get(getTokenPackage);

router.route('/tokens/packages/:id')
  .put(updateTokenPackage)
  .delete(deleteTokenPackage);

export default router;
