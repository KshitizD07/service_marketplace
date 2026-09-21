/**
 * @file ProviderDashboardPage.jsx
 * @description Provider business workspace.
 * Manages incoming customer requests, updates service status, configures operating availability,
 * and manages offered service packages.
 */

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, DollarSign, Star, Briefcase, Plus, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import * as bookingService from '../../services/bookingService';
import * as providerService from '../../services/providerService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Avatar from '../../components/common/Avatar';
import StatusPill from '../../components/common/StatusPill';
import SectionHeading from '../../components/common/SectionHeading';

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function ProviderDashboardPage() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('requests');
  const [providerProfile, setProviderProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Availability Schedule State (Monday - Sunday)
  const [scheduleState, setScheduleState] = useState(
    DAYS_OF_WEEK.map(day => ({
      dayOfWeek: day,
      enabled: day !== "Sunday",
      startTime: "09:00",
      endTime: "17:00"
    }))
  );

  // New Service Form State
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');
  const [newServiceDuration, setNewServiceDuration] = useState('60');
  const [newServiceDesc, setNewServiceDesc] = useState('');
  const [savingService, setSavingService] = useState(false);

  // Load provider profile and assigned bookings
  const loadWorkspaceData = async () => {
    setLoading(true);
    try {
      // 1. Load bookings
      const bookingsRes = await bookingService.getBookings();
      if (bookingsRes.success) {
        setBookings(bookingsRes.data || []);
      }

      // 2. Fetch provider profile details
      if (user?.providerId) {
        const provRes = await providerService.getProviderById(user.providerId);
        if (provRes.success && provRes.data) {
          setProviderProfile(provRes.data);

          // Populate schedule state from provider availability
          if (provRes.data.availability) {
            setScheduleState(DAYS_OF_WEEK.map(day => {
              const slots = provRes.data.availability[day];
              const isEnabled = Array.isArray(slots) && slots.length > 0;
              return {
                dayOfWeek: day,
                enabled: isEnabled,
                startTime: isEnabled ? "09:00" : "09:00",
                endTime: isEnabled ? "17:00" : "17:00"
              };
            }));
          }
        }
      }
    } catch (err) {
      addToast("Failed to load provider workspace data.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkspaceData();
  }, [user]);

  // Handle status progression
  const handleUpdateStatus = async (bookingId, targetStatus) => {
    try {
      await bookingService.updateBookingStatus(bookingId, targetStatus);
      addToast(`Booking status updated to ${targetStatus}.`, "success");
      loadWorkspaceData();
    } catch (err) {
      addToast(err.message || "Failed to update booking status.", "error");
    }
  };

  // Handle availability save
  const handleSaveAvailability = async (e) => {
    e.preventDefault();
    try {
      const activeShifts = scheduleState
        .filter(s => s.enabled)
        .map(s => ({
          dayOfWeek: s.dayOfWeek,
          startTime: s.startTime,
          endTime: s.endTime
        }));

      await providerService.updateAvailability(activeShifts);
      addToast("Operating availability saved successfully.", "success");
      loadWorkspaceData();
    } catch (err) {
      addToast(err.message || "Failed to save availability schedule.", "error");
    }
  };

  // Handle add service package
  const handleAddService = async (e) => {
    e.preventDefault();
    if (!newServiceName.trim() || !newServicePrice) {
      addToast("Service name and price are required.", "error");
      return;
    }

    setSavingService(true);
    try {
      await providerService.addService({
        name: newServiceName.trim(),
        price: parseFloat(newServicePrice),
        duration: parseInt(newServiceDuration, 10) || 60,
        description: newServiceDesc.trim()
      });
      addToast("Service package created successfully.", "success");
      setNewServiceName('');
      setNewServicePrice('');
      setNewServiceDesc('');
      loadWorkspaceData();
    } catch (err) {
      addToast(err.message || "Failed to create service.", "error");
    } finally {
      setSavingService(false);
    }
  };

  // Handle delete service package
  const handleDeleteService = async (serviceId) => {
    if (!window.confirm("Are you sure you want to remove this service package?")) return;

    try {
      await providerService.deleteService(serviceId);
      addToast("Service package removed.", "success");
      loadWorkspaceData();
    } catch (err) {
      addToast(err.message || "Failed to delete service.", "error");
    }
  };

  // Compute metrics
  const totalEarnings = bookings
    .filter(b => b.status === 'Completed')
    .reduce((sum, b) => sum + (parseFloat(b.price) || 0), 0);

  const pendingRequestsCount = bookings.filter(b => b.status === 'Requested').length;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2.5rem 1.5rem 5rem' }}>
      <SectionHeading
        eyebrow="PROVIDER WORKSPACE"
        title={providerProfile?.business_name || `${user?.name}'s Dashboard`}
        sub="Manage customer appointments, update your weekly shifts, and manage service packages."
      />

      {/* KPI Summary Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.2rem',
          marginBottom: '2.2rem'
        }}
      >
        <div style={{ background: '#FFFFFF', border: '1.5px solid #E1DACB', borderRadius: 16, padding: '1.4rem' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#8D8577', textTransform: 'uppercase' }}>
            New Requests
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1B1F1C', marginTop: 4 }}>
            {pendingRequestsCount}
          </div>
        </div>

        <div style={{ background: '#FFFFFF', border: '1.5px solid #E1DACB', borderRadius: 16, padding: '1.4rem' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#8D8577', textTransform: 'uppercase' }}>
            Completed Earnings
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1F6E5E', marginTop: 4 }}>
            ₹{totalEarnings.toLocaleString()}
          </div>
        </div>

        <div style={{ background: '#FFFFFF', border: '1.5px solid #E1DACB', borderRadius: 16, padding: '1.4rem' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#8D8577', textTransform: 'uppercase' }}>
            Overall Rating
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1B1F1C', marginTop: 4 }}>
            ⭐ {Number(providerProfile?.rating || 5.0).toFixed(1)}
          </div>
        </div>

        <div style={{ background: '#FFFFFF', border: '1.5px solid #E1DACB', borderRadius: 16, padding: '1.4rem' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#8D8577', textTransform: 'uppercase' }}>
            Total Bookings
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1B1F1C', marginTop: 4 }}>
            {bookings.length}
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div
        style={{
          display: 'flex',
          gap: 12,
          borderBottom: '1.5px solid #E1DACB',
          marginBottom: '2rem'
        }}
      >
        <button
          onClick={() => setActiveTab('requests')}
          style={{
            background: 'transparent',
            border: 0,
            padding: '10px 18px',
            fontWeight: 700,
            fontSize: '0.92rem',
            color: activeTab === 'requests' ? '#1F6E5E' : '#8D8577',
            borderBottom: activeTab === 'requests' ? '3px solid #1F6E5E' : '3px solid transparent',
            cursor: 'pointer'
          }}
        >
          Customer Requests ({bookings.length})
        </button>
        <button
          onClick={() => setActiveTab('availability')}
          style={{
            background: 'transparent',
            border: 0,
            padding: '10px 18px',
            fontWeight: 700,
            fontSize: '0.92rem',
            color: activeTab === 'availability' ? '#1F6E5E' : '#8D8577',
            borderBottom: activeTab === 'availability' ? '3px solid #1F6E5E' : '3px solid transparent',
            cursor: 'pointer'
          }}
        >
          Weekly Availability
        </button>
        <button
          onClick={() => setActiveTab('services')}
          style={{
            background: 'transparent',
            border: 0,
            padding: '10px 18px',
            fontWeight: 700,
            fontSize: '0.92rem',
            color: activeTab === 'services' ? '#1F6E5E' : '#8D8577',
            borderBottom: activeTab === 'services' ? '3px solid #1F6E5E' : '3px solid transparent',
            cursor: 'pointer'
          }}
        >
          Service Packages ({providerProfile?.services?.length || 0})
        </button>
      </div>

      {/* TAB 1: Booking Requests & Status Progression */}
      {activeTab === 'requests' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {bookings.map((b) => (
            <div
              key={b.id}
              style={{
                background: '#FFFFFF',
                border: '1.5px solid #E1DACB',
                borderRadius: 16,
                padding: '1.4rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 16
              }}
            >
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <Avatar name={b.customer_name} size={44} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: '#1B1F1C' }}>
                    {b.customer_name}
                  </div>
                  <div style={{ fontSize: '0.84rem', color: '#1F6E5E', fontWeight: 600, marginTop: 2 }}>
                    {b.service_name} · ₹{b.price}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#8D8577', marginTop: 4 }}>
                    📅 {b.booking_date} at {b.start_time}
                  </div>
                  {b.address && (
                    <div style={{ fontSize: '0.78rem', color: '#8D8577', marginTop: 3 }}>
                      📍 {b.address}
                    </div>
                  )}
                  {b.notes && (
                    <div style={{ fontSize: '0.78rem', color: '#8D8577', fontStyle: 'italic', marginTop: 2 }}>
                      "{b.notes}"
                    </div>
                  )}
                </div>
              </div>

              {/* Status & Transitions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <StatusPill status={b.status} />

                {b.status === 'Requested' && (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      onClick={() => handleUpdateStatus(b.id, 'Confirmed')}
                      style={{
                        background: '#1F6E5E',
                        color: '#FBFAF6',
                        border: 0,
                        borderRadius: 8,
                        padding: '6px 14px',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(b.id, 'Cancelled')}
                      style={{
                        background: 'transparent',
                        border: '1.5px solid #A6432B',
                        color: '#A6432B',
                        borderRadius: 8,
                        padding: '6px 12px',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Decline
                    </button>
                  </div>
                )}

                {b.status === 'Confirmed' && (
                  <button
                    onClick={() => handleUpdateStatus(b.id, 'In Progress')}
                    style={{
                      background: '#C1622F',
                      color: '#FBFAF6',
                      border: 0,
                      borderRadius: 8,
                      padding: '7px 16px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Start Job
                  </button>
                )}

                {b.status === 'In Progress' && (
                  <button
                    onClick={() => handleUpdateStatus(b.id, 'Completed')}
                    style={{
                      background: '#1F6E5E',
                      color: '#FBFAF6',
                      border: 0,
                      borderRadius: 8,
                      padding: '7px 16px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Mark Completed
                  </button>
                )}
              </div>
            </div>
          ))}

          {bookings.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem', background: '#FFFFFF', borderRadius: 16, border: '1px solid #E1DACB', color: '#8D8577' }}>
              No booking requests received yet.
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Availability Schedule Manager (Resolves Bug #7) */}
      {activeTab === 'availability' && (
        <form onSubmit={handleSaveAvailability} style={{ background: '#FFFFFF', border: '1.5px solid #E1DACB', borderRadius: 16, padding: '2rem' }}>
          <h3 style={{ margin: '0 0 8px', fontSize: '1.15rem', color: '#1B1F1C' }}>
            Weekly Operating Schedule
          </h3>
          <p style={{ color: '#8D8577', fontSize: '0.88rem', margin: '0 0 1.8rem' }}>
            Configure days of the week and operating hours when you are available for bookings.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {scheduleState.map((shift, idx) => (
              <div
                key={shift.dayOfWeek}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: 12,
                  background: shift.enabled ? '#F5F2EA' : '#FAF8F5',
                  border: `1px solid ${shift.enabled ? '#E1DACB' : '#EFEAE1'}`
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: 140 }}>
                  <input
                    type="checkbox"
                    id={`day-${shift.dayOfWeek}`}
                    checked={shift.enabled}
                    onChange={(e) => {
                      const updated = [...scheduleState];
                      updated[idx].enabled = e.target.checked;
                      setScheduleState(updated);
                    }}
                    style={{ width: 18, height: 18, accentColor: '#1F6E5E', cursor: 'pointer' }}
                  />
                  <label htmlFor={`day-${shift.dayOfWeek}`} style={{ fontWeight: 700, fontSize: '0.9rem', color: shift.enabled ? '#1B1F1C' : '#8D8577', cursor: 'pointer' }}>
                    {shift.dayOfWeek}
                  </label>
                </div>

                {shift.enabled ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem' }}>
                    <input
                      type="time"
                      value={shift.startTime}
                      onChange={(e) => {
                        const updated = [...scheduleState];
                        updated[idx].startTime = e.target.value;
                        setScheduleState(updated);
                      }}
                      style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #CFC6B2' }}
                    />
                    <span>to</span>
                    <input
                      type="time"
                      value={shift.endTime}
                      onChange={(e) => {
                        const updated = [...scheduleState];
                        updated[idx].endTime = e.target.value;
                        setScheduleState(updated);
                      }}
                      style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #CFC6B2' }}
                    />
                  </div>
                ) : (
                  <span style={{ fontSize: '0.85rem', color: '#A6432B', fontWeight: 600 }}>Closed</span>
                )}
              </div>
            ))}
          </div>

          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              style={{
                background: '#1F6E5E',
                color: '#FBFAF6',
                border: 0,
                borderRadius: 999,
                padding: '11px 28px',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                boxShadow: '2px 2px 0 #1B1F1C'
              }}
            >
              Save Working Shifts
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: Service Package Management */}
      {activeTab === 'services' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '2rem', alignItems: 'start' }}>
          {/* Existing Packages List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h3 style={{ margin: '0 0 4px', fontSize: '1.1rem', color: '#1B1F1C' }}>
              Your Active Packages
            </h3>

            {providerProfile?.services?.map((s) => (
              <div
                key={s.id}
                style={{
                  background: '#FFFFFF',
                  border: '1.5px solid #E1DACB',
                  borderRadius: 14,
                  padding: '1.2rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1B1F1C' }}>
                    {s.name}
                  </div>
                  {s.description && (
                    <div style={{ fontSize: '0.8rem', color: '#8D8577', marginTop: 3 }}>
                      {s.description}
                    </div>
                  )}
                  <div style={{ fontSize: '0.78rem', color: '#1F6E5E', fontWeight: 600, marginTop: 4 }}>
                    ₹{s.price} · {s.duration} minutes
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteService(s.id)}
                  title="Delete Package"
                  style={{
                    background: 'transparent',
                    border: '1px solid #E1DACB',
                    borderRadius: 8,
                    padding: '6px 10px',
                    color: '#A6432B',
                    cursor: 'pointer'
                  }}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>

          {/* Add Package Form */}
          <form
            onSubmit={handleAddService}
            style={{
              background: '#FFFFFF',
              border: '1.5px solid #1B1F1C',
              borderRadius: 16,
              padding: '1.6rem',
              boxShadow: '3px 3px 0 #1B1F1C'
            }}
          >
            <h3 style={{ margin: '0 0 12px', fontSize: '1.1rem', color: '#1B1F1C' }}>
              Add New Package
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: 4 }}>
                  Package Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sofa Deep Clean"
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', borderRadius: 8, border: '1px solid #CFC6B2' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: 4 }}>
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="50"
                    placeholder="799"
                    value={newServicePrice}
                    onChange={(e) => setNewServicePrice(e.target.value)}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', borderRadius: 8, border: '1px solid #CFC6B2' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: 4 }}>
                    Duration (mins)
                  </label>
                  <input
                    type="number"
                    min="15"
                    step="15"
                    value={newServiceDuration}
                    onChange={(e) => setNewServiceDuration(e.target.value)}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', borderRadius: 8, border: '1px solid #CFC6B2' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: 4 }}>
                  Description (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="What is included in this package?"
                  value={newServiceDesc}
                  onChange={(e) => setNewServiceDesc(e.target.value)}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', borderRadius: 8, border: '1px solid #CFC6B2', resize: 'vertical' }}
                />
              </div>

              <button
                type="submit"
                disabled={savingService}
                style={{
                  marginTop: 6,
                  background: '#1F6E5E',
                  color: '#FBFAF6',
                  border: 0,
                  borderRadius: 999,
                  padding: '10px 0',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: savingService ? 'not-allowed' : 'pointer'
                }}
              >
                {savingService ? 'Adding...' : 'Create Package'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
