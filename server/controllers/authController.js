const { registerUser, loginUser } = require('../services/authService');
const { sendSuccess, sendError } = require('../utils/response');
const { logActivity } = require('../utils/logger');

const register = async (req, res, next) => {
  try {
    const studentIdFile = req.file || null;
    const result = await registerUser(req.body, studentIdFile);

    await logActivity({
      actorId: result.user.id,
      action: 'USER_REGISTERED',
      targetType: 'USER',
      targetId: result.user.id,
      req,
    });

    return sendSuccess(res, 201, 'Registration successful. Student ID is pending verification.', result);
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await loginUser(email, password);

    await logActivity({
      actorId: result.user.id,
      action: 'USER_LOGGED_IN',
      targetType: 'USER',
      targetId: result.user.id,
      req,
    });

    return sendSuccess(res, 200, 'Login successful', result);
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res) => {
  return sendSuccess(res, 200, 'Logged out successfully');
};

const getMe = async (req, res) => {
  return sendSuccess(res, 200, 'Current authenticated user', req.currentUser);
};

module.exports = {
  register,
  login,
  logout,
  getMe,
};
