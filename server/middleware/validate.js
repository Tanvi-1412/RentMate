const { validationResult } = require('express-validator');
const { sendError } = require('../utils/response');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(
      res,
      400,
      'Validation failed',
      errors.array().map((err) => ({ field: err.path, message: err.msg }))
    );
  }
  next();
};

module.exports = validate;
