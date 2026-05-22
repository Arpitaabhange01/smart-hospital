const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  addDoctor,
  getDoctors,
  updateDoctor,
  removeDoctor,
  getPatients,
  getPatientDetails,
  getAllAppointments,
  getReportsOverview,
} = require('../controllers/adminController');

router.use(protect);
router.use(authorize('admin'));

router.post('/doctors', addDoctor);
router.get('/doctors', getDoctors);
router.put('/doctors/:id', updateDoctor);
router.delete('/doctors/:id', removeDoctor);
router.get('/patients', getPatients);
router.get('/patients/:id', getPatientDetails);
router.get('/appointments', getAllAppointments);
router.get('/reports', getReportsOverview);

module.exports = router;
