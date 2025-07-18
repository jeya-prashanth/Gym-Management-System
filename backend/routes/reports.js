import express from 'express';
import { protect, admin, gymOwner } from '../middleware/auth.js';
import { exportReport } from '../controllers/reportController.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Role-based access control middleware
const authorize = (req, res, next) => {
  if (req.user.role === 'admin') {
    admin(req, res, next);
  } else if (req.user.role === 'gym') {
    gymOwner(req, res, next);
  } else {
    res.status(403).json({ 
      success: false, 
      message: 'Not authorized to access this route' 
    });
  }
};

// Single endpoint for all report types
router.get('/export/:type', authorize, exportReport);
router.get('/export/:type/:format', authorize, exportReport);

export default router;