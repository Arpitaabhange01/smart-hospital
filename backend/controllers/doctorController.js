const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Prescription = require('../models/Prescription');
const MedicalReport = require('../models/MedicalReport');
const Notification = require('../models/Notification');
const User = require('../models/User');

const emit = (req, userId, data) => {
  try { req.app.get('io')?.to(`user:${userId}`).emit('notification', data); } catch {}
};

exports.getMyProfile = async (req, res, next) => {
  try {
    let doctor = await Doctor.findOne({ user: req.user._id }).populate('user', 'name email phone gender avatar address');
    if (!doctor) {
      doctor = await Doctor.create({ user: req.user._id, specialization: 'General', department: 'General', fees: 0 });
      doctor = await Doctor.findById(doctor._id).populate('user', 'name email phone gender avatar address');
    }
    res.json({ success: true, doctor });
  } catch (err) { next(err); }
};

exports.updateMyProfile = async (req, res, next) => {
  try {
    const { specialization, department, experience, fees, about, availability } = req.body;
    let doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    if (specialization) doctor.specialization = specialization;
    if (department) doctor.department = department;
    if (experience !== undefined) doctor.experience = experience;
    if (fees) doctor.fees = fees;
    if (about !== undefined) doctor.about = about;
    if (availability) doctor.availability = availability;
    await doctor.save();
    doctor = await Doctor.findById(doctor._id).populate('user', 'name email phone gender avatar address');
    res.json({ success: true, message: 'Profile updated', doctor });
  } catch (err) { next(err); }
};

exports.getMyAppointments = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = { doctor: req.user._id };
    if (status) filter.status = status;
    const appointments = await Appointment.find(filter)
      .populate({ path: 'patient', select: 'name email phone gender avatar dateOfBirth' })
      .sort({ date: -1 });
    res.json({ success: true, count: appointments.length, appointments });
  } catch (err) { next(err); }
};

exports.updateAppointmentStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['confirmed', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.id, doctor: req.user._id },
      { status },
      { new: true }
    ).populate({ path: 'patient', select: 'name email phone' });
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });

    const notif = await Notification.create({
      user: appointment.patient._id,
      type: 'appointment_reminder',
      title: `Appointment ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message: `Your appointment with Dr. ${req.user.name} on ${new Date(appointment.date).toLocaleDateString()} at ${appointment.timeSlot} has been ${status}.`,
      link: '/patient/my-appointments',
    });
    emit(req, appointment.patient._id, notif);

    res.json({ success: true, message: `Appointment ${status}`, appointment });
  } catch (err) { next(err); }
};

exports.getPatientHistory = async (req, res, next) => {
  try {
    const patientId = req.params.patientId;
    const appointments = await Appointment.find({ doctor: req.user._id, patient: patientId })
      .populate({ path: 'patient', select: 'name email phone gender dateOfBirth address' })
      .sort({ date: -1 });
    const prescriptions = await Prescription.find({ doctor: req.user._id, patient: patientId }).sort({ createdAt: -1 });
    const reports = await MedicalReport.find({ doctor: req.user._id, patient: patientId }).sort({ createdAt: -1 });
    const patient = await User.findById(patientId);
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });
    res.json({ success: true, patient, appointments, prescriptions, reports });
  } catch (err) { next(err); }
};

exports.addAppointmentNotes = async (req, res, next) => {
  try {
    const { notes } = req.body;
    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.id, doctor: req.user._id },
      { notes },
      { new: true }
    );
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
    res.json({ success: true, message: 'Notes added', appointment });
  } catch (err) { next(err); }
};

exports.createPrescription = async (req, res, next) => {
  try {
    const { patientId, appointmentId, medicines, diagnosis, notes } = req.body;
    if (!patientId || !medicines || !medicines.length) {
      return res.status(400).json({ success: false, message: 'Patient and medicines are required' });
    }
    const prescription = await Prescription.create({
      patient: patientId,
      doctor: req.user._id,
      appointment: appointmentId || undefined,
      medicines,
      diagnosis,
      notes,
    });
    const populated = await Prescription.findById(prescription._id)
      .populate({ path: 'patient', select: 'name email' })
      .populate({ path: 'doctor', select: 'name' });

    const notif = await Notification.create({
      user: patientId,
      type: 'prescription',
      title: 'New Prescription Issued',
      message: `Dr. ${req.user.name} has issued a new prescription for you.`,
      link: '/patient/my-prescriptions',
    });
    emit(req, patientId, notif);

    res.status(201).json({ success: true, message: 'Prescription created', prescription: populated });
  } catch (err) { next(err); }
};

exports.getMyPrescriptions = async (req, res, next) => {
  try {
    const prescriptions = await Prescription.find({ doctor: req.user._id })
      .populate({ path: 'patient', select: 'name email' })
      .populate('appointment')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: prescriptions.length, prescriptions });
  } catch (err) { next(err); }
};

exports.uploadReport = async (req, res, next) => {
  try {
    const { patientId, title, description, reportType } = req.body;
    if (!patientId || !title) {
      return res.status(400).json({ success: false, message: 'Patient and title are required' });
    }
    const report = await MedicalReport.create({
      patient: patientId,
      doctor: req.user._id,
      title,
      description,
      reportType,
      fileUrl: req.file ? `/uploads/${req.file.filename}` : '',
    });

    const notif = await Notification.create({
      user: patientId,
      type: 'report',
      title: 'New Medical Report',
      message: `Dr. ${req.user.name} has uploaded a new report: ${title}.`,
      link: '/patient/my-reports',
    });
    emit(req, patientId, notif);

    res.status(201).json({ success: true, message: 'Report uploaded', report });
  } catch (err) { next(err); }
};

exports.getMyReports = async (req, res, next) => {
  try {
    const reports = await MedicalReport.find({ doctor: req.user._id })
      .populate({ path: 'patient', select: 'name email' })
      .sort({ createdAt: -1 });
    res.json({ success: true, count: reports.length, reports });
  } catch (err) { next(err); }
};
