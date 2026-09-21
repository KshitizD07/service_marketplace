/**
 * @file bookingRoutes.js
 * @description Route declarations for booking creation, listing, status updates, and cancellation.
 */

const express = require('express');
const router = express.Router();
const BookingController = require('../controllers/bookingController');
const { authenticateToken } = require('../middlewares/auth');
const { requireRole } = require('../middlewares/role');
const { requireBodyFields } = require('../middlewares/validate');

// All booking routes require authentication
router.use(authenticateToken);

// Create booking (Customer role)
router.post(
  '/',
  requireRole('customer'),
  requireBodyFields(['providerId', 'serviceId', 'bookingDate', 'startTime']),
  BookingController.createBooking
);

// Get bookings (filtered by user session)
router.get('/', BookingController.getBookings);

// Update booking status (Provider or Admin only — defense in depth: role also enforced in service)
router.put(
  '/:id/status',
  requireRole('provider', 'admin'),
  requireBodyFields(['status']),
  BookingController.updateStatus
);

// Cancel booking (Customer or Provider)
router.put(
  '/:id/cancel',
  BookingController.cancelBooking
);

module.exports = router;
