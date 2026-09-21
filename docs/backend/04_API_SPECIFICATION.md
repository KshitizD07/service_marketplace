# REST API Specification & Contract
## Service Marketplace API Reference

---

## 1. Global Conventions

- **Base URL:** `http://localhost:5000/api`
- **Content-Type:** `application/json`
- **Authentication:** `Authorization: Bearer <JWT_TOKEN>`
- **Response Format:** All responses conform to the standard JSON envelope:
  ```json
  {
    "success": true,
    "message": "Human readable message",
    "data": { ... }
  }
  ```

---

## 2. Authentication API (`/api/auth`)

### 2.1 Register Account
Registers a new user (Customer or Provider). If registering as a provider, the provider profile is atomically initialized.

- **Method:** `POST`
- **Path:** `/api/auth/register`
- **Access:** Public
- **Request Body:**
  ```json
  {
    "name": "Alex Carter",
    "email": "alex.carter@example.com",
    "password": "Password123!",
    "role": "provider",
    "phone": "9876543210",
    "businessName": "Carter Home Care",
    "categoryId": 1,
    "hourlyRate": 450
  }
  ```
- **Responses:**
  - `201 Created`
    ```json
    {
      "success": true,
      "message": "Registration successful",
      "data": {
        "token": "eyJhbGciOi...",
        "user": {
          "id": 5,
          "name": "Alex Carter",
          "email": "alex.carter@example.com",
          "role": "provider",
          "providerId": 3
        }
      }
    }
    ```
  - `400 Bad Request` (Missing fields, weak password, invalid role)
  - `409 Conflict` (Email already registered)

---

### 2.2 Login
Authenticates an existing user and issues a signed JWT.

- **Method:** `POST`
- **Path:** `/api/auth/login`
- **Access:** Public
- **Request Body:**
  ```json
  {
    "email": "alex.carter@example.com",
    "password": "Password123!"
  }
  ```
- **Responses:**
  - `200 OK`
    ```json
    {
      "success": true,
      "message": "Login successful",
      "data": {
        "token": "eyJhbGciOi...",
        "user": {
          "id": 5,
          "name": "Alex Carter",
          "email": "alex.carter@example.com",
          "role": "provider",
          "providerId": 3,
          "status": "active"
        }
      }
    }
    ```
  - `401 Unauthorized` (Invalid credentials)
  - `403 Forbidden` (Account has been deactivated by admin)

---

### 2.3 Get Current Session User
Retrieves current profile from JWT claims.

- **Method:** `GET`
- **Path:** `/api/auth/me`
- **Access:** Private (`Bearer Token`)
- **Responses:**
  - `200 OK` (User object)
  - `401 Unauthorized`

---

## 3. Categories API (`/api/categories`)

### 3.1 Get All Categories
- **Method:** `GET`
- **Path:** `/api/categories`
- **Access:** Public
- **Responses:**
  - `200 OK`
    ```json
    {
      "success": true,
      "data": [
        {
          "id": 1,
          "name": "Home Cleaning",
          "description": "Deep cleaning and housekeeping services",
          "icon": "Sparkles"
        }
      ]
    }
    ```

---

## 4. Providers API (`/api/providers`)

### 4.1 Search & List Providers
- **Method:** `GET`
- **Path:** `/api/providers`
- **Access:** Public
- **Query Parameters:**
  - `category` (optional, string or id)
  - `search` (optional, keyword for name/location)
  - `minRating` (optional, number)
- **Responses:**
  - `200 OK` (Array of provider cards with summary ratings and available services)

---

### 4.2 Get Provider Profile by ID
- **Method:** `GET`
- **Path:** `/api/providers/:id`
- **Access:** Public
- **Responses:**
  - `200 OK`
    ```json
    {
      "success": true,
      "data": {
        "id": 1,
        "userId": 2,
        "businessName": "Kulkarni Home Services",
        "description": "Eco-friendly deep cleaning specialists.",
        "location": "Mumbai, MH",
        "experience": 6,
        "hourlyRate": 499.00,
        "rating": 4.8,
        "totalReviews": 12,
        "categoryName": "Home Cleaning",
        "services": [
          { "id": 1, "name": "Standard Clean", "price": 799.00, "duration": 90 }
        ],
        "availability": {
          "Monday": ["9:00 AM", "10:00 AM", "11:00 AM", "1:00 PM", "2:00 PM"]
        },
        "reviews": [
          {
            "id": 1,
            "customerName": "Sanket A.",
            "rating": 5,
            "comment": "Super clean and prompt!",
            "createdAt": "2026-09-10T14:30:00.000Z"
          }
        ]
      }
    }
    ```
  - `404 Not Found`

