/**
 * @file authRoutes.js
 * @description Express routing configuration for /api/auth.
 * Configures public registration/login endpoints and protected session verification.
 * Rate limiting is applied to public auth endpoints to prevent brute-force attacks.
 */

const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { authenticateToken } = require('../middlewares/auth');
const { requireBodyFields } = require('../middlewares/validate');

// Rate limiter: max 10 requests per 15 minutes per IP for sensitive auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many attempts from this IP. Please try again after 15 minutes.'
  }
});

// Public routes — rate limited to prevent brute-force credential attacks
router.post(
  '/register',
  authLimiter,
  requireBodyFields(['name', 'email', 'password']),
  AuthController.register
);

router.post(
  '/login',
  authLimiter,
  requireBodyFields(['email', 'password']),
  AuthController.login
);

// Protected session route — no rate limit needed (requires valid JWT)
router.get(
  '/me',
  authenticateToken,
  AuthController.me
);

module.exports = router;

