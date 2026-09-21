/**
 * @file errorHandler.js
 * @description Centralized Express error-handling middleware.
 * Intercepts uncaught exceptions and synchronous or asynchronous pipeline errors,
 * formatting them into the unified ApiResponse.error envelope.
 */

const ApiResponse = require('../utils/apiResponse');

/**
 * 4-argument Express error middleware.
 * @param {Error} err - Error object
 * @param {import('express').Request} req - Request object
 * @param {import('express').Response} res - Response object
 * @param {import('express').NextFunction} next - Next function
 */
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || "An unexpected internal server error occurred.";

  if (process.env.NODE_ENV !== 'test' && statusCode === 500) {
    console.error(`[ERROR] ${req.method} ${req.originalUrl}:`, err);
  }

  return ApiResponse.error(
    res,
    message,
    statusCode,
    process.env.NODE_ENV === 'development' ? { stack: err.stack } : null
  );
}

module.exports = errorHandler;
