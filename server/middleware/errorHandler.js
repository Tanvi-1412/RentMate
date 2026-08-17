const errorHandler = (err, req, res, next) => {
  // Log internal details strictly on server console for developer debugging
  console.error('[RentMate Error Handler]:', err.message || err);

  let statusCode = err.statusCode || 500;
  let statusTitle = 'Server Busy';
  let userDescription = 'An unexpected issue occurred while processing your request. Please try again in a moment.';

  // Mongoose CastError (e.g. invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    statusTitle = 'Invalid Request';
    userDescription = 'The requested item or resource reference is invalid.';
  }
  // Mongoose Duplicate Key (11000)
  else if (err.code === 11000) {
    statusCode = 409;
    statusTitle = 'Already Exists';
    const field = err.keyValue ? Object.keys(err.keyValue)[0] : 'field';
    userDescription = `A record with this ${field} already exists in the KITCOEK marketplace.`;
  }
  // Mongoose ValidationError
  else if (err.name === 'ValidationError') {
    statusCode = 400;
    statusTitle = 'Validation Required';
    const messages = err.errors ? Object.values(err.errors).map((val) => val.message) : [];
    userDescription = messages.length > 0 ? messages.join('. ') : 'Please check all required form fields and try again.';
  }
  // JWT Authentication Errors
  else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    statusCode = 401;
    statusTitle = 'Session Expired';
    userDescription = 'Your login session has expired. Please sign in to continue.';
  }
  // Multer / Image Upload Errors
  else if (err.name === 'MulterError' || err.http_code === 403 || (err.message && err.message.toLowerCase().includes('cloudinary'))) {
    statusCode = 400;
    statusTitle = 'Upload Failed';
    userDescription = 'Could not process image upload. Please upload a JPEG, PNG, or WebP file under 5MB.';
  }
  // Clean operational errors
  else if (err.message && statusCode < 500) {
    statusTitle = 'Notice';
    userDescription = err.message;
  }

  return res.status(statusCode).json({
    success: false,
    status: statusCode,
    error: statusTitle,
    message: userDescription,
  });
};

module.exports = errorHandler;
