const mongoose = require('mongoose');

const ipdAdmissionSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ward: { type: mongoose.Schema.Types.ObjectId, ref: 'Ward', required: true },
  bedNumber: { type: String, required: true },
  admissionDate: { type: Date, required: true, default: Date.now },
  expectedDischargeDate: Date,
  dischargeDate: Date,
  diagnosis: { type: String, default: '' },
  treatment: { type: String, default: '' },
  status: { type: String, enum: ['admitted', 'discharged', 'transferred'], default: 'admitted' },
  notes: { type: String, default: '' },
  admittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('IPDAdmission', ipdAdmissionSchema);
