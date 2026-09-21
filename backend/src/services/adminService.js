/**
 * @file adminService.js
 * @description Administration dashboard analytics, user moderation, and category governance service.
 */

const store = require('../store/memoryStore');

class AdminService {
  /**
   * Aggregates platform-wide KPI statistics.
   * Total Users, Active Providers, Bookings This Month, Revenue, and Category Distribution.
   *
   * @returns {Promise<Object>}
   */
  static async getStats() {
    const totalUsers = store.users.length;
    const activeProviders = store.providers.length;

    // Current month filter
    const now = new Date();
    const currentYear = now.getUTCFullYear();
    const currentMonth = now.getUTCMonth();

    const bookingsThisMonth = store.bookings.filter(b => {
      const bDate = new Date(b.booking_date);
      return bDate.getUTCFullYear() === currentYear && bDate.getUTCMonth() === currentMonth;
    }).length;

    // Platform revenue (Gross volume of Completed bookings)
    const revenue = store.bookings
      .filter(b => b.status === "Completed")
      .reduce((sum, b) => {
        const service = store.services.find(s => s.id === b.service_id);
        return sum + (service ? parseFloat(service.price) : 0);
      }, 0);

    // Category distribution breakdown
    const categorySplit = store.categories.map(c => {
      const count = store.providers.filter(p => p.category_id === c.id).length;
      return {
        id: c.id,
        name: c.name,
        providers: count
      };
    });

    return {
      totalUsers,
      activeProviders,
      bookingsThisMonth,
      revenue,
      categorySplit
    };
  }

  /**
   * Retrieves all user accounts merged with provider credentials and commercial metrics.
   *
   * @returns {Promise<Array<Object>>}
   */
  static async getUsers() {
    return store.users.map(u => {
      const provider = store.providers.find(p => p.user_id === u.id);
      let categoryName = null;

      if (provider) {
        const cat = store.categories.find(c => c.id === provider.category_id);
        categoryName = cat ? cat.name : null;
      }

      return {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        status: u.status || "active",
        phone: u.phone,
        created_at: u.created_at,
        provider_id: provider ? provider.id : null,
        business_name: provider ? provider.business_name : null,
        category_name: categoryName,
        rating: provider ? provider.rating : null,
        total_reviews: provider ? provider.total_reviews : null
      };
    });
  }

  /**
   * Moderates user account status between 'active' and 'inactive'.
   *
   * @param {number} userId - Target user ID
   * @param {string} status - 'active' or 'inactive'
   * @returns {Promise<Object>}
   */
  static async toggleUserStatus(userId, status) {
    const id = parseInt(userId, 10);
    const normalized = String(status).trim().toLowerCase();

    if (!["active", "inactive"].includes(normalized)) {
      const err = new Error("Invalid status specified. Must be 'active' or 'inactive'.");
      err.statusCode = 400;
      throw err;
    }

    const user = store.users.find(u => u.id === id);
    if (!user) {
      const err = new Error("User account not found.");
      err.statusCode = 404;
      throw err;
    }

    user.status = normalized;
    return {
      id: user.id,
      name: user.name,
      status: user.status
    };
  }

  /**
   * Creates a new service category.
   */
  static async addCategory({ name, description = "", icon = "Briefcase" }) {
    const trimmedName = String(name).trim();

    if (store.categories.some(c => c.name.toLowerCase() === trimmedName.toLowerCase())) {
      const err = new Error("A category with this name already exists.");
      err.statusCode = 409;
      throw err;
    }

    store.counters.categories += 1;
    const newCategory = {
      id: store.counters.categories,
      name: trimmedName,
      description: String(description).trim(),
      icon: String(icon).trim() || "Briefcase"
    };

    store.categories.push(newCategory);
    return newCategory;
  }

  /**
   * Updates an existing service category.
   */
  static async updateCategory(id, { name, description, icon }) {
    const catId = parseInt(id, 10);
    const category = store.categories.find(c => c.id === catId);

    if (!category) {
      const err = new Error("Category not found.");
      err.statusCode = 404;
      throw err;
    }

    if (name) {
      const trimmedName = String(name).trim();
      const duplicate = store.categories.find(
        c => c.name.toLowerCase() === trimmedName.toLowerCase() && c.id !== catId
      );
      if (duplicate) {
        const err = new Error("Another category already possesses this name.");
        err.statusCode = 409;
        throw err;
      }
      category.name = trimmedName;
    }

    if (description !== undefined) category.description = String(description).trim();
    if (icon !== undefined) category.icon = String(icon).trim();

    return category;
  }

  /**
   * Deletes a service category if no active providers are assigned to it.
   */
  static async deleteCategory(id) {
    const catId = parseInt(id, 10);
    const categoryIndex = store.categories.findIndex(c => c.id === catId);

    if (categoryIndex === -1) {
      const err = new Error("Category not found.");
      err.statusCode = 404;
      throw err;
    }

    const providerCount = store.providers.filter(p => p.category_id === catId).length;
    if (providerCount > 0) {
      const err = new Error(`Cannot delete category: ${providerCount} provider(s) are currently categorized under it.`);
      err.statusCode = 409;
      throw err;
    }

    store.categories.splice(categoryIndex, 1);
    return { deletedCategoryId: catId };
  }

  /**
   * Retrieves all customer reviews across the platform for moderation.
   */
  static async getAllReviews() {
    return store.reviews.map(r => {
      const customer = store.users.find(u => u.id === r.customer_id) || {};
      const provider = store.providers.find(p => p.id === r.provider_id) || {};
      const providerUser = store.users.find(u => u.id === provider.user_id) || {};
      const booking = store.bookings.find(b => b.id === r.booking_id) || {};
      const service = store.services.find(s => s.id === booking.service_id) || {};

      return {
        id: r.id,
        booking_id: r.booking_id,
        rating: r.rating,
        comment: r.comment,
        created_at: r.created_at,
        customer_name: customer.name || "Customer",
        customer_email: customer.email || "",
        provider_name: providerUser.name || provider.business_name || "Provider",
        service_name: service.name || "Service"
      };
    });
  }
}

module.exports = AdminService;
