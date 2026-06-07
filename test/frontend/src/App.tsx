import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginSignup } from './pages/LoginSignup';
import { AdminDashboard } from './pages/AdminDashboard';
import { NormalUserDashboard } from './pages/NormalUserDashboard';
import { StoreOwnerDashboard } from './pages/StoreOwnerDashboard';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-secondary)'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid var(--border-color)',
          borderTopColor: 'var(--primary)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '1rem'
        }} />
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
        <span>Restoring your session...</span>
      </div>
    );
  }

  // Guest view: Show combined login / signup
  if (!user) {
    return <LoginSignup />;
  }

  // Authenticated views based on Roles
  switch (user.role) {
    case 'ADMIN':
      return <AdminDashboard />;
    case 'STORE_OWNER':
      return <StoreOwnerDashboard />;
    case 'NORMAL':
    default:
      return <NormalUserDashboard />;
  }
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
