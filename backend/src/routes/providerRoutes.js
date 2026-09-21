/**
 * @file providerRoutes.js
 * @description Route declarations for provider discovery, profiles, availability and services.
 */

const express = require('express');
const router = express.Router();
const ProviderController = require('../controllers/providerController');
const { authenticateToken } = require('../middlewares/auth');
const { requireRole } = require('../middlewares/role');
const { requireBodyFields } = require('../middlewares/validate');

// Public catalog routes
router.get('/', ProviderController.getProviders);
router.get('/:id', ProviderController.getProviderById);

// Protected provider workspace routes
router.put(
  '/profile',
  authenticateToken,
  requireRole('provider'),
  ProviderController.updateProfile
);

router.put(
  '/availability',
  authenticateToken,
  requireRole('provider'),
  requireBodyFields(['schedule']),
  ProviderController.updateAvailability
);

router.post(
  '/services',
  authenticateToken,
  requireRole('provider'),
  requireBodyFields(['name', 'price']),
  ProviderController.addService
);

router.delete(
  '/services/:serviceId',
  authenticateToken,
  requireRole('provider'),
  ProviderController.deleteService
);

module.exports = router;
