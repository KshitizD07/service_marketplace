/**
 * @file reviewService.js
 * @description API client methods for verified review submission and retrieval.
 */

import { request } from './api';

/**
 * Submit a customer review for a completed appointment.
 * POST /api/reviews
 */
export async function submitReview(reviewData) {
  return request('/reviews', {
    method: 'POST',
    body: JSON.stringify(reviewData),
  });
}

/**
 * Fetch reviews for a specific provider.
 * GET /api/reviews/provider/:providerId
 */
export async function getProviderReviews(providerId) {
  return request(`/reviews/provider/${providerId}`, {
    method: 'GET',
  });
}
