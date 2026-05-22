const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getWards, createWard, updateWard,
  getAdmissions, admitPatient, dischargePatient,
} = require('../controllers/ipdController');

router.get('/wards', protect, getWards);
router.post('/wards', protect, authorize('admin'), createWard);
router.put('/wards/:id', protect, authorize('admin'), updateWard);

router.get('/admissions', protect, getAdmissions);
router.post('/admit', protect, authorize('admin', 'doctor'), admitPatient);
router.put('/discharge/:id', protect, authorize('admin', 'doctor'), dischargePatient);

module.exports = router;
