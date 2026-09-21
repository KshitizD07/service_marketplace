/**
 * @file reviewRoutes.js
 * @description Routes for review submissions and provider review querying.
 */

const express = require('express');
const router = express.Router();
const ReviewController = require('../controllers/reviewController');
const { authenticateToken } = require('../middlewares/auth');
const { requireRole } = require('../middlewares/role');
const { requireBodyFields } = require('../middlewares/validate');

// Public route to view a provider's reviews
router.get('/provider/:providerId', ReviewController.getProviderReviews);

// Protected customer review submission
router.post(
  '/',
  authenticateToken,
  requireRole('customer'),
  requireBodyFields(['bookingId', 'rating']),
  ReviewController.submitReview
);

module.exports = router;
