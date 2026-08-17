const multer = require('multer');
const path = require('path');
const fs = require('fs');

const useLocalStorage = process.env.USE_LOCAL_STORAGE === 'true';
const uploadDir = path.join(__dirname, '../../uploads');

if (useLocalStorage && !fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

let storage;

const hasCloudinaryKeys =
  Boolean(process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUD_NAME) &&
  Boolean(process.env.CLOUDINARY_API_KEY || process.env.CLOUD_API_KEY);

if (!useLocalStorage && hasCloudinaryKeys) {
  const { CloudinaryStorage } = require('multer-storage-cloudinary');
  const cloudinary = require('../config/cloudConfig');

  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'rentmate_products',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    },
  });
} else {
  // Local storage fallback for dev testing
  storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    },
  });
}

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, and WebP image files are allowed'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter,
});

module.exports = upload;
