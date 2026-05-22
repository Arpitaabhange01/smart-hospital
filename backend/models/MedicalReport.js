const mongoose = require('mongoose');

const medicalReportSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    title: {
      type: String,
      required: [true, 'Report title is required'],
    },
    fileUrl: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    reportType: {
      type: String,
      default: 'general',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MedicalReport', medicalReportSchema);
