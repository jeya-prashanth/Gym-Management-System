import express from 'express';
import { protect, admin, gymOwner } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { validationSchemas } from '../middleware/validate.js';
import {
  getTokenTransactions,
  addTokens,
  getMemberTokenBalance,
  getTokenStats,
  transferTokens,
  getMyTokenBalance,
  getMyTokenTransactions,
  purchaseTokens,
  verifyTokenPurchase,
  updateTokenRate,
  getTokenRate,
  getGymTokenStats
} from '../controllers/tokenController.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Member routes
router.get('/my-balance', getMyTokenBalance);
router.get('/my-transactions', 
  validate(validationSchemas.tokenTransactionList, 'query'),
  getMyTokenTransactions
);

// Public route (protected by token)
router.get('/rate', getTokenRate);

// Admin routes
router.get('/stats', 
  admin,
  validate(validationSchemas.tokenStats, 'query'),
  getTokenStats
);

// Gym owner routes
router.get('/gym-stats',
  gymOwner,
  getGymTokenStats
);

// Token purchase flow
router.post('/purchase',
  validate(validationSchemas.purchaseTokens),
  purchaseTokens
);

router.post('/verify-purchase',
  validate(validationSchemas.verifyTokenPurchase),
  verifyTokenPurchase
);

router.post('/transfer',
  validate(validationSchemas.transferTokens),
  transferTokens
);

router.post('/rate',
  authorize('admin'),
  validate(validationSchemas.updateTokenRate),
  updateTokenRate
);

router.get('/balance/:memberId',
  authorize('admin', 'gym'),
  validate(validationSchemas.objectId, 'params'),
  getMemberTokenBalance
);

router.get('/transactions',
  authorize('admin', 'gym'),
  validate(validationSchemas.tokenTransactionList, 'query'),
  getTokenTransactions
);

router.post('/add',
  authorize('admin'),
  validate(validationSchemas.addTokens),
  addTokens
);

export default router;
