const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getAuditLogs, logAction } = require('../controllers/auditController');

router.get('/', protect, authorize('admin'), getAuditLogs);
router.post('/', protect, logAction);

module.exports = router;
