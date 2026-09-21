/**
 * @file bookingService.js
 * @description Booking lifecycle, double-booking prevention, and state machine transitions.
 * Enforces business validation rules for scheduling and role-based status updates.
 */

const store = require('../store/memoryStore');
const { calculateEndTime, to24HourTime, checkTimeOverlap } = require('../utils/timeHelper');

class BookingService {
  /**
   * Creates a new booking reservation with conflict validation.
   *
   * @param {number} customerId - Authenticated customer's user ID
   * @param {Object} payload
   * @param {number} payload.providerId - ID of target provider
   * @param {number} payload.serviceId - ID of selected service package
   * @param {string} payload.bookingDate - ISO date string ("YYYY-MM-DD")
   * @param {string} payload.startTime - Appointment start time ("10:00:00" or "10:00 AM")
   * @param {string} [payload.address] - Service delivery location
   * @param {string} [payload.notes] - Special requests or instructions
   * @returns {Promise<Object>} Created booking record
   */
  static async createBooking(customerId, {
    providerId,
    serviceId,
    bookingDate,
    startTime,
    address = null,
    notes = null
  }) {
    const pId = parseInt(providerId, 10);
    const sId = parseInt(serviceId, 10);
    const formattedStartTime = to24HourTime(startTime);

    // 1. Verify Provider existence
    const provider = store.providers.find(p => p.id === pId);
    if (!provider) {
      const err = new Error("Selected service provider does not exist.");
      err.statusCode = 404;
      throw err;
    }

    // 2. Verify Service existence
    const service = store.services.find(s => s.id === sId && s.provider_id === pId);
    if (!service) {
      const err = new Error("Selected service is not offered by this provider.");
      err.statusCode = 404;
      throw err;
    }

    // 3. Calculate End Time based on Service Duration
    const duration = service.duration || 60;
    const formattedEndTime = calculateEndTime(formattedStartTime, duration);

    // 4. Validate Provider Working Day Availability
    const dateObj = new Date(`${bookingDate}T12:00:00Z`);
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayOfWeek = dayNames[dateObj.getUTCDay()];

    const shift = store.availability.find(
      a => a.provider_id === pId && a.day_of_week === dayOfWeek
    );

    if (!shift) {
      const err = new Error(`Provider does not operate on ${dayOfWeek}s.`);
      err.statusCode = 400;
      throw err;
    }

    // Check if start time falls within shift hours
    if (formattedStartTime < shift.start_time || formattedEndTime > shift.end_time) {
      const err = new Error(
        `Requested time is outside provider operating hours (${shift.start_time} - ${shift.end_time}).`
      );
      err.statusCode = 400;
      throw err;
    }

    // 5. Check Double-Booking Collision
    // Active statuses that reserve provider calendar time
    const activeStatuses = ["Requested", "Confirmed", "In Progress"];

    const hasConflict = store.bookings.some(b => {
      if (b.provider_id !== pId) return false;
      if (b.booking_date !== bookingDate) return false;
      if (!activeStatuses.includes(b.status)) return false;

      const existingStart = to24HourTime(b.start_time);
      const existingEnd = b.end_time ? to24HourTime(b.end_time) : calculateEndTime(existingStart, 60);

      return checkTimeOverlap(formattedStartTime, formattedEndTime, existingStart, existingEnd);
    });

    if (hasConflict) {
      const err = new Error("The provider is already booked for this time window. Please select another slot.");
      err.statusCode = 409;
      throw err;
    }

    // 6. Insert Booking Record
    store.counters.bookings += 1;
    const newBooking = {
      id: store.counters.bookings,
      customer_id: customerId,
      provider_id: pId,
      service_id: sId,
      booking_date: bookingDate,
      start_time: formattedStartTime,
      end_time: formattedEndTime,
      address: address ? String(address).trim() : null,
      notes: notes ? String(notes).trim() : null,
      status: "Requested",
      created_at: new Date().toISOString()
    };

    store.bookings.push(newBooking);

    return {
      id: newBooking.id,
      booking_id: newBooking.id,
      customer_id: newBooking.customer_id,
      customerId: newBooking.customer_id,
      provider_id: newBooking.provider_id,
      service_id: newBooking.service_id,
      booking_date: newBooking.booking_date,
      start_time: newBooking.start_time,
      end_time: newBooking.end_time,
      price: service.price,
      service_name: service.name,
      status: newBooking.status
    };
  }

