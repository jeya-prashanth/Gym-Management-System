import express from 'express';
import { protect, admin, gymOwner } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { validationSchemas } from '../middleware/validate.js';
import {
  checkIn,
  checkOut,
  getMemberAttendance,
  getClassAttendance,
  getAttendanceStats,
  getActiveCheckIns
} from '../controllers/attendanceController.js';

const router = express.Router();

router.use(protect);

router.post('/checkin', validate(validationSchemas.checkIn), checkIn);
router.post('/checkout', validate(validationSchemas.checkOut), checkOut);
router.get('/member/:memberId', validate(validationSchemas.objectId, 'params'), getMemberAttendance);

const adminAndGym = [admin, gymOwner];

router.get('/active', adminAndGym, getActiveCheckIns);
router.get('/class/:classId', adminAndGym, validate(validationSchemas.objectId, 'params'), getClassAttendance);
router.get('/stats/:memberId', adminAndGym, validate(validationSchemas.objectId, 'params'), getAttendanceStats);

export default router;
