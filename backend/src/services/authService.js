/**
 * @file authService.js
 * @description Authentication and user identity business logic service.
 * Manages password hashing, credential verification, JWT token issuance,
 * and handles atomic provider profile initialization during provider signup.
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const store = require('../store/memoryStore');

class AuthService {
  /**
   * Registers a new account.
   * If the role is 'provider', it simultaneously initializes a corresponding provider
   * profile record and sets up default weekday operating availability.
   *
   * @param {Object} payload
   * @param {string} payload.name - Full name
   * @param {string} payload.email - Unique email address
   * @param {string} payload.password - Plaintext password
   * @param {string} [payload.role="customer"] - 'customer' or 'provider'
   * @param {string} [payload.phone] - Phone number
   * @param {string} [payload.businessName] - Commercial trade name (for providers)
   * @param {number} [payload.categoryId] - Industry category ID (for providers)
   * @param {number} [payload.hourlyRate=350] - Base rate (for providers)
   * @returns {Promise<{token: string, user: Object}>}
   */
  static async registerUser({
    name,
    email,
    password,
    role = "customer",
    phone = null,
    businessName = null,
    categoryId = null,
    hourlyRate = 350
  }) {
    const normalizedEmail = email.trim().toLowerCase();

    // 1. Role validation
    if (!["customer", "provider"].includes(role)) {
      const err = new Error("Invalid role specified. Must be 'customer' or 'provider'.");
      err.statusCode = 400;
      throw err;
    }

    // 2. Password strength validation — minimum 8 characters required
    if (!password || password.length < 8) {
      const err = new Error("Password must be at least 8 characters long.");
      err.statusCode = 400;
      throw err;
    }

    // 3. Email uniqueness check
    const existing = store.users.find(u => u.email === normalizedEmail);
    if (existing) {
      const err = new Error("An account with this email address already exists.");
      err.statusCode = 409;
      throw err;
    }

    // 4. Password hashing (bcrypt with cost factor 10)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. Create User Record
    store.counters.users += 1;
    const newUser = {
      id: store.counters.users,
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role,
      phone: phone ? phone.trim() : null,
      status: "active",
      created_at: new Date().toISOString()
    };
    store.users.push(newUser);

    let providerId = null;

    // 5. If Provider, atomically initialize Provider Profile and default Availability
    if (role === "provider") {
      store.counters.providers += 1;
      providerId = store.counters.providers;

      const newProvider = {
        id: providerId,
        user_id: newUser.id,
        category_id: categoryId ? parseInt(categoryId, 10) : 1,
        business_name: (businessName && businessName.trim()) || `${newUser.name}'s Services`,
        description: `Professional services offered by ${newUser.name}. Verified provider on Service Marketplace.`,
        location: "Mumbai, MH",
        experience: 2,
        hourly_rate: parseFloat(hourlyRate) || 350.00,
        rating: 5.0,
        total_reviews: 0
      };
      store.providers.push(newProvider);

      // Seed default weekday operating availability (Monday through Friday, 09:00 to 17:00)
      const defaultDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
      defaultDays.forEach(day => {
        store.counters.availability += 1;
        store.availability.push({
          id: store.counters.availability,
          provider_id: providerId,
          day_of_week: day,
          start_time: "09:00:00",
          end_time: "17:00:00"
        });
      });
    }

    // 6. Sign JWT with user claims
    const tokenPayload = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      providerId
    };

    const token = jwt.sign(tokenPayload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN
    });

    return {
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone,
        status: newUser.status,
        providerId
      }
    };
  }

  /**
   * Authenticates user credentials and generates a signed JWT.
   *
   * @param {Object} credentials
   * @param {string} credentials.email - User email
   * @param {string} credentials.password - Plaintext password
   * @returns {Promise<{token: string, user: Object}>}
   */
  static async loginUser({ email, password }) {
    const normalizedEmail = String(email).trim().toLowerCase();

    // 1. Locate user by email
    const user = store.users.find(u => u.email === normalizedEmail);
    if (!user) {
      const err = new Error("Invalid email or password.");
      err.statusCode = 401;
      throw err;
    }

    // 2. Verify account status
    if (user.status === "inactive") {
      const err = new Error("Your account has been deactivated. Please contact administrator support.");
      err.statusCode = 403;
      throw err;
    }

    // 3. Compare password hash
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      const err = new Error("Invalid email or password.");
      err.statusCode = 401;
      throw err;
    }

    // 4. Determine associated provider profile ID (if role is provider)
    let providerId = null;
    if (user.role === "provider") {
      const providerProfile = store.providers.find(p => p.user_id === user.id);
      providerId = providerProfile ? providerProfile.id : null;
    }

    // 5. Sign JWT
    const tokenPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      providerId
    };

    const token = jwt.sign(tokenPayload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        status: user.status,
        providerId
      }
    };
  }

  /**
   * Retrieves current session user details by decoded token ID.
   * @param {number} userId - ID of authenticated user
   * @returns {Promise<Object>}
   */
  static async getCurrentUser(userId) {
    const user = store.users.find(u => u.id === userId);
    if (!user) {
      const err = new Error("User profile not found.");
      err.statusCode = 404;
      throw err;
    }

    let providerProfile = null;
    if (user.role === "provider") {
      providerProfile = store.providers.find(p => p.user_id === user.id) || null;
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      status: user.status,
      created_at: user.created_at,
      provider: providerProfile
    };
  }
}

module.exports = AuthService;
