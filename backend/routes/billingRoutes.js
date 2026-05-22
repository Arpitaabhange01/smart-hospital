const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getMyInvoices, getInvoiceById, createInvoice, payInvoice, getAllInvoices } = require('../controllers/billingController');

router.use(protect);

// Patient routes
router.get('/my-invoices', getMyInvoices);
router.get('/my-invoices/:id', getInvoiceById);
router.put('/pay/:id', payInvoice);

// Admin routes
router.get('/invoices', authorize('admin'), getAllInvoices);
router.post('/invoices', authorize('admin', 'receptionist'), createInvoice);

module.exports = router;
