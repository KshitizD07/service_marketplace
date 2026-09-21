# Frontend Developer Implementation Checklist & Sprint Plan
## Step-by-Step Construction Guide

This document tracks the phased implementation of the modular frontend client.

---

## Phase 1: Foundation, Design Tokens & Shared Infrastructure

- [ ] **Task 1.1: Dependency Verification**
  Confirm dependencies in `frontend/package.json` (`react-router-dom`, `lucide-react`, `recharts`).
- [ ] **Task 1.2: API Transport Client (`src/services/api.js`)**
  Create centralized fetch wrapper that automatically appends `Authorization: Bearer <token>`.
- [ ] **Task 1.3: Service API Modules (`src/services/*.js`)**
  Implement client methods for `authService`, `providerService`, `bookingService`, `reviewService`, and `adminService`.
- [ ] **Task 1.4: Global AuthContext (`src/context/AuthContext.jsx`)**
  Implement session management, token persistence, and automatic hydration on page load.
- [ ] **Task 1.5: Shared UI Components (`src/components/common/*`)**
  Create `Avatar.jsx`, `StarRating.jsx`, `StatusPill.jsx`, and `SectionHeading.jsx`.
- [ ] **Task 1.6: Layout Components (`src/components/layout/*`)**
  Implement `NavBar.jsx` and `Footer.jsx`.

---

## Phase 2: Authentication Module

- [ ] **Task 2.1: Authentication Page (`src/pages/auth/AuthPage.jsx`)**
  - Toggle between Login and Register tabs.
  - Role selection for Customer vs Service Provider.
  - Additional fields when registering as a provider (Business Name, Category selector, Hourly Rate).
  - Redirect user upon successful authentication based on role (`/admin`, `/provider/dashboard`, or `/`).

---

## Phase 3: Marketplace Discovery & Provider Profiles

- [ ] **Task 3.1: Browse / Marketplace Page (`src/pages/customer/BrowsePage.jsx`)**
  - Category filter pills.
  - Keyword search query input.
  - Provider cards with rating, location, hourly rate, and "View Profile" action.
- [ ] **Task 3.2: Provider Profile Page (`src/pages/customer/ProviderProfilePage.jsx`)**
  - Business header, bio, and hourly rate.
  - Bookable service packages list with prices and duration.
  - Display verified customer reviews loaded from the database (`GET /api/providers/:id`).

---

## Phase 4: Interactive Booking Engine

- [ ] **Task 4.1: Booking Flow Page (`src/pages/customer/BookingFlowPage.jsx`)**
  - Select service package.
  - Select from 14-day rolling availability dates.
  - Select available time slot.
  - Provide physical address and special instructions/notes.
  - Confirm booking via `POST /api/bookings`.

---

## Phase 5: Customer Dashboard & Review System

- [ ] **Task 5.1: Customer Bookings Page (`src/pages/customer/CustomerDashboardPage.jsx`)**
  - Filter bookings by authenticated customer ID.
  - Visual status progress stepper (`Requested` -> `Confirmed` -> `In Progress` -> `Completed`).
  - Server-side cancellation (`PUT /api/bookings/:id/cancel`).
  - Integrated Review Composer drawer for completed bookings (`POST /api/reviews`).

---

## Phase 6: Provider Workspace

- [ ] **Task 6.1: Provider Dashboard Page (`src/pages/provider/ProviderDashboardPage.jsx`)**
  - Summary KPI cards (Requests, Completed Earnings, Active Rating).
  - Tab 1: Manage booking requests (`Accept`, `Decline`, `Start Job`, `Mark Complete`).
  - Tab 2: Availability Manager with weekday shift editing (`PUT /api/providers/availability`).
  - Tab 3: Service Package Manager (Add new service, delete existing service).

---

## Phase 7: Administration Console

- [ ] **Task 7.1: Admin Dashboard Page (`src/pages/admin/AdminDashboardPage.jsx`)**
  - Tab 1: Overview KPIs + Category distribution chart.
  - Tab 2: Users & Providers management with account status toggle.
  - Tab 3: Category Governance (Create, Edit, Delete).
  - Tab 4: All Bookings inspection with status filters.
  - Tab 5: Customer Reviews moderation table.

---

## Phase 8: Route Integration & Production Build Verification

- [ ] **Task 8.1: React Router Routing Assembly (`src/App.jsx`)**
  Wire all routes with `<BrowserRouter>`, `<Routes>`, and `<ProtectedRoute>`.
- [ ] **Task 8.2: Build Check**
  Execute `npm run build` in `frontend/` to ensure zero compilation errors or broken imports.
