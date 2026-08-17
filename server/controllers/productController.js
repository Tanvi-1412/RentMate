const Product = require('../models/Product');
const { getProducts, createProduct, deleteProduct } = require('../services/productService');
const { sendSuccess, sendError } = require('../utils/response');
const { logActivity } = require('../utils/logger');

const getAllProducts = async (req, res, next) => {
  try {
    const result = await getProducts(req.query);
    return sendSuccess(res, 200, 'Products fetched successfully', result);
  } catch (error) {
    next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('ownerId', 'name course studyYear approximateLocation profileImage status isVerified createdAt')
      .populate('categoryId', 'name slug');

    if (!product || product.status === 'REMOVED_BY_ADMIN') {
      return sendError(res, 404, 'Product not found or has been removed');
    }

    return sendSuccess(res, 200, 'Product details fetched', product);
  } catch (error) {
    next(error);
  }
};

const addProduct = async (req, res, next) => {
  try {
    const files = req.files || [];
    const product = await createProduct(req.user.userId, req.body, files);

    await logActivity({
      actorId: req.user.userId,
      action: 'USER_CREATED_PRODUCT',
      targetType: 'PRODUCT',
      targetId: product._id,
      req,
    });

    return sendSuccess(res, 201, 'Product created successfully', product);
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const product = req.resource; // From checkOwnership middleware
    const allowedUpdates = [
      'title',
      'categoryId',
      'description',
      'condition',
      'transactionType',
      'price',
      'rentalPeriod',
      'securityDeposit',
      'approximateLocation',
      'availability',
    ];

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    });

    await product.save();

    await logActivity({
      actorId: req.user.userId,
      action: 'USER_UPDATED_PRODUCT',
      targetType: 'PRODUCT',
      targetId: product._id,
      req,
    });

    return sendSuccess(res, 200, 'Product updated successfully', product);
  } catch (error) {
    next(error);
  }
};

const removeProduct = async (req, res, next) => {
  try {
    const product = req.resource; // From checkOwnership middleware
    await deleteProduct(product);

    await logActivity({
      actorId: req.user.userId,
      action: 'USER_DELETED_PRODUCT',
      targetType: 'PRODUCT',
      targetId: product._id,
      req,
    });

    return sendSuccess(res, 200, 'Product deleted successfully');
  } catch (error) {
    next(error);
  }
};

const updateAvailability = async (req, res, next) => {
  try {
    const product = req.resource;
    const { availability } = req.body;

    if (!['AVAILABLE', 'UNAVAILABLE', 'COMPLETED'].includes(availability)) {
      return sendError(res, 400, 'Invalid availability status');
    }

    product.availability = availability;
    await product.save();

    return sendSuccess(res, 200, 'Product availability updated', product);
  } catch (error) {
    next(error);
  }
};

const getMyProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ ownerId: req.user.userId })
      .populate('categoryId', 'name')
      .sort({ createdAt: -1 });

    return sendSuccess(res, 200, 'User listings fetched', products);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  addProduct,
  updateProduct,
  removeProduct,
  updateAvailability,
  getMyProducts,
};
