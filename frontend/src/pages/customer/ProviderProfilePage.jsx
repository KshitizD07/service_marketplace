/**
 * @file ProviderProfilePage.jsx
 * @description Detailed profile page for a service provider.
 * Displays business biography, service package list, operating shifts,
 * and REAL customer reviews fetched dynamically from the database.
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, Calendar, ShieldCheck, CheckCircle2, MessageSquare, Star } from 'lucide-react';
import * as providerService from '../../services/providerService';
import Avatar from '../../components/common/Avatar';
import StarRating from '../../components/common/StarRating';

export default function ProviderProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    providerService.getProviderById(id)
      .then((res) => {
        if (res.success && res.data) {
          setProvider(res.data);
        } else {
          setError("Provider profile could not be loaded.");
        }
      })
      .catch((err) => setError(err.message || "Failed to load provider profile."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div style={{ maxWidth: 1100, margin: '4rem auto', textAlign: 'center', color: '#8D8577' }}>
        Loading provider profile...
      </div>
    );
  }

  if (error || !provider) {
    return (
      <div style={{ maxWidth: 600, margin: '4rem auto', textAlign: 'center', padding: '2rem' }}>
        <h2>Provider Not Found</h2>
        <p style={{ color: '#8D8577' }}>{error || "The requested service professional does not exist."}</p>
        <button
          onClick={() => navigate('/')}
          style={{
            background: '#1F6E5E',
            color: '#FBFAF6',
            border: 0,
            borderRadius: 999,
            padding: '10px 24px',
            fontWeight: 700,
            cursor: 'pointer',
            marginTop: 14
          }}
        >
          Back to Marketplace
        </button>
      </div>
    );
  }

  const displayName = provider.business_name || provider.provider_name || 'Provider';

  return (
    <div style={{ maxWidth: 1140, margin: '0 auto', padding: '2.5rem 1.5rem 5rem' }}>
      {/* Back button */}
      <button
        onClick={() => navigate('/')}
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
          marginBottom: '1.5rem',
          padding: 0
        }}
      >
        <ArrowLeft size={16} /> Back to marketplace
      </button>

      {/* Two-Column Grid Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '2.2rem', alignItems: 'start' }}>
        {/* Left Column: Details, Services, Reviews */}
        <div>
          {/* Header Card */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1.5px solid #E1DACB',
              borderRadius: 18,
              padding: '2rem',
              boxShadow: '2px 2px 0 #E1DACB',
              marginBottom: '1.8rem'
            }}
          >
            <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start' }}>
              <Avatar name={displayName} size={64} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: '1.8rem', fontWeight: 600, color: '#1B1F1C', margin: 0 }}>
                    {displayName}
                  </h1>
                  <ShieldCheck size={20} color="#1F6E5E" title="Verified Specialist" />
                </div>
                <div style={{ fontSize: '0.9rem', color: '#1F6E5E', fontWeight: 700, marginTop: 4 }}>
                  {provider.category_name}
                </div>
                {provider.location && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.82rem', color: '#8D8577', marginTop: 4 }}>
                    <MapPin size={13} /> {provider.location} · {provider.experience} years experience
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
                  <StarRating rating={provider.rating} size={15} />
                  <span style={{ fontSize: '0.85rem', color: '#8D8577' }}>
                    ({provider.total_reviews} verified reviews)
                  </span>
                </div>
              </div>
            </div>

            {/* About section */}
            <div style={{ marginTop: '1.5rem', paddingTop: '1.2rem', borderTop: '1px solid #E1DACB' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 8px', color: '#1B1F1C' }}>
                About the Specialist
              </h3>
              <p style={{ color: '#8D8577', fontSize: '0.92rem', lineHeight: 1.6, margin: 0 }}>
                {provider.description || "Dedicated professional with extensive experience offering reliable home and commercial services."}
              </p>
            </div>
          </div>

          {/* Bookable Services Offered */}
          <div style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: '1.4rem', fontWeight: 600, color: '#1B1F1C', marginBottom: '1rem' }}>
              Services Offered ({provider.services?.length || 0})
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {provider.services?.map((s) => (
                <div
                  key={s.id}
                  style={{
                    background: '#FFFFFF',
                    border: '1.5px solid #E1DACB',
                    borderRadius: 14,
                    padding: '1.3rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 16
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '1.02rem', color: '#1B1F1C' }}>
                      {s.name}
                    </div>
                    {s.description && (
                      <div style={{ fontSize: '0.84rem', color: '#8D8577', marginTop: 4, lineHeight: 1.4 }}>
                        {s.description}
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: '#1F6E5E', fontWeight: 600, marginTop: 6 }}>
                      <Clock size={13} /> {s.duration} minutes
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1B1F1C', marginBottom: 6 }}>
                      ₹{s.price}
                    </div>
                    <button
                      onClick={() => navigate(`/book/${provider.id}?serviceId=${s.id}`)}
                      style={{
                        background: '#1F6E5E',
                        color: '#FBFAF6',
                        border: 0,
                        borderRadius: 999,
                        padding: '8px 18px',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        cursor: 'pointer'
                      }}
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* REAL Customer Reviews Section (Resolves Bug #6) */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
              <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: '1.4rem', fontWeight: 600, color: '#1B1F1C', margin: 0 }}>
                Customer Reviews
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Star size={16} fill="#B8912B" color="#B8912B" />
                <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>{Number(provider.rating || 0).toFixed(1)}</span>
                <span style={{ color: '#8D8577', fontSize: '0.85rem' }}>({provider.reviews?.length || 0} reviews)</span>
              </div>
            </div>

            {provider.reviews && provider.reviews.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {provider.reviews.map((rev) => (
                  <div
                    key={rev.id}
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #E1DACB',
                      borderRadius: 14,
                      padding: '1.2rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Avatar name={rev.customer_name} size={32} />
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1B1F1C' }}>
                            {rev.customer_name}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: '#8D8577' }}>
                            {new Date(rev.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </div>
                        </div>
                      </div>
                      <StarRating rating={rev.rating} size={13} showNumber={false} />
                    </div>
                    {rev.comment && (
                      <p style={{ margin: '6px 0 0', fontSize: '0.88rem', color: '#1B1F1C', lineHeight: 1.5 }}>
                        "{rev.comment}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div
                style={{
                  background: '#F5F2EA',
                  border: '1px dashed #CFC6B2',
                  borderRadius: 14,
                  padding: '2rem',
                  textAlign: 'center',
                  color: '#8D8577',
                  fontSize: '0.9rem'
                }}
              >
                <MessageSquare size={24} style={{ margin: '0 auto 8px' }} />
                No customer reviews yet. Be the first to book and leave feedback!
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Sticky Quick Booking Card & Operating Hours */}
        <div style={{ position: 'sticky', top: 90 }}>
          {/* Quick Booking Summary Card */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1.5px solid #1B1F1C',
              borderRadius: 18,
              padding: '1.8rem',
              boxShadow: '4px 4px 0 #1B1F1C',
              marginBottom: '1.5rem'
            }}
          >
            <div style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: '#8D8577', letterSpacing: '0.05em' }}>
              STARTING AT
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1B1F1C', margin: '4px 0 12px' }}>
              ₹{provider.hourly_rate} <span style={{ fontSize: '0.9rem', fontWeight: 500, color: '#8D8577' }}>/ hour</span>
            </div>

            <p style={{ fontSize: '0.84rem', color: '#8D8577', lineHeight: 1.5, marginBottom: '1.4rem' }}>
              Select a service package from this provider's catalog and pick an open slot directly from their calendar.
            </p>

            <button
              onClick={() => {
                const firstServiceId = provider.services?.[0]?.id;
                navigate(`/book/${provider.id}${firstServiceId ? `?serviceId=${firstServiceId}` : ''}`);
              }}
              style={{
                width: '100%',
                background: '#1F6E5E',
                color: '#FBFAF6',
                border: 0,
                borderRadius: 999,
                padding: '12px 0',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer',
                boxShadow: '2px 2px 0 #1B1F1C'
              }}
            >
              Book an Appointment
            </button>
          </div>

          {/* Operating Schedule Card */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E1DACB',
              borderRadius: 16,
              padding: '1.5rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem' }}>
              <Calendar size={16} color="#1F6E5E" />
              <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#1B1F1C' }}>
                Weekly Operating Schedule
              </h4>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.82rem' }}>
              {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => {
                const slots = provider.availability?.[day];
                const isOpen = Array.isArray(slots) && slots.length > 0;

                return (
                  <div key={day} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', borderBottom: '1px solid #F5F2EA' }}>
                    <span style={{ fontWeight: 600, color: isOpen ? '#1B1F1C' : '#8D8577' }}>{day}</span>
                    <span style={{ color: isOpen ? '#1F6E5E' : '#A6432B', fontWeight: 600 }}>
                      {isOpen ? `${slots[0]} - ${slots[slots.length - 1]}` : 'Closed'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
