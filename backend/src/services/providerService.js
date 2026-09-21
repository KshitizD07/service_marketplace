/**
 * @file providerService.js
 * @description Provider catalog, profile management, and scheduling business logic.
 * Enriches provider records with associated services, formatted operating slots,
 * and verified reviews.
 */

const store = require('../store/memoryStore');
const { generateHourlySlots, to24HourTime } = require('../utils/timeHelper');

class ProviderService {
  /**
   * Helper that builds availability display-slot map ({ "Monday": ["9:00 AM", ...] }) for a provider.
   * Used by the booking flow and provider profile page.
   * @param {number} providerId
   * @returns {Object<string, string[]>}
   */
  static _buildAvailabilityMap(providerId) {
    const slots = store.availability.filter(a => a.provider_id === providerId);
    const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const map = {};

    dayOrder.forEach(day => {
      const match = slots.find(s => s.day_of_week === day);
      if (match) {
        map[day] = generateHourlySlots(match.start_time, match.end_time, 60);
      }
    });

    return map;
  }

  /**
   * Helper that builds a raw schedule map ({ "Monday": { startTime: "09:00", endTime: "17:00" } }) for a provider.
   * Used by the provider dashboard to repopulate time inputs with real saved values.
   * @param {number} providerId
   * @returns {Object<string, {startTime: string, endTime: string}>}
   */
  static _buildRawSchedule(providerId) {
    const slots = store.availability.filter(a => a.provider_id === providerId);
    const map = {};
    slots.forEach(s => {
      map[s.day_of_week] = {
        startTime: s.start_time.slice(0, 5), // "09:00" trimmed from "09:00:00"
        endTime: s.end_time.slice(0, 5)
      };
    });
    return map;
  }

  /**
   * Retrieves all verified providers with optional query search and category filtering.
   *
   * @param {Object} [filters={}]
   * @param {string} [filters.category] - Category name or ID
   * @param {string} [filters.search] - Search keyword
   * @param {number} [filters.minRating] - Minimum rating filter
   * @returns {Promise<Array<Object>>}
   */
  static async getProviders({ category = null, search = null, minRating = null } = {}) {
    let result = store.providers.map(p => {
      const user = store.users.find(u => u.id === p.user_id) || {};
      const cat = store.categories.find(c => c.id === p.category_id) || {};
      const services = store.services.filter(s => s.provider_id === p.id);
      const availability = this._buildAvailabilityMap(p.id);

      return {
        id: p.id,
        user_id: p.user_id,
        provider_name: user.name || "Provider",
        email: user.email || "",
        business_name: p.business_name,
        description: p.description,
        location: p.location,
        experience: p.experience,
        hourly_rate: p.hourly_rate,
        rating: p.rating,
        total_reviews: p.total_reviews,
        category_id: p.category_id,
        category_name: cat.name || "General",
        services,
        availability
      };
    });

    // Category filter
    if (category) {
      const catLower = String(category).toLowerCase();
      result = result.filter(p =>
        String(p.category_id) === String(category) ||
        p.category_name.toLowerCase().includes(catLower)
      );
    }

    // Search keyword filter
    if (search) {
      const q = String(search).toLowerCase();
      result = result.filter(p =>
        p.business_name.toLowerCase().includes(q) ||
        p.provider_name.toLowerCase().includes(q) ||
        p.category_name.toLowerCase().includes(q) ||
        (p.location && p.location.toLowerCase().includes(q))
      );
    }

    // Minimum rating filter
    if (minRating) {
      const min = parseFloat(minRating);
      result = result.filter(p => p.rating >= min);
    }

    return result;
  }