  /**
   * Retrieves enriched booking list filtered by caller's role and identity.
   *
   * @param {Object} user - Decoded JWT session user
   * @returns {Promise<Array<Object>>}
   */
  static async getBookings(user) {
    let list = [...store.bookings];

    if (user.role === "customer") {
      list = list.filter(b => b.customer_id === user.id);
    } else if (user.role === "provider") {
      const pProfile = store.providers.find(p => p.user_id === user.id);
      const targetProviderId = pProfile ? pProfile.id : user.providerId;
      list = list.filter(b => b.provider_id === targetProviderId);
    }
    // Admin sees all bookings without filtering

    // Sort newest bookings first
    list.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

    // Enrich with associated foreign entity metadata
    return list.map(b => {
      const customer = store.users.find(u => u.id === b.customer_id) || {};
      const provider = store.providers.find(p => p.id === b.provider_id) || {};
      const providerUser = store.users.find(u => u.id === provider.user_id) || {};
      const service = store.services.find(s => s.id === b.service_id) || {};

      return {
        id: b.id,
        customer_id: b.customer_id,
        customerId: b.customer_id, // Critical: fixes Bug #2 (omitted customerId mapping)
        customer_name: customer.name || "Customer",
        customer_email: customer.email || "",
        customer_phone: customer.phone || "",
        provider_id: b.provider_id,
        providerId: b.provider_id,
        provider_name: providerUser.name || provider.business_name || "Provider",
        business_name: provider.business_name || "Provider",
        service_id: b.service_id,
        service_name: service.name || "Service",
        price: service.price || 0,
        booking_date: b.booking_date,
        start_time: b.start_time,
        end_time: b.end_time,
        address: b.address,
        notes: b.notes,
        status: b.status,
        is_reviewed: store.reviews.some(r => r.booking_id === b.id), // true if a review has already been submitted for this booking
        created_at: b.created_at
      };
    });
  }

  /**
   * Transitions booking status according to the business workflow state machine.
   *
   * @param {number} bookingId - Target booking ID
   * @param {string} rawStatus - Requested new status string
   * @param {Object} user - Decoded JWT session user
   * @returns {Promise<Object>} Updated booking
   */
  static async updateBookingStatus(bookingId, rawStatus, user) {
    const id = parseInt(bookingId, 10);
    const booking = store.bookings.find(b => b.id === id);

    if (!booking) {
      const err = new Error("Booking not found.");
      err.statusCode = 404;
      throw err;
    }

    // Normalize status string (resolves Bug #3: handling "in-progress" vs "in_progress")
    const statusMap = {
      "requested": "Requested",
      "pending": "Requested",
      "confirmed": "Confirmed",
      "in-progress": "In Progress",
      "in_progress": "In Progress",
      "completed": "Completed",
      "cancelled": "Cancelled"
    };

    const normalized = statusMap[String(rawStatus).trim().toLowerCase()];
    if (!normalized) {
      const err = new Error(`Invalid booking status: '${rawStatus}'. Allowed: Requested, Confirmed, In Progress, Completed, Cancelled.`);
      err.statusCode = 400;
      throw err;
    }

    // Role-based state machine permission check
    const current = booking.status;

    if (user.role === "customer") {
      // Customer can only cancel their own requested or confirmed bookings
      if (booking.customer_id !== user.id) {
        const err = new Error("Unauthorized: You do not own this booking.");
        err.statusCode = 403;
        throw err;
      }
      if (normalized !== "Cancelled") {
        const err = new Error("Customers are only permitted to cancel appointments.");
        err.statusCode = 403;
        throw err;
      }
      if (current === "Completed") {
        const err = new Error("Cannot cancel a completed service.");
        err.statusCode = 400;
        throw err;
      }
    } else if (user.role === "provider") {
      const pProfile = store.providers.find(p => p.user_id === user.id);
      const providerId = pProfile ? pProfile.id : user.providerId;

      if (booking.provider_id !== providerId) {
        const err = new Error("Unauthorized: This booking is assigned to another provider.");
        err.statusCode = 403;
        throw err;
      }

      // Allowed provider transitions
      const validProviderTransitions = {
        "Requested": ["Confirmed", "Cancelled"],
        "Confirmed": ["In Progress", "Cancelled"],
        "In Progress": ["Completed"],
        "Completed": [],
        "Cancelled": []
      };

      if (!validProviderTransitions[current].includes(normalized)) {
        const err = new Error(`Invalid status transition from '${current}' to '${normalized}'.`);
        err.statusCode = 400;
        throw err;
      }
    }

    // Apply status update
    booking.status = normalized;
    booking.updated_at = new Date().toISOString();

    return {
      id: booking.id,
      status: booking.status,
      updated_at: booking.updated_at
    };
  }
}

module.exports = BookingService;
