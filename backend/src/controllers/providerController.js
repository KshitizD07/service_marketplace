/**
 * @file providerController.js
 * @description Controller handling provider marketplace search, profile retrieval,
 * profile editing, availability updates, and service package management.
 */

const ProviderService = require('../services/providerService');
const ApiResponse = require('../utils/apiResponse');

class ProviderController {
  /**
   * List all providers with optional query parameters.
   * GET /api/providers
   */
  static async getProviders(req, res, next) {
    try {
      const providers = await ProviderService.getProviders(req.query);
      return ApiResponse.success(res, providers, "Providers fetched successfully.");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get complete details of a specific provider by ID.
   * GET /api/providers/:id
   */
  static async getProviderById(req, res, next) {
    try {
      const provider = await ProviderService.getProviderById(req.params.id);
      return ApiResponse.success(res, provider, "Provider details fetched successfully.");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update commercial profile details for logged in provider.
   * PUT /api/providers/profile
   */
  static async updateProfile(req, res, next) {
    try {
      const updated = await ProviderService.updateProfile(req.user.id, req.body);
      return ApiResponse.success(res, updated, "Provider profile updated successfully.");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update weekly availability schedule for logged in provider.
   * PUT /api/providers/availability
   */
  static async updateAvailability(req, res, next) {
    try {
      if (!req.user.providerId) {
        return ApiResponse.error(res, "No provider profile associated with this account.", 400);
      }
      const updated = await ProviderService.updateAvailability(req.user.providerId, req.body.schedule);
      return ApiResponse.success(res, updated, "Operating availability updated successfully.");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Add a new service package.
   * POST /api/providers/services
   */
  static async addService(req, res, next) {
    try {
      if (!req.user.providerId) {
        return ApiResponse.error(res, "No provider profile associated with this account.", 400);
      }
      const service = await ProviderService.addService(req.user.providerId, req.body);
      return ApiResponse.success(res, service, "Service added successfully.", 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a service package.
   * DELETE /api/providers/services/:serviceId
   */
  static async deleteService(req, res, next) {
    try {
      if (!req.user.providerId) {
        return ApiResponse.error(res, "No provider profile associated with this account.", 400);
      }
      const result = await ProviderService.deleteService(req.user.providerId, req.params.serviceId);
      return ApiResponse.success(res, result, "Service deleted successfully.");
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ProviderController;
