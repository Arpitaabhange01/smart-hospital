const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { downloadPrescription, downloadInvoice, downloadReport } = require('../controllers/pdfController');

router.get('/prescription/:id', protect, downloadPrescription);
router.get('/invoice/:id', protect, downloadInvoice);
router.get('/report/:id', protect, downloadReport);

module.exports = router;
