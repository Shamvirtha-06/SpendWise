/**
 * ==========================================================================
 * SpendWise – Authentication Middleware
 * Technology: jsonwebtoken (JWT)
 * ==========================================================================
 * 
 * Protects private API routes by verifying the JSON Web Token sent
 * in the HTTP Authorization header (format: "Bearer <token>").
 * 
 * If valid:
 *   Attaches the authenticated user details (id, email, name) to req.user
 *   and calls next() to allow access to the protected route.
 * 
 * If missing, invalid, or expired:
 *   Returns HTTP 401 Unauthorized with a clear, helpful error message.
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { getDiagnosticCategory } = require('../config/db');

const protect = async (req, res, next) => {
  let token = null;

  // 1. Check for Authorization header starting with "Bearer " (case-insensitive)
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (authHeader) {
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (authHeader.startsWith('bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (/^bearer\s+/i.test(authHeader)) {
      token = authHeader.replace(/^bearer\s+/i, '').trim();
    }
  }

  // Treat string "null", "undefined", or empty whitespace as null
  if (!token || token === 'undefined' || token === 'null' || !token.trim()) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Please log in to access this resource.'
    });
  }

  token = token.trim();

  // 2. Validate JWT_SECRET environment configuration
  const secret = process.env.JWT_SECRET;
  if (!secret || !secret.trim()) {
    console.error('🔒 Auth Configuration Error: JWT_SECRET environment variable is missing.');
    return res.status(500).json({
      success: false,
      message: 'Authentication service configuration error.'
    });
  }

  // 3. Verify the token signature and expiration
  let decoded;
  try {
    decoded = jwt.verify(token, secret.trim());
  } catch (error) {
    console.error('🔒 Auth Token Verification Failed:', error.message);

    let clientMessage = 'Invalid authentication token. Please log in again.';
    if (error.name === 'TokenExpiredError') {
      clientMessage = 'Your session has expired. Please log in again.';
    }

    return res.status(401).json({
      success: false,
      message: clientMessage
    });
  }

  // 4. Retrieve user from MongoDB to guard against stale tokens from deleted/deactivated accounts (SEC-11)
  let user;
  try {
    user = await User.findById(decoded.id).select('_id name email isActive');
  } catch (dbError) {
    const isProduction = process.env.NODE_ENV === 'production';
    if (isProduction) {
      console.error('🔒 Database Error during authentication: An internal database error occurred.');
    } else {
      const errClass = dbError?.name || 'Error';
      const errCode = dbError?.code || 'N/A';
      const category = getDiagnosticCategory(dbError);
      console.error('🔒 Database Error during authentication:');
      console.error('   Error Class:', errClass);
      console.error('   Error Code:', errCode);
      console.error('   Diagnostic Category:', category);
    }
    return res.status(500).json({
      success: false,
      message: 'Authentication service error. Please try again later.'
    });
  }

  // 5. Reject if user was deleted from the database
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'User account no longer exists. Please log in again.'
    });
  }

  // 6. Reject if user account is deactivated (treat missing isActive as active for backward compatibility)
  if (user.isActive === false) {
    return res.status(401).json({
      success: false,
      message: 'Your account has been deactivated. Please contact support.'
    });
  }

  // 7. Attach verified database user details to req.user (do not trust name/email from JWT)
  req.user = {
    id: user._id.toString(),
    email: user.email,
    name: user.name
  };

  next();
};

module.exports = { protect };