---

### 4.3 Update Provider Availability Schedule
- **Method:** `PUT`
- **Path:** `/api/providers/availability`
- **Access:** Private (`role: 'provider'`)
- **Request Body:**
  ```json
  {
    "schedule": [
      { "dayOfWeek": "Monday", "startTime": "09:00", "endTime": "17:00" },
      { "dayOfWeek": "Tuesday", "startTime": "09:00", "endTime": "17:00" },
      { "dayOfWeek": "Wednesday", "startTime": "09:00", "endTime": "17:00" }
    ]
  }
  ```
- **Responses:**
  - `200 OK` `{ "success": true, "message": "Availability updated successfully" }`

---

### 4.4 Provider Services Management
- **Add Service:** `POST /api/providers/services`
  - **Body:** `{ "name": "Sofa Shampooing", "price": 599.00, "duration": 60, "description": "Wet extraction clean" }`
  - **Status:** `201 Created`
- **Update Service:** `PUT /api/providers/services/:serviceId`
- **Delete Service:** `DELETE /api/providers/services/:serviceId`

---

## 5. Bookings API (`/api/bookings`)

### 5.1 Create a Booking
- **Method:** `POST`
- **Path:** `/api/bookings`
- **Access:** Private (`role: 'customer'`)
- **Request Body:**
  ```json
  {
    "providerId": 1,
    "serviceId": 1,
    "bookingDate": "2026-09-28",
    "startTime": "10:00:00",
    "address": "Flat 402, Sunshine Heights, Andheri West",
    "notes": "Doorbell broken, call on arrival."
  }
  ```
- **Responses:**
  - `201 Created`
    ```json
    {
      "success": true,
      "message": "Booking created successfully",
      "data": { "bookingId": 14 }
    }
    ```
  - `409 Conflict` (Provider is already booked for that date & time window)

---

### 5.2 List User Bookings
- **Method:** `GET`
- **Path:** `/api/bookings`
- **Access:** Private (Authenticated user)
- **Behavior:** Automatically filters by `customer_id` for customers, and by `provider_id` for providers.
- **Responses:**
  - `200 OK` (Array of bookings)

---

### 5.3 Update Booking Status
- **Method:** `PUT`
- **Path:** `/api/bookings/:id/status`
- **Access:** Private (`provider` or `admin`)
- **Request Body:**
  ```json
  {
    "status": "Confirmed"
  }
  ```
- **Allowed Transitions:**
  - Provider can transition: `Requested` -> `Confirmed` | `Cancelled`
  - Provider can transition: `Confirmed` -> `In Progress` | `Cancelled`
  - Provider can transition: `In Progress` -> `Completed`
  - Customer can transition: `Requested` -> `Cancelled`

---

## 6. Reviews API (`/api/reviews`)

### 6.1 Submit Customer Review
- **Method:** `POST`
- **Path:** `/api/reviews`
- **Access:** Private (`role: 'customer'`)
- **Request Body:**
  ```json
  {
    "bookingId": 14,
    "rating": 5,
    "comment": "Punctual, polite, and great attention to detail!"
  }
  ```
- **Responses:**
  - `201 Created` `{ "success": true, "message": "Review submitted successfully" }`
  - `400 Bad Request` (Booking not completed, or not owned by user)
  - `409 Conflict` (Review already exists for this booking)

---

## 7. Admin API (`/api/admin`)

*All admin endpoints require `role: 'admin'` authorization.*

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/admin/stats` | Platform KPIs: Total users, providers, monthly bookings, gross revenue, category distribution. |
| `GET` | `/api/admin/users` | List all accounts with role, rating, and status. |
| `PUT` | `/api/admin/users/:id/status` | Body: `{ "status": "active" \| "inactive" }`. |
| `POST` | `/api/admin/categories` | Body: `{ "name": "Pet Care", "description": "Grooming & walking" }`. |
| `PUT` | `/api/admin/categories/:id` | Body: `{ "name": "...", "description": "..." }`. |
| `DELETE` | `/api/admin/categories/:id` | Deletes category (fails with `409 Conflict` if providers use it). |
| `GET` | `/api/admin/reviews` | Complete list of reviews across all providers. |
