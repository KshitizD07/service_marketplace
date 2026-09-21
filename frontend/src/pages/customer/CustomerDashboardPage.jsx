/**
 * @file CustomerDashboardPage.jsx
 * @description Customer bookings dashboard.
 * Displays booking history, visual progress stepper, server-side cancellation,
 * and verified review composer for completed appointments.
 */

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, MessageSquare, X, CheckCircle2, AlertCircle } from 'lucide-react';
import * as bookingService from '../../services/bookingService';
import * as reviewService from '../../services/reviewService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Avatar from '../../components/common/Avatar';
import StatusPill from '../../components/common/StatusPill';
import StarRating from '../../components/common/StarRating';
import SectionHeading from '../../components/common/SectionHeading';

const STATUS_FLOW = ["Requested", "Confirmed", "In Progress", "Completed"];

export default function CustomerDashboardPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review Drawer / Modal State
  const [reviewBooking, setReviewBooking] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Load customer bookings on mount
  const loadBookings = () => {
    setLoading(true);
    bookingService.getBookings()
      .then((res) => {
        if (res.success && res.data) {
          // Robust user ID matching (Resolving Bug #1 & Bug #2)
          const myBookings = res.data.filter(
            b => b.customerId === user?.id || b.customer_id === user?.id
          );
          setBookings(myBookings);
        }
      })
      .catch((err) => addToast("Failed to load your bookings.", "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadBookings();
  }, [user]);

  // Handle server-side cancellation (Resolving Bug #8)
  const handleCancelBooking = async (bookingId) => {
    const confirmCancel = window.confirm("Are you sure you want to cancel this booking request?");
    if (!confirmCancel) return;

    try {
      await bookingService.cancelBooking(bookingId);
      addToast("Booking request cancelled successfully.", "success");
      loadBookings();
    } catch (err) {
      addToast(err.message || "Failed to cancel booking.", "error");
    }
  };

  // Submit verified review
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewBooking) return;

    setSubmittingReview(true);
    try {
      await reviewService.submitReview({
        bookingId: reviewBooking.id,
        rating,
        comment: comment.trim()
      });
      addToast("Thank you! Your verified review has been published.", "success");
      setReviewBooking(null);
      setComment('');
      setRating(5);
      loadBookings();
    } catch (err) {
      addToast(err.message || "Failed to submit review.", "error");
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '2.5rem 1.5rem 5rem' }}>
      <SectionHeading
        eyebrow="YOUR ACCOUNT"
        title="My Appointments & Bookings"
        sub="Track your upcoming service visits, cancel requests, and leave verified reviews."
      />

      {loading && (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: '#8D8577' }}>
          Loading your appointments...
        </div>
      )}

      {/* Bookings List */}
      {!loading && bookings.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {bookings.map((b) => {
            const isCancelled = b.status === 'Cancelled';
            const isCompleted = b.status === 'Completed';
            const isRequested = b.status === 'Requested';

            return (
              <div
                key={b.id}
                style={{
                  background: '#FFFFFF',
                  border: '1.5px solid #E1DACB',
                  borderRadius: 16,
                  padding: '1.6rem',
                  boxShadow: '2px 2px 0 #E1DACB'
                }}
              >
                {/* Header Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                  <div style={{ display: 'flex', gap: 14 }}>
                    <Avatar name={b.provider_name} size={48} />
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#1B1F1C' }}>
                        {b.service_name}
                      </h3>
                      <div style={{ fontSize: '0.86rem', color: '#8D8577', marginTop: 2 }}>
                        with <b>{b.provider_name}</b>
                      </div>
                      <div style={{ display: 'flex', gap: 14, fontSize: '0.8rem', color: '#8D8577', marginTop: 6, flexWrap: 'wrap' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Calendar size={13} /> {b.booking_date}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Clock size={13} /> {b.start_time}
                        </span>
                        {b.address && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <MapPin size={13} /> {b.address}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <StatusPill status={b.status} />
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1B1F1C', marginTop: 6 }}>
                      ₹{b.price}
                    </div>
                  </div>
                </div>

                {/* Progress Stepper Bar (if not cancelled) */}
                {!isCancelled && (
                  <div style={{ marginTop: '1.5rem', paddingTop: '1.2rem', borderTop: '1px solid #F5F2EA' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {STATUS_FLOW.map((s, i) => {
                        const currentIndex = STATUS_FLOW.indexOf(b.status);
                        const isReached = currentIndex >= i;

                        return (
                          <div key={s} style={{ flex: 1, textAlign: 'center' }}>
                            <div
                              style={{
                                height: 5,
                                borderRadius: 3,
                                background: isReached ? '#1F6E5E' : '#E1DACB',
                                marginBottom: 6
                              }}
                            />
                            <span
                              style={{
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                color: isReached ? '#154E43' : '#8D8577',
                                textTransform: 'uppercase'
                              }}
                            >
                              {s}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: 10, marginTop: '1.2rem' }}>
                  {isRequested && (
                    <button
                      onClick={() => handleCancelBooking(b.id)}
                      style={{
                        background: '#FFFFFF',
                        border: '1.5px solid #A6432B',
                        color: '#A6432B',
                        borderRadius: 8,
                        padding: '6px 14px',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Cancel Request
                    </button>
                  )}

                  {isCompleted && (
                    <button
                      onClick={() => setReviewBooking(b)}
                      style={{
                        background: '#C1622F',
                        color: '#FBFAF6',
                        border: 0,
                        borderRadius: 8,
                        padding: '7px 16px',
                        fontSize: '0.84rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6
                      }}
                    >
                      <MessageSquare size={14} /> Leave a Verified Review
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!loading && bookings.length === 0 && (
        <div
          style={{
            background: '#FFFFFF',
            border: '1.5px solid #E1DACB',
            borderRadius: 16,
            padding: '3.5rem 1.5rem',
            textAlign: 'center'
          }}
        >
          <Calendar size={38} color="#8D8577" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ margin: '0 0 6px', color: '#1B1F1C' }}>No appointments yet</h3>
          <p style={{ color: '#8D8577', fontSize: '0.9rem', maxWidth: 420, margin: '0 auto 1.5rem' }}>
            You haven't placed any bookings yet. Explore our directory of vetted specialists to get started.
          </p>
        </div>
      )}

      {/* Review Composer Modal Drawer */}
      {reviewBooking && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(18, 24, 27, 0.65)',
            zIndex: 1000,
            display: 'grid',
            placeItems: 'center',
            padding: 16
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 18,
              border: '1.5px solid #1B1F1C',
              padding: '2rem',
              maxWidth: 480,
              width: '100%',
              boxShadow: '6px 6px 0 #1B1F1C'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.2rem' }}>
              <div>
                <h3 style={{ margin: 0, fontFamily: 'Fraunces, serif', fontSize: '1.4rem', color: '#1B1F1C' }}>
                  Review Your Experience
                </h3>
                <p style={{ color: '#8D8577', fontSize: '0.84rem', margin: '4px 0 0' }}>
                  {reviewBooking.service_name} with {reviewBooking.provider_name}
                </p>
              </div>
              <button
                onClick={() => setReviewBooking(null)}
                style={{ background: 'transparent', border: 0, cursor: 'pointer', color: '#8D8577' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitReview}>
              <div style={{ marginBottom: '1.2rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#1B1F1C', marginBottom: 8 }}>
                  Your Rating
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <StarRating rating={rating} size={26} showNumber={false} onChange={(r) => setRating(r)} />
                  <span style={{ fontWeight: 800, fontSize: '1.1rem', marginLeft: 8 }}>{rating} / 5</span>
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#1B1F1C', marginBottom: 6 }}>
                  Feedback & Comments
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="How was the service? Did the professional arrive on time?"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
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

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setReviewBooking(null)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: 999,
                    border: '1.5px solid #1B1F1C',
                    background: 'transparent',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  style={{
                    padding: '10px 22px',
                    borderRadius: 999,
                    border: 0,
                    background: '#1F6E5E',
                    color: '#FBFAF6',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: submittingReview ? 'not-allowed' : 'pointer',
                    boxShadow: '2px 2px 0 #1B1F1C'
                  }}
                >
                  {submittingReview ? 'Submitting...' : 'Post Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
