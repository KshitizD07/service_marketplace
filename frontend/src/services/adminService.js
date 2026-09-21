/**
 * @file adminService.js
 * @description API client methods for administrative analytics, user moderation, and category governance.
 */

import { request } from './api';

/**
 * Fetch platform KPI metrics.
 * GET /api/admin/stats
 */
export async function getStats() {
  return request('/admin/stats', { method: 'GET' });
}

/**
 * Fetch all registered users and providers.
 * GET /api/admin/users
 */
export async function getUsers() {
  return request('/admin/users', { method: 'GET' });
}

/**
 * Toggle user account status (active/inactive).
 * PUT /api/admin/users/:id/status
 */
export async function toggleUserStatus(id, status) {
  return request(`/admin/users/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
}

/**
 * Add a new category.
 * POST /api/admin/categories
 */
export async function addCategory(categoryData) {
  return request('/admin/categories', {
    method: 'POST',
    body: JSON.stringify(categoryData),
  });
}

/**
 * Update an existing category.
 * PUT /api/admin/categories/:id
 */
export async function updateCategory(id, categoryData) {
  return request(`/admin/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(categoryData),
  });
}

/**
 * Delete a category.
 * DELETE /api/admin/categories/:id
 */
export async function deleteCategory(id) {
  return request(`/admin/categories/${id}`, {
    method: 'DELETE',
  });
}

/**
 * Fetch all customer reviews platform-wide.
 * GET /api/admin/reviews
 */
export async function getAllReviews() {
  return request('/admin/reviews', { method: 'GET' });
}
