const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  invoiceNumber: { type: String, required: true, unique: true },
  items: [{
    description: { type: String, required: true },
    amount: { type: Number, required: true },
  }],
  subtotal: { type: Number, required: true },
  tax: { type: Number, default: 0 },
  total: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'paid', 'cancelled'], default: 'pending' },
  paymentMethod: { type: String, default: '' },
  paidAt: Date,
}, { timestamps: true });

invoiceSchema.pre('validate', async function (next) {
  if (!this.invoiceNumber) {
    const count = await mongoose.model('Invoice').countDocuments();
    this.invoiceNumber = `INV-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Invoice', invoiceSchema);
