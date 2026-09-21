/**
 * @file bookingController.js
 * @description Controller handling booking creation, calendar listing, and status workflow transitions.
 */

const BookingService = require('../services/bookingService');
const ApiResponse = require('../utils/apiResponse');

class BookingController {
  /**
   * Create a new booking reservation.
   * POST /api/bookings
   */
  static async createBooking(req, res, next) {
    try {
      const result = await BookingService.createBooking(req.user.id, req.body);
      return ApiResponse.success(res, result, "Booking created successfully.", 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * List all bookings belonging to the authenticated user (or all if admin).
   * GET /api/bookings
   */
  static async getBookings(req, res, next) {
    try {
      const bookings = await BookingService.getBookings(req.user);
      return ApiResponse.success(res, bookings, "Bookings retrieved successfully.");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update the status of a booking.
   * PUT /api/bookings/:id/status
   */
  static async updateStatus(req, res, next) {
    try {
      const result = await BookingService.updateBookingStatus(
        req.params.id,
        req.body.status,
        req.user
      );
      return ApiResponse.success(res, result, "Booking status updated successfully.");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cancel an appointment (convenience endpoint).
   * PUT /api/bookings/:id/cancel
   */
  static async cancelBooking(req, res, next) {
    try {
      const result = await BookingService.updateBookingStatus(
        req.params.id,
        "Cancelled",
        req.user
      );
      return ApiResponse.success(res, result, "Booking cancelled successfully.");
    } catch (error) {
      next(error);
    }
  }
}

module.exports = BookingController;
