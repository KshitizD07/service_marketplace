/**
 * @file AdminDashboardPage.jsx
 * @description Administration portal for platform operations.
 * Displays live analytics KPI cards, category distribution chart, user moderation,
 * category governance, and global booking/review inspection.
 */

import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Users, Settings, Calendar, MessageSquare,
  DollarSign, Briefcase, Plus, Pencil, Trash2, UserCheck, UserX
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import * as adminService from '../../services/adminService';
import * as bookingService from '../../services/bookingService';
import { useToast } from '../../context/ToastContext';
import StatusPill from '../../components/common/StatusPill';
import StarRating from '../../components/common/StarRating';
import SectionHeading from '../../components/common/SectionHeading';

export default function AdminDashboardPage() {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  // Admin Data State
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);

  // Category Add State
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  // Booking Status Filter
  const [bookingFilter, setBookingFilter] = useState('all');

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, bookingsRes, reviewsRes] = await Promise.all([
        adminService.getStats(),
        adminService.getUsers(),
        bookingService.getBookings(),
        adminService.getAllReviews()
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (usersRes.success) setUsers(usersRes.data || []);
      if (bookingsRes.success) setBookings(bookingsRes.data || []);
      if (reviewsRes.success) setReviews(reviewsRes.data || []);

      // Derive categories from stats or endpoint
      if (statsRes.data?.categorySplit) {
        setCategories(statsRes.data.categorySplit);
      }
    } catch (err) {
      addToast("Failed to load administration data.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  // Handle User Status Toggle
  const handleToggleUser = async (userId, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      await adminService.toggleUserStatus(userId, nextStatus);
      addToast(`User status updated to ${nextStatus}.`, "success");
      loadAdminData();
    } catch (err) {
      addToast(err.message || "Failed to update user status.", "error");
    }
  };

  // Handle Add Category
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    try {
      await adminService.addCategory({
        name: newCatName.trim(),
        description: newCatDesc.trim()
      });
      addToast("Category created successfully.", "success");
      setNewCatName('');
      setNewCatDesc('');
      loadAdminData();
    } catch (err) {
      addToast(err.message || "Failed to add category.", "error");
    }
  };

  // Handle Edit Category
  const handleEditCategory = async (cat) => {
    const newName = window.prompt("Enter updated category title:", cat.name);
    if (!newName || !newName.trim()) return;

    const newDesc = window.prompt("Enter updated description:", cat.description || "");

    try {
      await adminService.updateCategory(cat.id, {
        name: newName.trim(),
        description: newDesc ? newDesc.trim() : ""
      });
      addToast("Category updated successfully.", "success");
      loadAdminData();
    } catch (err) {
      addToast(err.message || "Failed to update category.", "error");
    }
  };

  // Handle Delete Category
  const handleDeleteCategory = async (catId) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;

    try {
      await adminService.deleteCategory(catId);
      addToast("Category deleted successfully.", "success");
      loadAdminData();
    } catch (err) {
      addToast(err.message || "Cannot delete category in active use.", "error");
    }
  };

  // Filter Bookings
  const filteredBookings = bookings.filter((b) => {
    if (bookingFilter === 'all') return true;
    return b.status?.toLowerCase() === bookingFilter.toLowerCase();
  });

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'users', label: 'Users & Providers', icon: Users },
    { id: 'categories', label: 'Categories', icon: Settings },
    { id: 'bookings', label: 'All Bookings', icon: Calendar },
    { id: 'reviews', label: 'Customer Reviews', icon: MessageSquare }
  ];

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 75px)', background: '#F5F2EA' }}>
      {/* Admin Sidebar */}
      <aside
        style={{
          width: 240,
          background: '#12181B',
          color: '#FBFAF6',
          padding: '2rem 1rem',
          flexShrink: 0
        }}
      >
        <div style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.08em', color: '#7C8580', padding: '0 12px', marginBottom: 16 }}>
          PLATFORM ADMINISTRATION
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 10,
                  border: 0,
                  background: isActive ? '#1F6E5E' : 'transparent',
                  color: isActive ? '#FBFAF6' : '#A9A292',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.15s ease'
                }}
              >
                <Icon size={16} /> {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '2.5rem 2rem', minWidth: 0 }}>
        {loading && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#8D8577' }}>
            Loading platform telemetry...
          </div>
        )}

        {/* TAB 1: Overview & Metrics */}
        {!loading && activeTab === 'overview' && (
          <div>
            <SectionHeading
              eyebrow="PLATFORM TELEMETRY"
              title="Marketplace Overview"
              sub="Key performance indicators, gross volume, and provider category split."
            />

            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.2rem', marginBottom: '2.5rem' }}>
              <div style={{ background: '#FFFFFF', border: '1.5px solid #E1DACB', borderRadius: 16, padding: '1.4rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#8D8577' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Total Users</span>
                  <Users size={18} />
                </div>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#1B1F1C', marginTop: 6 }}>
                  {stats?.totalUsers || 0}
                </div>
              </div>

              <div style={{ background: '#FFFFFF', border: '1.5px solid #E1DACB', borderRadius: 16, padding: '1.4rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#8D8577' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Active Providers</span>
                  <Briefcase size={18} />
                </div>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#1B1F1C', marginTop: 6 }}>
                  {stats?.activeProviders || 0}
                </div>
              </div>

              <div style={{ background: '#FFFFFF', border: '1.5px solid #E1DACB', borderRadius: 16, padding: '1.4rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#8D8577' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Bookings This Month</span>
                  <Calendar size={18} />
                </div>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#1B1F1C', marginTop: 6 }}>
                  {stats?.bookingsThisMonth || 0}
                </div>
              </div>

              <div style={{ background: '#FFFFFF', border: '1.5px solid #E1DACB', borderRadius: 16, padding: '1.4rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#8D8577' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Gross Revenue</span>
                  <DollarSign size={18} />
                </div>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#1F6E5E', marginTop: 6 }}>
                  ₹{(stats?.revenue || 0).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Category Split Chart */}
            <div style={{ background: '#FFFFFF', border: '1.5px solid #E1DACB', borderRadius: 16, padding: '1.8rem' }}>
              <h3 style={{ margin: '0 0 1rem', fontSize: '1.1rem', color: '#1B1F1C' }}>
                Provider Distribution by Category
              </h3>
              <div style={{ height: 260, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats?.categorySplit || []}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E1DACB" />
                    <XAxis dataKey="name" stroke="#8D8577" fontSize={12} />
                    <YAxis allowDecimals={false} stroke="#8D8577" fontSize={12} />
                    <Tooltip cursor={{ fill: '#F5F2EA' }} />
                    <Bar dataKey="providers" fill="#1F6E5E" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Users & Providers Moderation */}
        {!loading && activeTab === 'users' && (
          <div>
            <SectionHeading
              eyebrow="ACCOUNTS & ACCESS"
              title="Registered Users & Service Providers"
              sub="Inspect account roles, business credentials, and activate or suspend access."
            />

            <div style={{ background: '#FFFFFF', border: '1.5px solid #E1DACB', borderRadius: 16, overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: '#FAF8F5', borderBottom: '1.5px solid #E1DACB' }}>
                    <th style={{ padding: '12px 16px', fontWeight: 700 }}>Name & Email</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700 }}>Role</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700 }}>Category / Business</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700 }}>Rating</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700 }}>Status</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700 }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const isActive = u.status === 'active';

                    return (
                      <tr key={u.id} style={{ borderBottom: '1px solid #E1DACB' }}>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ fontWeight: 700, color: '#1B1F1C' }}>{u.name}</div>
                          <div style={{ fontSize: '0.78rem', color: '#8D8577' }}>{u.email}</div>
                        </td>
                        <td style={{ padding: '12px 16px', textTransform: 'capitalize' }}>
                          <b>{u.role}</b>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          {u.business_name ? (
                            <div>
                              <div>{u.business_name}</div>
                              <span style={{ fontSize: '0.74rem', color: '#1F6E5E', fontWeight: 600 }}>{u.category_name}</span>
                            </div>
                          ) : '—'}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          {u.rating ? `⭐ ${Number(u.rating).toFixed(1)} (${u.total_reviews})` : '—'}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '2px 8px',
                              borderRadius: 999,
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              background: isActive ? '#E4EEE9' : '#F3E1DA',
                              color: isActive ? '#154E43' : '#A6432B'
                            }}
                          >
                            {u.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <button
                            onClick={() => handleToggleUser(u.id, u.status)}
                            style={{
                              background: 'transparent',
                              border: `1px solid ${isActive ? '#A6432B' : '#1F6E5E'}`,
                              color: isActive ? '#A6432B' : '#1F6E5E',
                              borderRadius: 8,
                              padding: '5px 10px',
                              fontSize: '0.76rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4
                            }}
                          >
                            {isActive ? <UserX size={12} /> : <UserCheck size={12} />}
                            {isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: Category Governance */}
        {!loading && activeTab === 'categories' && (
          <div>
            <SectionHeading
              eyebrow="CATALOG GOVERNANCE"
              title="Marketplace Service Categories"
              sub="Create, update, or remove service classifications."
            />

            {/* Add Category Form */}
            <form
              onSubmit={handleAddCategory}
              style={{
                background: '#FFFFFF',
                border: '1.5px solid #E1DACB',
                borderRadius: 16,
                padding: '1.4rem',
                marginBottom: '1.8rem',
                display: 'grid',
                gridTemplateColumns: '1fr 1.6fr auto',
                gap: 12,
                alignItems: 'end'
              }}
            >
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: 4 }}>
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pet Care"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', borderRadius: 8, border: '1px solid #CFC6B2' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: 4 }}>
                  Description
                </label>
                <input
                  type="text"
                  placeholder="Grooming, training and veterinary visits"
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', borderRadius: 8, border: '1px solid #CFC6B2' }}
                />
              </div>

              <button
                type="submit"
                style={{
                  background: '#1F6E5E',
                  color: '#FBFAF6',
                  border: 0,
                  borderRadius: 8,
                  padding: '9px 18px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <Plus size={15} /> Add Category
              </button>
            </form>

            {/* Categories Table */}
            <div style={{ background: '#FFFFFF', border: '1.5px solid #E1DACB', borderRadius: 16, overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: '#FAF8F5', borderBottom: '1.5px solid #E1DACB' }}>
                    <th style={{ padding: '12px 16px', fontWeight: 700 }}>Category Name</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700 }}>Providers Assigned</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((c) => (
                    <tr key={c.id} style={{ borderBottom: '1px solid #E1DACB' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 700, color: '#1B1F1C' }}>{c.name}</div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {c.providers || 0} provider(s)
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            onClick={() => handleEditCategory(c)}
                            title="Edit"
                            style={{ background: 'transparent', border: '1px solid #CFC6B2', borderRadius: 6, padding: '5px 8px', cursor: 'pointer' }}
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(c.id)}
                            title="Delete"
                            style={{ background: 'transparent', border: '1px solid #A6432B', color: '#A6432B', borderRadius: 6, padding: '5px 8px', cursor: 'pointer' }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: All Bookings Global Table */}
        {!loading && activeTab === 'bookings' && (
          <div>
            <SectionHeading
              eyebrow="GLOBAL LEDGER"
              title="All Marketplace Bookings"
              sub="Real-time log of customer reservations across all providers."
            />

            {/* Filter */}
            <div style={{ marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Filter by Status:</span>
              <select
                value={bookingFilter}
                onChange={(e) => setBookingFilter(e.target.value)}
                style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #CFC6B2', background: '#FFFFFF', fontSize: '0.85rem' }}
              >
                <option value="all">All Bookings</option>
                <option value="requested">Requested</option>
                <option value="confirmed">Confirmed</option>
                <option value="in progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div style={{ background: '#FFFFFF', border: '1.5px solid #E1DACB', borderRadius: 16, overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: '#FAF8F5', borderBottom: '1.5px solid #E1DACB' }}>
                    <th style={{ padding: '12px 16px', fontWeight: 700 }}>Customer</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700 }}>Provider</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700 }}>Service</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700 }}>Schedule</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700 }}>Price</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700 }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((b) => (
                    <tr key={b.id} style={{ borderBottom: '1px solid #E1DACB' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 700 }}>{b.customer_name}</td>
                      <td style={{ padding: '12px 16px' }}>{b.provider_name}</td>
                      <td style={{ padding: '12px 16px' }}>{b.service_name}</td>
                      <td style={{ padding: '12px 16px' }}>{b.booking_date} at {b.start_time}</td>
                      <td style={{ padding: '12px 16px', fontWeight: 700 }}>₹{b.price}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <StatusPill status={b.status} />
                      </td>
                    </tr>
                  ))}
                  {filteredBookings.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#8D8577' }}>
                        No bookings found matching filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: Reviews Moderation */}
        {!loading && activeTab === 'reviews' && (
          <div>
            <SectionHeading
              eyebrow="FEEDBACK MODERATION"
              title="Customer Reviews & Ratings"
              sub="Platform-wide review submissions for quality assurance."
            />

            <div style={{ background: '#FFFFFF', border: '1.5px solid #E1DACB', borderRadius: 16, overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: '#FAF8F5', borderBottom: '1.5px solid #E1DACB' }}>
                    <th style={{ padding: '12px 16px', fontWeight: 700 }}>Customer</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700 }}>Provider</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700 }}>Rating</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700 }}>Review Comment</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700 }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((r) => (
                    <tr key={r.id} style={{ borderBottom: '1px solid #E1DACB' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 700 }}>{r.customer_name}</td>
                      <td style={{ padding: '12px 16px' }}>{r.provider_name}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <StarRating rating={r.rating} size={14} showNumber={false} />
                      </td>
                      <td style={{ padding: '12px 16px', fontStyle: r.comment ? 'italic' : 'normal' }}>
                        {r.comment ? `"${r.comment}"` : '—'}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#8D8577', fontSize: '0.8rem' }}>
                        {new Date(r.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                  {reviews.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#8D8577' }}>
                        No customer reviews submitted yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
