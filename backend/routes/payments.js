import express from 'express';
import { protect, admin, gymOwner } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { validationSchemas } from '../middleware/validate.js';
import {
  createPayment,
  getMemberPayments,
  getPaymentById,
  getAllPayments,
  refundPayment
} from '../controllers/paymentController.js';

const router = express.Router();

// All routes in this file are protected
router.use(protect);

// Member routes
router.get('/my-payments', getMemberPayments);

// Admin routes
router.get('/', admin, getAllPayments);
router.post('/', admin, validate(validationSchemas.createPayment), createPayment);
router.post('/:id/refund', admin, validate(validationSchemas.objectId, 'params'), refundPayment);
router.get('/:id', admin, validate(validationSchemas.objectId, 'params'), getPaymentById);

export default router;
