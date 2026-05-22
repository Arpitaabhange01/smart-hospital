const rateLimit = require('express-rate-limit');

exports.loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many login attempts. Try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

exports.otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many OTP requests. Try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

exports.apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests. Slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});
