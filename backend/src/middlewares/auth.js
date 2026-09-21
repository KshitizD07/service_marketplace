/**
 * @file auth.js
 * @description JWT authentication middleware.
 * Intercepts incoming requests, extracts Bearer tokens from the Authorization header,
 * verifies cryptographic signatures using JWT_SECRET, and attaches claims to req.user.
 */

const jwt = require('jsonwebtoken');
const env = require('../config/env');
const ApiResponse = require('../utils/apiResponse');
const store = require('../store/memoryStore');

/**
 * Middleware that guards protected routes by validating the Bearer JWT.
 * Rejects unauthenticated requests with 401 Unauthorized or 403 Forbidden.
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer <TOKEN>"

  if (!token) {
    return ApiResponse.error(res, "Access denied. Authentication token required.", 401);
  }

  jwt.verify(token, env.JWT_SECRET, (err, decodedUser) => {
    if (err) {
      const isExpired = err.name === 'TokenExpiredError';
      const msg = isExpired ? "Session expired. Please log in again." : "Invalid or malformed authentication token.";
      return ApiResponse.error(res, msg, 403);
    }

    // Check if user status is active (reject deactivated accounts)
    const userInStore = store.users.find(u => u.id === decodedUser.id);
    if (userInStore && userInStore.status === 'inactive') {
      return ApiResponse.error(res, "Your account has been deactivated by the platform administrator.", 403);
    }

    req.user = decodedUser;
    next();
  });
}

module.exports = { authenticateToken };
