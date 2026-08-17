const bcrypt = require('bcryptjs');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

const registerUser = async (userData, studentIdFile = null) => {
  const {
    name,
    email,
    phone,
    dateOfBirth,
    course,
    studyYear,
    approximateLocation,
    password,
  } = userData;

  // Check duplicate email
  const existingEmail = await User.findOne({ email: email.toLowerCase() });
  if (existingEmail) {
    const error = new Error('An account with this email already exists.');
    error.statusCode = 409;
    throw error;
  }

  // Check duplicate phone
  const existingPhone = await User.findOne({ phone });
  if (existingPhone) {
    const error = new Error('An account with this phone number already exists.');
    error.statusCode = 409;
    throw error;
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  // Student ID card image from Option B
  let studentIdImage = { url: '', publicId: '' };
  if (studentIdFile) {
    studentIdImage = {
      url: studentIdFile.path || studentIdFile.secure_url || '',
      publicId: studentIdFile.filename || studentIdFile.public_id || '',
    };
  }

  // Enforce collegeName = KITCOEK (Rule 1 & Rule 12)
  const newUser = await User.create({
    name,
    email: email.toLowerCase(),
    phone,
    dateOfBirth,
    collegeName: 'KITCOEK',
    course,
    studyYear,
    approximateLocation,
    studentIdImage,
    passwordHash,
    role: 'USER',
    status: 'PENDING', // Option B: Admin verifies Student ID
    isVerified: false,
  });

  const token = generateToken(newUser._id, newUser.role, newUser.collegeName);

  return {
    user: {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      collegeName: newUser.collegeName,
      course: newUser.course,
      studyYear: newUser.studyYear,
      approximateLocation: newUser.approximateLocation,
      role: newUser.role,
      status: newUser.status,
      isVerified: newUser.isVerified,
    },
    token,
  };
};

const loginUser = async (email, password) => {
  const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  if (user.status === 'BLOCKED') {
    const error = new Error('Your account has been blocked by an administrator.');
    error.statusCode = 403;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken(user._id, user.role, user.collegeName);

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      collegeName: user.collegeName,
      course: user.course,
      studyYear: user.studyYear,
      approximateLocation: user.approximateLocation,
      role: user.role,
      status: user.status,
      isVerified: user.isVerified,
      profileImage: user.profileImage,
    },
    token,
  };
};

module.exports = {
  registerUser,
  loginUser,
};
