const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true },
  resource: { type: String, required: true },
  resourceId: { type: String },
  details: { type: mongoose.Schema.Types.Mixed },
  ip: { type: String, default: '' },
  userAgent: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now },
});

auditLogSchema.index({ timestamp: -1 });
auditLogSchema.index({ user: 1, timestamp: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
