const ActivityLog = require('../models/ActivityLog');

const logActivity = async ({ actorId, action, targetType = '', targetId = null, metadata = {}, req = null }) => {
  try {
    const ipAddress = req ? req.headers['x-forwarded-for'] || req.socket.remoteAddress || '' : '';
    await ActivityLog.create({
      actorId,
      action,
      targetType,
      targetId,
      metadata,
      ipAddress,
    });
  } catch (error) {
    console.error('[ActivityLogger] Error logging activity:', error.message);
  }
};

module.exports = {
  logActivity,
};
