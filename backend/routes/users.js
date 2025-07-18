import express from 'express';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { validationSchemas } from '../middleware/validate.js';
import {
  getProfile,
  updateProfile,
  updatePassword,
  getTokenBalance,
  getTokenTransactions,
  getWorkoutHistory,
  bookClass,
  cancelBooking,
  getBookings,
  updateProfilePicture,
  deleteAccount
} from '../controllers/userController.js';

const router = express.Router();

router.use(protect);

router.get('/profile', getProfile);
router.put('/profile', 
  validate(validationSchemas.updateProfile),
  updateProfile
);
router.put('/profile/picture', 
  validate(validationSchemas.updateProfilePicture),
  updateProfilePicture
);

router.put('/password', 
  validate(validationSchemas.updatePassword),
  updatePassword
);

router.get('/tokens/balance', getTokenBalance);
router.get('/tokens/transactions', 
  validate(validationSchemas.tokenTransactionList, 'query'),
  getTokenTransactions
);

router.get('/workouts', 
  validate(validationSchemas.workoutHistory, 'query'),
  getWorkoutHistory
);

router.get('/bookings', 
  validate(validationSchemas.bookingList, 'query'),
  getBookings
);

router.post('/bookings', 
  validate(validationSchemas.bookClass),
  bookClass
);

router.delete('/bookings/:id',
  validate(validationSchemas.objectId, 'params'),
  cancelBooking
);

router.delete('/account', deleteAccount);

export default router;
