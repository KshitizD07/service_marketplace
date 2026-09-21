/**
 * @file NavBar.jsx
 * @description Global navigation header component.
 * Displays brand identity, dynamic contextual links based on logged-in role,
 * and session login/logout action buttons.
 */

import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Briefcase, LogOut, LayoutDashboard, Calendar, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../common/Avatar';

export default function NavBar() {
  const { user, isAuthenticated, isCustomer, isProvider, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header
      style={{
        borderBottom: '1px solid #E1DACB',
        background: '#F5F2EA',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backdropFilter: 'blur(8px)'
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '0.9rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        {/* Brand Logo */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            textDecoration: 'none',
            color: '#1B1F1C'
          }}
        >
          <div
            style={{
              background: '#1F6E5E',
              color: '#FBFAF6',
              width: 36,
              height: 36,
              borderRadius: 10,
              display: 'grid',
              placeItems: 'center'
            }}
          >
            <Briefcase size={18} />
          </div>
          <div>
            <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: '1.2rem', lineHeight: 1 }}>
              Service Marketplace
            </div>
            <div style={{ fontSize: '0.68rem', color: '#8D8577', fontWeight: 600, letterSpacing: '0.04em' }}>
              HOME & PROFESSIONAL
            </div>
          </div>
        </Link>

        {/* Center Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '1.4rem' }}>
          <Link
            to="/"
            style={{
              textDecoration: 'none',
              fontSize: '0.88rem',
              fontWeight: 600,
              color: isActive('/') ? '#1F6E5E' : '#8D8577',
              borderBottom: isActive('/') ? '2px solid #1F6E5E' : '2px solid transparent',
              paddingBottom: 2
            }}
          >
            Marketplace
          </Link>

          {isCustomer && (
            <Link
              to="/bookings"
              style={{
                textDecoration: 'none',
                fontSize: '0.88rem',
                fontWeight: 600,
                color: isActive('/bookings') ? '#1F6E5E' : '#8D8577',
                borderBottom: isActive('/bookings') ? '2px solid #1F6E5E' : '2px solid transparent',
                paddingBottom: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 5
              }}
            >
              <Calendar size={14} /> My Bookings
            </Link>
          )}

          {isProvider && (
            <Link
              to="/provider/dashboard"
              style={{
                textDecoration: 'none',
                fontSize: '0.88rem',
                fontWeight: 600,
                color: isActive('/provider/dashboard') ? '#1F6E5E' : '#8D8577',
                borderBottom: isActive('/provider/dashboard') ? '2px solid #1F6E5E' : '2px solid transparent',
                paddingBottom: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 5
              }}
            >
              <LayoutDashboard size={14} /> Provider Workspace
            </Link>
          )}

          {isAdmin && (
            <Link
              to="/admin"
              style={{
                textDecoration: 'none',
                fontSize: '0.88rem',
                fontWeight: 600,
                color: isActive('/admin') ? '#1F6E5E' : '#8D8577',
                borderBottom: isActive('/admin') ? '2px solid #1F6E5E' : '2px solid transparent',
                paddingBottom: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 5
              }}
            >
              <LayoutDashboard size={14} /> Administration
            </Link>
          )}
        </nav>

        {/* Right Authentication Cluster */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Avatar name={user.name} size={36} />
              <div style={{ display: 'none', md: 'block' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1B1F1C', lineHeight: 1.1 }}>
                  {user.name}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#8D8577', textTransform: 'capitalize' }}>
                  {user.role}
                </div>
              </div>
              <button
                onClick={handleLogout}
                title="Sign out"
                style={{
                  background: 'transparent',
                  border: '1px solid #CFC6B2',
                  borderRadius: 8,
                  padding: '6px 10px',
                  cursor: 'pointer',
                  color: '#1B1F1C',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  fontSize: '0.8rem',
                  fontWeight: 600
                }}
              >
                <LogOut size={14} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => navigate('/auth', { state: { mode: 'login' } })}
                style={{
                  background: 'transparent',
                  border: '1.5px solid #1B1F1C',
                  borderRadius: 999,
                  padding: '7px 18px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  color: '#1B1F1C'
                }}
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/auth', { state: { mode: 'register' } })}
                style={{
                  background: '#1F6E5E',
                  border: 0,
                  borderRadius: 999,
                  padding: '7px 18px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  color: '#FBFAF6',
                  boxShadow: '2px 2px 0 #1B1F1C'
                }}
              >
                Register
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
