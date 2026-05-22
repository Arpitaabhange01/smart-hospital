const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getMyNotifications, markAsRead, markAllRead, sendAppointmentReminder } = require('../controllers/notificationController');

router.use(protect);

router.get('/', getMyNotifications);
router.put('/:id/read', markAsRead);
router.put('/read-all', markAllRead);
router.post('/send-reminder', sendAppointmentReminder);

module.exports = router;
