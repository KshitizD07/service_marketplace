/**
 * @file adminRoutes.js
 * @description Administration routes guarded strictly with JWT authentication and requireRole('admin').
 */

const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');
const { authenticateToken } = require('../middlewares/auth');
const { requireRole } = require('../middlewares/role');
const { requireBodyFields } = require('../middlewares/validate');

// Strictly guard all administrative endpoints
router.use(authenticateToken);
router.use(requireRole('admin'));

// Platform KPIs
router.get('/stats', AdminController.getStats);

// User & Provider Management
router.get('/users', AdminController.getUsers);
router.put(
  '/users/:id/status',
  requireBodyFields(['status']),
  AdminController.toggleUserStatus
);

// Category Governance
router.post(
  '/categories',
  requireBodyFields(['name']),
  AdminController.addCategory
);
router.put(
  '/categories/:id',
  requireBodyFields(['name']),
  AdminController.updateCategory
);
router.delete(
  '/categories/:id',
  AdminController.deleteCategory
);

// Review Inspection & Moderation
router.get('/reviews', AdminController.getReviews);

module.exports = router;
