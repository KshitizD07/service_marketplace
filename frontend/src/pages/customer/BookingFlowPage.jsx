/**
 * @file BookingFlowPage.jsx
 * @description Multi-step interactive booking checkout.
 * Allows customers to select service package, available date, time slot,
 * physical address, and special instructions before placing a reservation.
 */

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Calendar, MapPin, FileText, CheckCircle2, ShieldAlert } from 'lucide-react';
import * as providerService from '../../services/providerService';
import * as bookingService from '../../services/bookingService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import SectionHeading from '../../components/common/SectionHeading';

export default function BookingFlowPage() {
  const { providerId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, isCustomer } = useAuth();
  const { addToast } = useToast();

  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Booking Form State
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null); // { date: "YYYY-MM-DD", label: "Mon, 28 Sep", dayName: "Monday" }
  const [selectedTime, setSelectedTime] = useState(null); // e.g. "09:00 AM"
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  // Fetch provider and pre-select service if requested in query params
  useEffect(() => {
    providerService.getProviderById(providerId)
      .then((res) => {
        if (res.success && res.data) {
          setProvider(res.data);
          const preselectedServiceId = searchParams.get('serviceId');
          if (preselectedServiceId && res.data.services) {
            const found = res.data.services.find(s => String(s.id) === String(preselectedServiceId));
            if (found) setSelectedService(found);
            else if (res.data.services.length > 0) setSelectedService(res.data.services[0]);
          } else if (res.data.services && res.data.services.length > 0) {
            setSelectedService(res.data.services[0]);
          }
        }
      })
      .catch((err) => addToast("Failed to load booking details.", "error"))
      .finally(() => setLoading(false));
  }, [providerId, searchParams, addToast]);

  // Compute next 14 available calendar dates based on provider working days
  const availableDays = React.useMemo(() => {
    if (!provider || !provider.availability) return [];

    const days = [];
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const now = new Date();

    for (let i = 1; i <= 14; i++) {
      const target = new Date(now);
      target.setDate(now.getDate() + i);
      const dayName = dayNames[target.getDay()];

      const slots = provider.availability[dayName];
      if (Array.isArray(slots) && slots.length > 0) {
        days.push({
          date: target.toISOString().split('T')[0],
          label: target.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }),
          dayName
        });
      }
    }

    return days;
  }, [provider]);

  // Get available time slots for the selected date
  const timeSlots = React.useMemo(() => {
    if (!selectedDate || !provider?.availability) return [];
    return provider.availability[selectedDate.dayName] || [];
  }, [selectedDate, provider]);

  const handleConfirmBooking = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      addToast("Please sign in to confirm your appointment.", "info");
      navigate('/auth', { state: { mode: 'login' } });
      return;
    }

    if (!isCustomer) {
      addToast("Only customer accounts can place booking reservations.", "error");
      return;
    }

    if (!selectedService || !selectedDate || !selectedTime) {
      addToast("Please select a service package, date, and time slot.", "error");
      return;
    }

    if (!address.trim()) {
      addToast("Please enter the service location address.", "error");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        providerId: parseInt(providerId, 10),
        serviceId: selectedService.id,
        bookingDate: selectedDate.date,
        startTime: selectedTime,
        address: address.trim(),
        notes: notes.trim() || null
      };

      const res = await bookingService.createBooking(payload);
      addToast("Booking placed successfully! You can track status in your dashboard.", "success");
      navigate('/bookings');
    } catch (err) {
      addToast(err.message || "Could not complete booking. Please choose another time slot.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{ maxWidth: 800, margin: '4rem auto', textAlign: 'center', color: '#8D8577' }}>Preparing checkout...</div>;
  }

  if (!provider) {
    return <div style={{ maxWidth: 600, margin: '4rem auto', textAlign: 'center' }}>Provider not found.</div>;
  }

  const displayName = provider.business_name || provider.provider_name || 'Provider';

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '2.5rem 1.5rem 5rem' }}>
      <button
        onClick={() => navigate(`/provider/${provider.id}`)}
        style={{
          background: 'transparent',
          border: 0,
          color: '#8D8577',
          fontWeight: 600,
          fontSize: '0.88rem',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          marginBottom: '1.2rem',
          padding: 0
        }}
      >
        <ArrowLeft size={16} /> Back to profile
      </button>

      <SectionHeading
        eyebrow={`BOOKING WITH ${displayName.toUpperCase()}`}
        title="Choose a Service, Date & Time"
        sub="Reserve an appointment directly on the specialist's calendar."
      />

      <form onSubmit={handleConfirmBooking} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Step 1: Select Service Package */}
        <div style={{ background: '#FFFFFF', border: '1.5px solid #E1DACB', borderRadius: 16, padding: '1.8rem' }}>
          <div style={{ fontWeight: 800, fontSize: '1rem', color: '#1B1F1C', marginBottom: 12 }}>
            1. Select a Service Package
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 10 }}>
            {provider.services?.map((s) => {
              const isSelected = selectedService?.id === s.id;

              return (
                <div
                  key={s.id}
                  onClick={() => setSelectedService(s)}
                  style={{
                    border: `1.5px solid ${isSelected ? '#1F6E5E' : '#E1DACB'}`,
                    background: isSelected ? '#E4EEE9' : '#FFFFFF',
                    borderRadius: 12,
                    padding: '1.1rem',
                    cursor: 'pointer',
                    transition: 'all 0.1s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: isSelected ? '#154E43' : '#1B1F1C' }}>
                      {s.name}
                    </span>
                    <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#1B1F1C' }}>
                      ₹{s.price}
                    </span>
                  </div>
                  {s.description && (
                    <p style={{ fontSize: '0.8rem', color: '#8D8577', margin: '6px 0 0', lineHeight: 1.4 }}>
                      {s.description}
                    </p>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: '#1F6E5E', marginTop: 8, fontWeight: 600 }}>
                    <Clock size={12} /> {s.duration} minutes
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 2: Select Date */}
        <div style={{ background: '#FFFFFF', border: '1.5px solid #E1DACB', borderRadius: 16, padding: '1.8rem' }}>
          <div style={{ fontWeight: 800, fontSize: '1rem', color: '#1B1F1C', marginBottom: 6 }}>
            2. Choose an Available Date
          </div>
          <p style={{ color: '#8D8577', fontSize: '0.84rem', margin: '0 0 14px' }}>
            Showing dates for the next 2 weeks matching provider operating hours.
          </p>

          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 6 }}>
            {availableDays.map((d) => {
              const isSelected = selectedDate?.date === d.date;

              return (
                <button
                  type="button"
                  key={d.date}
                  onClick={() => { setSelectedDate(d); setSelectedTime(null); }}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 12,
                    border: `1.5px solid ${isSelected ? '#1F6E5E' : '#CFC6B2'}`,
                    background: isSelected ? '#1F6E5E' : '#FFFFFF',
                    color: isSelected ? '#FBFAF6' : '#1B1F1C',
                    cursor: 'pointer',
                    textAlign: 'center',
                    flexShrink: 0
                  }}
                >
                  <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', opacity: 0.8, fontWeight: 700 }}>
                    {d.dayName.slice(0, 3)}
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, marginTop: 2 }}>
                    {d.label.split(' ')[1]} {d.label.split(' ')[2]}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 3: Select Time Slot */}
        {selectedDate && (
          <div style={{ background: '#FFFFFF', border: '1.5px solid #E1DACB', borderRadius: 16, padding: '1.8rem' }}>
            <div style={{ fontWeight: 800, fontSize: '1rem', color: '#1B1F1C', marginBottom: 12 }}>
              3. Select an Open Time Slot for {selectedDate.label}
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {timeSlots.map((slot) => {
                const isSelected = selectedTime === slot;

                return (
                  <button
                    type="button"
                    key={slot}
                    onClick={() => setSelectedTime(slot)}
                    style={{
                      padding: '9px 18px',
                      borderRadius: 10,
                      border: `1.5px solid ${isSelected ? '#1F6E5E' : '#CFC6B2'}`,
                      background: isSelected ? '#1F6E5E' : '#FFFFFF',
                      color: isSelected ? '#FBFAF6' : '#1B1F1C',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    <Clock size={14} /> {slot}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 4: Service Address & Instructions (Resolving Bug #9) */}
        <div style={{ background: '#FFFFFF', border: '1.5px solid #E1DACB', borderRadius: 16, padding: '1.8rem' }}>
          <div style={{ fontWeight: 800, fontSize: '1rem', color: '#1B1F1C', marginBottom: 14 }}>
            4. Service Location & Instructions
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#1B1F1C', marginBottom: 6 }}>
                Service Physical Address *
              </label>
              <div style={{ position: 'relative' }}>
                <MapPin size={16} color="#8D8577" style={{ position: 'absolute', left: 12, top: 12 }} />
                <input
                  type="text"
                  required
                  placeholder="e.g. Flat 402, Sunshine Heights, Andheri West, Mumbai"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
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

            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#1B1F1C', marginBottom: 6 }}>
                Special Notes / Instructions (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Please call before arrival. Doorbell is not working."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: '1.5px solid #CFC6B2',
                  fontSize: '0.9rem',
                  outline: 'none',
                  resize: 'vertical'
                }}
              />
            </div>
          </div>
        </div>

        {/* Step 5: Summary & Confirmation */}
        <div
          style={{
            background: '#F5F2EA',
            border: '1.5px solid #1B1F1C',
            borderRadius: 16,
            padding: '1.8rem',
            boxShadow: '4px 4px 0 #1B1F1C'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#8D8577', textTransform: 'uppercase' }}>
                Total Service Amount
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1B1F1C' }}>
                ₹{selectedService ? selectedService.price : 0}
              </div>
              {selectedService && selectedDate && selectedTime && (
                <div style={{ fontSize: '0.82rem', color: '#1F6E5E', fontWeight: 600, marginTop: 2 }}>
                  {selectedService.name} on {selectedDate.label} at {selectedTime}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting || !selectedService || !selectedDate || !selectedTime || !address.trim()}
              style={{
                background: '#1F6E5E',
                color: '#FBFAF6',
                border: 0,
                borderRadius: 999,
                padding: '12px 32px',
                fontWeight: 700,
                fontSize: '1rem',
                cursor: (submitting || !selectedService || !selectedDate || !selectedTime || !address.trim()) ? 'not-allowed' : 'pointer',
                opacity: (submitting || !selectedService || !selectedDate || !selectedTime || !address.trim()) ? 0.6 : 1,
                boxShadow: '2px 2px 0 #1B1F1C'
              }}
            >
              {submitting ? 'Placing Reservation...' : 'Confirm Appointment'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
