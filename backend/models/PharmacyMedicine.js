const mongoose = require('mongoose');

const pharmacyMedicineSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  genericName: { type: String, trim: true },
  category: { type: String, enum: ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Cream', 'Drops', 'Inhaler', 'Other'], default: 'Tablet' },
  strength: { type: String, default: '' },
  manufacturer: { type: String, default: '' },
  price: { type: Number, required: true },
  stock: { type: Number, required: true, default: 0 },
  minStock: { type: Number, default: 10 },
  unit: { type: String, default: 'strip' },
  expiryDate: Date,
  requiresPrescription: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

pharmacyMedicineSchema.index({ name: 'text', genericName: 'text' });

module.exports = mongoose.model('PharmacyMedicine', pharmacyMedicineSchema);
