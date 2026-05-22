const Notification = require('../models/Notification');
const Appointment = require('../models/Appointment');
const { sendOTPEmail } = require('../utils/email');

const emitNotification = (req, userId, notification) => {
  try {
    const io = req.app.get('io');
    if (io) io.to(`user:${userId}`).emit('notification', notification);
  } catch {}
};

exports.getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50);
    const unreadCount = await Notification.countDocuments({ user: req.user._id, isRead: false });
    res.json({ success: true, count: notifications.length, unreadCount, notifications });
  } catch (err) { next(err); }
};

exports.markAsRead = async (req, res, next) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ success: true });
  } catch (err) { next(err); }
};

exports.markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
    res.json({ success: true });
  } catch (err) { next(err); }
};

exports.sendAppointmentReminder = async (req, res, next) => {
  try {
    const { appointmentId } = req.body;
    const appointment = await Appointment.findById(appointmentId).populate('patient').populate({ path: 'doctor', select: 'name' });
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });

    const notification = await Notification.create({
      user: appointment.patient._id,
      type: 'appointment_reminder',
      title: 'Appointment Reminder',
      message: `Reminder: You have an appointment with Dr. ${appointment.doctor.name} on ${new Date(appointment.date).toLocaleDateString()} at ${appointment.timeSlot}.`,
      link: '/patient/my-appointments',
    });

    emitNotification(req, appointment.patient._id, notification);

    try {
      await sendOTPEmail({
        to: appointment.patient.email,
        name: appointment.patient.name,
        otp: 'N/A',
        type: 'register',
        customSubject: 'Appointment Reminder - Smart Hospital',
        customHtml: `
          <div style="font-family:sans-serif;max-width:560px;margin:0 auto;">
            <div style="background:linear-gradient(135deg,#0f4c81,#1a7fc1);padding:30px;text-align:center;border-radius:16px 16px 0 0;">
              <h1 style="color:#fff;margin:0;font-size:20px;">🏥 Smart Hospital</h1>
            </div>
            <div style="padding:30px;background:#fff;border:1px solid #eee;">
              <h2 style="color:#0f4c81;">Appointment Reminder</h2>
              <p>Hello <strong>${appointment.patient.name}</strong>,</p>
              <p>This is a reminder for your upcoming appointment:</p>
              <div style="background:#f0f7ff;padding:20px;border-radius:12px;margin:20px 0;">
                <p style="margin:4px 0;"><strong>Doctor:</strong> Dr. ${appointment.doctor.name}</p>
                <p style="margin:4px 0;"><strong>Date:</strong> ${new Date(appointment.date).toLocaleDateString()}</p>
                <p style="margin:4px 0;"><strong>Time:</strong> ${appointment.timeSlot}</p>
              </div>
              <p style="color:#666;">Please arrive 10 minutes early. Thank you!</p>
            </div>
          </div>
        `,
      });
    } catch (emailErr) {}

    res.json({ success: true, message: 'Reminder sent' });
  } catch (err) { next(err); }
};
