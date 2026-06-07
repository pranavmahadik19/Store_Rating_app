import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn, UserPlus } from 'lucide-react';

export const LoginSignup: React.FC = () => {
  const { login, signup } = useAuth();
  const [isLogin, setIsLogin] = useState(true);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');

  // UI States
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);

  // Client-side validations
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Email validation
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Must follow standard email validation rules';
    }

    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8 || password.length > 16) {
      newErrors.password = 'Password must be between 8 and 16 characters';
    } else if (!/[A-Z]/.test(password)) {
      newErrors.password = 'Password must include at least one uppercase letter';
    } else if (!/[^A-Za-z0-9]/.test(password)) {
      newErrors.password = 'Password must include at least one special character';
    }

    if (!isLogin) {
      // Name validation: 20 to 60 characters
      if (!name) {
        newErrors.name = 'Name is required';
      } else if (name.length < 20 || name.length > 60) {
        newErrors.name = 'Name must be between 20 and 60 characters';
      }

      // Address validation: Max 400 characters
      if (!address) {
        newErrors.address = 'Address is required';
      } else if (address.length > 400) {
        newErrors.address = 'Address must not exceed 400 characters';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    if (!validateForm()) return;

    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup({ name, email, address, password });
      }
    } catch (err: any) {
      console.error(err);
      if (err.errors && Array.isArray(err.errors)) {
        const backendErrors: { [key: string]: string } = {};
        err.errors.forEach((e: any) => {
          backendErrors[e.field] = e.message;
        });
        setErrors(backendErrors);
      } else {
        setSubmitError(err.message || 'Authentication failed. Please check your inputs.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMode = () => {
    setIsLogin(!isLogin);
    setEmail('');
    setPassword('');
    setName('');
    setAddress('');
    setErrors({});
    setSubmitError('');
  };

  return (
    <div className="auth-wrapper">
      <div className="card auth-card">
        <div className="auth-header">
          <h1>{isLogin ? 'Welcome Back' : 'Join Our Platform'}</h1>
          <p>{isLogin ? 'Log in to access your dashboard' : 'Create a normal user account'}</p>
        </div>

        {submitError && (
          <div className="alert alert-error">
            <span>{submitError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {!isLogin && (
            <>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Alexander Bartholomew Cunningham"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  {errors.name ? (
                    <span className="form-error">{errors.name}</span>
                  ) : (
                    <span className="form-info">Name must be 20-60 characters</span>
                  )}
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {name.length}/60
                  </span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Address</label>
                <textarea
                  className="form-input"
                  rows={3}
                  placeholder="Full Residential Address"
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    if (errors.address) setErrors((prev) => ({ ...prev, address: '' }));
                  }}
                  style={{ resize: 'vertical' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  {errors.address ? (
                    <span className="form-error">{errors.address}</span>
                  ) : (
                    <span className="form-info">Max 400 characters</span>
                  )}
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {address.length}/400
                  </span>
                </div>
              </div>
            </>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
              }}
            />
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
              }}
            />
            {errors.password ? (
              <span className="form-error">{errors.password}</span>
            ) : (
              <span className="form-info">
                8-16 chars, at least 1 uppercase and 1 special character
              </span>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1rem' }}
            disabled={loading}
          >
            {loading ? (
              'Authenticating...'
            ) : isLogin ? (
              <>
                <LogIn size={18} /> Log In
              </>
            ) : (
              <>
                <UserPlus size={18} /> Sign Up
              </>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
          </span>
          <button onClick={handleToggleMode} className="btn-link">
            {isLogin ? 'Sign up here' : 'Log in here'}
          </button>
        </div>
      </div>
    </div>
  );
};
