import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember,
  getMemberCheckIns,
  getMemberSubscriptions,
  updateMemberStatus,
  searchMembers
} from '../controllers/memberController.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(authorize('admin', 'gym'), getMembers)
  .post(authorize('admin'), createMember);

router.get('/search', authorize('admin', 'gym'), searchMembers);

router.route('/:id')
  .get(authorize('admin', 'gym'), getMemberById)
  .put(authorize('admin'), updateMember)
  .delete(authorize('admin'), deleteMember);

router.get('/:id/checkins', authorize('admin', 'gym'), getMemberCheckIns);
router.get('/:id/subscriptions', authorize('admin', 'gym'), getMemberSubscriptions);
router.patch('/:id/status', authorize('admin'), updateMemberStatus);

export default router;
