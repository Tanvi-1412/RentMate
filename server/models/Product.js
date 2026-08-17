const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Product title is required'],
      trim: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    condition: {
      type: String,
      required: [true, 'Condition is required'],
      enum: ['NEW', 'LIKE_NEW', 'GOOD', 'USED', 'HEAVILY_USED'],
    },
    transactionType: {
      type: String,
      required: [true, 'Transaction type is required'],
      enum: ['SELL', 'RENT'],
      index: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    rentalPeriod: {
      type: String, // e.g., 'per day', 'per week', 'per month'
      default: '',
    },
    securityDeposit: {
      type: Number,
      default: 0,
    },
    images: {
      type: [
        {
          url: { type: String, required: true },
          publicId: { type: String, required: true },
        },
      ],
      validate: [
        function (val) {
          return val.length >= 1 && val.length <= 3;
        },
        'Product must have between 1 and 3 images',
      ],
    },
    approximateLocation: {
      type: String,
      required: [true, 'Approximate location is required'],
      trim: true,
      default: 'Near KITCOEK',
    },
    availability: {
      type: String,
      enum: ['AVAILABLE', 'UNAVAILABLE', 'COMPLETED'],
      default: 'AVAILABLE',
      index: true,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'REMOVED_BY_ADMIN', 'HIDDEN'],
      default: 'ACTIVE',
    },
  },
  {
    timestamps: true,
  }
);

// Search text index
productSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);
