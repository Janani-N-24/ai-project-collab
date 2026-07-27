const jwt = require('jsonwebtoken');

// Generates a signed JWT containing the user's id.
// Expiry is configurable via env so it can be tuned per deployment/demo needs.
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

module.exports = generateToken;
