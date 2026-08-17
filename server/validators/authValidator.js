const { body } = require('express-validator');

const registerValidator = [
  body('name').trim().notEmpty().withMessage('Full name is required'),
  body('email').trim().isEmail().withMessage('Valid email is required').toLowerCase(),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('dateOfBirth').notEmpty().withMessage('Date of birth is required').isISO8601().withMessage('Invalid date format'),
  body('course').trim().notEmpty().withMessage('Course is required'),
  body('studyYear').trim().notEmpty().withMessage('Year of study is required'),
  body('approximateLocation').trim().notEmpty().withMessage('Approximate location is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords do not match');
    }
    return true;
  }),
];

const loginValidator = [
  body('email').trim().isEmail().withMessage('Valid email is required').toLowerCase(),
  body('password').notEmpty().withMessage('Password is required'),
];

module.exports = {
  registerValidator,
  loginValidator,
};
