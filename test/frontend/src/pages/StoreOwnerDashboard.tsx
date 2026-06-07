import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { StarRating } from '../components/StarRating';
import { 
  Store, Star, LogOut, Key, User, ArrowUpDown, Check, AlertCircle, Calendar, MessageSquare, MapPin, Mail 
} from 'lucide-react';

interface ReviewerRating {
  user_id: number;
  user_name: string;
  user_email: string;
  user_address: string;
  rating: number;
  rating_date: string;
}

interface OwnerStore {
  id: number;
  name: string;
  email: string;
  address: string;
}

interface DashboardData {
  store: OwnerStore | null;
  averageRating: number;
  ratingsCount: number;
  ratings: ReviewerRating[];
}

export const StoreOwnerDashboard: React.FC = () => {
  const { logout, user } = useAuth();
  
  // Tab control
  const [activeTab, setActiveTab] = useState<'dashboard' | 'password'>('dashboard');

  // Dashboard state
  const [dashboard, setDashboard] = useState<DashboardData>({
    store: null,
    averageRating: 0,
    ratingsCount: 0,
    ratings: []
  });
  const [sortBy, setSortBy] = useState('rating_date');
  const [sortOrder, setSortOrder] = useState('desc');

  // Change Password state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordErrors, setPasswordErrors] = useState<{ [key: string]: string }>({});

  // Status indicators
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch Owner Dashboard
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        sortBy,
        sortOrder
      }).toString();

      const res = await api.get(`/store-owner/dashboard?${queryParams}`);
      setDashboard(res.data);
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [sortBy, sortOrder]);

  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchDashboardData();
    }
  }, [activeTab, fetchDashboardData]);

  const handleSort = (column: string) => {
    const isAsc = sortBy === column && sortOrder === 'asc';
    setSortBy(column);
    setSortOrder(isAsc ? 'desc' : 'asc');
  };

  // Change password validations
  const validatePasswordChange = () => {
    const errs: { [key: string]: string } = {};

    if (!oldPassword) {
      errs.oldPassword = 'Current password is required';
    }

    if (!newPassword) {
      errs.newPassword = 'New password is required';
    } else if (newPassword.length < 8 || newPassword.length > 16) {
      errs.newPassword = 'Password must be between 8 and 16 characters';
    } else if (!/[A-Z]/.test(newPassword)) {
      errs.newPassword = 'Password must include at least one uppercase letter';
    } else if (!/[^A-Za-z0-9]/.test(newPassword)) {
      errs.newPassword = 'Password must include at least one special character';
    }

    if (newPassword !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    if (newPassword === oldPassword && oldPassword !== '') {
      errs.newPassword = 'New password cannot be the same as your old password';
    }

    setPasswordErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    if (!validatePasswordChange()) return;

    try {
      await api.post('/auth/change-password', {
        oldPassword,
        newPassword,
      });
      setSuccessMsg('Password updated successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordErrors({});
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to change password. Please verify your current password.');
    }
  };

  return (
    <div className="app-container">
      {/* Navbar */}
      <header className="navbar">
        <div className="navbar-brand">
          <span>⭐ Store Rating Hub</span>
          <span className="badge badge-owner" style={{ fontSize: '0.7rem', marginLeft: '0.5rem' }}>Owner</span>
        </div>
        <div className="navbar-actions">
          <div className="user-badge-profile">
            <User size={16} style={{ color: 'var(--primary-hover)' }} />
            <span>{user?.name || 'Store Owner'}</span>
          </div>
          <button onClick={logout} className="btn btn-danger btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="main-content">
        <div className="dashboard-header">
          <div className="dashboard-title">
            <h2>Store Management Portal</h2>
            <p>Monitor reviews, view average feedback ratings, and manage your security settings.</p>
          </div>
        </div>

        {/* Global Notifications */}
        {errorMsg && (
          <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
            <Check size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="tab-navigation">
          <button 
            className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => { setActiveTab('dashboard'); setErrorMsg(''); setSuccessMsg(''); }}
          >
            <Store size={16} style={{ marginRight: '0.4rem', display: 'inline' }} /> Store Dashboard
          </button>
          <button 
            className={`tab-btn ${activeTab === 'password' ? 'active' : ''}`}
            onClick={() => { setActiveTab('password'); setErrorMsg(''); setSuccessMsg(''); }}
          >
            <Key size={16} style={{ marginRight: '0.4rem', display: 'inline' }} /> Change Password
          </button>
        </div>

        {/* TAB 1: STORE DASHBOARD */}
        {activeTab === 'dashboard' && (
          <>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>Loading dashboard data...</div>
            ) : !dashboard.store ? (
              <div className="card empty-state" style={{ padding: '3.5rem 2rem' }}>
                <Store className="empty-state-icon" style={{ width: '56px', height: '56px', marginBottom: '1rem' }} />
                <h3 style={{ fontSize: '1.5rem', color: '#fff', fontWeight: 600 }}>No Store Associated</h3>
                <p style={{ maxWidth: '460px', margin: '0 auto', color: 'var(--text-secondary)' }}>
                  There is currently no registered store assigned to your store owner account. 
                  Please request the System Administrator to assign your store name to:
                </p>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem 1.25rem', borderRadius: '8px', border: '1px solid var(--border-color)', fontWeight: 500 }}>
                  {user?.email}
                </div>
              </div>
            ) : (
              <>
                {/* Store Stats Grid */}
                <section className="stats-grid">
                  <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-hover)', marginBottom: '0.5rem' }}>
                      <Store size={20} />
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>STORE DETAILS</span>
                    </div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff' }}>{dashboard.store.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      <Mail size={14} style={{ flexShrink: 0 }} />
                      <span>{dashboard.store.email}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      <MapPin size={14} style={{ flexShrink: 0 }} />
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{dashboard.store.address}</span>
                    </div>
                  </div>

                  <div className="card stat-card">
                    <div className="stat-icon ratings">
                      <Star size={24} />
                    </div>
                    <div className="stat-info">
                      <span className="stat-value">{dashboard.averageRating} / 5</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.15rem' }}>
                        <StarRating rating={dashboard.averageRating} />
                      </div>
                      <span className="stat-label" style={{ marginTop: '0.25rem' }}>Average Rating</span>
                    </div>
                  </div>

                  <div className="card stat-card">
                    <div className="stat-icon" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-blue)' }}>
                      <MessageSquare size={24} />
                    </div>
                    <div className="stat-info">
                      <span className="stat-value">{dashboard.ratingsCount}</span>
                      <span className="stat-label" style={{ marginTop: '0.25rem' }}>Total Ratings Submitted</span>
                    </div>
                  </div>
                </section>

                {/* Ratings Table */}
                <div className="card" style={{ padding: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>User Feedback & Ratings</h3>

                  <div className="table-container">
                    {dashboard.ratings.length === 0 ? (
                      <div className="empty-state" style={{ padding: '3rem 2rem' }}>
                        <Star className="empty-state-icon" />
                        <p>No ratings have been submitted for your store yet.</p>
                      </div>
                    ) : (
                      <table className="custom-table">
                        <thead>
                          <tr>
                            <th onClick={() => handleSort('user_name')} className="sort-header">
                              Customer Name <ArrowUpDown size={14} />
                            </th>
                            <th onClick={() => handleSort('user_email')} className="sort-header">
                              Email Address <ArrowUpDown size={14} />
                            </th>
                            <th>Residential Location</th>
                            <th onClick={() => handleSort('rating')} className="sort-header" style={{ textAlign: 'center' }}>
                              Rating Given <ArrowUpDown size={14} />
                            </th>
                            <th onClick={() => handleSort('rating_date')} className="sort-header" style={{ textAlign: 'center' }}>
                              Feedback Date <ArrowUpDown size={14} />
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {dashboard.ratings.map((rating) => (
                            <tr key={rating.user_id}>
                              <td style={{ fontWeight: 600, color: '#fff' }}>{rating.user_name}</td>
                              <td>{rating.user_email}</td>
                              <td style={{ maxWidth: '280px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={rating.user_address}>
                                {rating.user_address}
                              </td>
                              <td>
                                <div style={{ display: 'flex', justifyContent: 'center' }}>
                                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(245, 158, 11, 0.08)', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid rgba(245, 158, 11, 0.15)' }}>
                                    <Star size={14} style={{ fill: 'var(--accent-gold)', color: 'var(--accent-gold)' }} />
                                    <span style={{ color: 'var(--accent-gold)', fontWeight: 600, fontSize: '0.85rem' }}>{rating.rating} / 5</span>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.9rem' }}>
                                  <Calendar size={14} style={{ color: 'var(--text-muted)' }} />
                                  <span>{new Date(rating.rating_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* TAB 2: CHANGE PASSWORD */}
        {activeTab === 'password' && (
          <div className="card" style={{ maxWidth: '560px', margin: '0 auto' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Key size={20} style={{ color: 'var(--primary)' }} /> Update Login Credentials
            </h3>
            
            <form onSubmit={handlePasswordSubmit} noValidate>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Enter current password"
                  value={oldPassword}
                  onChange={(e) => {
                    setOldPassword(e.target.value);
                    if (passwordErrors.oldPassword) setPasswordErrors(prev => ({ ...prev, oldPassword: '' }));
                  }}
                />
                {passwordErrors.oldPassword && <span className="form-error">{passwordErrors.oldPassword}</span>}
              </div>

              <div className="form-group" style={{ marginTop: '1.25rem' }}>
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (passwordErrors.newPassword) setPasswordErrors(prev => ({ ...prev, newPassword: '' }));
                  }}
                />
                {passwordErrors.newPassword ? (
                  <span className="form-error">{passwordErrors.newPassword}</span>
                ) : (
                  <span className="form-info">Must be 8-16 characters, include 1 uppercase and 1 special character</span>
                )}
              </div>

              <div className="form-group" style={{ marginTop: '1.25rem' }}>
                <label className="form-label">Confirm New Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (passwordErrors.confirmPassword) setPasswordErrors(prev => ({ ...prev, confirmPassword: '' }));
                  }}
                />
                {passwordErrors.confirmPassword && <span className="form-error">{passwordErrors.confirmPassword}</span>}
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '1.75rem' }}
              >
                Update Password
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};
