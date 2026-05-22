const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['patient', 'doctor', 'receptionist', 'admin'],
      default: 'patient',
    },
    phone: {
      type: String,
      trim: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    // OTP fields
    otp: {
      type: String,
      select: false,
    },
    otpExpire: {
      type: Date,
      select: false,
    },
    otpType: {
      type: String,
      enum: ['register', 'forgot-password'],
      select: false,
    },
    // Profile
    avatar: {
      type: String,
      default: '',
    },
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
    },
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
