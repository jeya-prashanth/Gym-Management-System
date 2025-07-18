import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { validationSchemas } from '../middleware/validate.js';
import {
  getPayments,
  createPayment,
  getPaymentById,
  updatePayment,
  deletePayment,
  initiatePayment,
  verifyPayment,
  getPaymentHistory,
  getPaymentStats,
  processRefund,
  getMyPayments,
  getMyPaymentHistory,
  getGymPayments
} from '../controllers/paymentController.js';

const router = express.Router();

router.use(protect);

router.get('/my-payments', getMyPayments);
router.get('/my/history', getMyPaymentHistory);

router.get('/gym', authorize('gym'), getGymPayments);
router.get('/stats', authorize('admin'), getPaymentStats);
router.get('/history', validate(validationSchemas.paymentHistory, 'query'), getPaymentHistory);

router.post('/initiate', validate(validationSchemas.initiatePayment), initiatePayment);
router.post('/verify', validate(validationSchemas.verifyPayment), verifyPayment);

router.post('/refund/:id',
  authorize('admin'),
  validate(validationSchemas.objectId, 'params'),
  validate(validationSchemas.processRefund),
  processRefund
);

router.route('/')
  .get(authorize('admin'), validate(validationSchemas.paymentList, 'query'), getPayments)
  .post(authorize('admin'), validate(validationSchemas.createPayment), createPayment);

router.route('/:id')
  .get(authorize('admin'), validate(validationSchemas.objectId, 'params'), getPaymentById)
  .put(
    authorize('admin'),
    validate(validationSchemas.objectId, 'params'),
    validate(validationSchemas.updatePayment),
    updatePayment
  )
  .delete(
    authorize('admin'),
    validate(validationSchemas.objectId, 'params'),
    deletePayment
  );

export default router;
