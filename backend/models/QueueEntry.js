const mongoose = require('mongoose');

const queueEntrySchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  tokenNumber: { type: Number, required: true },
  priority: { type: String, enum: ['normal', 'urgent', 'emergency'], default: 'normal' },
  status: { type: String, enum: ['waiting', 'called', 'in-progress', 'completed', 'no-show', 'cancelled'], default: 'waiting' },
  estimatedWaitMinutes: { type: Number, default: 0 },
  checkedInAt: { type: Date, default: Date.now },
  calledAt: Date,
  completedAt: Date,
  notes: { type: String, default: '' },
}, { timestamps: true });

queueEntrySchema.index({ doctor: 1, status: 1, tokenNumber: 1 });

module.exports = mongoose.model('QueueEntry', queueEntrySchema);
