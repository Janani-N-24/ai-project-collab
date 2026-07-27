const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('./asyncHandler');

// Protects any route it's applied to. Expects "Authorization: Bearer <token>".
// On success attaches the authenticated user (without passwordHash) to req.user.
const protect = asyncHandler(async (req, res, next) => {
  let token;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token provided');
  }

  // jwt.verify throws for expired/invalid tokens; caught by asyncHandler and
  // formatted by the central error middleware (JsonWebTokenError / TokenExpiredError)
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const user = await User.findById(decoded.id);
  if (!user) {
    res.status(401);
    throw new Error('Not authorized, user no longer exists');
  }

  req.user = user;
  next();
});

module.exports = { protect };
