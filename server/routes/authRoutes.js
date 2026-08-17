const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const validate = require('../middleware/validate');
const authenticate = require('../middleware/authenticate');
const { authLimiter } = require('../middleware/rateLimiter');
const { registerValidator, loginValidator } = require('../validators/authValidator');
const { register, login, logout, getMe } = require('../controllers/authController');

router.post(
  '/register',
  authLimiter,
  upload.single('studentIdImage'),
  registerValidator,
  validate,
  register
);

router.post('/login', authLimiter, loginValidator, validate, login);
router.post('/logout', logout);
router.get('/me', authenticate, getMe);

module.exports = router;
