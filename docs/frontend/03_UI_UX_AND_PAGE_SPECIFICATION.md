# UI/UX & Page Specification
## Comprehensive User Interface & Interaction Design

---

## 1. Global Navigation Bar (`NavBar.jsx`)

* **Left:** Brand Logo with Briefcase icon (`Service Marketplace`). Clicking brand navigates to `/`.
* **Center Navigation:**
  * `Browse / Marketplace` (`/`)
  * `My Bookings` (`/bookings`) - Visible to Customers
  * `Provider Workspace` (`/provider/dashboard`) - Visible to Providers
  * `Administration` (`/admin`) - Visible to Admins
* **Right Authentication Cluster:**
  * **When Logged Out:** Secondary `Sign In` button and Primary `Register` button.
  * **When Logged In:** User Avatar with initials, Display Name, Role Pill (`Customer`, `Provider`, or `Admin`), and a `Sign Out` button.

---

## 2. Page Specifications

### 2.1 Marketplace & Browse Page (`BrowsePage.jsx`)
* **Hero Banner:** Asymmetric layout with high-impact headline ("Find someone who'll actually show up on time.") and keyword search input.
* **Category Filter Bar:** Horizontal scrollable category pill chips. Clicking a category filters the provider list; clicking "All" clears the filter.
* **Provider Card Grid:** Responsive multi-column layout showing:
  - Provider Avatar & Business Name
  - Category Badge & Location
  - Star Rating (e.g. `⭐ 4.8 (12 reviews)`)
  - Hourly rate (e.g. `₹499/hr`) & Years of experience
  - Primary button: `View Profile & Book` -> Navigates to `/provider/:id`

---

### 2.2 Provider Profile Page (`ProviderProfilePage.jsx`)
* **Header Section:** Business name, owner name, location, star rating, total review count, and base hourly rate.
* **About / Bio Section:** Detailed description of services, credentials, and specialties.
* **Services Offered Section:** List of all bookable service packages displaying service title, duration in minutes, description, and price. Includes a `Book Now` button.
* **Real Customer Reviews Section:**
  - Direct integration with backend database reviews.
  - Lists verified customer reviews with star ratings, reviewer names, review dates, and comments.
  - Shows empty state ("No reviews yet for this provider") if zero reviews exist.

---

### 2.3 Interactive Booking Flow Page (`BookingFlowPage.jsx`)
* **Step 1: Service Package Selection:** Radio cards displaying all services for this provider with duration and price.
* **Step 2: Calendar Date Selection:** 14-day rolling date picker. Only enables days when the provider has an active operating shift.
* **Step 3: Hourly Time Slot Selection:** Grid of available hourly slots (e.g., `09:00 AM`, `10:00 AM`) matching provider working hours.
* **Step 4: Location & Instructions (Resolves Bug #9):**
  - Text input for service physical address (`address`).
  - Textarea for special instructions (`notes`).
* **Step 5: Confirmation & Summary:** Total fee summary and `Confirm Booking` primary button. Submits payload to `POST /api/bookings`.

---

### 2.4 Customer Bookings Dashboard (`CustomerDashboardPage.jsx`)
* **Booking Cards List:** Shows service title, provider name, date, time, total fee, and address.
* **Visual Status Stepper:** Step progress bar tracking state:
  `Requested` -> `Confirmed` -> `In Progress` -> `Completed`.
* **Action Buttons:**
  - When status is `Requested`: `Cancel Request` button (dispatches `PUT /api/bookings/:id/cancel` - Resolves Bug #8).
  - When status is `Completed`: `Leave a Review` button.
* **Review Composer Drawer / Modal:**
  - Interactive 5-star picker.
  - Feedback comment textarea.
  - `Submit Review` button calling `POST /api/reviews`.

---

### 2.5 Provider Workspace (`ProviderDashboardPage.jsx`)
* **KPI Metrics Summary Cards:**
  - Total Bookings Count
  - Completed Gross Earnings (`₹`)
  - Overall Rating (`⭐ X.X / 5.0`)
* **Tab 1: Booking Requests:**
  - Displays customer name, service title, scheduled date & time, address, and notes.
  - Status progression buttons:
    - If `Requested`: `Accept` (transitions to `Confirmed`) and `Decline` (transitions to `Cancelled`).
    - If `Confirmed`: `Start Job` (transitions to `In Progress` - Resolves Bug #3).
    - If `In Progress`: `Mark Complete` (transitions to `Completed`).
* **Tab 2: Weekly Availability Manager (Resolves Bug #7):**
  - Lists Monday through Sunday.
  - Start time and End time inputs with toggle to enable/disable days.
  - `Save Schedule` button calling `PUT /api/providers/availability`.
* **Tab 3: Service Package Manager:**
  - Add new package with name, price, and duration.
  - Delete existing service packages.

---

### 2.6 Administration Operations Portal (`AdminDashboardPage.jsx`)
* **Sidebar Navigation:**
  - `Overview`: High-level metrics (Total Users, Active Providers, Bookings this month, Revenue) + Category distribution Recharts bar chart.
  - `Users & Providers`: Table of all accounts with role, category, rating, status badge, and `Activate / Deactivate` toggle button.
  - `Categories`: Table with `Add Category` modal, `Edit Category` modal, and `Delete Category` action.
  - `All Bookings`: Global table with status filter dropdown.
  - `All Reviews`: Moderation table displaying customer name, provider name, rating, and feedback comment.
