const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const upload = require('../middleware/upload');
const validate = require('../middleware/validate');
const { updateProfileValidator } = require('../validators/userValidator');
const {
  getMyProfile,
  updateMyProfile,
  getUserPublicProfile,
  updateProfileImage,
} = require('../controllers/userController');

router.get('/me', authenticate, getMyProfile);
router.patch('/me', authenticate, updateProfileValidator, validate, updateMyProfile);
router.patch('/profile-image', authenticate, upload.single('profileImage'), updateProfileImage);
router.get('/:id', authenticate, getUserPublicProfile);

module.exports = router;
