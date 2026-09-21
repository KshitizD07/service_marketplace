# Backend Developer Implementation Checklist & Sprint Plan
## Step-by-Step Construction Guide

This document is the actionable task tracker for engineering the backend according to the system specification.

---

## Phase 1: Environment & Core Infrastructure Setup

- [x] **Task 1.1: Dependency Verification**
  Ensure all production dependencies are declared in `backend/package.json`:
  ```bash
  npm install express cors dotenv mysql2 bcryptjs jsonwebtoken
  npm install --save-dev nodemon
  ```
- [x] **Task 1.2: Environment Configuration (`src/config/env.js`)**
  Create a strict environment loader that validates existence of:
  - `PORT` (Default: 5000)
  - `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
  - `JWT_SECRET`
- [x] **Task 1.3: Database Connection Pool (`src/config/db.js`)**
  Configure a MySQL2 promise pool with connection limits, reconnect listeners, and a health test route.
- [ ] **Task 1.4: Database DDL Execution**
  Apply `src/db/schema.sql` and `src/db/seeds.sql` to your local MySQL server (deferred to final database stage).

---

## Phase 2: Middlewares & Error Handling Layer

- [x] **Task 2.1: JWT Authentication Middleware (`src/middlewares/auth.js`)**
  Implement `authenticateToken(req, res, next)`:
  - Extract Bearer token from `Authorization` header.
  - Verify token with `jwt.verify`.
  - Inject decoded payload into `req.user`.
  - Return `401 Unauthorized` if token is missing, `403 Forbidden` if invalid/expired.
- [x] **Task 2.2: Role Authorization Guard (`src/middlewares/role.js`)**
  Implement `requireRole(...roles)`:
  - Check `req.user.role`.
  - Return `403 Forbidden` ("Insufficient permissions") if role doesn't match.
- [x] **Task 2.3: Centralized Error Handler (`src/middlewares/errorHandler.js`)**
  Implement Express 4-argument error handling middleware returning standardized JSON responses.

---

## Phase 3: Authentication & Identity Module

- [x] **Task 3.1: Service Layer (`src/services/authService.js`)**
  - Hash passwords with `bcrypt.hash(password, 10)`.
  - Transactional user creation: if `role === 'provider'`, insert a row into `providers` table and insert default `availability` rows (Mon–Fri, 09:00 to 17:00).
  - Issue JWT token with `{ id, email, role, providerId }`.
- [x] **Task 3.2: Controller Layer (`src/controllers/authController.js`)**
  - Implement `register`, `login`, and `me` methods.
- [x] **Task 3.3: Route Definition (`src/routes/authRoutes.js`)**
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `GET /api/auth/me` (Guarded with `authenticateToken`)

---

## Phase 4: Provider & Catalog Module

- [x] **Task 4.1: Service Layer (`src/services/providerService.js`)**
  - Query providers with join on `users` and `categories`.
  - Query single provider including attached `services`, `availability`, and database `reviews`.
  - Update provider commercial details (`business_name`, `description`, `hourly_rate`, `location`).
  - Update availability schedule (`PUT /api/providers/availability`).
  - Manage services (Add, Update, Delete service packages).
- [x] **Task 4.2: Controller & Routes (`src/controllers/providerController.js`, `src/routes/providerRoutes.js`)**
  - Mount public routes (`GET /api/providers`, `GET /api/providers/:id`).
  - Mount protected provider routes (`PUT /profile`, `PUT /availability`, `POST /services`, `DELETE /services/:id`).

---

## Phase 5: Booking & Scheduling Module

- [x] **Task 5.1: Conflict Detection Engine (`src/services/bookingService.js`)**
  - Calculate `end_time` using `service.duration`.
  - Check provider working availability for the requested weekday.
  - Check overlapping bookings in `status IN ('Requested', 'Confirmed', 'In Progress')`.
  - Prevent double booking by throwing `ConflictError` on collision.
- [x] **Task 5.2: State Machine Implementation**
  - Validate state transitions:
    - Provider: `Requested` -> `Confirmed` | `Cancelled`
    - Provider: `Confirmed` -> `In Progress` | `Cancelled`
    - Provider: `In Progress` -> `Completed`
    - Customer: `Requested` -> `Cancelled`
- [x] **Task 5.3: Controller & Routes (`src/controllers/bookingController.js`, `src/routes/bookingRoutes.js`)**
  - `POST /api/bookings` (Customer)
  - `GET /api/bookings` (Role-filtered)
  - `PUT /api/bookings/:id/status` (Guarded state transition)

---

## Phase 6: Reviews & Reputation Module

- [x] **Task 6.1: Atomic Review Submission (`src/services/reviewService.js`)**
  - Begin MySQL transaction.
  - Verify booking is `Completed` and belongs to `req.user.id`.
  - Insert review record into `reviews`.
  - Recalculate `AVG(rating)` and `COUNT(*)` and update `providers` record.
  - Commit transaction.
- [x] **Task 6.2: Controller & Routes (`src/controllers/reviewController.js`, `src/routes/reviewRoutes.js`)**
  - `POST /api/reviews` (Customer)
  - `GET /api/providers/:id/reviews` (Public)

---

## Phase 7: Admin & Governance Module

- [x] **Task 7.1: Platform Analytics (`src/services/adminService.js`)**
  - Aggregated counts: Users, Active Providers, Bookings this month, Total Revenue.
  - Category breakdown distribution.
- [x] **Task 7.2: Governance Endpoints**
  - User status toggle (`PUT /api/admin/users/:id/status`).
  - Category CRUD (`POST`, `PUT`, `DELETE /api/admin/categories`).
  - Global review moderation (`GET /api/admin/reviews`).
- [x] **Task 7.3: Route Guarding**
  - Protect all `/api/admin/*` endpoints with `authenticateToken` AND `requireRole('admin')`.

---

## Phase 8: Verification & Automated Smoke Testing

- [x] **Task 8.1: Test Suite Script (`tests/smoke.sh` or Postman collection)**
  - Register Customer -> Success.
  - Register Provider -> Success (verify row created in `providers`).
  - Search Providers -> New provider appears.
  - Customer books slot -> Success.
  - Customer attempts same slot -> Fails with `409 Conflict`.
  - Provider accepts booking -> Status becomes `Confirmed`.
  - Provider starts job -> Status becomes `In Progress`.
  - Provider completes job -> Status becomes `Completed`.
  - Customer submits review -> Rating updates on provider profile.
  - Non-admin attempts `/api/admin/stats` -> Returns `403 Forbidden`.
