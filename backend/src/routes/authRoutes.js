/**
 * @file authRoutes.js
 * @description Express routing configuration for /api/auth.
 * Configures public registration/login endpoints and protected session verification.
 */

const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { authenticateToken } = require('../middlewares/auth');
const { requireBodyFields } = require('../middlewares/validate');

// Public routes
router.post(
  '/register',
  requireBodyFields(['name', 'email', 'password']),
  AuthController.register
);

router.post(
  '/login',
  requireBodyFields(['email', 'password']),
  AuthController.login
);

// Protected session route
router.get(
  '/me',
  authenticateToken,
  AuthController.me
);

module.exports = router;
