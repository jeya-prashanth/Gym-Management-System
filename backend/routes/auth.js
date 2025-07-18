import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  register,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  updatePassword,
  verifyEmail,
  resendVerificationEmail,
  refreshToken,
  revokeTokens
} from '../controllers/authController.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', resendVerificationEmail);
router.post('/refresh-token', refreshToken);

router.use(protect);

router.get('/me', getMe);
router.post('/update-password', updatePassword);
router.post('/logout', logout);
router.post('/revoke-tokens', revokeTokens);

export default router;
