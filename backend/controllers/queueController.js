const QueueEntry = require('../models/QueueEntry');
const Doctor = require('../models/Doctor');
const Notification = require('../models/Notification');

const AVG_CONSULT_MINUTES = 10;

const emitQueue = (req, doctorId) => {
  try {
    const io = req.app.get('io');
    QueueEntry.find({ doctor: doctorId, status: { $in: ['waiting', 'called', 'in-progress'] } }).sort({ tokenNumber: 1 }).then((queue) => {
      io.to(`user:${doctorId}`).emit('queue:update', queue);
      queue.forEach((entry) => {
        io.to(`user:${entry.patient}`).emit('queue:update', {
          myEntry: entry,
          position: queue.findIndex((q) => q._id.equals(entry._id)) + 1,
          totalWaiting: queue.length,
        });
      });
    });
  } catch {}
};

exports.getDoctorQueue = async (req, res, next) => {
  try {
    const queue = await QueueEntry.find({
      doctor: req.user._id,
      status: { $in: ['waiting', 'called', 'in-progress'] },
    }).populate('patient', 'name email phone gender avatar').sort({ tokenNumber: 1 });
    const todayCount = await QueueEntry.countDocuments({ doctor: req.user._id, checkedInAt: { $gte: new Date().setHours(0, 0, 0, 0) } });
    res.json({ success: true, queue, todayCount });
  } catch (err) { next(err); }
};

exports.checkIn = async (req, res, next) => {
  try {
    const { doctorId, appointmentId, priority } = req.body;
    if (!doctorId) return res.status(400).json({ success: false, message: 'Doctor is required' });

    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const lastToken = await QueueEntry.findOne({ doctor: doctorId, checkedInAt: { $gte: todayStart } }).sort({ tokenNumber: -1 });
    const tokenNumber = (lastToken?.tokenNumber || 0) + 1;

    const activeCount = await QueueEntry.countDocuments({ doctor: doctorId, status: { $in: ['waiting', 'called', 'in-progress'] } });
    const estimatedWaitMinutes = activeCount * AVG_CONSULT_MINUTES;

    const entry = await QueueEntry.create({
      patient: req.user._id,
      doctor: doctorId,
      appointment: appointmentId || undefined,
      tokenNumber,
      priority: priority || 'normal',
      estimatedWaitMinutes,
    });

    const populated = await QueueEntry.findById(entry._id).populate('patient', 'name email phone gender avatar');

    const notif = await Notification.create({
      user: doctorId,
      type: 'appointment_reminder',
      title: `Patient Checked In — Token #${tokenNumber}`,
      message: `${req.user.name} has checked in. Estimated wait: ${estimatedWaitMinutes} min.`,
      link: '/doctor/queue',
    });
    try { req.app.get('io')?.to(`user:${doctorId}`).emit('notification', notif); } catch {}

    emitQueue(req, doctorId);
    res.status(201).json({ success: true, message: `Checked in. Token #${tokenNumber}`, entry: populated });
  } catch (err) { next(err); }
};

exports.callNext = async (req, res, next) => {
  try {
    const nextEntry = await QueueEntry.findOne({ doctor: req.user._id, status: 'waiting' }).sort({ priority: -1, tokenNumber: 1 });
    if (!nextEntry) return res.status(404).json({ success: false, message: 'No patients in queue.' });

    // Mark any currently "called" back to "waiting"
    await QueueEntry.updateMany({ doctor: req.user._id, status: 'called' }, { status: 'waiting' });

    nextEntry.status = 'called';
    nextEntry.calledAt = new Date();
    await nextEntry.save();

    const populated = await QueueEntry.findById(nextEntry._id).populate('patient', 'name email phone gender avatar');

    try {
      const notif = await Notification.create({
        user: nextEntry.patient,
        type: 'appointment_reminder',
        title: `Token #${nextEntry.tokenNumber} — Doctor is Ready`,
        message: `Please proceed to Dr. ${req.user.name}'s cabin. Your token has been called.`,
        link: '/patient/queue',
      });
      req.app.get('io')?.to(`user:${nextEntry.patient}`).emit('notification', notif);
      req.app.get('io')?.to(`user:${nextEntry.patient}`).emit('queue:called', { tokenNumber: nextEntry.tokenNumber, doctorName: req.user.name });
    } catch {}

    emitQueue(req, req.user._id);
    res.json({ success: true, message: `Token #${nextEntry.tokenNumber} called`, entry: populated });
  } catch (err) { next(err); }
};

