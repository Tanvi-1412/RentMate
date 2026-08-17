const User = require('../models/User');
const Product = require('../models/Product');
const Review = require('../models/Review');
const { sendSuccess, sendError } = require('../utils/response');

const getMyProfile = async (req, res) => {
  return sendSuccess(res, 200, 'User profile fetched', req.currentUser);
};

const updateMyProfile = async (req, res, next) => {
  try {
    const allowedUpdates = ['name', 'phone', 'course', 'studyYear', 'approximateLocation'];
    const updates = {};

    Object.keys(req.body).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const updatedUser = await User.findByIdAndUpdate(req.user.userId, updates, {
      new: true,
      runValidators: true,
    }).select('-passwordHash');

    return sendSuccess(res, 200, 'Profile updated successfully', updatedUser);
  } catch (error) {
    next(error);
  }
};

const getUserPublicProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select(
      'name collegeName course studyYear approximateLocation profileImage status isVerified createdAt'
    );

    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    const [activeListings, reviews] = await Promise.all([
      Product.find({ ownerId: user._id, availability: 'AVAILABLE', status: 'ACTIVE' }).populate(
        'categoryId',
        'name'
      ),
      Review.find({ revieweeId: user._id }).populate('reviewerId', 'name profileImage'),
    ]);

    const averageRating =
      reviews.length > 0
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
        : 0;

    return sendSuccess(res, 200, 'Public profile fetched', {
      user,
      activeListings,
      reviews,
      stats: {
        totalListings: activeListings.length,
        totalReviews: reviews.length,
        averageRating: Number(averageRating),
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateProfileImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return sendError(res, 400, 'Profile image file is required');
    }

    const imageObj = {
      url: req.file.path || req.file.secure_url || `/uploads/${req.file.filename}`,
      publicId: req.file.filename || req.file.public_id || '',
    };

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { profileImage: imageObj },
      { new: true }
    ).select('-passwordHash');

    return sendSuccess(res, 200, 'Profile image updated successfully', user);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  getUserPublicProfile,
  updateProfileImage,
};
