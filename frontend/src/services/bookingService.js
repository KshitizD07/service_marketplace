/**
 * @file bookingService.js
 * @description API client methods for booking creation, listing, status progression, and cancellation.
 */

import { request } from './api';

/**
 * Place a new appointment reservation.
 * POST /api/bookings
 */
export async function createBooking(bookingData) {
  return request('/bookings', {
    method: 'POST',
    body: JSON.stringify(bookingData),
  });
}

/**
 * Fetch bookings for the logged-in user (role-filtered).
 * GET /api/bookings
 */
export async function getBookings() {
  return request('/bookings', { method: 'GET' });
}

/**
 * Update the status of a booking.
 * PUT /api/bookings/:id/status
 */
export async function updateBookingStatus(id, status) {
  return request(`/bookings/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
}

/**
 * Cancel an active booking.
 * PUT /api/bookings/:id/cancel
 */
export async function cancelBooking(id) {
  return request(`/bookings/${id}/cancel`, {
    method: 'PUT',
  });
}
