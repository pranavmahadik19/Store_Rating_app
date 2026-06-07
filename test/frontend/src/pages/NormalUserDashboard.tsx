import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { StarRating } from '../components/StarRating';
import { 
  Store, Star, LogOut, Search, Key, User, ArrowUpDown, Check, AlertCircle 
} from 'lucide-react';

interface StoreItem {
  id: number;
  name: string;
  email: string;
  address: string;
  rating: number;
  rating_count: number;
  user_rating: number | null;
}

export const NormalUserDashboard: React.FC = () => {
  const { logout, user } = useAuth();
  
  // Dashboard view state
  const [activeTab, setActiveTab] = useState<'stores' | 'password'>('stores');

  // Stores state
  const [stores, setStores] = useState<StoreItem[]>([]);
  const [searchName, setSearchName] = useState('');
  const [searchAddress, setSearchAddress] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Change Password state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordErrors, setPasswordErrors] = useState<{ [key: string]: string }>({});

  // UI status
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch stores
  const fetchStores = useCallback(async () => {
    try {
      const queryParams = new URLSearchParams({
        name: searchName,
        address: searchAddress,
        sortBy,
        sortOrder,
      }).toString();

      const res = await api.get(`/stores?${queryParams}`);
      setStores(res.data);
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Failed to load stores');
    }
  }, [searchName, searchAddress, sortBy, sortOrder]);

  useEffect(() => {
    if (activeTab === 'stores') {
      fetchStores();
    }
  }, [activeTab, fetchStores]);

  // Handle rating submit / modify
  const handleRateStore = async (storeId: number, rating: number) => {
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await api.post(`/stores/${storeId}/rate`, { rating });
      // Update local state directly to prevent a full refetch flash
      setStores((prevStores) =>
        prevStores.map((store) => {
          if (store.id === storeId) {
            const hasPreviousRating = store.user_rating !== null;
            const prevRatingValue = store.user_rating || 0;
            const newRatingCount = hasPreviousRating ? store.rating_count : store.rating_count + 1;
            
            // Calculate new overall average rating
            const totalRatingSum = (store.rating * store.rating_count) - prevRatingValue + rating;
            const newAverageRating = newRatingCount > 0 ? parseFloat((totalRatingSum / newRatingCount).toFixed(2)) : rating;

            return {
              ...store,
              user_rating: rating,
              rating_count: newRatingCount,
              rating: newAverageRating,
            };
          }
          return store;
        })
      );
      setSuccessMsg('Rating submitted successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to submit rating');
    } finally {
      // Done submitting
    }
  };

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
          <span className="badge badge-normal" style={{ fontSize: '0.7rem', marginLeft: '0.5rem' }}>User</span>
        </div>
        <div className="navbar-actions">
          <div className="user-badge-profile">
            <User size={16} style={{ color: 'var(--accent-green)' }} />
            <span>{user?.name || 'User'}</span>
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
            <h2>Welcome, {user?.name.split(' ')[0]}</h2>
            <p>Search and rate stores, modify your ratings, or update your security credentials.</p>
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
            className={`tab-btn ${activeTab === 'stores' ? 'active' : ''}`}
            onClick={() => { setActiveTab('stores'); setErrorMsg(''); setSuccessMsg(''); }}
          >
            <Store size={16} style={{ marginRight: '0.4rem', display: 'inline' }} /> Browse & Rate Stores
          </button>
          <button 
            className={`tab-btn ${activeTab === 'password' ? 'active' : ''}`}
            onClick={() => { setActiveTab('password'); setErrorMsg(''); setSuccessMsg(''); }}
          >
            <Key size={16} style={{ marginRight: '0.4rem', display: 'inline' }} /> Change Password
          </button>
        </div>

        {/* TAB 1: BROWSE STORES */}
        {activeTab === 'stores' && (
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>Registered Stores</h3>

            {/* Search Controls */}
            <div className="controls-bar">
              <div className="search-filters">
                <div className="search-input-wrapper">
                  <Search className="search-icon" />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Search by Store Name..."
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                  />
                </div>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Search by Address..."
                  value={searchAddress}
                  onChange={(e) => setSearchAddress(e.target.value)}
                  style={{ flex: 1, minWidth: '220px' }}
                />
                <button 
                  onClick={() => { setSearchName(''); setSearchAddress(''); }} 
                  className="btn btn-secondary"
                  style={{ padding: '0.6rem 1rem' }}
                >
                  Clear Search
                </button>
              </div>
            </div>

            {/* Stores Table */}
            <div className="table-container">
              {stores.length === 0 ? (
                <div className="empty-state">
                  <Store className="empty-state-icon" />
                  <p>No stores match your search parameters.</p>
                </div>
              ) : (
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th onClick={() => handleSort('name')} className="sort-header">
                        Store Name <ArrowUpDown size={14} />
                      </th>
                      <th onClick={() => handleSort('address')} className="sort-header">
                        Store Location <ArrowUpDown size={14} />
                      </th>
                      <th onClick={() => handleSort('rating')} className="sort-header" style={{ textAlign: 'center' }}>
                        Overall Average Rating <ArrowUpDown size={14} />
                      </th>
                      <th onClick={() => handleSort('user_rating')} className="sort-header" style={{ textAlign: 'center' }}>
                        Your Current Rating <ArrowUpDown size={14} />
                      </th>
                      <th style={{ textAlign: 'center', width: '220px' }}>Submit / Modify Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stores.map((store) => (
                      <tr key={store.id}>
                        <td style={{ fontWeight: 600, color: '#fff' }}>{store.name}</td>
                        <td style={{ maxWidth: '280px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={store.address}>
                          {store.address}
                        </td>
                        <td>
                          <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <StarRating rating={store.rating} count={store.rating_count} />
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', justifyContent: 'center' }}>
                            {store.user_rating ? (
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(245, 158, 11, 0.08)', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid rgba(245, 158, 11, 0.15)' }}>
                                <Star size={14} style={{ fill: 'var(--accent-gold)', color: 'var(--accent-gold)' }} />
                                <span style={{ color: 'var(--accent-gold)', fontWeight: 600, fontSize: '0.85rem' }}>{store.user_rating} / 5</span>
                              </div>
                            ) : (
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>Not Rated Yet</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <StarRating 
                              rating={store.user_rating || 0} 
                              interactive={true} 
                              onChange={(value) => handleRateStore(store.id, value)}
                              size={20}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
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
