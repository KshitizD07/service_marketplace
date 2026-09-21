/**
 * @file role.js
 * @description Role-Based Access Control (RBAC) middleware.
 * Inspects req.user (populated by authenticateToken) and ensures the caller possesses
 * the required role ('customer', 'provider', or 'admin').
 */

const ApiResponse = require('../utils/apiResponse');

/**
 * Higher-order middleware factory that restricts route access to specific roles.
 * @param {...string} allowedRoles - Allowed user roles (e.g. 'admin', 'provider')
 * @returns {import('express').RequestHandler}
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return ApiResponse.error(res, "Authentication required prior to authorization check.", 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return ApiResponse.error(
        res,
        `Forbidden: Insufficient privileges. Required role: [${allowedRoles.join(' or ')}].`,
        403
      );
    }

    next();
  };
}

module.exports = { requireRole };
