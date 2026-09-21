/**
 * @file env.js
 * @description Centralized environment configuration and validation.
 * Loads variables from the root .env file and assigns safe default fallbacks
 * to guarantee that the application never runs with undefined configuration.
 */

require('dotenv').config();

const env = {
  // Server port
  PORT: parseInt(process.env.PORT, 10) || 5000,

  // Node environment ('development', 'production', 'test')
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Database credentials (MySQL 8.0)
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: parseInt(process.env.DB_PORT, 10) || 3306,
  DB_USER: process.env.DB_USER || 'root',
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  DB_NAME: process.env.DB_NAME || 'service_marketplace',

  // Force in-memory mock mode if true or if DB is offline
  USE_MOCK_DB: process.env.USE_MOCK_DB === 'true',

  // JSON Web Token secret key and expiration window
  JWT_SECRET: process.env.JWT_SECRET || 'service_marketplace_secret_2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

  // Allowed Cross-Origin Resource Sharing origin
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*'
};

module.exports = env;
