import express from 'express';
import { protect, admin, gymOwner } from '../middleware/auth.js';
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
  getMemberClasses
} from '../controllers/classController.js';

const router = express.Router();

router.use(protect);

const adminAndGym = [admin, gymOwner];

router.get('/', getClasses);
router.get('/:id', validate(validationSchemas.objectId, 'params'), getClassById);

router.get('/my-classes', getMemberClasses);
router.post('/:id/enroll', validate(validationSchemas.objectId, 'params'), enrollInClass);

router.post('/', adminAndGym, validate(validationSchemas.class), createClass);
router.put('/:id', adminAndGym, validate(validationSchemas.objectId, 'params'), validate(validationSchemas.class), updateClass);
router.delete('/:id', admin, validate(validationSchemas.objectId, 'params'), deleteClass);
router.get('/:id/attendees', adminAndGym, validate(validationSchemas.objectId, 'params'), getClassAttendees);

export default router;
