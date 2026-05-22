const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getMyProfile,
  updateMyProfile,
  getMyAppointments,
  updateAppointmentStatus,
  getPatientHistory,
  addAppointmentNotes,
  createPrescription,
  getMyPrescriptions,
  uploadReport,
  getMyReports,
} = require('../controllers/doctorController');

router.use(protect);
router.use(authorize('doctor'));

router.get('/profile', getMyProfile);
router.put('/profile', updateMyProfile);
router.get('/appointments', getMyAppointments);
router.put('/appointments/:id/status', updateAppointmentStatus);
router.put('/appointments/:id/notes', addAppointmentNotes);
router.get('/patients/:patientId', getPatientHistory);
router.post('/prescriptions', createPrescription);
router.get('/prescriptions', getMyPrescriptions);
router.post('/reports', upload.single('file'), uploadReport);
router.get('/reports', getMyReports);

module.exports = router;
