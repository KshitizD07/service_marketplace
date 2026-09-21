/**
 * @file BrowsePage.jsx
 * @description Public marketplace discovery catalog.
 * Features live category filter chips, search querying, and provider card grid.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Briefcase, Star, ArrowRight } from 'lucide-react';
import * as providerService from '../../services/providerService';
import Avatar from '../../components/common/Avatar';
import StarRating from '../../components/common/StarRating';
import SectionHeading from '../../components/common/SectionHeading';

export default function BrowsePage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);

  // Fetch categories and providers on mount
  useEffect(() => {
    Promise.all([
      providerService.getCategories(),
      providerService.getProviders()
    ])
      .then(([catRes, provRes]) => {
        if (catRes.success) setCategories(catRes.data || []);
        if (provRes.success) setProviders(provRes.data || []);
      })
      .catch((err) => console.error("Error loading marketplace:", err))
      .finally(() => setLoading(false));
  }, []);

  // Filter providers in memory based on query and active category
  const filteredProviders = useMemo(() => {
    return providers.filter((p) => {
      const pName = (p.provider_name || p.business_name || '').toLowerCase();
      const bName = (p.business_name || '').toLowerCase();
      const cName = (p.category_name || '').toLowerCase();
      const loc = (p.location || '').toLowerCase();
      const q = query.toLowerCase();

      const matchesSearch = !q || pName.includes(q) || bName.includes(q) || cName.includes(q) || loc.includes(q);
      const matchesCategory = !activeCategory || p.category_id === activeCategory;

      return matchesSearch && matchesCategory;
    });
  }, [providers, query, activeCategory]);

  return (
    <div>
      {/* Hero Banner */}
      <section
        style={{
          borderBottom: '1px solid #E1DACB',
          background: '#F5F2EA',
          padding: '4rem 1.5rem 3.5rem'
        }}
      >
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <div style={{ maxWidth: 680 }}>
            <div
              style={{
                fontSize: '0.82rem',
                fontWeight: 800,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#1F6E5E',
                marginBottom: 10
              }}
            >
              VETTED HOME & PROFESSIONAL SERVICES
            </div>
            <h1
              style={{
                fontFamily: 'Fraunces, serif',
                fontSize: 'clamp(2.2rem, 4vw, 3.2rem)',
                fontWeight: 600,
                color: '#1B1F1C',
                lineHeight: 1.15,
                margin: 0
              }}
            >
              Find trusted local professionals who show up on time.
            </h1>
            <p style={{ color: '#8D8577', fontSize: '1.05rem', margin: '1.2rem 0 2rem', lineHeight: 1.6 }}>
              Book vetted cleaners, licensed electricians, plumbers, and academic tutors. View verified ratings, choose an open slot on their calendar, and confirm instantly.
            </p>

            {/* Keyword Search Input */}
            <div
              style={{
                display: 'flex',
                gap: 10,
                background: '#FFFFFF',
                padding: 6,
                borderRadius: 999,
                border: '1.5px solid #1B1F1C',
                boxShadow: '3px 3px 0 #1B1F1C',
                maxWidth: 540
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', flex: 1, paddingLeft: 14, gap: 10 }}>
                <Search size={18} color="#8D8577" />
                <input
                  type="text"
                  placeholder="Try 'Electrician', 'Deep Clean', or 'Mumbai'..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  style={{
                    width: '100%',
                    border: 0,
                    outline: 'none',
                    fontSize: '0.92rem',
                    background: 'transparent'
                  }}
                />
              </div>
              <button
                type="button"
                style={{
                  background: '#1F6E5E',
                  color: '#FBFAF6',
                  border: 0,
                  borderRadius: 999,
                  padding: '10px 22px',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer'
                }}
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Catalog View */}
      <main style={{ maxWidth: 1180, margin: '0 auto', padding: '2.5rem 1.5rem 5rem' }}>
        {/* Category Filter Chips */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: '2.5rem', alignItems: 'center' }}>
          <button
            onClick={() => setActiveCategory(null)}
            style={{
              padding: '7px 18px',
              borderRadius: 999,
              border: `1.5px solid ${activeCategory === null ? '#1F6E5E' : '#CFC6B2'}`,
              background: activeCategory === null ? '#1F6E5E' : '#FFFFFF',
              color: activeCategory === null ? '#FBFAF6' : '#1B1F1C',
              fontWeight: 700,
              fontSize: '0.84rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            All Categories
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(activeCategory === c.id ? null : c.id)}
              style={{
                padding: '7px 18px',
                borderRadius: 999,
                border: `1.5px solid ${activeCategory === c.id ? '#1F6E5E' : '#CFC6B2'}`,
                background: activeCategory === c.id ? '#E4EEE9' : '#FFFFFF',
                color: activeCategory === c.id ? '#154E43' : '#1B1F1C',
                fontWeight: 700,
                fontSize: '0.84rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Section Title */}
        <SectionHeading
          eyebrow="Available Providers"
          title={activeCategory ? `${categories.find(c => c.id === activeCategory)?.name || 'Filtered'} Specialists` : "All Verified Service Providers"}
          sub={`${filteredProviders.length} verified professional(s) available for booking`}
        />

        {/* Loading State */}
        {loading && (
          <div style={{ padding: '3rem 0', textAlign: 'center', color: '#8D8577' }}>
            Loading available specialists...
          </div>
        )}

        {/* Providers Grid */}
        {!loading && filteredProviders.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '1.4rem'
            }}
          >
            {filteredProviders.map((p) => {
              const displayName = p.business_name || p.provider_name || 'Provider';

              return (
                <div
                  key={p.id}
                  style={{
                    background: '#FFFFFF',
                    border: '1.5px solid #E1DACB',
                    borderRadius: 16,
                    padding: '1.4rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '2px 2px 0 #E1DACB',
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                  }}
                >
                  <div>
                    {/* Header */}
                    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                      <Avatar name={displayName} size={50} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#1B1F1C', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {displayName}
                        </h3>
                        <div style={{ fontSize: '0.8rem', color: '#1F6E5E', fontWeight: 700, marginTop: 2 }}>
                          {p.category_name}
                        </div>
                        {p.location && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', color: '#8D8577', marginTop: 3 }}>
                            <MapPin size={12} /> {p.location}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <p style={{ fontSize: '0.85rem', color: '#8D8577', margin: '1rem 0', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {p.description || "Certified service professional offering quality repairs and care."}
                    </p>

                    {/* Stats */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: '#F5F2EA',
                        padding: '8px 12px',
                        borderRadius: 10,
                        fontSize: '0.82rem',
                        marginBottom: '1.2rem'
                      }}
                    >
                      <StarRating rating={p.rating} size={14} />
                      <span style={{ color: '#8D8577' }}>{p.total_reviews} review(s)</span>
                      <span style={{ fontWeight: 700, color: '#1B1F1C' }}>₹{p.hourly_rate}/hr</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => navigate(`/provider/${p.id}`)}
                    style={{
                      width: '100%',
                      background: '#1F6E5E',
                      color: '#FBFAF6',
                      border: 0,
                      borderRadius: 999,
                      padding: '10px 0',
                      fontWeight: 700,
                      fontSize: '0.88rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6
                    }}
                  >
                    View Profile & Services <ArrowRight size={15} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredProviders.length === 0 && (
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E1DACB',
              borderRadius: 16,
              padding: '3.5rem 1.5rem',
              textAlign: 'center'
            }}
          >
            <Briefcase size={36} color="#8D8577" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ margin: '0 0 6px', color: '#1B1F1C' }}>No specialists found</h3>
            <p style={{ color: '#8D8577', fontSize: '0.9rem', maxWidth: 400, margin: '0 auto 1.5rem' }}>
              We couldn't find any service providers matching your current search criteria.
            </p>
            <button
              onClick={() => { setQuery(''); setActiveCategory(null); }}
              style={{
                background: '#1F6E5E',
                color: '#FBFAF6',
                border: 0,
                borderRadius: 999,
                padding: '8px 20px',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              Reset Filters
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
