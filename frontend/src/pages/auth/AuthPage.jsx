/**
 * @file AuthPage.jsx
 * @description Dedicated authentication page supporting login and dual-role registration
 * (Customer vs Service Provider with business name, category, and hourly rate).
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Briefcase, User, Mail, Lock, Phone, DollarSign, Building } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import * as providerService from '../../services/providerService';

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, isAuthenticated, user } = useAuth();
  const { addToast } = useToast();

  const [mode, setMode] = useState(location.state?.mode || 'login');
  const [role, setRole] = useState('customer');
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [hourlyRate, setHourlyRate] = useState('450');

  // Load categories for provider registration dropdown
  useEffect(() => {
    providerService.getCategories()
      .then(res => {
        if (res.success && res.data) {
          setCategories(res.data);
          if (res.data.length > 0) setCategoryId(res.data[0].id);
        }
      })
      .catch(() => {});
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'provider') navigate('/provider/dashboard');
      else navigate('/');
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'login') {
        const loggedInUser = await login(email, password);
        addToast(`Welcome back, ${loggedInUser.name}!`, 'success');
        if (loggedInUser.role === 'admin') navigate('/admin');
        else if (loggedInUser.role === 'provider') navigate('/provider/dashboard');
        else navigate('/');
      } else {
        const payload = {
          name,
          email,
          password,
          role,
          phone: phone || null,
          ...(role === 'provider' && {
            businessName: businessName || `${name}'s Services`,
            categoryId: categoryId ? parseInt(categoryId, 10) : 1,
            hourlyRate: parseFloat(hourlyRate) || 350
          })
        };

        const registeredUser = await register(payload);
        addToast(`Account created successfully! Welcome, ${registeredUser.name}.`, 'success');
        if (registeredUser.role === 'admin') navigate('/admin');
        else if (registeredUser.role === 'provider') navigate('/provider/dashboard');
        else navigate('/');
      }
    } catch (err) {
      addToast(err.message || 'Authentication failed. Please check credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 75px)', display: 'grid', placeItems: 'center', padding: '2.5rem 1rem' }}>
      <div
        style={{
          width: '100%',
          maxWidth: 480,
          background: '#FFFFFF',
          border: '1.5px solid #E1DACB',
          borderRadius: 20,
          padding: '2.5rem 2.2rem',
          boxShadow: '4px 4px 0 #1B1F1C'
        }}
      >
        {/* Header Branding */}
        <div style={{ textAlign: 'center', marginBottom: '1.8rem' }}>
          <div
            style={{
              width: 48,
              height: 48,
              background: '#E4EEE9',
              color: '#1F6E5E',
              borderRadius: 14,
              display: 'grid',
              placeItems: 'center',
              margin: '0 auto 12px'
            }}
          >
            <Briefcase size={24} />
          </div>
          <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: '1.8rem', fontWeight: 600, color: '#1B1F1C', margin: 0 }}>
            {mode === 'login' ? 'Welcome Back' : 'Create an Account'}
          </h1>
          <p style={{ color: '#8D8577', fontSize: '0.88rem', marginTop: 4 }}>
            {mode === 'login' ? 'Access your marketplace account & bookings' : 'Join as a customer or service provider'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div
          style={{
            display: 'flex',
            background: '#F5F2EA',
            borderRadius: 10,
            padding: 4,
            marginBottom: '1.6rem',
            border: '1px solid #E1DACB'
          }}
        >
          <button
            type="button"
            onClick={() => setMode('login')}
            style={{
              flex: 1,
              padding: '8px 0',
              border: 0,
              borderRadius: 8,
              background: mode === 'login' ? '#FFFFFF' : 'transparent',
              color: mode === 'login' ? '#1B1F1C' : '#8D8577',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: mode === 'login' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none'
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            style={{
              flex: 1,
              padding: '8px 0',
              border: 0,
              borderRadius: 8,
              background: mode === 'register' ? '#FFFFFF' : 'transparent',
              color: mode === 'register' ? '#1B1F1C' : '#8D8577',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: mode === 'register' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none'
            }}
          >
            Register
          </button>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          {mode === 'register' && (
            <>
              {/* Role Selection */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#1B1F1C', marginBottom: 6 }}>
                  I want to:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => setRole('customer')}
                    style={{
                      padding: '10px',
                      borderRadius: 10,
                      border: `1.5px solid ${role === 'customer' ? '#1F6E5E' : '#E1DACB'}`,
                      background: role === 'customer' ? '#E4EEE9' : '#FFFFFF',
                      color: role === 'customer' ? '#154E43' : '#8D8577',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer'
                    }}
                  >
                    Hire Services (Customer)
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('provider')}
                    style={{
                      padding: '10px',
                      borderRadius: 10,
                      border: `1.5px solid ${role === 'provider' ? '#1F6E5E' : '#E1DACB'}`,
                      background: role === 'provider' ? '#E4EEE9' : '#FFFFFF',
                      color: role === 'provider' ? '#154E43' : '#8D8577',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer'
                    }}
                  >
                    Provide Services (Pro)
                  </button>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#1B1F1C', marginBottom: 6 }}>
                  Full Name
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={16} color="#8D8577" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    required
                    placeholder="Jane Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '10px 12px 10px 38px',
                      borderRadius: 10,
                      border: '1.5px solid #CFC6B2',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>
            </>
          )}

          {/* Email */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#1B1F1C', marginBottom: 6 }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="#8D8577" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '10px 12px 10px 38px',
                  borderRadius: 10,
                  border: '1.5px solid #CFC6B2',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#1B1F1C', marginBottom: 6 }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="#8D8577" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '10px 12px 10px 38px',
                  borderRadius: 10,
                  border: '1.5px solid #CFC6B2',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Additional Provider Fields */}
          {mode === 'register' && role === 'provider' && (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#1B1F1C', marginBottom: 6 }}>
                  Business / Trade Name
                </label>
                <div style={{ position: 'relative' }}>
                  <Building size={16} color="#8D8577" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Electrical Solutions"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '10px 12px 10px 38px',
                      borderRadius: 10,
                      border: '1.5px solid #CFC6B2',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#1B1F1C', marginBottom: 6 }}>
                    Category
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 10,
                      border: '1.5px solid #CFC6B2',
                      background: '#FFFFFF',
                      fontSize: '0.88rem'
                    }}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#1B1F1C', marginBottom: 6 }}>
                    Hourly Rate (₹)
                  </label>
                  <div style={{ position: 'relative' }}>
                    <DollarSign size={16} color="#8D8577" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="number"
                      min="100"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(e.target.value)}
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '10px 10px 10px 32px',
                        borderRadius: 10,
                        border: '1.5px solid #CFC6B2',
                        fontSize: '0.88rem',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 10,
              padding: '12px',
              borderRadius: 999,
              border: 0,
              background: '#1F6E5E',
              color: '#FBFAF6',
              fontSize: '0.95rem',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              boxShadow: '3px 3px 0 #1B1F1C',
              transition: 'transform 0.1s ease'
            }}
          >
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In to Account' : 'Complete Registration'}
          </button>
        </form>

        {/* Quick Demo Credentials Reminder */}
        <div
          style={{
            marginTop: '1.5rem',
            padding: '10px 14px',
            background: '#F5F2EA',
            borderRadius: 10,
            border: '1px solid #E1DACB',
            fontSize: '0.76rem',
            color: '#8D8577',
            lineHeight: 1.5
          }}
        >
          <b>Demo Logins (Password: Password123!):</b>
          <div>Admin: <code>admin@marketplace.com</code></div>
          <div>Provider: <code>meera@cleanpro.com</code></div>
          <div>Customer: <code>customer@gmail.com</code></div>
        </div>
      </div>
    </div>
  );
}
