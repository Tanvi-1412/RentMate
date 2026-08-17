const cloudinary = require('../config/cloudConfig');

const deleteImage = async (publicId) => {
  try {
    if (!publicId) return;
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('[CloudinaryService] Failed to delete image:', error.message);
  }
};

module.exports = {
  deleteImage,
};
