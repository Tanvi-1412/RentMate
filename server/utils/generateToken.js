const jwt = require('jsonwebtoken');

const generateToken = (userId, role, college = 'KITCOEK') => {
  return jwt.sign(
    {
      userId,
      role,
      college,
    },
    process.env.JWT_SECRET || 'rentmate_super_secret_jwt_key_2026',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  );
};

module.exports = generateToken;
