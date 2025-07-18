import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { validationSchemas } from '../middleware/validate.js';
import {
  checkInMember,
  checkOutMember,
  getAttendanceByDate,
  getMemberAttendance,
  updateAttendance,
  getAttendanceStats,
  bulkUpdateAttendance,
  getAttendanceByClass,
  getMyAttendance,
  getTodaysAttendance,
  getGymAttendance
} from '../controllers/attendanceController.js';

const router = express.Router();

router.use(protect);

router.get('/my-attendance', getMyAttendance);
router.get('/today', getTodaysAttendance);

router.get('/stats', 
  authorize('admin', 'gym'),
  validate(validationSchemas.attendanceStats, 'query'), 
  getAttendanceStats
);

router.get('/gym', 
  authorize('gym'), 
  getGymAttendance
);

router.post('/checkin', validate(validationSchemas.checkIn), checkInMember);
router.post('/checkout', validate(validationSchemas.checkOut), checkOutMember);

router.get('/date/:date', 
  authorize('admin', 'gym'), 
  validate(validationSchemas.dateParam, 'params'), 
  getAttendanceByDate
);

router.get('/class/:classId',
  validate(validationSchemas.objectId, 'params'),
  getAttendanceByClass
);

router.get('/member/:memberId',
  authorize('admin', 'gym'),
  validate(validationSchemas.objectId, 'params'),
  getMemberAttendance
);

router.post('/bulk-update',
  authorize('admin', 'gym'),
  validate(validationSchemas.bulkUpdateAttendance),
  bulkUpdateAttendance
);

router.put('/:id',
  authorize('admin', 'gym'),
  validate(validationSchemas.objectId, 'params'),
  validate(validationSchemas.updateAttendance),
  updateAttendance
);

export default router;
