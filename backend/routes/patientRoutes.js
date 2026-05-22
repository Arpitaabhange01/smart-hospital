const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getDoctors,
  getDoctorById,
  bookAppointment,
  getMyAppointments,
  getMyPrescriptions,
  getMyReports,
  getUpcomingAppointments,
  cancelAppointment,
} = require('../controllers/patientController');

router.use(protect);

router.get('/doctors', getDoctors);
router.get('/doctors/:id', getDoctorById);
router.post('/appointments', bookAppointment);
router.get('/appointments', getMyAppointments);
router.get('/appointments/upcoming', getUpcomingAppointments);
router.put('/appointments/:id/cancel', cancelAppointment);
router.get('/prescriptions', getMyPrescriptions);
router.get('/reports', getMyReports);

module.exports = router;
