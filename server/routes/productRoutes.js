const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const checkCollege = require('../middleware/checkCollege');
const checkOwnership = require('../middleware/checkOwnership');
const upload = require('../middleware/upload');
const validate = require('../middleware/validate');
const Product = require('../models/Product');
const { productValidator } = require('../validators/productValidator');
const {
  getAllProducts,
  getProductById,
  addProduct,
  updateProduct,
  removeProduct,
  updateAvailability,
  getMyProducts,
} = require('../controllers/productController');

router.get('/', getAllProducts);
router.get('/my-products', authenticate, getMyProducts);
router.get('/:id', getProductById);

router.post(
  '/',
  authenticate,
  checkCollege,
  upload.array('images', 3),
  productValidator,
  validate,
  addProduct
);

router.patch(
  '/:id',
  authenticate,
  checkCollege,
  checkOwnership(Product, 'id', 'ownerId'),
  updateProduct
);

router.delete(
  '/:id',
  authenticate,
  checkCollege,
  checkOwnership(Product, 'id', 'ownerId'),
  removeProduct
);

router.patch(
  '/:id/availability',
  authenticate,
  checkCollege,
  checkOwnership(Product, 'id', 'ownerId'),
  updateAvailability
);

module.exports = router;
