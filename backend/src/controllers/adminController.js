/**
 * @file adminController.js
 * @description Controller handling administrator platform metrics, user moderation,
 * category governance, and global review inspection.
 */

const AdminService = require('../services/adminService');
const ApiResponse = require('../utils/apiResponse');

class AdminController {
  /**
   * Get platform statistics.
   * GET /api/admin/stats
   */
  static async getStats(req, res, next) {
    try {
      const stats = await AdminService.getStats();
      return ApiResponse.success(res, stats, "Admin statistics fetched successfully.");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all registered users and providers.
   * GET /api/admin/users
   */
  static async getUsers(req, res, next) {
    try {
      const users = await AdminService.getUsers();
      return ApiResponse.success(res, users, "Users list fetched successfully.");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Toggle user active/inactive status.
   * PUT /api/admin/users/:id/status
   */
  static async toggleUserStatus(req, res, next) {
    try {
      const result = await AdminService.toggleUserStatus(req.params.id, req.body.status);
      return ApiResponse.success(res, result, "User account status updated successfully.");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Add a new category.
   * POST /api/admin/categories
   */
  static async addCategory(req, res, next) {
    try {
      const category = await AdminService.addCategory(req.body);
      return ApiResponse.success(res, category, "Category created successfully.", 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Edit an existing category.
   * PUT /api/admin/categories/:id
   */
  static async updateCategory(req, res, next) {
    try {
      const category = await AdminService.updateCategory(req.params.id, req.body);
      return ApiResponse.success(res, category, "Category updated successfully.");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a category.
   * DELETE /api/admin/categories/:id
   */
  static async deleteCategory(req, res, next) {
    try {
      const result = await AdminService.deleteCategory(req.params.id);
      return ApiResponse.success(res, result, "Category deleted successfully.");
    } catch (error) {
      next(error);
    }
  }

  /**
   * List all platform reviews.
   * GET /api/admin/reviews
   */
  static async getReviews(req, res, next) {
    try {
      const reviews = await AdminService.getAllReviews();
      return ApiResponse.success(res, reviews, "All reviews fetched successfully.");
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AdminController;
