import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  registerMember,
  login,
  logout,
  getMe,
  updateProfile,
  refreshToken,
  revokeTokens
} from '../controllers/authController.js';

const router = express.Router();

router.post('/register', registerMember); 
router.post('/login', login); 

router.use(protect);

router.get('/me', getMe);
router.put('/profile', updateProfile);
router.post('/logout', logout);
router.post('/refresh-token', refreshToken);
router.post('/revoke-tokens', revokeTokens);

export default router;
