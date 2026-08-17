const Request = require('../models/Request');
const Product = require('../models/Product');
const { createAndSendNotification } = require('./notificationService');

const createRequest = async (requesterId, { productId, requestType, message }) => {
  // Normalize SELL to BUY (if a item is listed for SELL, the student request is BUY)
  const normalizedType = requestType === 'SELL' ? 'BUY' : requestType;

  const product = await Product.findById(productId);
  if (!product) {
    const err = new Error('Product not found');
    err.statusCode = 404;
    throw err;
  }

  if (product.ownerId.toString() === requesterId) {
    const err = new Error('You cannot request your own product');
    err.statusCode = 400;
    throw err;
  }

  if (product.availability !== 'AVAILABLE') {
    const err = new Error('This product is currently unavailable for requests');
    err.statusCode = 400;
    throw err;
  }

  // Check existing active request
  const existingActive = await Request.findOne({
    productId,
    requesterId,
    status: { $in: ['PENDING', 'ACCEPTED'] },
  });

  if (existingActive) {
    const err = new Error('You already have an active request for this product');
    err.statusCode = 409;
    throw err;
  }

  const newRequest = await Request.create({
    productId,
    requesterId,
    sellerId: product.ownerId,
    requestType: normalizedType,
    status: 'PENDING',
    message: message || '',
  });

  // Send notification to seller
  await createAndSendNotification({
    recipientId: product.ownerId,
    type: 'REQUEST_NEW',
    title: 'New Product Request',
    message: `A student requested to ${normalizedType.toLowerCase()} your item "${product.title}"`,
    relatedProductId: product._id,
    relatedRequestId: newRequest._id,
  });

  return newRequest;
};

const updateRequestStatus = async (request, newStatus, userId) => {
  request.status = newStatus;
  await request.save();

  const product = await Product.findById(request.productId);

  if (newStatus === 'ACCEPTED') {
    // Notify requester
    await createAndSendNotification({
      recipientId: request.requesterId,
      type: 'REQUEST_ACCEPTED',
      title: 'Request Accepted!',
      message: `Your request for "${product ? product.title : 'item'}" was accepted by the seller. Open Chat to arrange exchange.`,
      relatedProductId: request.productId,
      relatedRequestId: request._id,
    });
  } else if (newStatus === 'REJECTED') {
    await createAndSendNotification({
      recipientId: request.requesterId,
      type: 'REQUEST_REJECTED',
      title: 'Request Rejected',
      message: `Your request for "${product ? product.title : 'item'}" was declined by the seller.`,
      relatedProductId: request.productId,
      relatedRequestId: request._id,
    });
  } else if (newStatus === 'COMPLETED') {
    if (product) {
      product.availability = 'COMPLETED';
      await product.save();
    }
  }

  return request;
};

module.exports = {
  createRequest,
  updateRequestStatus,
};
