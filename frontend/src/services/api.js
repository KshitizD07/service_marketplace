/**
 * @file api.js
 * @description Centralized REST API client for backend communication.
 * Automatically injects the Authorization header with Bearer JWT if present in localStorage,
 * serializes JSON payloads, and normalizes errors.
 */

const API_BASE_URL = "http://localhost:5000/api";

/**
 * Dispatches an HTTP request to the backend API.
 *
 * @param {string} endpoint - API path (e.g. '/auth/login' or '/providers')
 * @param {Object} [options={}] - Fetch configuration options
 * @returns {Promise<any>} Response JSON data
 */
export async function request(endpoint, options = {}) {
  const token = localStorage.getItem("service_marketplace_token");

  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = new Error(data.message || `Request failed with status ${response.status}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    // Re-throw normalized error
    throw error;
  }
}
