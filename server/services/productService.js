const Product = require('../models/Product');
const { deleteImage } = require('./cloudinaryService');

const getProducts = async (query) => {
  const {
    q,
    category,
    type,
    condition,
    availability,
    minPrice,
    maxPrice,
    sort = 'newest',
    page = 1,
    limit = 12,
  } = query;

  const filter = { status: 'ACTIVE' };

  if (availability && availability !== 'ALL') {
    filter.availability = availability;
  }

  if (category) {
    filter.categoryId = category;
  }

  if (type && ['SELL', 'RENT'].includes(type)) {
    filter.transactionType = type;
  }

  if (condition) {
    filter.condition = condition;
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};
    if (minPrice !== undefined) filter.price.$gte = Number(minPrice);
    if (maxPrice !== undefined) filter.price.$lte = Number(maxPrice);
  }

  if (q) {
    filter.$or = [
      { title: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
      { approximateLocation: { $regex: q, $options: 'i' } },
    ];
  }

  let sortOption = { createdAt: -1 };
  if (sort === 'oldest') sortOption = { createdAt: 1 };
  if (sort === 'price_asc') sortOption = { price: 1 };
  if (sort === 'price_desc') sortOption = { price: -1 };

  const skip = (Number(page) - 1) * Number(limit);

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate('ownerId', 'name course studyYear profileImage approximateLocation')
      .populate('categoryId', 'name slug')
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit)),
    Product.countDocuments(filter),
  ]);

  return {
    products,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
};

const createProduct = async (userId, productData, files = []) => {
  if (!files || files.length === 0) {
    const err = new Error('At least 1 product image is required (maximum 3)');
    err.statusCode = 400;
    throw err;
  }

  if (files.length > 3) {
    const err = new Error('A maximum of 3 product images is allowed');
    err.statusCode = 400;
    throw err;
  }

  const images = files.map((file) => ({
    url: file.path || file.secure_url,
    publicId: file.filename || file.public_id || '',
  }));

  const product = await Product.create({
    ownerId: userId,
    title: productData.title,
    categoryId: productData.categoryId,
    description: productData.description,
    condition: productData.condition,
    transactionType: productData.transactionType,
    price: Number(productData.price),
    rentalPeriod: productData.rentalPeriod || '',
    securityDeposit: Number(productData.securityDeposit || 0),
    images,
    approximateLocation: productData.approximateLocation || 'Near KITCOEK',
    availability: 'AVAILABLE',
  });

  return product;
};

const deleteProduct = async (product) => {
  // Delete images from Cloudinary
  if (product.images && product.images.length > 0) {
    for (const img of product.images) {
      await deleteImage(img.publicId);
    }
  }

  await Product.findByIdAndDelete(product._id);
};

module.exports = {
  getProducts,
  createProduct,
  deleteProduct,
};
