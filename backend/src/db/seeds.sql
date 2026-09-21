-- Seed data for Service Marketplace Database
USE service_marketplace;

-- 1. Users (password is 'Password123!' hashed with bcrypt cost factor 10)
-- $2a$10$7vN3G3cIq0Z9Qj7Iq0Z9Qe1tB3zJ7e2V3a1b0c9d8e7f6a5b4c3d2
INSERT INTO users (id, name, email, password, role, phone, status) VALUES
(1, 'System Admin', 'admin@marketplace.com', '$2a$10$g1k2j3h4l5k6j7h8g9f0e1d2c3b4a59087654321fedcba098765', 'admin', '+91 98200 11223', 'active'),
(2, 'Meera Kulkarni', 'meera@cleanpro.com', '$2a$10$g1k2j3h4l5k6j7h8g9f0e1d2c3b4a59087654321fedcba098765', 'provider', '+91 98201 33445', 'active'),
(3, 'Rohan Sharma', 'rohan@sparkelectric.in', '$2a$10$g1k2j3h4l5k6j7h8g9f0e1d2c3b4a59087654321fedcba098765', 'provider', '+91 98202 55667', 'active'),
(4, 'Pooja Verma', 'customer@gmail.com', '$2a$10$g1k2j3h4l5k6j7h8g9f0e1d2c3b4a59087654321fedcba098765', 'customer', '+91 98203 77889', 'active')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 2. Categories
INSERT INTO categories (id, name, description) VALUES
(1, 'Home Cleaning', 'Deep cleaning, sanitation and routine housekeeping upkeep.'),
(2, 'Electrical', 'Wiring, fixture upgrades, appliances and safety diagnostics.'),
(3, 'Plumbing', 'Leak repairs, pipe installations, water heaters and drain clearing.'),
(4, 'Tutoring', 'Academic coaching, board test prep, STEM and languages.')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 3. Providers
INSERT INTO providers (id, user_id, category_id, business_name, description, location, experience, hourly_rate, rating, total_reviews) VALUES
(1, 2, 1, 'Kulkarni Home Services', 'Certified deep cleaning specialists with non-toxic eco supplies.', 'Mumbai, MH', 6, 499.00, 5.0, 1),
(2, 3, 2, 'Spark Electricals', 'Licensed master electrician for residential and commercial repairs.', 'Pune, MH', 8, 350.00, 5.0, 1)
ON DUPLICATE KEY UPDATE business_name=VALUES(business_name);

-- 4. Services
INSERT INTO services (id, provider_id, name, description, price, duration) VALUES
(1, 1, 'Deep Home Cleaning', 'Comprehensive multi-room dusting, floor scrubbing, and sanitization.', 1499.00, 90),
(2, 1, 'Kitchen Sanitization', 'Degreasing chimneys, countertop sterilization, and cabinet wiping.', 899.00, 60),
(3, 2, 'Wiring Inspection & Fix', 'Circuit breaker diagnostics, rewiring, and short circuit resolution.', 499.00, 60),
(4, 2, 'Ceiling Fan & Light Fitting', 'Heavy fixture mounting, switchboard connections, and testing.', 350.00, 45)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 5. Availability
INSERT INTO availability (id, provider_id, day_of_week, start_time, end_time) VALUES
(1, 1, 'Monday', '09:00:00', '17:00:00'),
(2, 1, 'Tuesday', '09:00:00', '17:00:00'),
(3, 1, 'Wednesday', '09:00:00', '17:00:00'),
(4, 1, 'Thursday', '09:00:00', '17:00:00'),
(5, 1, 'Friday', '09:00:00', '17:00:00'),
(6, 2, 'Monday', '10:00:00', '18:00:00'),
(7, 2, 'Tuesday', '10:00:00', '18:00:00'),
(8, 2, 'Wednesday', '10:00:00', '18:00:00'),
(9, 2, 'Saturday', '10:00:00', '16:00:00')
ON DUPLICATE KEY UPDATE day_of_week=VALUES(day_of_week);

-- 6. Bookings
INSERT INTO bookings (id, customer_id, provider_id, service_id, booking_date, start_time, end_time, address, notes, status, created_at) VALUES
(1, 4, 1, 1, '2026-09-25', '10:00:00', '11:30:00', 'Flat 402, Sunshine Heights, Andheri West', 'Please bring vacuum cleaner.', 'Confirmed', '2026-09-18 10:00:00'),
(2, 4, 2, 3, '2026-09-10', '11:00:00', '12:00:00', 'Flat 402, Sunshine Heights, Andheri West', 'Switchboard sparking in master bedroom.', 'Completed', '2026-09-08 09:00:00'),
(3, 4, 1, 1, '2026-09-02', '09:00:00', '10:30:00', 'Flat 402, Sunshine Heights, Andheri West', 'Initial move-in sanitization and deep cleaning.', 'Completed', '2026-09-01 08:00:00')
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- 7. Reviews
INSERT INTO reviews (id, booking_id, customer_id, provider_id, rating, comment, created_at) VALUES
(1, 2, 4, 2, 5, 'Rohan arrived on time, diagnosed the short circuit in 10 minutes and repaired it safely.', '2026-09-10 14:30:00'),
(2, 3, 4, 1, 5, 'Outstanding deep cleaning! Every surface was spotless and the team was extremely polite.', '2026-09-02 16:00:00')
ON DUPLICATE KEY UPDATE rating=VALUES(rating);
