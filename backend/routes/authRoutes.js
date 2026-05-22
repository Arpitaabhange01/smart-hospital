const express = require('express');
const router = express.Router();
const {
  register,
  verifyOTP,
  login,
  logout,
  forgotPassword,
  verifyForgotOTP,
  resetPassword,
  getMe,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { loginLimiter, otpLimiter } = require('../middleware/rateLimiter');

router.post('/register', register);
router.post('/verify-otp', otpLimiter, verifyOTP);
router.post('/login', loginLimiter, login);
router.post('/logout', logout);
router.post('/forgot-password', otpLimiter, forgotPassword);
router.post('/verify-forgot-otp', otpLimiter, verifyForgotOTP);
router.post('/reset-password', resetPassword);
router.get('/me', protect, getMe);

module.exports = router;
