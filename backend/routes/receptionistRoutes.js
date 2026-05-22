const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  registerPatient,
  getDoctors,
  getPatients,
  bookAppointment,
  getAppointments,
  updateAppointment,
} = require('../controllers/receptionistController');

router.use(protect);
router.use(authorize('receptionist'));

router.post('/patients', registerPatient);
router.get('/patients', getPatients);
router.get('/doctors', getDoctors);
router.post('/appointments', bookAppointment);
router.get('/appointments', getAppointments);
router.put('/appointments/:id', updateAppointment);

module.exports = router;