exports.startConsultation = async (req, res, next) => {
  try {
    const entry = await QueueEntry.findOneAndUpdate(
      { _id: req.params.id, doctor: req.user._id, status: 'called' },
      { status: 'in-progress' },
      { new: true }
    ).populate('patient', 'name email phone gender avatar');
    if (!entry) return res.status(404).json({ success: false, message: 'Entry not found or not in called status' });
    emitQueue(req, req.user._id);
    res.json({ success: true, entry });
  } catch (err) { next(err); }
};

exports.completeConsultation = async (req, res, next) => {
  try {
    const entry = await QueueEntry.findOneAndUpdate(
      { _id: req.params.id, doctor: req.user._id, status: 'in-progress' },
      { status: 'completed', completedAt: new Date() },
      { new: true }
    );
    if (!entry) return res.status(404).json({ success: false, message: 'Entry not found' });
    emitQueue(req, req.user._id);
    res.json({ success: true, message: 'Consultation completed', entry });
  } catch (err) { next(err); }
};

exports.markNoShow = async (req, res, next) => {
  try {
    const entry = await QueueEntry.findOneAndUpdate(
      { _id: req.params.id, doctor: req.user._id, status: { $in: ['waiting', 'called'] } },
      { status: 'no-show' },
      { new: true }
    );
    if (!entry) return res.status(404).json({ success: false, message: 'Entry not found' });
    emitQueue(req, req.user._id);
    res.json({ success: true, message: 'Marked as no-show', entry });
  } catch (err) { next(err); }
};

exports.getPatientQueueStatus = async (req, res, next) => {
  try {
    const entry = await QueueEntry.findOne({
      patient: req.user._id,
      status: { $in: ['waiting', 'called', 'in-progress'] },
    }).populate({ path: 'doctor', select: 'name' }).populate('doctorProfile', 'specialization').sort({ checkedInAt: -1 });
    if (!entry) return res.json({ success: true, queue: null, message: 'No active queue entry' });
    const ahead = await QueueEntry.countDocuments({ doctor: entry.doctor, status: { $in: ['waiting', 'called'] }, tokenNumber: { $lt: entry.tokenNumber } });
    const totalWaiting = await QueueEntry.countDocuments({ doctor: entry.doctor, status: { $in: ['waiting', 'called'] } });
    res.json({ success: true, queue: entry, position: ahead + 1, totalWaiting: totalWaiting + 1 });
  } catch (err) { next(err); }
};

exports.receptionistCheckIn = async (req, res, next) => {
  try {
    const { patientId, doctorId, appointmentId, priority } = req.body;
    if (!patientId || !doctorId) return res.status(400).json({ success: false, message: 'Patient and doctor required' });

    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const lastToken = await QueueEntry.findOne({ doctor: doctorId, checkedInAt: { $gte: todayStart } }).sort({ tokenNumber: -1 });
    const tokenNumber = (lastToken?.tokenNumber || 0) + 1;

    const activeCount = await QueueEntry.countDocuments({ doctor: doctorId, status: { $in: ['waiting', 'called', 'in-progress'] } });
    const estimatedWaitMinutes = activeCount * AVG_CONSULT_MINUTES;

    const entry = await QueueEntry.create({
      patient: patientId,
      doctor: doctorId,
      appointment: appointmentId || undefined,
      tokenNumber,
      priority: priority || 'normal',
      estimatedWaitMinutes,
    });

    const populated = await QueueEntry.findById(entry._id)
      .populate('patient', 'name email phone')
      .populate({ path: 'doctor', select: 'name' });

    emitQueue(req, doctorId);
    res.status(201).json({ success: true, message: `Patient checked in. Token #${tokenNumber}`, entry: populated });
  } catch (err) { next(err); }
};
