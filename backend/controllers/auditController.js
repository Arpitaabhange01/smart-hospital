const AuditLog = require('../models/AuditLog');

exports.getAuditLogs = async (req, res, next) => {
  try {
    const { action, resource, userId, startDate, endDate } = req.query;
    const filter = {};
    if (action) filter.action = action;
    if (resource) filter.resource = resource;
    if (userId) filter.user = userId;
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }
    const logs = await AuditLog.find(filter)
      .populate('user', 'name email role')
      .sort({ timestamp: -1 })
      .limit(200);
    res.json({ success: true, count: logs.length, logs });
  } catch (err) { next(err); }
};

exports.logAction = async (req, res, next) => {
  try {
    const log = await AuditLog.create({
      user: req.user?._id,
      action: req.body.action,
      resource: req.body.resource,
      resourceId: req.body.resourceId,
      details: req.body.details,
      ip: req.ip,
      userAgent: req.headers['user-agent'] || '',
    });
    res.status(201).json({ success: true, log });
  } catch (err) { next(err); }
};
