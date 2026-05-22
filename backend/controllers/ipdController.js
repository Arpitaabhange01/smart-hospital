const Ward = require('../models/Ward');
const IPDAdmission = require('../models/IPDAdmission');
const Notification = require('../models/Notification');

exports.getWards = async (req, res, next) => {
  try {
    const wards = await Ward.find({ isActive: true }).sort({ name: 1 });
    res.json({ success: true, wards });
  } catch (err) { next(err); }
};

exports.createWard = async (req, res, next) => {
  try {
    const ward = await Ward.create(req.body);
    res.status(201).json({ success: true, ward });
  } catch (err) { next(err); }
};

exports.updateWard = async (req, res, next) => {
  try {
    const ward = await Ward.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!ward) return res.status(404).json({ success: false, message: 'Ward not found' });
    res.json({ success: true, ward });
  } catch (err) { next(err); }
};

exports.getAdmissions = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const admissions = await IPDAdmission.find(filter)
      .populate('patient', 'name email phone gender')
      .populate('doctor', 'name')
      .populate('ward', 'name type pricePerDay')
      .populate('admittedBy', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: admissions.length, admissions });
  } catch (err) { next(err); }
};

exports.admitPatient = async (req, res, next) => {
  try {
    const { patientId, doctorId, wardId, diagnosis, expectedDischargeDate, notes } = req.body;
    const ward = await Ward.findById(wardId);
    if (!ward) return res.status(404).json({ success: false, message: 'Ward not found' });
    if (ward.availableBeds <= 0) return res.status(400).json({ success: false, message: 'No beds available in this ward' });

    const bedNumber = `${ward.name.slice(0, 3).toUpperCase()}-${ward.totalBeds - ward.availableBeds + 1}`;

    const admission = await IPDAdmission.create({
      patient: patientId,
      doctor: doctorId,
      ward: wardId,
      bedNumber,
      diagnosis,
      expectedDischargeDate,
      notes,
      admittedBy: req.user._id,
    });

    ward.availableBeds -= 1;
    await ward.save();

    const populated = await IPDAdmission.findById(admission._id)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name')
      .populate('ward', 'name type pricePerDay')
      .populate('admittedBy', 'name');

    try {
      await Notification.create({
        user: patientId,
        type: 'general',
        title: 'Admitted to Hospital',
        message: `You have been admitted to ${ward.name} (Bed ${bedNumber}).`,
        link: '/patient/ipd',
      });
    } catch {}

    res.status(201).json({ success: true, message: 'Patient admitted', admission: populated });
  } catch (err) { next(err); }
};

exports.dischargePatient = async (req, res, next) => {
  try {
    const admission = await IPDAdmission.findById(req.params.id);
    if (!admission) return res.status(404).json({ success: false, message: 'Admission not found' });
    if (admission.status === 'discharged') return res.status(400).json({ success: false, message: 'Already discharged' });

    admission.status = 'discharged';
    admission.dischargeDate = new Date();
    await admission.save();

    const ward = await Ward.findById(admission.ward);
    if (ward) {
      ward.availableBeds += 1;
      await ward.save();
    }

    try {
      await Notification.create({
        user: admission.patient,
        type: 'general',
        title: 'Discharged from Hospital',
        message: `You have been discharged from ${ward?.name || 'the hospital'}.`,
        link: '/patient/ipd',
      });
    } catch {}

    const populated = await IPDAdmission.findById(admission._id)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name')
      .populate('ward', 'name type pricePerDay');

    res.json({ success: true, message: 'Patient discharged', admission: populated });
  } catch (err) { next(err); }
};
