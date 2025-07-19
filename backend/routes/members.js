import express from 'express';
import { protect, admin, gymOwner } from '../middleware/auth.js';
import {
  getMembers,
  getMemberById,
  getMemberProfile,
  updateMemberProfile,
  memberCheckIn,
  memberCheckOut,
  getCheckInHistory,
  getTokenTransactions,
  addTokens
} from '../controllers/memberController.js';

const router = express.Router();

// All routes in this file are protected
router.use(protect);

// Member profile routes
router.route('/profile')
  .get(getMemberProfile)
  .put(updateMemberProfile);

// Check-in/Check-out routes
router.post('/check-in', memberCheckIn);
router.post('/check-out', memberCheckOut);
router.get('/check-in/history', getCheckInHistory);

// Token management routes
router.get('/tokens/transactions', getTokenTransactions);
router.post('/tokens/add', admin, addTokens);

// Admin and gym owner routes
const adminAndGym = [admin, gymOwner];

// Admin only routes
router.get('/', adminAndGym, getMembers);
router.get('/:id', adminAndGym, getMemberById);

export default router;
