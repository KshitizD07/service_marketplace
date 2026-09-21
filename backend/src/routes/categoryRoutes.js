/**
 * @file categoryRoutes.js
 * @description Route definition for public categories discovery.
 */

const express = require('express');
const router = express.Router();
const CategoryController = require('../controllers/categoryController');

// Public category listing
router.get('/', CategoryController.getCategories);

module.exports = router;
