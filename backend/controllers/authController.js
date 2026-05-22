const User = require('../models/User');
const { generateOTP, sendOTPEmail } = require('../utils/email');
const { sendTokenResponse } = require('../utils/jwt');

// ─── REGISTER ─────────────────────────────────────────────
// POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required.' });
    }

    // Check if already registered and verified
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({ success: false, message: 'Email already registered. Please login.' });
    }

    const otp = generateOTP();
    const otpExpire = new Date(Date.now() + (process.env.OTP_EXPIRE_MINUTES || 10) * 60 * 1000);

    let user;
    if (existingUser && !existingUser.isVerified) {
      // Update existing unverified user
      existingUser.name = name;
      existingUser.password = password;
      existingUser.phone = phone;
      existingUser.role = role || existingUser.role;
      existingUser.otp = otp;
      existingUser.otpExpire = otpExpire;
      existingUser.otpType = 'register';
      user = await existingUser.save();
    } else {
      user = await User.create({ name, email, password, phone, role: role || 'patient', otp, otpExpire, otpType: 'register' });
    }

    await sendOTPEmail({ to: email, name, otp, type: 'register' });

    res.status(200).json({
      success: true,
      message: `OTP sent to ${email}. Please verify to complete registration.`,
      email,
    });
  } catch (err) {
    next(err);
  }
};

// ─── VERIFY OTP (Registration) ─────────────────────────────
// POST /api/auth/verify-otp
exports.verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required.' });
    }

    const user = await User.findOne({ email }).select('+otp +otpExpire +otpType');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    if (user.otpType !== 'register') {
      return res.status(400).json({ success: false, message: 'Invalid OTP request.' });
    }
    if (user.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP.' });
    }
    if (user.otpExpire < new Date()) {
      return res.status(400).json({ success: false, message: 'OTP has expired. Please register again.' });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpire = undefined;
    user.otpType = undefined;
    await user.save({ validateBeforeSave: false });

    sendTokenResponse(user, 201, res, 'Account verified and created successfully!');
  } catch (err) {
    next(err);
  }
};

// ─── LOGIN ─────────────────────────────────────────────────
// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }
    if (!user.isVerified) {
      return res.status(401).json({ success: false, message: 'Please verify your email before logging in.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    sendTokenResponse(user, 200, res, 'Login successful!');
  } catch (err) {
    next(err);
  }
};

// ─── LOGOUT ────────────────────────────────────────────────
// POST /api/auth/logout
exports.logout = async (req, res) => {
  res.cookie('token', 'none', { expires: new Date(Date.now() + 5 * 1000), httpOnly: true });
  res.status(200).json({ success: true, message: 'Logged out successfully.' });
};

// ─── FORGOT PASSWORD ───────────────────────────────────────
// POST /api/auth/forgot-password
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal user existence
      return res.status(200).json({ success: true, message: `If ${email} is registered, an OTP has been sent.` });
    }
    if (!user.isVerified) {
      return res.status(400).json({ success: false, message: 'Account not verified. Please register again.' });
    }

    const otp = generateOTP();
    const otpExpire = new Date(Date.now() + (process.env.OTP_EXPIRE_MINUTES || 10) * 60 * 1000);

    user.otp = otp;
    user.otpExpire = otpExpire;
    user.otpType = 'forgot-password';
    await user.save({ validateBeforeSave: false });

    await sendOTPEmail({ to: email, name: user.name, otp, type: 'forgot-password' });

    res.status(200).json({
      success: true,
      message: `OTP sent to ${email}.`,
      email,
    });
  } catch (err) {
    next(err);
  }
};

// ─── VERIFY FORGOT PASSWORD OTP ────────────────────────────
// POST /api/auth/verify-forgot-otp
exports.verifyForgotOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required.' });
    }

    const user = await User.findOne({ email }).select('+otp +otpExpire +otpType');
    if (!user || user.otpType !== 'forgot-password') {
      return res.status(400).json({ success: false, message: 'Invalid request.' });
    }
    if (user.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP.' });
    }
    if (user.otpExpire < new Date()) {
      return res.status(400).json({ success: false, message: 'OTP has expired. Please try again.' });
    }

    // Give a short-lived reset token
    const resetToken = require('crypto').randomBytes(32).toString('hex');
    user.otp = resetToken; // reuse otp field to store reset token
    user.otpExpire = new Date(Date.now() + 15 * 60 * 1000); // 15 min
    user.otpType = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({ success: true, message: 'OTP verified.', resetToken, email });
  } catch (err) {
    next(err);
  }
};

// ─── RESET PASSWORD ────────────────────────────────────────
// POST /api/auth/reset-password
exports.resetPassword = async (req, res, next) => {
  try {
    const { email, resetToken, newPassword } = req.body;
    if (!email || !resetToken || !newPassword) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    const user = await User.findOne({ email }).select('+otp +otpExpire');
    if (!user || user.otp !== resetToken || user.otpExpire < new Date()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token.' });
    }

    user.password = newPassword;
    user.otp = undefined;
    user.otpExpire = undefined;
    await user.save();

    res.status(200).json({ success: true, message: 'Password reset successfully. Please login.' });
  } catch (err) {
    next(err);
  }
};

// ─── GET CURRENT USER ──────────────────────────────────────
// GET /api/auth/me
exports.getMe = async (req, res) => {
  const user = req.user;
  res.status(200).json({ success: true, user });
};
