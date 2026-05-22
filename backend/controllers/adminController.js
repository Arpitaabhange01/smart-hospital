const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const MedicalReport = require('../models/MedicalReport');

exports.addDoctor = async (req, res, next) => {
  try {
    const { name, email, phone, password, specialization, department, experience, fees, gender } = req.body;
    if (!name || !email || !specialization || !department || !fees) {
      return res.status(400).json({ success: false, message: 'Name, email, specialization, department and fees are required' });
    }
    let user = await User.findOne({ email });
    if (user) {
      if (user.role !== 'doctor') {
        user.role = 'doctor';
        await user.save();
      }
    } else {
      user = await User.create({
        name, email, phone,
        password: password || 'doctor123',
        role: 'doctor',
        isVerified: true,
        gender,
      });
    }
    let doctor = await Doctor.findOne({ user: user._id });
    if (doctor) {
      doctor.specialization = specialization;
      doctor.department = department;
      doctor.experience = experience || doctor.experience;
      doctor.fees = fees;
      await doctor.save();
    } else {
      doctor = await Doctor.create({
        user: user._id,
        specialization,
        department,
        experience,
        fees,
      });
    }
    doctor = await Doctor.findById(doctor._id).populate('user', 'name email phone gender avatar');
    res.status(201).json({ success: true, message: 'Doctor added successfully', doctor });
  } catch (err) {
    next(err);
  }
};

exports.getDoctors = async (req, res, next) => {
  try {
    const doctors = await Doctor.find().populate('user', 'name email phone gender isVerified avatar').sort({ createdAt: -1 });
    res.json({ success: true, count: doctors.length, doctors });
  } catch (err) {
    next(err);
  }
};

exports.updateDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('user', 'name email phone gender');
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
    if (req.body.name || req.body.email || req.body.phone) {
      const userUpdate = {};
      if (req.body.name) userUpdate.name = req.body.name;
      if (req.body.email) userUpdate.email = req.body.email;
      if (req.body.phone) userUpdate.phone = req.body.phone;
      await User.findByIdAndUpdate(doctor.user._id, userUpdate);
    }
    res.json({ success: true, message: 'Doctor updated', doctor });
  } catch (err) {
    next(err);
  }
};

exports.removeDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
    await Doctor.findByIdAndDelete(req.params.id);
    // Optionally deactivate user instead of deleting
    await User.findByIdAndUpdate(doctor.user, { isVerified: false });
    res.json({ success: true, message: 'Doctor removed' });
  } catch (err) {
    next(err);
  }
};

exports.getPatients = async (req, res, next) => {
  try {
    const patients = await User.find({ role: 'patient' }).select('-password -otp -otpExpire -otpType').sort({ createdAt: -1 });
    res.json({ success: true, count: patients.length, patients });
  } catch (err) {
    next(err);
  }
};

exports.getPatientDetails = async (req, res, next) => {
  try {
    const patient = await User.findById(req.params.id).select('-password -otp -otpExpire -otpType');
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });
    const appointments = await Appointment.find({ patient: req.params.id })
      .populate({ path: 'doctor', select: 'name email' })
      .populate('doctorProfile')
      .sort({ date: -1 });
    const prescriptions = await Prescription.find({ patient: req.params.id })
      .populate({ path: 'doctor', select: 'name' })
      .sort({ createdAt: -1 });
    const reports = await MedicalReport.find({ patient: req.params.id })
      .populate({ path: 'doctor', select: 'name' })
      .sort({ createdAt: -1 });
    res.json({ success: true, patient, appointments, prescriptions, reports });
  } catch (err) {
    next(err);
  }
};

exports.getAllAppointments = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const appointments = await Appointment.find(filter)
      .populate('patient', 'name email phone')
      .populate({ path: 'doctor', select: 'name email' })
      .populate('doctorProfile')
      .sort({ date: -1 });
    res.json({ success: true, count: appointments.length, appointments });
  } catch (err) {
    next(err);
  }
};

exports.getReportsOverview = async (req, res, next) => {
  try {
    const totalDoctors = await Doctor.countDocuments();
    const totalPatients = await User.countDocuments({ role: 'patient' });
    const totalAppointments = await Appointment.countDocuments();
    const appointmentsByStatus = await Appointment.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const appointmentsByMonth = await Appointment.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$date' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 12 },
    ]);
    const recentAppointments = await Appointment.find()
      .populate('patient', 'name')
      .populate({ path: 'doctor', select: 'name' })
      .sort({ date: -1 })
      .limit(5);
    res.json({
      success: true,
      stats: { totalDoctors, totalPatients, totalAppointments },
      appointmentsByStatus,
      appointmentsByMonth,
      recentAppointments,
    });
  } catch (err) {
    next(err);
  }
};
