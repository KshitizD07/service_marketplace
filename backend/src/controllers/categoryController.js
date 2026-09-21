/**
 * @file categoryController.js
 * @description Controller for marketplace category discovery.
 */

const store = require('../store/memoryStore');
const ApiResponse = require('../utils/apiResponse');

class CategoryController {
  /**
   * Retrieve all available service categories.
   * GET /api/categories
   */
  static async getCategories(req, res, next) {
    try {
      const categories = [...store.categories].sort((a, b) => a.name.localeCompare(b.name));
      return ApiResponse.success(res, categories, "Categories fetched successfully.");
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CategoryController;
