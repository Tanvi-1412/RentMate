const Report = require('../models/Report');
const { sendSuccess, sendError } = require('../utils/response');

const createReport = async (req, res, next) => {
  try {
    const { targetType, targetId, reason, description } = req.body;

    const report = await Report.create({
      reporterId: req.user.userId,
      targetType,
      targetId,
      reason,
      description: description || '',
      status: 'OPEN',
    });

    return sendSuccess(res, 201, 'Report submitted to admin for review', report);
  } catch (error) {
    next(error);
  }
};

const getMyReports = async (req, res, next) => {
  try {
    const reports = await Report.find({ reporterId: req.user.userId }).sort({ createdAt: -1 });
    return sendSuccess(res, 200, 'My submitted reports', reports);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReport,
  getMyReports,
};
