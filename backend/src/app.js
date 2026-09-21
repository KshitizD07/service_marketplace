/**
 * @file app.js
 * @description Express application assembly and middleware orchestration.
 * Configures CORS, body parsing, route mounting, health probes, and global error handling.
 */

const express = require('express');
const cors = require('cors');
const env = require('./config/env');
const { checkDatabaseHealth } = require('./config/db');
const ApiResponse = require('./utils/apiResponse');
const errorHandler = require('./middlewares/errorHandler');

// Route modules
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const providerRoutes = require('./routes/providerRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Global Middleware Pipeline
app.use(cors({
  origin: env.CORS_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Root & Health Verification Endpoints
app.get('/', (req, res) => {
  return ApiResponse.success(res, {
    service: "Service Marketplace & Booking Platform API",
    version: "2.0.0",
    status: "healthy"
  }, "Service Marketplace Backend is running!");
});

app.get('/api/health', async (req, res) => {
  const dbHealth = await checkDatabaseHealth();
  return ApiResponse.success(res, {
    uptime: process.uptime(),
    database: dbHealth,
    timestamp: new Date().toISOString()
  }, "System health report generated.");
});

// Database connectivity test route (backward compatibility with earlier specs)
app.get('/api/test-db', async (req, res) => {
  const dbHealth = await checkDatabaseHealth();
  return ApiResponse.success(res, dbHealth, dbHealth.message);
});

// API Route Mounts
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);

// Catch-all 404 Route Handler
app.use((req, res, next) => {
  const error = new Error(`Resource endpoint not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
});

// Centralized Global Error Handler
app.use(errorHandler);

module.exports = app;
