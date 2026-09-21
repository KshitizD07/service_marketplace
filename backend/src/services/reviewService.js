/**
 * @file reviewService.js
 * @description Customer review submission and provider reputation recalculation logic.
 * Enforces verification that only completed appointments can be reviewed,
 * and maintains atomic aggregate ratings.
 */

const store = require('../store/memoryStore');

class ReviewService {
  /**
   * Submits a customer review for a completed booking and updates provider rating aggregates.
   *
   * @param {number} customerId - Authenticated customer's user ID
   * @param {Object} payload
   * @param {number} payload.bookingId - ID of completed booking
   * @param {number} payload.rating - 1 to 5 integer rating
   * @param {string} [payload.comment] - Qualitative feedback
   * @returns {Promise<Object>} Created review and updated provider metrics
   */
  static async submitReview(customerId, { bookingId, rating, comment = "" }) {
    const bId = parseInt(bookingId, 10);
    const numRating = parseInt(rating, 10);

    // 1. Rating value validation
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      const err = new Error("Rating score must be an integer between 1 and 5.");
      err.statusCode = 400;
      throw err;
    }

    // 2. Locate booking
    const booking = store.bookings.find(b => b.id === bId);
    if (!booking) {
      const err = new Error("Booking record not found.");
      err.statusCode = 404;
      throw err;
    }

    // 3. Customer ownership verification
    if (booking.customer_id !== customerId) {
      const err = new Error("Unauthorized: You can only review bookings made from your account.");
      err.statusCode = 403;
      throw err;
    }

    // 4. Booking completion verification
    if (booking.status !== "Completed") {
      const err = new Error(`Reviews can only be submitted for completed services. Current status: '${booking.status}'.`);
      err.statusCode = 400;
      throw err;
    }

    // 5. Check if booking was already reviewed (uniqueness constraint)
    const existingReview = store.reviews.find(r => r.booking_id === bId);
    if (existingReview) {
      const err = new Error("A review has already been submitted for this service appointment.");
      err.statusCode = 409;
      throw err;
    }

    // 6. Insert Review Record
    store.counters.reviews += 1;
    const newReview = {
      id: store.counters.reviews,
      booking_id: bId,
      customer_id: customerId,
      provider_id: booking.provider_id,
      rating: numRating,
      comment: comment ? String(comment).trim() : null,
      created_at: new Date().toISOString()
    };

    store.reviews.push(newReview);

    // 7. Atomic Recalculation of Provider Average Rating & Total Reviews
    const providerReviews = store.reviews.filter(r => r.provider_id === booking.provider_id);
    const totalCount = providerReviews.length;
    const sumRatings = providerReviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalCount > 0 ? parseFloat((sumRatings / totalCount).toFixed(1)) : 5.0;

    const provider = store.providers.find(p => p.id === booking.provider_id);
    if (provider) {
      provider.rating = averageRating;
      provider.total_reviews = totalCount;
    }

    return {
      review: newReview,
      provider: {
        id: booking.provider_id,
        rating: averageRating,
        total_reviews: totalCount
      }
    };
  }

  /**
   * Retrieves verified customer reviews for a given provider.
   *
   * @param {number} providerId - Provider ID
   * @returns {Promise<Array<Object>>}
   */
  static async getProviderReviews(providerId) {
    const pId = parseInt(providerId, 10);
    const reviews = store.reviews.filter(r => r.provider_id === pId);

    // Sort newest reviews first
    reviews.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return reviews.map(r => {
      const customer = store.users.find(u => u.id === r.customer_id) || {};
      const booking = store.bookings.find(b => b.id === r.booking_id) || {};
      const service = store.services.find(s => s.id === booking.service_id) || {};

      return {
        id: r.id,
        booking_id: r.booking_id,
        customer_name: customer.name || "Customer",
        service_name: service.name || "Service",
        rating: r.rating,
        comment: r.comment,
        created_at: r.created_at
      };
    });
  }
}

module.exports = ReviewService;
