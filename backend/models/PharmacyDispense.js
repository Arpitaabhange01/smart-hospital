const mongoose = require('mongoose');

const dispenseItemSchema = new mongoose.Schema({
  medicine: { type: mongoose.Schema.Types.ObjectId, ref: 'PharmacyMedicine', required: true },
  medicineName: { type: String },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  instructions: { type: String, default: '' },
});

const pharmacyDispenseSchema = new mongoose.Schema({
  prescription: { type: mongoose.Schema.Types.ObjectId, ref: 'Prescription' },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  dispensedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [dispenseItemSchema],
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['dispensed', 'partial', 'cancelled'], default: 'dispensed' },
  notes: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('PharmacyDispense', pharmacyDispenseSchema);
