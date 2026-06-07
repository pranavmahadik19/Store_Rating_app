import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { StarRating } from '../components/StarRating';
import { 
  Users, Store, Star, LogOut, Search, UserPlus, Plus, X, Eye, ArrowUpDown, Shield, Trash2, Edit
} from 'lucide-react';

interface Stats {
  totalUsers: number;
  totalStores: number;
  totalRatings: number;
}

interface UserListItem {
  id: number;
  name: string;
  email: string;
  address: string;
  role: 'ADMIN' | 'NORMAL' | 'STORE_OWNER';
  store_name?: string | null;
  rating?: number | null;
}

interface StoreListItem {
  id: number;
  name: string;
  email: string;
  address: string;
  owner_id?: number | null;
  owner_name?: string | null;
  rating: number;
  rating_count: number;
}

interface AvailableOwner {
  id: number;
  name: string;
  email: string;
}

export const AdminDashboard: React.FC = () => {
  const { logout, user: currentUser } = useAuth();
  
  // Dashboard view state
  const [activeTab, setActiveTab] = useState<'stores' | 'users'>('stores');
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, totalStores: 0, totalRatings: 0 });

  // Lists state
  const [stores, setStores] = useState<StoreListItem[]>([]);
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [availableOwners, setAvailableOwners] = useState<AvailableOwner[]>([]);

  // Search/Filter state
  const [storeFilters, setStoreFilters] = useState({ name: '', email: '', address: '' });
  const [userFilters, setUserFilters] = useState({ name: '', email: '', address: '', role: '' });

  // Sorting state
  const [storeSort, setStoreSort] = useState({ sortBy: 'name', sortOrder: 'asc' });
  const [userSort, setUserSort] = useState({ sortBy: 'name', sortOrder: 'asc' });

  // Modals state
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showAddStoreModal, setShowAddStoreModal] = useState(false);
  const [showEditStoreModal, setShowEditStoreModal] = useState(false);
  const [selectedStore, setSelectedStore] = useState<StoreListItem | null>(null);
  const [selectedUserDetails, setSelectedUserDetails] = useState<UserListItem | null>(null);

  // Add User Form state
  const [userForm, setUserForm] = useState({ name: '', email: '', password: '', address: '', role: 'NORMAL' });
  const [userFormErrors, setUserFormErrors] = useState<{ [key: string]: string }>({});

  // Add Store Form state
  const [storeForm, setStoreForm] = useState({ name: '', email: '', address: '', ownerId: '' });
  const [storeFormErrors, setStoreFormErrors] = useState<{ [key: string]: string }>({});

  // General error state
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch Stats
  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get('/admin/stats');
      setStats(res.data);
    } catch (err: any) {
      console.error(err);
      setErrorMessage('Failed to fetch stats');
    }
  }, []);

  // Fetch Stores
  const fetchStores = useCallback(async () => {
    try {
      const { name, email, address } = storeFilters;
      const { sortBy, sortOrder } = storeSort;
      
      const queryParams = new URLSearchParams({
        name,
        email,
        address,
        sortBy,
        sortOrder
      }).toString();

      const res = await api.get(`/admin/stores?${queryParams}`);
      setStores(res.data);
    } catch (err: any) {
      console.error(err);
      setErrorMessage('Failed to fetch stores');
    }
  }, [storeFilters, storeSort]);

  // Fetch Users
  const fetchUsers = useCallback(async () => {
    try {
      const { name, email, address, role } = userFilters;
      const { sortBy, sortOrder } = userSort;

      const queryParams = new URLSearchParams({
        name,
        email,
        address,
        role,
        sortBy,
        sortOrder
      }).toString();

      const res = await api.get(`/admin/users?${queryParams}`);
      setUsers(res.data);
    } catch (err: any) {
      console.error(err);
      setErrorMessage('Failed to fetch users');
    }
  }, [userFilters, userSort]);

  // Fetch Available Store Owners (for dropdown selection)
  const fetchAvailableOwners = useCallback(async () => {
    try {
      const res = await api.get('/admin/available-owners');
      setAvailableOwners(res.data);
    } catch (err: any) {
      console.error(err);
    }
  }, []);

  // Initial Data Load
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    if (activeTab === 'stores') {
      fetchStores();
    } else {
      fetchUsers();
    }
  }, [activeTab, fetchStores, fetchUsers]);

  // Handle store sorting
  const handleStoreSort = (column: string) => {
    setStoreSort((prev) => {
      const isAsc = prev.sortBy === column && prev.sortOrder === 'asc';
      return { sortBy: column, sortOrder: isAsc ? 'desc' : 'asc' };
    });
  };

  // Handle user sorting
  const handleUserSort = (column: string) => {
    setUserSort((prev) => {
      const isAsc = prev.sortBy === column && prev.sortOrder === 'asc';
      return { sortBy: column, sortOrder: isAsc ? 'desc' : 'asc' };
    });
  };

  // Form validations for adding users
  const validateUserForm = () => {
    const errs: { [key: string]: string } = {};
    if (userForm.name.length < 20 || userForm.name.length > 60) {
      errs.name = 'Name must be between 20 and 60 characters';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userForm.email)) {
      errs.email = 'Must follow standard email validation rules';
    }
    if (userForm.password.length < 8 || userForm.password.length > 16) {
      errs.password = 'Password must be 8-16 characters';
    } else if (!/[A-Z]/.test(userForm.password)) {
      errs.password = 'Password must contain at least one uppercase letter';
    } else if (!/[^A-Za-z0-9]/.test(userForm.password)) {
      errs.password = 'Password must contain at least one special character';
    }
    if (userForm.address.length === 0) {
      errs.address = 'Address is required';
    } else if (userForm.address.length > 400) {
      errs.address = 'Address must not exceed 400 characters';
    }
    setUserFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Submit new user
  const handleAddUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);
    if (!validateUserForm()) {
      setIsSubmitting(false);
      return;
    }
    try {
      await api.post('/admin/users', userForm);
      setSuccessMessage('User added successfully!');
      setShowAddUserModal(false);
      setUserForm({ name: '', email: '', password: '', address: '', role: 'NORMAL' });
      fetchUsers();
      fetchStats();
      fetchAvailableOwners();
    } catch (err: any) {
      if (err.errors) {
        const backendErrors: { [key: string]: string } = {};
        err.errors.forEach((e: any) => { backendErrors[e.field] = e.message; });
        setUserFormErrors(backendErrors);
      } else {
        setErrorMessage(err.message || 'Failed to create user');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Form validations for adding stores
  const validateStoreForm = () => {
    const errs: { [key: string]: string } = {};
    if (storeForm.name.length < 20 || storeForm.name.length > 60) {
      errs.name = 'Store Name must be between 20 and 60 characters';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(storeForm.email)) {
      errs.email = 'Must follow standard email validation rules';
    }
    if (storeForm.address.length === 0) {
      errs.address = 'Address is required';
    } else if (storeForm.address.length > 400) {
      errs.address = 'Address must not exceed 400 characters';
    }
    setStoreFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Submit new store
  const handleAddStoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);
    if (!validateStoreForm()) {
      setIsSubmitting(false);
      return;
    }
    try {
      const postData = {
        name: storeForm.name,
        email: storeForm.email,
        address: storeForm.address,
        ownerId: storeForm.ownerId ? parseInt(storeForm.ownerId) : null,
      };

      await api.post('/admin/stores', postData);
      setSuccessMessage('Store created successfully!');
      setShowAddStoreModal(false);
      setStoreForm({ name: '', email: '', address: '', ownerId: '' });
      fetchStores();
      fetchStats();
    } catch (err: any) {
      if (err.errors) {
        const backendErrors: { [key: string]: string } = {};
        err.errors.forEach((e: any) => { backendErrors[e.field] = e.message; });
        setStoreFormErrors(backendErrors);
      } else {
        setErrorMessage(err.message || 'Failed to create store');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit edited store
  const handleEditStoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStore) return;
    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);
    if (!validateStoreForm()) {
      setIsSubmitting(false);
      return;
    }
    try {
      const putData = {
        name: storeForm.name,
        email: storeForm.email,
        address: storeForm.address,
        ownerId: storeForm.ownerId ? parseInt(storeForm.ownerId) : null,
      };

      await api.put(`/admin/stores/${selectedStore.id}`, putData);
      setSuccessMessage('Store updated successfully!');
      setShowEditStoreModal(false);
      setSelectedStore(null);
      setStoreForm({ name: '', email: '', address: '', ownerId: '' });
      fetchStores();
      fetchStats();
    } catch (err: any) {
      if (err.errors) {
        const backendErrors: { [key: string]: string } = {};
        err.errors.forEach((e: any) => { backendErrors[e.field] = e.message; });
        setStoreFormErrors(backendErrors);
      } else {
        setErrorMessage(err.message || 'Failed to update store');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete User
  const handleDeleteUser = async (user: UserListItem) => {
    if (user.id === currentUser?.id) {
      setErrorMessage("You cannot delete your own admin account.");
      return;
    }

    const confirmed = window.confirm(`Are you sure you want to delete user "${user.name}"? This action cannot be undone.`);
    if (!confirmed) return;

    try {
      await api.delete(`/admin/users/${user.id}`);
      setSuccessMessage(`User "${user.name}" deleted successfully.`);
      fetchUsers();
      fetchStats();
      fetchAvailableOwners();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to delete user');
    }
  };

  // Delete Store
  const handleDeleteStore = async (store: StoreListItem) => {
    const confirmed = window.confirm(`Are you sure you want to delete store "${store.name}"? This will also delete all associated ratings and reviews.`);
    if (!confirmed) return;

    try {
      await api.delete(`/admin/stores/${store.id}`);
      setSuccessMessage(`Store "${store.name}" deleted successfully.`);
      fetchStores();
      fetchStats();
      fetchAvailableOwners();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to delete store');
    }
  };

  return (
    <div className="app-container">
      {/* Navbar */}
      <header className="navbar">
        <div className="navbar-brand">
          <span>⭐ Store Rating Hub</span>
          <span className="badge badge-admin" style={{ fontSize: '0.7rem', marginLeft: '0.5rem' }}>Admin</span>
        </div>
        <div className="navbar-actions">
          <div className="user-badge-profile">
            <Shield size={16} style={{ color: 'var(--accent-blue)' }} />
            <span>{currentUser?.name || 'Administrator'}</span>
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
            <h2>System Administrator Dashboard</h2>
            <p>Monitor platform statistics, manage registered users, and associate store listings.</p>
          </div>
        </div>

        {/* Global Notifications */}
        {errorMessage && (
          <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
            <span>{errorMessage}</span>
            <button onClick={() => setErrorMessage('')} className="btn-link" style={{ marginLeft: 'auto', color: 'inherit' }}>Clear</button>
          </div>
        )}
        {successMessage && (
          <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
            <span>{successMessage}</span>
            <button onClick={() => setSuccessMessage('')} className="btn-link" style={{ marginLeft: 'auto', color: 'inherit' }}>X</button>
          </div>
        )}

        {/* Stats Section */}
        <section className="stats-grid">
          <div className="card stat-card">
            <div className="stat-icon admin">
              <Users size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.totalUsers}</span>
              <span className="stat-label">Total Users</span>
            </div>
          </div>

          <div className="card stat-card">
            <div className="stat-icon">
              <Store size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.totalStores}</span>
              <span className="stat-label">Total Stores</span>
            </div>
          </div>

          <div className="card stat-card">
            <div className="stat-icon ratings">
              <Star size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.totalRatings}</span>
              <span className="stat-label">Submitted Ratings</span>
            </div>
          </div>
        </section>

        {/* Navigation Tabs */}
        <div className="tab-navigation">
          <button 
            className={`tab-btn ${activeTab === 'stores' ? 'active' : ''}`}
            onClick={() => { setActiveTab('stores'); setErrorMessage(''); setSuccessMessage(''); }}
          >
            <Store size={16} style={{ marginRight: '0.4rem', display: 'inline' }} /> Registered Stores
          </button>
          <button 
            className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => { setActiveTab('users'); setErrorMessage(''); setSuccessMessage(''); }}
          >
            <Users size={16} style={{ marginRight: '0.4rem', display: 'inline' }} /> Platform Users
          </button>
        </div>

        {/* TAB 1: STORES LISTING */}
        {activeTab === 'stores' && (
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Manage Store Registrations</h3>
              <button 
                onClick={() => {
                  fetchAvailableOwners();
                  setShowAddStoreModal(true);
                }} 
                className="btn btn-primary"
              >
                <Plus size={16} /> Add New Store
              </button>
            </div>

            {/* Filter Bar */}
            <div className="controls-bar">
              <div className="search-filters">
                <div className="search-input-wrapper">
                  <Search className="search-icon" />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Filter by Store Name..."
                    value={storeFilters.name}
                    onChange={(e) => setStoreFilters(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Filter by Email..."
                  value={storeFilters.email}
                  onChange={(e) => setStoreFilters(prev => ({ ...prev, email: e.target.value }))}
                  style={{ flex: 1, minWidth: '160px' }}
                />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Filter by Address..."
                  value={storeFilters.address}
                  onChange={(e) => setStoreFilters(prev => ({ ...prev, address: e.target.value }))}
                  style={{ flex: 1, minWidth: '200px' }}
                />
                <button 
                  onClick={() => setStoreFilters({ name: '', email: '', address: '' })} 
                  className="btn btn-secondary" 
                  style={{ padding: '0.6rem 1rem' }}
                >
                  Clear Filters
                </button>
              </div>
            </div>

            {/* Stores Table */}
            <div className="table-container">
              {stores.length === 0 ? (
                <div className="empty-state">
                  <Store className="empty-state-icon" />
                  <p>No stores match the selected filters.</p>
                </div>
              ) : (
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th onClick={() => handleStoreSort('name')} className="sort-header">
                        Store Name <ArrowUpDown size={14} />
                      </th>
                      <th onClick={() => handleStoreSort('email')} className="sort-header">
                        Email Address <ArrowUpDown size={14} />
                      </th>
                      <th onClick={() => handleStoreSort('address')} className="sort-header">
                        Address Location <ArrowUpDown size={14} />
                      </th>
                      <th>Store Owner</th>
                      <th onClick={() => handleStoreSort('rating')} className="sort-header" style={{ textAlign: 'center' }}>
                        Rating <ArrowUpDown size={14} />
                      </th>
                      <th style={{ textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stores.map((store) => (
                      <tr key={store.id}>
                        <td style={{ fontWeight: 600, color: '#fff' }}>{store.name}</td>
                        <td>{store.email}</td>
                        <td style={{ maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={store.address}>
                          {store.address}
                        </td>
                        <td>{store.owner_name ? store.owner_name : <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Unassigned</span>}</td>
                        <td>
                          <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <StarRating rating={store.rating} count={store.rating_count} />
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                            <button 
                              onClick={() => {
                                setSelectedStore(store);
                                setStoreForm({ 
                                  name: store.name, 
                                  email: store.email, 
                                  address: store.address, 
                                  ownerId: store.owner_id ? store.owner_id.toString() : '' 
                                });
                                fetchAvailableOwners();
                                setShowEditStoreModal(true);
                              }} 
                              className="btn btn-secondary"
                              style={{ padding: '0.35rem 0.6rem' }}
                              title="Edit Store"
                            >
                              <Edit size={16} />
                            </button>
                            <button 
                              onClick={() => handleDeleteStore(store)} 
                              className="btn btn-secondary btn-danger"
                              style={{ padding: '0.35rem 0.6rem', color: 'var(--error-color)' }}
                              title="Delete Store"
                            >
                              <Trash2 size={16} />
                            </button>
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

        {/* TAB 2: USERS LISTING */}
        {activeTab === 'users' && (
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Manage Platform Accounts</h3>
              <button onClick={() => setShowAddUserModal(true)} className="btn btn-primary">
                <UserPlus size={16} /> Add New User
              </button>
            </div>

            {/* Filter Bar */}
            <div className="controls-bar">
              <div className="search-filters">
                <div className="search-input-wrapper">
                  <Search className="search-icon" />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Filter by Name..."
                    value={userFilters.name}
                    onChange={(e) => setUserFilters(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Filter by Email..."
                  value={userFilters.email}
                  onChange={(e) => setUserFilters(prev => ({ ...prev, email: e.target.value }))}
                  style={{ flex: 1, minWidth: '160px' }}
                />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Filter by Address..."
                  value={userFilters.address}
                  onChange={(e) => setUserFilters(prev => ({ ...prev, address: e.target.value }))}
                  style={{ flex: 1, minWidth: '180px' }}
                />
                <select
                  className="filter-select"
                  value={userFilters.role}
                  onChange={(e) => setUserFilters(prev => ({ ...prev, role: e.target.value }))}
                >
                  <option value="">All Roles</option>
                  <option value="ADMIN">Admin</option>
                  <option value="NORMAL">Normal User</option>
                  <option value="STORE_OWNER">Store Owner</option>
                </select>
                <button 
                  onClick={() => setUserFilters({ name: '', email: '', address: '', role: '' })} 
                  className="btn btn-secondary"
                  style={{ padding: '0.6rem 1rem' }}
                >
                  Clear Filters
                </button>
              </div>
            </div>

            {/* Users Table */}
            <div className="table-container">
              {users.length === 0 ? (
                <div className="empty-state">
                  <Users className="empty-state-icon" />
                  <p>No users match the selected filters.</p>
                </div>
              ) : (
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th onClick={() => handleUserSort('name')} className="sort-header">
                        Full Name <ArrowUpDown size={14} />
                      </th>
                      <th onClick={() => handleUserSort('email')} className="sort-header">
                        Email Address <ArrowUpDown size={14} />
                      </th>
                      <th onClick={() => handleUserSort('address')} className="sort-header">
                        Address Location <ArrowUpDown size={14} />
                      </th>
                      <th onClick={() => handleUserSort('role')} className="sort-header">
                        System Role <ArrowUpDown size={14} />
                      </th>
                      <th onClick={() => handleUserSort('rating')} className="sort-header" style={{ textAlign: 'center' }}>
                        Store Rating <ArrowUpDown size={14} />
                      </th>
                      <th style={{ textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td style={{ fontWeight: 600, color: '#fff' }}>{user.name}</td>
                        <td>{user.email}</td>
                        <td style={{ maxWidth: '220px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={user.address}>
                          {user.address}
                        </td>
                        <td>
                          <span className={`badge ${
                            user.role === 'ADMIN' 
                              ? 'badge-admin' 
                              : user.role === 'STORE_OWNER' 
                                ? 'badge-owner' 
                                : 'badge-normal'
                          }`}>
                            {user.role.replace('_', ' ')}
                          </span>
                        </td>
                        <td>
                          {user.role === 'STORE_OWNER' ? (
                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                              {user.store_name ? (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.1rem' }}>
                                  <StarRating rating={user.rating || 0} />
                                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>({user.store_name})</span>
                                </div>
                              ) : (
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic' }}>No Store Associated</span>
                              )}
                            </div>
                          ) : (
                            <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>—</div>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                            <button 
                              onClick={() => setSelectedUserDetails(user)} 
                              className="btn btn-secondary"
                              style={{ padding: '0.35rem 0.6rem' }}
                              title="View User Details"
                            >
                              <Eye size={16} />
                            </button>
                            <button 
                              onClick={() => handleDeleteUser(user)} 
                              className={`btn btn-secondary ${user.id === currentUser?.id ? 'disabled' : 'btn-danger'}`}
                              disabled={user.id === currentUser?.id}
                              style={{ padding: '0.35rem 0.6rem', color: user.id === currentUser?.id ? 'var(--text-muted)' : 'var(--error-color)' }}
                              title={user.id === currentUser?.id ? "Cannot delete yourself" : "Delete User"}
                            >
                              <Trash2 size={16} />
                            </button>
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
      </main>

      {/* MODAL: ADD USER */}
      {showAddUserModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button onClick={() => { setShowAddUserModal(false); setUserFormErrors({}); }} className="modal-close">
              <X size={20} />
            </button>
            <div className="modal-header">
              <h3>Add New User Account</h3>
            </div>
            {errorMessage && (
              <div className="alert alert-error" style={{ margin: '0 2.25rem 1rem' }}>
                <span>{errorMessage}</span>
              </div>
            )}
            <form onSubmit={handleAddUserSubmit} noValidate>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Min 20 characters"
                    value={userForm.name}
                    onChange={(e) => setUserForm(prev => ({ ...prev, name: e.target.value }))}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                    {userFormErrors.name ? <span className="form-error">{userFormErrors.name}</span> : <span className="form-info">Must be 20-60 characters</span>}
                    <span style={{ color: 'var(--text-muted)' }}>{userForm.name.length}/60</span>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="user@example.com"
                    value={userForm.email}
                    onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
                  />
                  {userFormErrors.email && <span className="form-error">{userFormErrors.email}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="••••••••"
                    value={userForm.password}
                    onChange={(e) => setUserForm(prev => ({ ...prev, password: e.target.value }))}
                  />
                  {userFormErrors.password ? <span className="form-error">{userFormErrors.password}</span> : <span className="form-info">8-16 chars, 1 uppercase, 1 special char</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">System Role</label>
                  <select
                    className="filter-select"
                    style={{ width: '100%' }}
                    value={userForm.role}
                    onChange={(e) => setUserForm(prev => ({ ...prev, role: e.target.value }))}
                  >
                    <option value="NORMAL">Normal User</option>
                    <option value="ADMIN">System Administrator</option>
                    <option value="STORE_OWNER">Store Owner</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Residential Address</label>
                  <textarea
                    className="form-input"
                    rows={3}
                    placeholder="Max 400 characters"
                    value={userForm.address}
                    onChange={(e) => setUserForm(prev => ({ ...prev, address: e.target.value }))}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                    {userFormErrors.address ? <span className="form-error">{userFormErrors.address}</span> : <span className="form-info">Full address details</span>}
                    <span style={{ color: 'var(--text-muted)' }}>{userForm.address.length}/400</span>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => { setShowAddUserModal(false); setUserFormErrors({}); }} className="btn btn-secondary" disabled={isSubmitting}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD STORE */}
      {showAddStoreModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button onClick={() => { setShowAddStoreModal(false); setStoreFormErrors({}); }} className="modal-close">
              <X size={20} />
            </button>
            <div className="modal-header">
              <h3>Register New Store Listing</h3>
            </div>
            {errorMessage && (
              <div className="alert alert-error" style={{ margin: '0 2.25rem 1rem' }}>
                <span>{errorMessage}</span>
              </div>
            )}
            <form onSubmit={handleAddStoreSubmit} noValidate>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Store Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Min 20 characters"
                    value={storeForm.name}
                    onChange={(e) => setStoreForm(prev => ({ ...prev, name: e.target.value }))}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                    {storeFormErrors.name ? <span className="form-error">{storeFormErrors.name}</span> : <span className="form-info">Must be 20-60 characters</span>}
                    <span style={{ color: 'var(--text-muted)' }}>{storeForm.name.length}/60</span>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Store Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="store@example.com"
                    value={storeForm.email}
                    onChange={(e) => setStoreForm(prev => ({ ...prev, email: e.target.value }))}
                  />
                  {storeFormErrors.email && <span className="form-error">{storeFormErrors.email}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Assigned Store Owner (Optional)</label>
                  <select
                    className="filter-select"
                    style={{ width: '100%' }}
                    value={storeForm.ownerId}
                    onChange={(e) => setStoreForm(prev => ({ ...prev, ownerId: e.target.value }))}
                  >
                    <option value="">-- No Owner Assigned --</option>
                    {availableOwners.map(owner => (
                      <option key={owner.id} value={owner.id}>
                        {owner.name} ({owner.email})
                      </option>
                    ))}
                  </select>
                  <span className="form-info">Only shows Store Owners who do not currently own a store.</span>
                </div>

                <div className="form-group">
                  <label className="form-label">Store Location Address</label>
                  <textarea
                    className="form-input"
                    rows={3}
                    placeholder="Max 400 characters"
                    value={storeForm.address}
                    onChange={(e) => setStoreForm(prev => ({ ...prev, address: e.target.value }))}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                    {storeFormErrors.address ? <span className="form-error">{storeFormErrors.address}</span> : <span className="form-info">Store physical address</span>}
                    <span style={{ color: 'var(--text-muted)' }}>{storeForm.address.length}/400</span>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => { setShowAddStoreModal(false); setStoreFormErrors({}); }} className="btn btn-secondary" disabled={isSubmitting}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Store'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT STORE */}
      {showEditStoreModal && selectedStore && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button 
              onClick={() => { 
                setShowEditStoreModal(false); 
                setSelectedStore(null); 
                setStoreFormErrors({}); 
                setErrorMessage('');
              }} 
              className="modal-close"
            >
              <X size={20} />
            </button>
            <div className="modal-header">
              <h3>Edit Store: {selectedStore.name}</h3>
            </div>
            {errorMessage && (
              <div className="alert alert-error" style={{ margin: '0 2.25rem 1rem' }}>
                <span>{errorMessage}</span>
              </div>
            )}
            <form onSubmit={handleEditStoreSubmit} noValidate>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Store Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={storeForm.name}
                    onChange={(e) => setStoreForm(prev => ({ ...prev, name: e.target.value }))}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                    {storeFormErrors.name ? <span className="form-error">{storeFormErrors.name}</span> : <span className="form-info">20-60 characters</span>}
                    <span style={{ color: 'var(--text-muted)' }}>{storeForm.name.length}/60</span>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Store Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    value={storeForm.email}
                    onChange={(e) => setStoreForm(prev => ({ ...prev, email: e.target.value }))}
                  />
                  {storeFormErrors.email && <span className="form-error">{storeFormErrors.email}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Assigned Store Owner</label>
                  <select
                    className="filter-select"
                    style={{ width: '100%' }}
                    value={storeForm.ownerId}
                    onChange={(e) => setStoreForm(prev => ({ ...prev, ownerId: e.target.value }))}
                  >
                    <option value="">-- No Owner Assigned --</option>
                    {/* If current owner is not in availableOwners list, add it back for selection */}
                    {selectedStore.owner_id && !availableOwners.find(o => o.id === selectedStore.owner_id) && (
                      <option value={selectedStore.owner_id}>
                        Current Owner: {selectedStore.owner_name}
                      </option>
                    )}
                    {availableOwners.map(owner => (
                      <option key={owner.id} value={owner.id}>
                        {owner.name} ({owner.email})
                      </option>
                    ))}
                  </select>
                  <span className="form-info">Assign a registered Store Owner who doesn't yet have a store.</span>
                </div>

                <div className="form-group">
                  <label className="form-label">Store Location Address</label>
                  <textarea
                    className="form-input"
                    rows={3}
                    value={storeForm.address}
                    onChange={(e) => setStoreForm(prev => ({ ...prev, address: e.target.value }))}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                    {storeFormErrors.address ? <span className="form-error">{storeFormErrors.address}</span> : <span className="form-info">Max 400 characters</span>}
                    <span style={{ color: 'var(--text-muted)' }}>{storeForm.address.length}/400</span>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  onClick={() => { 
                    setShowEditStoreModal(false); 
                    setSelectedStore(null); 
                    setStoreFormErrors({}); 
                    setErrorMessage('');
                  }} 
                  className="btn btn-secondary" 
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Updating...' : 'Update Store'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VIEW USER DETAILS */}
      {selectedUserDetails && (
        <div className="modal-overlay" onClick={() => setSelectedUserDetails(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <button onClick={() => setSelectedUserDetails(null)} className="modal-close">
              <X size={20} />
            </button>
            <div className="modal-header">
              <h3>Account Details</h3>
            </div>
            <div className="modal-body">
              <div className="details-list">
                <div className="details-row">
                  <span className="details-label">User Name</span>
                  <span className="details-value">{selectedUserDetails.name}</span>
                </div>

                <div className="details-row">
                  <span className="details-label">Email Address</span>
                  <span className="details-value">{selectedUserDetails.email}</span>
                </div>

                <div className="details-row">
                  <span className="details-label">Residential Address</span>
                  <span className="details-value" style={{ textOverflow: 'clip', whiteSpace: 'normal' }}>
                    {selectedUserDetails.address}
                  </span>
                </div>

                <div className="details-row">
                  <span className="details-label">Account Role</span>
                  <span className="details-value">
                    <span className={`badge ${
                      selectedUserDetails.role === 'ADMIN' 
                        ? 'badge-admin' 
                        : selectedUserDetails.role === 'STORE_OWNER' 
                          ? 'badge-owner' 
                          : 'badge-normal'
                    }`}>
                      {selectedUserDetails.role.replace('_', ' ')}
                    </span>
                  </span>
                </div>

                {selectedUserDetails.role === 'STORE_OWNER' && (
                  <>
                    <div className="details-row">
                      <span className="details-label">Store Associated</span>
                      <span className="details-value">{selectedUserDetails.store_name || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>None</span>}</span>
                    </div>
                    {selectedUserDetails.store_name && (
                      <div className="details-row">
                        <span className="details-label">Store Rating</span>
                        <span className="details-value" style={{ display: 'inline-flex', alignItems: 'center' }}>
                          <StarRating rating={selectedUserDetails.rating || 0} />
                          <span style={{ marginLeft: '0.4rem', fontWeight: 600 }}>({selectedUserDetails.rating || 0}/5)</span>
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setSelectedUserDetails(null)} className="btn btn-primary">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
