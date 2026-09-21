/**
 * @file providerService.js
 * @description API client methods for provider discovery, profiles, availability shifts, and service packages.
 */

import { request } from './api';

/**
 * Fetch all categories.
 * GET /api/categories
 */
export async function getCategories() {
  return request('/categories', { method: 'GET' });
}

/**
 * Fetch all providers with optional search/filter queries.
 * GET /api/providers
 */
export async function getProviders(params = {}) {
  const query = new URLSearchParams();
  if (params.category) query.append('category', params.category);
  if (params.search) query.append('search', params.search);
  if (params.minRating) query.append('minRating', params.minRating);

  const qs = query.toString();
  return request(`/providers${qs ? `?${qs}` : ''}`, { method: 'GET' });
}

/**
 * Fetch detailed provider profile by ID.
 * GET /api/providers/:id
 */
export async function getProviderById(id) {
  return request(`/providers/${id}`, { method: 'GET' });
}

/**
 * Update commercial profile details for the logged-in provider.
 * PUT /api/providers/profile
 */
export async function updateProfile(data) {
  return request('/providers/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * Update weekly operating schedule for the logged-in provider.
 * PUT /api/providers/availability
 */
export async function updateAvailability(schedule) {
  return request('/providers/availability', {
    method: 'PUT',
    body: JSON.stringify({ schedule }),
  });
}

/**
 * Add a new service package.
 * POST /api/providers/services
 */
export async function addService(data) {
  return request('/providers/services', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Delete a service package.
 * DELETE /api/providers/services/:serviceId
 */
export async function deleteService(serviceId) {
  return request(`/providers/services/${serviceId}`, {
    method: 'DELETE',
  });
}
