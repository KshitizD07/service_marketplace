# Backend REST API Integration Map
## Mapping 18 Backend Endpoints to Frontend Components

---

| # | Backend Route | HTTP | Frontend Caller / Page | Purpose & Payload |
| :-: | :--- | :---: | :--- | :--- |
| **1** | `/api/auth/register` | `POST` | `AuthPage.jsx` | Signs up customer or provider with business details and category. |
| **2** | `/api/auth/login` | `POST` | `AuthPage.jsx` | Authenticates email & password, stores JWT token. |
| **3** | `/api/auth/me` | `GET` | `AuthContext.jsx` | Restores user session and role claims on browser refresh. |
| **4** | `/api/categories` | `GET` | `BrowsePage.jsx`, `AdminDashboardPage.jsx` | Fetches list of categories for filter pills and select dropdowns. |
| **5** | `/api/providers` | `GET` | `BrowsePage.jsx` | Queries providers matching search keyword, category, or min rating. |
| **6** | `/api/providers/:id` | `GET` | `ProviderProfilePage.jsx`, `BookingFlowPage.jsx` | Loads full provider details with real database reviews and shifts. |
| **7** | `/api/providers/profile` | `PUT` | `ProviderDashboardPage.jsx` | Saves updated provider bio, location, trade name, and hourly rate. |
| **8** | `/api/providers/availability` | `PUT` | `ProviderDashboardPage.jsx` (Availability Tab) | Persists updated operating shifts across weekdays. |
| **9** | `/api/providers/services` | `POST` | `ProviderDashboardPage.jsx` (Services Tab) | Adds a new bookable package (`{ name, price, duration }`). |
| **10**| `/api/providers/services/:id` | `DELETE` | `ProviderDashboardPage.jsx` (Services Tab) | Removes a service package. |
| **11**| `/api/bookings` | `POST` | `BookingFlowPage.jsx` | Places reservation with address, notes, and collision prevention. |
| **12**| `/api/bookings` | `GET` | `CustomerDashboardPage.jsx`, `ProviderDashboardPage.jsx` | Retrieves role-filtered bookings list for the authenticated user. |
| **13**| `/api/bookings/:id/status` | `PUT` | `ProviderDashboardPage.jsx` | Advances job lifecycle (`Confirmed`, `In Progress`, `Completed`). |
| **14**| `/api/bookings/:id/cancel` | `PUT` | `CustomerDashboardPage.jsx` | Cancels an active appointment directly on the server. |
| **15**| `/api/reviews` | `POST` | `CustomerDashboardPage.jsx` (Review Modal) | Submits customer review and triggers provider rating update. |
| **16**| `/api/reviews/provider/:id` | `GET` | `ProviderProfilePage.jsx` | Loads verified reviews for a provider profile. |
| **17**| `/api/admin/stats` | `GET` | `AdminDashboardPage.jsx` (Overview Tab) | Displays KPI cards and category split charts. |
| **18**| `/api/admin/users` | `GET` | `AdminDashboardPage.jsx` (Users Tab) | Fetches user table with roles and status. |
| **19**| `/api/admin/users/:id/status` | `PUT` | `AdminDashboardPage.jsx` (Users Tab) | Toggles account between `active` and `inactive`. |
| **20**| `/api/admin/categories` | `POST` | `AdminDashboardPage.jsx` (Categories Tab) | Creates a new category. |
| **21**| `/api/admin/categories/:id` | `PUT` | `AdminDashboardPage.jsx` (Categories Tab) | Edits an existing category. |
| **22**| `/api/admin/categories/:id` | `DELETE` | `AdminDashboardPage.jsx` (Categories Tab) | Deletes a category if unused. |
| **23**| `/api/admin/reviews` | `GET` | `AdminDashboardPage.jsx` (Reviews Tab) | Lists all platform customer reviews for administrative inspection. |
