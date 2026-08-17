const { sendError } = require('../utils/response');

const checkCollege = (req, res, next) => {
  if (!req.user || req.user.college !== 'KITCOEK') {
    return sendError(res, 403, 'Forbidden: RentMate is strictly restricted to KITCOEK students');
  }
  next();
};

module.exports = checkCollege;
