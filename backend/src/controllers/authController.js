/**
 * @file authController.js
 * @description HTTP Transport controller for authentication and session endpoints.
 * Handles request body parsing, invokes AuthService, and formats standard ApiResponse envelopes.
 */

const AuthService = require('../services/authService');
const ApiResponse = require('../utils/apiResponse');

class AuthController {
  /**
   * Register a new Customer or Service Provider.
   * POST /api/auth/register
   */
  static async register(req, res, next) {
    try {
      const result = await AuthService.registerUser(req.body);
      return ApiResponse.success(
        res,
        result,
        "Account registered successfully.",
        201
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Log in an existing user and obtain a JWT.
   * POST /api/auth/login
   */
  static async login(req, res, next) {
    try {
      const result = await AuthService.loginUser(req.body);
      return ApiResponse.success(
        res,
        result,
        "Authentication successful."
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Retrieve the authenticated user's current session.
   * GET /api/auth/me
   */
  static async me(req, res, next) {
    try {
      const user = await AuthService.getCurrentUser(req.user.id);
      return ApiResponse.success(
        res,
        user,
        "Session profile retrieved successfully."
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;
