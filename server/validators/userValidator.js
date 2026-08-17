const { body } = require('express-validator');

const updateProfileValidator = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('phone').optional().trim().notEmpty().withMessage('Phone cannot be empty'),
  body('course').optional().trim().notEmpty().withMessage('Course cannot be empty'),
  body('studyYear').optional().trim().notEmpty().withMessage('Study year cannot be empty'),
  body('approximateLocation').optional().trim().notEmpty().withMessage('Location cannot be empty'),
];

module.exports = {
  updateProfileValidator,
};
