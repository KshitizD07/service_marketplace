/**
 * @file AuthContext.jsx
 * @description React context provider for global authentication state and user session persistence.
 * Hydrates active credentials from localStorage and verifies token against GET /api/auth/me on mount.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Hydrate session on initial browser mount
  useEffect(() => {
    const token = localStorage.getItem("service_marketplace_token");
    if (token) {
      authService.getMe()
        .then(res => {
          if (res.success && res.data) {
            setUser(res.data);
          } else {
            localStorage.removeItem("service_marketplace_token");
            setUser(null);
          }
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

  /**
   * Log in user and persist token in localStorage.
   */
  const login = async (email, password) => {
    const res = await authService.login(email, password);
    if (res.data?.token) {
      localStorage.setItem("service_marketplace_token", res.data.token);
    }
    setUser(res.data.user);
    return res.data.user;
  };

  /**
   * Register user, persist token, and set user state.
   */
  const register = async (formData) => {
    const res = await authService.register(formData);
    if (res.data?.token) {
      localStorage.setItem("service_marketplace_token", res.data.token);
    }
    setUser(res.data.user);
    return res.data.user;
  };

  /**
   * Log out user and clear stored token.
   */
  const logout = () => {
    localStorage.removeItem("service_marketplace_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      isAuthenticated: !!user,
      isCustomer: user?.role === 'customer',
      isProvider: user?.role === 'provider',
      isAdmin: user?.role === 'admin'
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
