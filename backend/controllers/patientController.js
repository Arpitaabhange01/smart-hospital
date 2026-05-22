const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Prescription = require('../models/Prescription');
const MedicalReport = require('../models/MedicalReport');
const Notification = require('../models/Notification');

const emit = (req, userId, data) => {
  try { req.app.get('io')?.to(`user:${userId}`).emit('notification', data); } catch {}
};

exports.getDoctors = async (req, res, next) => {
  try {
    const doctors = await Doctor.find({ isActive: true }).populate('user', 'name email gender avatar');
    res.json({ success: true, count: doctors.length, doctors });
  } catch (err) { next(err); }
};

exports.getDoctorById = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate('user', 'name email gender avatar phone address');
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
    res.json({ success: true, doctor });
  } catch (err) { next(err); }
};

exports.bookAppointment = async (req, res, next) => {
  try {
    const { doctorId, date, timeSlot, reason } = req.body;
    if (!doctorId || !date || !timeSlot) {
      return res.status(400).json({ success: false, message: 'Doctor, date, and time slot are required' });
    }

    const doctorProfile = await Doctor.findById(doctorId);
    if (!doctorProfile) return res.status(404).json({ success: false, message: 'Doctor profile not found' });

    const existing = await Appointment.findOne({
      doctor: doctorProfile.user,
      date: new Date(date),
      timeSlot,
      status: { $ne: 'cancelled' },
    });
    if (existing) {
      return res.status(400).json({ success: false, message: 'This time slot is already booked' });
    }

    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor: doctorProfile.user,
      doctorProfile: doctorId,
      date: new Date(date),
      timeSlot,
      reason,
      status: 'pending',
    });

    const populated = await Appointment.findById(appointment._id)
      .populate('patient', 'name email phone')
      .populate({ path: 'doctor', select: 'name email' })
      .populate('doctorProfile');

    const notif = await Notification.create({
      user: doctorProfile.user,
      type: 'appointment_reminder',
      title: 'New Appointment Booking',
      message: `${req.user.name} booked an appointment on ${new Date(date).toLocaleDateString()} at ${timeSlot}.`,
      link: '/doctor/appointments',
    });
    emit(req, doctorProfile.user, notif);

    res.status(201).json({ success: true, message: 'Appointment booked successfully', appointment: populated });
  } catch (err) { next(err); }
};

exports.getMyAppointments = async (req, res, next) => {
  try {
    const appointments = await Appointment.find({ patient: req.user._id })
      .populate({ path: 'doctor', select: 'name email gender avatar' })
      .populate('doctorProfile')
      .sort({ date: -1 });
    res.json({ success: true, count: appointments.length, appointments });
  } catch (err) { next(err); }
};

exports.getMyPrescriptions = async (req, res, next) => {
  try {
    const prescriptions = await Prescription.find({ patient: req.user._id })
      .populate({ path: 'doctor', select: 'name email' })
      .populate('appointment')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: prescriptions.length, prescriptions });
  } catch (err) { next(err); }
};

exports.getMyReports = async (req, res, next) => {
  try {
    const reports = await MedicalReport.find({ patient: req.user._id })
      .populate({ path: 'doctor', select: 'name' })
      .sort({ createdAt: -1 });
    res.json({ success: true, count: reports.length, reports });
  } catch (err) { next(err); }
};

exports.getUpcomingAppointments = async (req, res, next) => {
  try {
    const now = new Date();
    const appointments = await Appointment.find({
      patient: req.user._id,
      date: { $gte: now },
      status: { $in: ['pending', 'confirmed'] },
    })
      .populate({ path: 'doctor', select: 'name email gender avatar' })
      .populate('doctorProfile')
      .sort({ date: 1 })
      .limit(5);
    res.json({ success: true, appointments });
  } catch (err) { next(err); }
};

exports.cancelAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.id, patient: req.user._id },
      { status: 'cancelled' },
      { new: true }
    );
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });

    const notif = await Notification.create({
      user: appointment.doctor,
      type: 'appointment_reminder',
      title: 'Appointment Cancelled',
      message: `${req.user.name} cancelled their appointment on ${new Date(appointment.date).toLocaleDateString()} at ${appointment.timeSlot}.`,
      link: '/doctor/appointments',
    });
    emit(req, appointment.doctor, notif);

    res.json({ success: true, message: 'Appointment cancelled', appointment });
  } catch (err) { next(err); }
};
