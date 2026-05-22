const Invoice = require('../models/Invoice');
const Appointment = require('../models/Appointment');
const Notification = require('../models/Notification');

exports.getMyInvoices = async (req, res, next) => {
  try {
    const invoices = await Invoice.find({ patient: req.user._id }).populate({ path: 'appointment', populate: { path: 'doctor', select: 'name' } }).sort({ createdAt: -1 });
    res.json({ success: true, count: invoices.length, invoices });
  } catch (err) { next(err); }
};

exports.getInvoiceById = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate({ path: 'patient', select: 'name email phone address' }).populate({ path: 'appointment', populate: { path: 'doctor', select: 'name specialization' } });
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    res.json({ success: true, invoice });
  } catch (err) { next(err); }
};

exports.createInvoice = async (req, res, next) => {
  try {
    const { patientId, appointmentId, items, tax } = req.body;
    if (!patientId || !items || !items.length) {
      return res.status(400).json({ success: false, message: 'Patient and items are required' });
    }
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const taxAmount = tax || 0;
    const invoice = await Invoice.create({
      patient: patientId,
      appointment: appointmentId || undefined,
      items,
      subtotal,
      tax: taxAmount,
      total: subtotal + taxAmount,
    });
    await Notification.create({
      user: patientId,
      type: 'payment',
      title: 'New Invoice',
      message: `Invoice ${invoice.invoiceNumber} for ₹${invoice.total} has been generated.`,
      link: '/patient/billing',
    });
    res.status(201).json({ success: true, message: 'Invoice created', invoice });
  } catch (err) { next(err); }
};

exports.payInvoice = async (req, res, next) => {
  try {
    const { paymentMethod } = req.body;
    const invoice = await Invoice.findByIdAndUpdate(req.params.id, {
      status: 'paid',
      paymentMethod: paymentMethod || 'Online',
      paidAt: new Date(),
    }, { new: true });
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    await Notification.create({
      user: invoice.patient,
      type: 'payment',
      title: 'Payment Successful',
      message: `Payment of ₹${invoice.total} for ${invoice.invoiceNumber} was successful.`,
      link: '/patient/billing',
    });
    res.json({ success: true, message: 'Payment successful', invoice });
  } catch (err) { next(err); }
};

exports.getAllInvoices = async (req, res, next) => {
  try {
    const invoices = await Invoice.find().populate('patient', 'name email').populate({ path: 'appointment', populate: { path: 'doctor', select: 'name' } }).sort({ createdAt: -1 });
    res.json({ success: true, count: invoices.length, invoices });
  } catch (err) { next(err); }
};
