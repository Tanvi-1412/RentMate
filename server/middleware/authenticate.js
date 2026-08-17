const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendError } = require('../utils/response');

const authenticate = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return sendError(res, 401, 'Authentication token missing or invalid');
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'rentmate_super_secret_jwt_key_2026'
    );

    const user = await User.findById(decoded.userId).select('-passwordHash');
    if (!user) {
      return sendError(res, 401, 'User account no longer exists');
    }

    if (user.status === 'BLOCKED') {
      return sendError(res, 403, 'Your account has been blocked by an administrator');
    }

    req.user = {
      userId: user._id.toString(),
      role: user.role,
      college: user.collegeName,
      status: user.status,
    };
    req.currentUser = user;

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 401, 'Token has expired. Please log in again.');
    }
    return sendError(res, 401, 'Invalid authentication token');
  }
};

module.exports = authenticate;
