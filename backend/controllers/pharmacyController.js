const PharmacyMedicine = require('../models/PharmacyMedicine');
const PharmacyDispense = require('../models/PharmacyDispense');
const Prescription = require('../models/Prescription');

exports.getMedicines = async (req, res, next) => {
  try {
    const { search, category, lowStock } = req.query;
    const filter = { isActive: true };
    if (category) filter.category = category;
    if (lowStock === 'true') filter.stock = { $lte: 0 };
    if (search) filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { genericName: { $regex: search, $options: 'i' } },
    ];
    const medicines = await PharmacyMedicine.find(filter).sort({ name: 1 });
    res.json({ success: true, count: medicines.length, medicines });
  } catch (err) { next(err); }
};

exports.addMedicine = async (req, res, next) => {
  try {
    const medicine = await PharmacyMedicine.create(req.body);
    res.status(201).json({ success: true, medicine });
  } catch (err) { next(err); }
};

exports.updateMedicine = async (req, res, next) => {
  try {
    const medicine = await PharmacyMedicine.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!medicine) return res.status(404).json({ success: false, message: 'Medicine not found' });
    res.json({ success: true, medicine });
  } catch (err) { next(err); }
};

exports.deleteMedicine = async (req, res, next) => {
  try {
    await PharmacyMedicine.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Medicine removed' });
  } catch (err) { next(err); }
};

exports.getDispenses = async (req, res, next) => {
  try {
    const dispenses = await PharmacyDispense.find()
      .populate('patient', 'name email phone')
      .populate('doctor', 'name')
      .populate('dispensedBy', 'name')
      .populate('items.medicine', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: dispenses.length, dispenses });
  } catch (err) { next(err); }
};

exports.dispenseMedicine = async (req, res, next) => {
  try {
    const { prescriptionId, items, notes } = req.body;
    const prescription = await Prescription.findById(prescriptionId).populate('patient', 'name');
    if (!prescription) return res.status(404).json({ success: false, message: 'Prescription not found' });

    const dispenseItems = [];
    let totalAmount = 0;

    for (const item of items) {
      const medicine = await PharmacyMedicine.findById(item.medicineId);
      if (!medicine) return res.status(404).json({ success: false, message: `Medicine ${item.medicineId} not found` });
      if (medicine.stock < item.quantity) {
        return res.status(400).json({ success: false, message: `Insufficient stock for ${medicine.name}. Available: ${medicine.stock}` });
      }
      medicine.stock -= item.quantity;
      await medicine.save();

      dispenseItems.push({
        medicine: medicine._id,
        medicineName: medicine.name,
        quantity: item.quantity,
        price: medicine.price * item.quantity,
        instructions: item.instructions || '',
      });
      totalAmount += medicine.price * item.quantity;
    }

    const dispense = await PharmacyDispense.create({
      prescription: prescriptionId,
      patient: prescription.patient._id,
      doctor: prescription.doctor,
      dispensedBy: req.user._id,
      items: dispenseItems,
      totalAmount,
      notes,
    });

    const populated = await PharmacyDispense.findById(dispense._id)
      .populate('patient', 'name email')
      .populate('doctor', 'name')
      .populate('dispensedBy', 'name')
      .populate('items.medicine', 'name');

    res.status(201).json({ success: true, message: 'Medicines dispensed', dispense: populated });
  } catch (err) { next(err); }
};
