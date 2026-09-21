/**
 * @file App.jsx
 * @description Master single-page application routing layout.
 * Wraps the route hierarchy in AuthProvider, ToastProvider, and BrowserRouter,
 * with role-based ProtectedRoute guards for Customer, Provider, and Admin views.
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Layout Components
import NavBar from './components/layout/NavBar';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';

// Page Components
import BrowsePage from './pages/customer/BrowsePage';
import ProviderProfilePage from './pages/customer/ProviderProfilePage';
import BookingFlowPage from './pages/customer/BookingFlowPage';
import CustomerDashboardPage from './pages/customer/CustomerDashboardPage';
import ProviderDashboardPage from './pages/provider/ProviderDashboardPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AuthPage from './pages/auth/AuthPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <div
            style={{
              minHeight: '100vh',
              display: 'flex',
              flexDirection: 'column',
              background: '#F5F2EA',
              color: '#1B1F1C',
              fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
            }}
          >
            {/* Global Sticky Navigation */}
            <NavBar />

            {/* Route Hierarchy */}
            <div style={{ flex: 1 }}>
              <Routes>
                {/* Public Marketplace Catalog */}
                <Route path="/" element={<BrowsePage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/provider/:id" element={<ProviderProfilePage />} />

                {/* Customer Routes (Guarded) */}
                <Route
                  path="/book/:providerId"
                  element={
                    <ProtectedRoute allowedRoles={['customer']}>
                      <BookingFlowPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/bookings"
                  element={
                    <ProtectedRoute allowedRoles={['customer']}>
                      <CustomerDashboardPage />
                    </ProtectedRoute>
                  }
                />

                {/* Provider Workspace (Guarded) */}
                <Route
                  path="/provider/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['provider']}>
                      <ProviderDashboardPage />
                    </ProtectedRoute>
                  }
                />

                {/* Platform Administration Console (Guarded) */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboardPage />
                    </ProtectedRoute>
                  }
                />

                {/* Catch-all Redirect to Marketplace */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>

            {/* Global Footer */}
            <Footer />
          </div>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
