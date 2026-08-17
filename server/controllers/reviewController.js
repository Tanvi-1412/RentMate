const Review = require('../models/Review');
const Request = require('../models/Request');
const { sendSuccess, sendError } = require('../utils/response');

const createReview = async (req, res, next) => {
  try {
    const { productId, revieweeId, rating, comment } = req.body;

    // Backend Rule 52: Must verify completed interaction
    const completedInteraction = await Request.findOne({
      productId,
      status: 'COMPLETED',
      $or: [
        { requesterId: req.user.userId, sellerId: revieweeId },
        { sellerId: req.user.userId, requesterId: revieweeId },
      ],
    });

    if (!completedInteraction && req.user.role !== 'ADMIN') {
      return sendError(
        res,
        403,
        'Reviews can only be submitted after a verified completed transaction between students.'
      );
    }

    const review = await Review.create({
      productId,
      reviewerId: req.user.userId,
      revieweeId,
      rating,
      comment,
    });

    const populated = await Review.findById(review._id).populate('reviewerId', 'name profileImage');

    return sendSuccess(res, 201, 'Review submitted successfully', populated);
  } catch (error) {
    next(error);
  }
};

const getProductReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ productId: req.params.id })
      .populate('reviewerId', 'name profileImage course studyYear')
      .sort({ createdAt: -1 });

    return sendSuccess(res, 200, 'Product reviews fetched', reviews);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReview,
  getProductReviews,
};
