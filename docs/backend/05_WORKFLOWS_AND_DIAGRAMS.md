# Backend Workflows & Sequence Diagrams
## System Interactions & Lifecycle State Machines

---

## 1. Authentication & Registration Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor User as Client (Customer/Provider)
    participant AuthCtrl as AuthController
    participant AuthSvc as AuthService
    participant DB as MySQL Database

    User->>AuthCtrl: POST /api/auth/register (name, email, password, role, [businessName, categoryId])
    AuthCtrl->>AuthSvc: registerUser(payload)
    AuthSvc->>DB: SELECT id FROM users WHERE email = ?
    alt Email Already Exists
        DB-->>AuthSvc: [User record]
        AuthSvc-->>AuthCtrl: Throw ConflictError("Email already registered")
        AuthCtrl-->>User: 409 Conflict
    else Email Is Available
        AuthSvc->>AuthSvc: bcrypt.hash(password, 10)
        AuthSvc->>DB: START TRANSACTION
        AuthSvc->>DB: INSERT INTO users (name, email, password, role, phone)
        DB-->>AuthSvc: { insertId: userId }
        
        opt Role is 'provider'
            AuthSvc->>DB: INSERT INTO providers (user_id, business_name, category_id, hourly_rate)
            DB-->>AuthSvc: { insertId: providerId }
            AuthSvc->>DB: INSERT INTO availability (provider_id, day_of_week, start_time, end_time) [Default Mon-Fri 09:00-17:00]
        end
        
        AuthSvc->>DB: COMMIT
        AuthSvc->>AuthSvc: jwt.sign({ id, email, role, providerId }, JWT_SECRET)
        AuthSvc-->>AuthCtrl: { token, user }
        AuthCtrl-->>User: 201 Created { success: true, token, user }
    end
```

---

## 2. Booking Scheduling & Conflict Check Flow

```mermaid
sequenceDiagram
    autonumber
    actor Customer
    participant BookingCtrl as BookingController
    participant BookingSvc as BookingService
    participant DB as MySQL Database

    Customer->>BookingCtrl: POST /api/bookings { providerId, serviceId, bookingDate, startTime, address, notes }
    BookingCtrl->>BookingSvc: createBooking(customerId, payload)
    
    BookingSvc->>DB: SELECT duration, price FROM services WHERE id = ?
    DB-->>BookingSvc: { duration: 60, price: 799.00 }
    
    BookingSvc->>BookingSvc: calculateEndTime(startTime, duration)
    
    Note over BookingSvc,DB: Check if provider is available on this day/time
    BookingSvc->>DB: SELECT * FROM availability WHERE provider_id = ? AND day_of_week = DAYNAME(?)
    DB-->>BookingSvc: { start_time: '09:00:00', end_time: '17:00:00' }
    
    Note over BookingSvc,DB: Collision check against existing active bookings
    BookingSvc->>DB: SELECT id FROM bookings WHERE provider_id = ? AND booking_date = ? AND status IN ('Requested', 'Confirmed', 'In Progress') AND (start_time < ? AND end_time > ?)
    
    alt Time Slot Collides
        DB-->>BookingSvc: [Existing booking ID]
        BookingSvc-->>BookingCtrl: Throw ConflictError("Provider is already booked for this time slot")
        BookingCtrl-->>Customer: 409 Conflict
    else Time Slot Free
        DB-->>BookingSvc: [] (Zero conflicts)
        BookingSvc->>DB: INSERT INTO bookings (customer_id, provider_id, service_id, booking_date, start_time, end_time, address, notes, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Requested')
        DB-->>BookingSvc: { insertId: 14 }
        BookingSvc-->>BookingCtrl: { bookingId: 14 }
        BookingCtrl-->>Customer: 201 Created { success: true, bookingId: 14 }
    end
```

---

## 3. Booking State Machine

```mermaid
stateDiagram-v2
    [*] --> Requested : Customer creates booking
    
    Requested --> Confirmed : Provider accepts booking
    Requested --> Cancelled : Customer cancels or Provider declines
    
    Confirmed --> In_Progress : Provider starts job
    Confirmed --> Cancelled : Customer or Provider cancels
    
    In_Progress --> Completed : Provider marks job finished
    
    Completed --> [*] : Eligible for Customer Review
    Cancelled --> [*] : Terminal State
```

### Transition Authorization Matrix

| Initial Status | Target Status | Allowed Actor | API Endpoint | Business Rule |
| :--- | :--- | :--- | :--- | :--- |
| `Requested` | `Confirmed` | Provider | `PUT /api/bookings/:id/status` | Provider agrees to perform service. |
| `Requested` | `Cancelled` | Customer / Provider | `PUT /api/bookings/:id/status` | Immediate release of calendar slot. |
| `Confirmed` | `In Progress` | Provider | `PUT /api/bookings/:id/status` | Provider has arrived on site. |
| `Confirmed` | `Cancelled` | Customer / Provider | `PUT /api/bookings/:id/status` | Cancellation before job commencement. |
| `In Progress`| `Completed` | Provider | `PUT /api/bookings/:id/status` | Job completed, triggers review eligibility. |

---

## 4. Transactional Review & Rating Recalculation Flow

```mermaid
sequenceDiagram
    autonumber
    actor Customer
    participant ReviewCtrl as ReviewController
    participant ReviewSvc as ReviewService
    participant DB as MySQL Database

    Customer->>ReviewCtrl: POST /api/reviews { bookingId, rating, comment }
    ReviewCtrl->>ReviewSvc: submitReview(customerId, payload)

    ReviewSvc->>DB: START TRANSACTION
    
    ReviewSvc->>DB: SELECT provider_id, status FROM bookings WHERE id = ? AND customer_id = ? FOR UPDATE
    
    alt Booking is Not Completed or Not Owned
        DB-->>ReviewSvc: Invalid or status != 'Completed'
        ReviewSvc->>DB: ROLLBACK
        ReviewSvc-->>ReviewCtrl: Throw BadRequestError("Cannot review incomplete booking")
        ReviewCtrl-->>Customer: 400 Bad Request
    else Booking is Valid
        DB-->>ReviewSvc: { provider_id: 1, status: 'Completed' }
        
        ReviewSvc->>DB: INSERT INTO reviews (booking_id, customer_id, provider_id, rating, comment) VALUES (?, ?, ?, ?, ?)
        
        Note over ReviewSvc,DB: Atomic Aggregate Recalculation
        ReviewSvc->>DB: UPDATE providers SET rating = (SELECT AVG(rating) FROM reviews WHERE provider_id = ?), total_reviews = (SELECT COUNT(*) FROM reviews WHERE provider_id = ?) WHERE id = ?
        
        ReviewSvc->>DB: COMMIT
        ReviewSvc-->>ReviewCtrl: { success: true }
        ReviewCtrl-->>Customer: 201 Created { success: true, message: "Review submitted successfully" }
    end
```
