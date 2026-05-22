const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getDoctorQueue, checkIn, callNext, startConsultation, completeConsultation, markNoShow,
  getPatientQueueStatus, receptionistCheckIn,
} = require('../controllers/queueController');

router.get('/doctor', protect, authorize('doctor'), getDoctorQueue);
router.post('/checkin', protect, authorize('patient'), checkIn);
router.post('/call-next', protect, authorize('doctor'), callNext);
router.put('/start/:id', protect, authorize('doctor'), startConsultation);
router.put('/complete/:id', protect, authorize('doctor'), completeConsultation);
router.put('/no-show/:id', protect, authorize('doctor'), markNoShow);
router.get('/my-status', protect, authorize('patient'), getPatientQueueStatus);
router.post('/reception-checkin', protect, authorize('receptionist', 'admin'), receptionistCheckIn);

module.exports = router;
