/**
 * @file apiResponse.js
 * @description Standardized API response serializer.
 * Ensures that every endpoint in the application returns an envelope with consistent
 * keys (success, message, data, errors, timestamp) for predictable frontend consumption.
 */

class ApiResponse {
  /**
   * Serializes a successful HTTP response.
   * @param {import('express').Response} res - Express response object
   * @param {*} [data=null] - The payload to deliver to the client
   * @param {string} [message="Operation successful"] - Human-readable status message
   * @param {number} [statusCode=200] - HTTP status code
   */
  static success(res, data = null, message = "Operation successful", statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Serializes a structured error HTTP response.
   * @param {import('express').Response} res - Express response object
   * @param {string} [message="An error occurred"] - Explanatory error message
   * @param {number} [statusCode=500] - HTTP status code
   * @param {*} [errors=null] - Optional detailed validation or field errors
   */
  static error(res, message = "An error occurred", statusCode = 500, errors = null) {
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = ApiResponse;
