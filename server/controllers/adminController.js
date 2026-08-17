const User = require('../models/User');
const Product = require('../models/Product');
const Request = require('../models/Request');
const Report = require('../models/Report');
const Category = require('../models/Category');
const ActivityLog = require('../models/ActivityLog');
const { sendSuccess, sendError } = require('../utils/response');
const { logActivity } = require('../utils/logger');
const { deleteProduct } = require('../services/productService');

const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      activeUsers,
      pendingUsers,
      blockedUsers,
      totalProducts,
      activeProducts,
      completedProducts,
      pendingRequests,
      completedTransactions,
      openReports,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ status: 'ACTIVE' }),
      User.countDocuments({ status: 'PENDING' }),
      User.countDocuments({ status: 'BLOCKED' }),
      Product.countDocuments(),
      Product.countDocuments({ availability: 'AVAILABLE', status: 'ACTIVE' }),
      Product.countDocuments({ availability: 'COMPLETED' }),
      Request.countDocuments({ status: 'PENDING' }),
      Request.countDocuments({ status: 'COMPLETED' }),
      Report.countDocuments({ status: 'OPEN' }),
    ]);

    return sendSuccess(res, 200, 'Admin dashboard statistics', {
      users: { total: totalUsers, active: activeUsers, pending: pendingUsers, blocked: blockedUsers },
      products: { total: totalProducts, active: activeProducts, completed: completedProducts },
      requests: { pending: pendingRequests, completed: completedTransactions },
      reports: { open: openReports },
    });
  } catch (error) {
    next(error);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const { status, q, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [users, total] = await Promise.all([
      User.find(filter).select('-passwordHash').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      User.countDocuments(filter),
    ]);

    return sendSuccess(res, 200, 'Users list fetched', { users, total, page: Number(page) });
  } catch (error) {
    next(error);
  }
};

const blockUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: 'BLOCKED' },
      { new: true }
    ).select('-passwordHash');

    if (!user) return sendError(res, 404, 'User not found');

    await logActivity({
      actorId: req.user.userId,
      action: 'ADMIN_BLOCKED_USER',
      targetType: 'USER',
      targetId: user._id,
      req,
    });

    return sendSuccess(res, 200, 'User has been blocked', user);
  } catch (error) {
    next(error);
  }
};

const unblockUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: 'ACTIVE', isVerified: true },
      { new: true }
    ).select('-passwordHash');

    if (!user) return sendError(res, 404, 'User not found');

    await logActivity({
      actorId: req.user.userId,
      action: 'ADMIN_UNBLOCKED_USER',
      targetType: 'USER',
      targetId: user._id,
      req,
    });

    return sendSuccess(res, 200, 'User unblocked and approved', user);
  } catch (error) {
    next(error);
  }
};

const verifyStudentId = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: 'ACTIVE', isVerified: true },
      { new: true }
    ).select('-passwordHash');

    if (!user) return sendError(res, 404, 'User not found');

    await logActivity({
      actorId: req.user.userId,
      action: 'ADMIN_VERIFIED_STUDENT',
      targetType: 'USER',
      targetId: user._id,
      req,
    });

    return sendSuccess(res, 200, 'Student ID verified and account activated', user);
  } catch (error) {
    next(error);
  }
};

const getProducts = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('ownerId', 'name email phone')
        .populate('categoryId', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Product.countDocuments(filter),
    ]);

    return sendSuccess(res, 200, 'Admin product list', { products, total });
  } catch (error) {
    next(error);
  }
};

const adminDeleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return sendError(res, 404, 'Product not found');

    await deleteProduct(product);

    await logActivity({
      actorId: req.user.userId,
      action: 'ADMIN_DELETED_PRODUCT',
      targetType: 'PRODUCT',
      targetId: product._id,
      req,
    });

    return sendSuccess(res, 200, 'Product removed by Admin');
  } catch (error) {
    next(error);
  }
};

const getReports = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const reports = await Report.find(filter)
      .populate('reporterId', 'name email')
      .sort({ createdAt: -1 });

    return sendSuccess(res, 200, 'Reports fetched', reports);
  } catch (error) {
    next(error);
  }
};

const updateReportStatus = async (req, res, next) => {
  try {
    const { status, adminNote } = req.body;
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      {
        status,
        adminNote: adminNote || '',
        resolvedBy: req.user.userId,
      },
      { new: true }
    );

    if (!report) return sendError(res, 404, 'Report not found');

    await logActivity({
      actorId: req.user.userId,
      action: 'ADMIN_RESOLVED_REPORT',
      targetType: 'REPORT',
      targetId: report._id,
      req,
    });

    return sendSuccess(res, 200, 'Report status updated', report);
  } catch (error) {
    next(error);
  }
};

const getActivityLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [logs, total] = await Promise.all([
      ActivityLog.find()
        .populate('actorId', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      ActivityLog.countDocuments(),
    ]);

    return sendSuccess(res, 200, 'Activity logs fetched', { logs, total, page: Number(page) });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getUsers,
  blockUser,
  unblockUser,
  verifyStudentId,
  getProducts,
  adminDeleteProduct,
  getReports,
  updateReportStatus,
  getActivityLogs,
};
