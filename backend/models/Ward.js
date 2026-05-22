const mongoose = require('mongoose');

const wardSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  type: { type: String, enum: ['General', 'Semi-Private', 'Private', 'ICU', 'NICU', 'Emergency'], required: true },
  totalBeds: { type: Number, required: true },
  availableBeds: { type: Number, required: true },
  pricePerDay: { type: Number, required: true },
  floor: { type: String, default: '' },
  description: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Ward', wardSchema);
