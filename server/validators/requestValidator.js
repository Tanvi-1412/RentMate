const { body } = require('express-validator');

const requestValidator = [
  body('productId').isMongoId().withMessage('Invalid Product ID'),
  body('requestType')
    .isIn(['BUY', 'RENT', 'SELL'])
    .withMessage('Request type must be BUY or RENT'),
  body('message').optional().trim().isLength({ max: 500 }).withMessage('Message cannot exceed 500 characters'),
];

module.exports = {
  requestValidator,
};
