/**
 * @file authService.js
 * @description API client methods for user authentication and session verification.
 */

import { request } from './api';

/**
 * Log in an existing user.
 * POST /api/auth/login
 */
export async function login(email, password) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

/**
 * Register a new Customer or Provider account.
 * POST /api/auth/register
 */
export async function register(formData) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(formData),
  });
}

/**
 * Retrieve active session profile for current JWT.
 * GET /api/auth/me
 */
export async function getMe() {
  return request('/auth/me', {
    method: 'GET',
  });
}
