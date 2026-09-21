# Frontend Architecture & Component Patterns
## Modular Component Organization Specification

---

## 1. Directory Structure & File Inventory

The frontend breaks away from the monolithic 4,000-line single file into a structured, maintainable architecture:

```text
frontend/src/
├── assets/                   # Static graphics, hero banners, brand SVGs
│   ├── hero.png
│   ├── react.svg
│   └── vite.svg
│
├── components/               # Reusable presentation and UI components
│   ├── common/
│   │   ├── Avatar.jsx        # Colored initial avatars
│   │   ├── StarRating.jsx    # Visual star renderers with numeric label
│   │   ├── StatusPill.jsx    # Standardized color-coded status badges
│   │   ├── SectionHeading.jsx# Eyebrow, serif headline, and subtitle
│   │   ├── Modal.jsx         # Accessible overlay modal shell
│   │   └── Toast.jsx         # Floating toast alert banners
│   ├── layout/
│   │   ├── NavBar.jsx        # Global navigation header with auth triggers
│   │   └── Footer.jsx        # Footer links and copyright
│   └── booking/
│       ├── ServiceCard.jsx   # Selectable service package item
│       ├── DatePicker.jsx    # 14-day rolling availability calendar
│       └── TimeSlotGrid.jsx  # Hourly slot selection buttons
│
├── context/
│   ├── AuthContext.jsx       # Global user credentials & token state
│   └── ToastContext.jsx      # Global alert banner notification queue
│
├── services/                 # Backend REST API transport clients
│   ├── api.js                # Base fetch wrapper with Bearer token injection
│   ├── authService.js        # login, register, getMe
│   ├── providerService.js    # getProviders, getProviderById, updateProfile, updateAvailability, manageServices
│   ├── bookingService.js     # createBooking, getBookings, updateStatus, cancelBooking
│   ├── reviewService.js      # submitReview, getProviderReviews
│   └── adminService.js       # getStats, getUsers, toggleUserStatus, manageCategories, getAllReviews
│
├── pages/                    # Route-level page components
│   ├── auth/
│   │   └── AuthPage.jsx      # Login and Registration form tabs
│   ├── customer/
│   │   ├── BrowsePage.jsx    # Marketplace search & category browsing
│   │   ├── ProviderProfilePage.jsx # Provider profile, bio, services, real reviews
│   │   ├── BookingFlowPage.jsx     # Service, date, slot, address & confirmation
│   │   └── CustomerDashboardPage.jsx # Booking status tracker, cancellation & review composer
│   ├── provider/
│   │   └── ProviderDashboardPage.jsx # Requests, status management, availability & services
│   └── admin/
│       └── AdminDashboardPage.jsx    # Overview KPIs, Users, Categories, Bookings, Reviews
│
├── styles/
│   └── designTokens.css      # Custom variables and typography classes
│
├── App.jsx                   # React Router routing configuration
├── App.css                   # Global layout styling
├── index.css                 # Base resets and Tailwind imports
└── main.jsx                  # Root React 19 render entrypoint
```

---

## 2. Core Frontend Design Patterns

### 2.1 Centralized API Client (`services/api.js`)
Eliminates repetitive `fetch()` boilerplate and ensures all requests automatically include the `Authorization` header when a token is present:

```javascript
// src/services/api.js
const API_BASE_URL = "http://localhost:5000/api";

export async function request(endpoint, options = {}) {
  const token = localStorage.getItem("service_marketplace_token");
  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || `HTTP ${response.status} Error`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}
```

---

### 2.2 Global Authentication Hook (`useAuth`)
Components consume authenticated state and actions via `useAuth()` without prop-drilling:

```javascript
// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("service_marketplace_token");
    if (token) {
      authService.getMe()
        .then(res => {
          if (res.success) setUser(res.data);
        })
        .catch(() => {
          localStorage.removeItem("service_marketplace_token");
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await authService.login(email, password);
    localStorage.setItem("service_marketplace_token", res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = () => {
    localStorage.removeItem("service_marketplace_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

---

### 2.3 Role-Based Route Guard Pattern
Restricts access to specific paths based on user roles:

```javascript
// src/components/common/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;

  return children;
}
```
