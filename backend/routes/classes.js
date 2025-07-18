import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { validationSchemas } from '../middleware/validate.js';
import {
  getClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
  getClassAttendees,
  enrollInClass,
  cancelEnrollment,
  markAttendance,
  getClassSchedule,
  getAvailableClasses,
  getMemberClasses
} from '../controllers/classController.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getClasses)
  .post(
    authorize('admin', 'gym'),
    validate(validationSchemas.class),
    createClass
  );

router.get('/available', getAvailableClasses);
router.get('/my-classes', getMemberClasses);
router.get('/schedule', getClassSchedule);

router.post('/:id/enroll', validate(validationSchemas.objectId, 'params'), enrollInClass);
router.post('/:id/cancel-enrollment', validate(validationSchemas.objectId, 'params'), cancelEnrollment);

router.post('/:id/attendance',
  authorize('admin', 'gym'),
  validate(validationSchemas.objectId, 'params'),
  validate(validationSchemas.markAttendance),
  markAttendance
);

router.get('/:id/attendees',
  authorize('admin', 'gym'),
  validate(validationSchemas.objectId, 'params'),
  getClassAttendees
);

router.route('/:id')
  .get(validate(validationSchemas.objectId, 'params'), getClassById)
  .put(
    authorize('admin', 'gym'),
    validate(validationSchemas.objectId, 'params'),
    validate(validationSchemas.classUpdate),
    updateClass
  )
  .delete(
    authorize('admin', 'gym'),
    validate(validationSchemas.objectId, 'params'),
    deleteClass
  );

export default router;
