const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getMedicines, addMedicine, updateMedicine, deleteMedicine,
  getDispenses, dispenseMedicine,
} = require('../controllers/pharmacyController');

router.get('/medicines', protect, getMedicines);
router.post('/medicines', protect, authorize('admin', 'receptionist'), addMedicine);
router.put('/medicines/:id', protect, authorize('admin', 'receptionist'), updateMedicine);
router.delete('/medicines/:id', protect, authorize('admin'), deleteMedicine);

router.get('/dispenses', protect, getDispenses);
router.post('/dispense', protect, authorize('admin', 'receptionist', 'doctor'), dispenseMedicine);

module.exports = router;