  /**
   * Retrieves a single provider profile by ID with full details, services,
   * operating availability, and REAL database-backed customer reviews.
   *
   * @param {number} id - Provider ID
   * @returns {Promise<Object>}
   */
  static async getProviderById(id) {
    const providerId = parseInt(id, 10);
    const p = store.providers.find(item => item.id === providerId);

    if (!p) {
      const err = new Error("Provider profile not found.");
      err.statusCode = 404;
      throw err;
    }

    const user = store.users.find(u => u.id === p.user_id) || {};
    const cat = store.categories.find(c => c.id === p.category_id) || {};
    const services = store.services.filter(s => s.provider_id === p.id);
    const availability = this._buildAvailabilityMap(p.id);
    const rawSchedule = this._buildRawSchedule(p.id); // raw start/end times for dashboard form repopulation

    // Load REAL reviews attached to this provider from our store (resolving Bug #6)
    const reviews = store.reviews
      .filter(r => r.provider_id === p.id)
      .map(r => {
        const customer = store.users.find(u => u.id === r.customer_id);
        return {
          id: r.id,
          customer_name: customer ? customer.name : "Customer",
          rating: r.rating,
          comment: r.comment,
          created_at: r.created_at
        };
      });

    return {
      id: p.id,
      user_id: p.user_id,
      provider_name: user.name || "Provider",
      email: user.email || "",
      business_name: p.business_name,
      description: p.description,
      location: p.location,
      experience: p.experience,
      hourly_rate: p.hourly_rate,
      rating: p.rating,
      total_reviews: p.total_reviews,
      category_id: p.category_id,
      category_name: cat.name || "General",
      services,
      availability,
      rawSchedule, // includes { "Monday": { startTime: "09:00", endTime: "17:00" }, ... }
      reviews
    };
  }

  /**
   * Updates commercial profile details for a provider.
   *
   * @param {number} userId - ID of authenticated provider user
   * @param {Object} data - Updated profile fields
   * @returns {Promise<Object>}
   */
  static async updateProfile(userId, { businessName, description, location, hourlyRate, experience, categoryId }) {
    const p = store.providers.find(item => item.user_id === userId);
    if (!p) {
      const err = new Error("Provider record not found for this user account.");
      err.statusCode = 404;
      throw err;
    }

    if (businessName !== undefined) p.business_name = String(businessName).trim();
    if (description !== undefined) p.description = String(description).trim();
    if (location !== undefined) p.location = String(location).trim();
    if (hourlyRate !== undefined) p.hourly_rate = parseFloat(hourlyRate) || p.hourly_rate;
    if (experience !== undefined) p.experience = parseInt(experience, 10) || p.experience;
    if (categoryId !== undefined) p.category_id = parseInt(categoryId, 10) || p.category_id;

    return p;
  }

  /**
   * Replaces a provider's weekly operating availability schedule (resolving Bug #7).
   *
   * @param {number} providerId - Provider ID
   * @param {Array<{dayOfWeek: string, startTime: string, endTime: string}>} schedule
   * @returns {Promise<Object<string, string[]>>} Updated availability mapping
   */
  static async updateAvailability(providerId, schedule) {
    if (!Array.isArray(schedule)) {
      const err = new Error("Schedule must be an array of shift objects.");
      err.statusCode = 400;
      throw err;
    }

    // Clear existing schedule for this provider
    store.availability = store.availability.filter(a => a.provider_id !== providerId);

    // Insert new schedule rows, validating each shift before saving
    for (const slot of schedule) {
      const startNorm = to24HourTime(slot.startTime);
      const endNorm = to24HourTime(slot.endTime);

      // CQ-3 fix: ensure start time is strictly before end time
      if (startNorm >= endNorm) {
        const err = new Error(
          `Invalid shift for ${slot.dayOfWeek}: start time (${slot.startTime}) must be before end time (${slot.endTime}).`
        );
        err.statusCode = 400;
        throw err;
      }

      store.counters.availability += 1;
      store.availability.push({
        id: store.counters.availability,
        provider_id: providerId,
        day_of_week: slot.dayOfWeek,
        start_time: startNorm,
        end_time: endNorm
      });
    }

    return this._buildAvailabilityMap(providerId);
  }

  /**
   * Adds a new service package to the provider's catalog.
   */
  static async addService(providerId, { name, description = "", price, duration = 60 }) {
    if (!name || !price) {
      const err = new Error("Service name and price are required.");
      err.statusCode = 400;
      throw err;
    }

    store.counters.services += 1;
    const newService = {
      id: store.counters.services,
      provider_id: providerId,
      name: String(name).trim(),
      description: String(description).trim(),
      price: parseFloat(price),
      duration: parseInt(duration, 10) || 60
    };

    store.services.push(newService);
    return newService;
  }

  /**
   * Deletes a service package owned by the provider.
   */
  static async deleteService(providerId, serviceId) {
    const sId = parseInt(serviceId, 10);
    const index = store.services.findIndex(s => s.id === sId && s.provider_id === providerId);

    if (index === -1) {
      const err = new Error("Service package not found or unauthorized to delete.");
      err.statusCode = 404;
      throw err;
    }

    store.services.splice(index, 1);
    return { deletedServiceId: sId };
  }
}

module.exports = ProviderService;
