/**
 * ==========================================================================
 * SpendWise – Authentication Routes
 * Endpoints:
 *   POST /api/auth/register – Register a new user
 *   POST /api/auth/login    – Log in an existing user
 *   GET  /api/auth/me       – Get current authenticated user profile
 * ==========================================================================
 */

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Environment check: only disclose raw error message in development mode
const isDev = process.env.NODE_ENV !== 'production';

/**
 * Brute-Force Rate Limiter for Authentication Endpoints (SEC-03)
 * Limits each IP address to a maximum of 10 requests per 15-minute window.
 * Protects POST /api/auth/login and POST /api/auth/register against credential stuffing.
 * Returns HTTP 429 with a friendly JSON response when exceeded.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Max 10 attempts per IP per 15 minutes
  standardHeaders: true, // Return standard RateLimit headers (RateLimit-Limit, RateLimit-Remaining, RateLimit-Reset)
  legacyHeaders: false, // Disable X-RateLimit-* headers
  statusCode: 429,
  message: {
    success: false,
    message: 'Too many attempts. Please try again after 15 minutes.'
  },
  handler: (req, res, next, options) => {
    res.status(options.statusCode).json(options.message);
  }
});

/**
 * Helper function: Generate a signed JSON Web Token
 * @param {object} user - User document
 * @returns {string} Signed JWT
 */
const generateToken = (user) => {
  const secret = process.env.JWT_SECRET;
  if (!secret || !secret.trim()) {
    throw new Error('JWT_SECRET environment variable is missing or empty.');
  }

  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  return jwt.sign(
    {
      id: user._id,
      name: user.name,
      email: user.email
    },
    secret.trim(),
    { expiresIn }
  );
};

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user account (Rate limited: max 10 requests per 15 min per IP)
 * @access  Public
 */
router.post('/register', authLimiter, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full name, email, and password.'
      });
    }

    // 2. Validate password strength
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    // 3. Check if user email is already registered
    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists. Please log in.'
      });
    }

    // 4. Create new user (password is automatically hashed by User model pre-save hook)
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: password
    });

    // 5. Generate authentication token
    const token = generateToken(user);

    // 6. Return response (excluding password hash)
    res.status(201).json({
      success: true,
      message: 'Account created successfully! Welcome to SpendWise.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration. Please try again later.',
      ...(isDev && { error: error.message })
    });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and return JWT token (Rate limited: max 10 requests per 15 min per IP)
 * @access  Public
 */
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    // 2. Find user by email and explicitly select the password field
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password. Please check your credentials.'
      });
    }

    // 3. Reject deactivated accounts (SEC-FIND-02)
    // Backward compatibility: users without isActive are treated as active (only strictly false is rejected)
    // Returns generic login error message to prevent account enumeration / status discovery
    if (user.isActive === false) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password. Please check your credentials.'
      });
    }

    // 4. Verify password hash using bcrypt
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password. Please check your credentials.'
      });
    }

    // 5. Generate authentication token
    const token = generateToken(user);

    // 5. Return success response
    res.status(200).json({
      success: true,
      message: 'Login successful! Welcome back.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login. Please try again later.',
      ...(isDev && { error: error.message })
    });
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get currently authenticated user's profile
 * @access  Private (Requires valid JWT)
 */
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.'
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Profile Retrieval Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving user profile.',
      ...(isDev && { error: error.message })
    });
  }
});

module.exports = router;

