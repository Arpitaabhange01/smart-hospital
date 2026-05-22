const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    specialization: {
      type: String,
      required: [true, 'Specialization is required'],
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
    },
    experience: {
      type: Number,
      default: 0,
    },
    fees: {
      type: Number,
      required: [true, 'Consultation fees is required'],
    },
    about: {
      type: String,
      default: '',
    },
    availability: [
      {
        day: {
          type: String,
          enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        },
        slots: [String],
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Doctor', doctorSchema);
