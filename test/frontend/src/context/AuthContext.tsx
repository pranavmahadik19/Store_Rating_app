import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'NORMAL' | 'STORE_OWNER';
  address: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  signup: (signupData: any) => Promise<User>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Restore session on mount
    const savedToken = localStorage.getItem('store_rating_token');
    const savedUser = localStorage.getItem('store_rating_user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const response = await api.post('/auth/login', { email, password });
    const receivedToken = response.token!;
    const receivedUser = response.user! as User;

    localStorage.setItem('store_rating_token', receivedToken);
    localStorage.setItem('store_rating_user', JSON.stringify(receivedUser));

    setToken(receivedToken);
    setUser(receivedUser);

    return receivedUser;
  };

  const signup = async (signupData: any): Promise<User> => {
    const response = await api.post('/auth/signup', signupData);
    const receivedToken = response.token!;
    const receivedUser = response.user! as User;

    localStorage.setItem('store_rating_token', receivedToken);
    localStorage.setItem('store_rating_user', JSON.stringify(receivedUser));

    setToken(receivedToken);
    setUser(receivedUser);

    return receivedUser;
  };

  const logout = () => {
    localStorage.removeItem('store_rating_token');
    localStorage.removeItem('store_rating_user');
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        signup,
        logout,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
