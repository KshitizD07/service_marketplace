/**
 * @file reviewController.js
 * @description Controller handling verified review submission and provider review listing.
 */

const ReviewService = require('../services/reviewService');
const ApiResponse = require('../utils/apiResponse');

class ReviewController {
  /**
   * Submit a customer review for a completed booking.
   * POST /api/reviews
   */
  static async submitReview(req, res, next) {
    try {
      const result = await ReviewService.submitReview(req.user.id, req.body);
      return ApiResponse.success(res, result, "Review submitted successfully.", 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Retrieve all verified reviews for a specific provider.
   * GET /api/reviews/provider/:providerId
   */
  static async getProviderReviews(req, res, next) {
    try {
      const reviews = await ReviewService.getProviderReviews(req.params.providerId);
      return ApiResponse.success(res, reviews, "Provider reviews fetched successfully.");
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ReviewController;
