const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Date of Birth is required'],
    },
    collegeName: {
      type: String,
      default: 'KITCOEK',
      immutable: true, // Backend hard-enforcement
    },
    course: {
      type: String,
      required: [true, 'Course is required'],
      trim: true,
    },
    studyYear: {
      type: String,
      required: [true, 'Year of study is required'],
      enum: ['First Year', 'Second Year', 'Third Year', 'Final Year', 'Postgraduate'],
    },
    approximateLocation: {
      type: String,
      required: [true, 'Approximate location is required'],
      trim: true,
      default: 'Near KITCOEK, Kolhapur',
    },
    profileImage: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    studentIdImage: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ['USER', 'ADMIN'],
      default: 'USER',
    },
    status: {
      type: String,
      enum: ['PENDING', 'ACTIVE', 'BLOCKED'],
      default: 'PENDING', // Option B: Pending Admin verification of Student ID
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);
