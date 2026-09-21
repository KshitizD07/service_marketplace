/**
 * @file validate.js
 * @description Request body and parameter validation middleware.
 * Verifies that required fields are present and conform to basic format constraints.
 */

const ApiResponse = require('../utils/apiResponse');

/**
 * Validates that specified required fields exist in req.body.
 * @param {string[]} requiredFields - List of mandatory field names
 */
function requireBodyFields(requiredFields) {
  return (req, res, next) => {
    const missing = [];

    for (const field of requiredFields) {
      if (req.body[field] === undefined || req.body[field] === null || String(req.body[field]).trim() === '') {
        missing.push(field);
      }
    }

    if (missing.length > 0) {
      return ApiResponse.error(
        res,
        `Validation failed: Missing required fields: [${missing.join(', ')}].`,
        400,
        { missingFields: missing }
      );
    }

    next();
  };
}

module.exports = { requireBodyFields };
