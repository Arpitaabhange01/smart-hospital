const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');

exports.registerPatient = async (req, res, next) => {
  try {
    const { name, email, phone, password, gender, dateOfBirth, address } = req.body;
    if (!name || !email || !phone) {
      return res.status(400).json({ success: false, message: 'Name, email and phone are required' });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }
    const user = await User.create({
      name, email, phone,
      password: password || 'password123',
      role: 'patient',
      isVerified: true,
      gender, dateOfBirth, address,
    });
    res.status(201).json({ success: true, message: 'Patient registered successfully', patient: user });
  } catch (err) {
    next(err);
  }
};

exports.getDoctors = async (req, res, next) => {
  try {
    const doctors = await Doctor.find({ isActive: true }).populate('user', 'name email phone gender');
    res.json({ success: true, count: doctors.length, doctors });
  } catch (err) {
    next(err);
  }
};

exports.bookAppointment = async (req, res, next) => {
  try {
    const { patientId, doctorId, date, timeSlot, reason } = req.body;
    if (!patientId || !doctorId || !date || !timeSlot) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    const doctorProfile = await Doctor.findById(doctorId);
    if (!doctorProfile) return res.status(404).json({ success: false, message: 'Doctor not found' });
    const existing = await Appointment.findOne({
      doctor: doctorProfile.user,
      date: new Date(date),
      timeSlot,
      status: { $ne: 'cancelled' },
    });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Time slot already booked' });
    }
    const appointment = await Appointment.create({
      patient: patientId,
      doctor: doctorProfile.user,
      doctorProfile: doctorId,
      date: new Date(date),
      timeSlot,
      reason,
      status: 'confirmed',
    });
    const populated = await Appointment.findById(appointment._id)
      .populate('patient', 'name email phone')
      .populate({ path: 'doctor', select: 'name email' })
      .populate('doctorProfile');
    res.status(201).json({ success: true, message: 'Appointment booked', appointment: populated });
  } catch (err) {
    next(err);
  }
};

exports.getAppointments = async (req, res, next) => {
  try {
    const { status, date } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (date) filter.date = { $gte: new Date(date), $lt: new Date(new Date(date).setDate(new Date(date).getDate() + 1)) };
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

exports.getPatients = async (req, res, next) => {
  try {
    const patients = await User.find({ role: 'patient' }).select('name email phone gender dateOfBirth').sort({ createdAt: -1 });
    res.json({ success: true, count: patients.length, patients });
  } catch (err) {
    next(err);
  }
};

exports.updateAppointment = async (req, res, next) => {
  try {
    const { status, date, timeSlot } = req.body;
    const update = {};
    if (status) update.status = status;
    if (date) update.date = new Date(date);
    if (timeSlot) update.timeSlot = timeSlot;
    const appointment = await Appointment.findByIdAndUpdate(req.params.id, update, { new: true })
      .populate('patient', 'name email phone')
      .populate({ path: 'doctor', select: 'name email' });
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
    res.json({ success: true, message: 'Appointment updated', appointment });
  } catch (err) {
    next(err);
  }
};
