import express from 'express';
import { protect, admin, gymOwner } from '../middleware/auth.js';
import { exportReport } from '../controllers/reportController.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Admin routes
router.get(
  '/export/:type',
  (req, res, next) => {
    if (req.user.role === 'admin') {
      return admin(req, res, next);
    }
    return res.status(403).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  },
  exportReport
);

// Gym owner routes
router.get(
  '/gym/export/:type',
  (req, res, next) => {
    if (req.user.role === 'gym') {
      return gymOwner(req, res, next);
    }
    return res.status(403).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  },
  exportReport
);

export default router;