const User = require('../models/User');
const asyncHandler = require('../middlewares/asyncHandler');
const generateToken = require('../services/tokenService');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please provide name, email, and password');
  }
  if (password.length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters');
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    res.status(400);
    throw new Error('An account with this email already exists');
  }

  // Note: field is named passwordHash on the model, but the pre-save hook
  // hashes whatever plaintext is assigned to it before persisting.
  const user = await User.create({ name, email, passwordHash: password });

  res.status(201).json({
    success: true,
    token: generateToken(user._id),
    user,
  });
});

// @desc    Log in an existing user
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  // passwordHash has select: false on the schema, so it must be explicitly requested
  const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
  if (!user) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  res.json({
    success: true,
    token: generateToken(user._id),
    user, // toJSON() override strips passwordHash automatically
  });
});

// @desc    Get the currently logged-in user's profile
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user });
});

module.exports = { registerUser, loginUser, getMe };
