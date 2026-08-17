const { body } = require('express-validator');

const productValidator = [
  body('title').trim().notEmpty().withMessage('Product title is required'),
  body('categoryId').notEmpty().withMessage('Category is required').isMongoId().withMessage('Invalid Category ID'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('condition')
    .notEmpty()
    .withMessage('Condition is required')
    .isIn(['NEW', 'LIKE_NEW', 'GOOD', 'USED', 'HEAVILY_USED'])
    .withMessage('Invalid condition value'),
  body('transactionType')
    .notEmpty()
    .withMessage('Transaction type is required')
    .isIn(['SELL', 'RENT'])
    .withMessage('Transaction type must be SELL or RENT'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
  body('approximateLocation').trim().notEmpty().withMessage('Approximate location is required'),
];

module.exports = {
  productValidator,
};
