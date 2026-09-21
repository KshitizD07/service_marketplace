/**
 * @file memoryStore.js
 * @description In-memory data repository initialized with production seed data.
 * Powers the backend when MySQL is offline or during testing, allowing full
 * CRUD operations, conflict checks, and state machine transitions in RAM.
 */

const DEFAULT_HASH = "$2b$10$LhBbIHFreYS308bAbs3m.O5wcU4EEhVweoHrkNMwdIxFuqGEJpKTS"; // Password123!

const store = {
  // 1. Users collection
  users: [
    {
      id: 1,
      name: "Admin System",
      email: "admin@marketplace.com",
      password: DEFAULT_HASH,
      role: "admin",
      phone: "9998887770",
      status: "active",
      created_at: "2026-09-01T00:00:00.000Z"
    },
    {
      id: 2,
      name: "Meera Kulkarni",
      email: "meera@cleanpro.com",
      password: DEFAULT_HASH,
      role: "provider",
      phone: "9820011223",
      status: "active",
      created_at: "2026-09-01T00:00:00.000Z"
    },
    {
      id: 3,
      name: "Rohan Deshmukh",
      email: "rohan@sparkelectric.com",
      password: DEFAULT_HASH,
      role: "provider",
      phone: "9820022334",
      status: "active",
      created_at: "2026-09-01T00:00:00.000Z"
    },
    {
      id: 4,
      name: "Sanket Abhang",
      email: "customer@gmail.com",
      password: DEFAULT_HASH,
      role: "customer",
      phone: "9820033445",
      status: "active",
      created_at: "2026-09-01T00:00:00.000Z"
    }
  ],

  // 2. Categories collection
  categories: [
    {
      id: 1,
      name: "Home Cleaning",
      description: "Deep cleaning, sanitation and routine housekeeping upkeep.",
      icon: "Sparkles"
    },
    {
      id: 2,
      name: "Electrical",
      description: "Wiring, fixture upgrades, appliances and safety diagnostics.",
      icon: "Zap"
    },
    {
      id: 3,
      name: "Plumbing",
      description: "Leak repairs, pipe installations, water heaters and drain clearing.",
      icon: "Wrench"
    },
    {
      id: 4,
      name: "Tutoring",
      description: "Academic coaching, board test prep, STEM and languages.",
      icon: "GraduationCap"
    }
  ],

  // 3. Providers collection
  providers: [
    {
      id: 1,
      user_id: 2,
      category_id: 1,
      business_name: "Kulkarni Home Services",
      description: "Certified deep cleaning specialists with non-toxic eco supplies.",
      location: "Mumbai, MH",
      experience: 6,
      hourly_rate: 499.00,
      rating: 4.8,
      total_reviews: 2
    },
    {
      id: 2,
      user_id: 3,
      category_id: 2,
      business_name: "Spark Electricals",
      description: "Licensed master electrician for residential and commercial repairs.",
      location: "Pune, MH",
      experience: 8,
      hourly_rate: 350.00,
      rating: 4.9,
      total_reviews: 1
    }
  ],

  // 4. Services collection
  services: [
    {
      id: 1,
      provider_id: 1,
      name: "Standard Home Clean",
      description: "Thorough dusting, vacuuming and floor disinfection across all rooms.",
      price: 799.00,
      duration: 90
    },
    {
      id: 2,
      provider_id: 1,
      name: "Deep Kitchen & Bath Clean",
      description: "Degreasing, tile scrubbing and appliance sanitization.",
      price: 1499.00,
      duration: 150
    },
    {
      id: 3,
      provider_id: 2,
      name: "Electrical Safety Inspection",
      description: "Complete panel diagnostics and safety circuit grounding check.",
      price: 499.00,
      duration: 60
    },
    {
      id: 4,
      provider_id: 2,
      name: "Ceiling Fan & Light Installation",
      description: "Mounting and safe wiring for up to 3 fixtures.",
      price: 699.00,
      duration: 60
    }
  ],

  // 5. Operating Availability collection
  availability: [
    { id: 1, provider_id: 1, day_of_week: "Monday", start_time: "09:00:00", end_time: "17:00:00" },
    { id: 2, provider_id: 1, day_of_week: "Tuesday", start_time: "09:00:00", end_time: "17:00:00" },
    { id: 3, provider_id: 1, day_of_week: "Wednesday", start_time: "09:00:00", end_time: "17:00:00" },
    { id: 4, provider_id: 1, day_of_week: "Thursday", start_time: "09:00:00", end_time: "17:00:00" },
    { id: 5, provider_id: 1, day_of_week: "Friday", start_time: "09:00:00", end_time: "17:00:00" },
    { id: 6, provider_id: 2, day_of_week: "Monday", start_time: "10:00:00", end_time: "18:00:00" },
    { id: 7, provider_id: 2, day_of_week: "Tuesday", start_time: "10:00:00", end_time: "18:00:00" },
    { id: 8, provider_id: 2, day_of_week: "Wednesday", start_time: "10:00:00", end_time: "18:00:00" },
    { id: 9, provider_id: 2, day_of_week: "Saturday", start_time: "10:00:00", end_time: "16:00:00" }
  ],

  // 6. Bookings collection
  bookings: [
    {
      id: 1,
      customer_id: 4,
      provider_id: 1,
      service_id: 1,
      booking_date: "2026-09-25",
      start_time: "10:00:00",
      end_time: "11:30:00",
      address: "Flat 402, Sunshine Heights, Andheri West",
      notes: "Please bring vacuum cleaner.",
      status: "Confirmed",
      created_at: "2026-09-18T10:00:00.000Z"
    },
    {
      id: 2,
      customer_id: 4,
      provider_id: 2,
      service_id: 3,
      booking_date: "2026-09-10",
      start_time: "11:00:00",
      end_time: "12:00:00",
      address: "Flat 402, Sunshine Heights, Andheri West",
      notes: "Switchboard sparking in master bedroom.",
      status: "Completed",
      created_at: "2026-09-08T09:00:00.000Z"
    }
  ],

  // 7. Reviews collection
  reviews: [
    {
      id: 1,
      booking_id: 2,
      customer_id: 4,
      provider_id: 2,
      rating: 5,
      comment: "Rohan arrived on time, diagnosed the short circuit in 10 minutes and repaired it safely.",
      created_at: "2026-09-10T14:30:00.000Z"
    }
  ],

  // Auto-increment ID counters
  counters: {
    users: 4,
    categories: 4,
    providers: 2,
    services: 4,
    availability: 9,
    bookings: 2,
    reviews: 1
  }
};

module.exports = store;
