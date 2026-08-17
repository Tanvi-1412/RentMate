const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const {
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
} = require('../controllers/adminController');

router.use(authenticate, authorize('ADMIN'));

router.get('/dashboard', getDashboardStats);
router.get('/users', getUsers);
router.patch('/users/:id/block', blockUser);
router.patch('/users/:id/unblock', unblockUser);
router.patch('/users/:id/verify-id', verifyStudentId);

router.get('/products', getProducts);
router.delete('/products/:id', adminDeleteProduct);

router.get('/reports', getReports);
router.patch('/reports/:id', updateReportStatus);

router.get('/activity-logs', getActivityLogs);

module.exports = router;
