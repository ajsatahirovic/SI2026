import { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    setUser(data.user);
    return data;
  };

  const register = async (userData) => {
    const data = await authService.register(userData);
    return data;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const isAuthenticated = () => {
    return user !== null;
  };

  const hasRole = (role) => {
    return user?.role === role;
  };

  const isGuest = () => {
    return !user;
  };

  const isUser = () => {
    return user?.role === 'User';
  };

  const isSeller = () => {
    return user?.role === 'Seller';
  };

  const isAdmin = () => {
    return user?.role === 'Admin';
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated,
    hasRole,
    isGuest,
    isUser,
    isSeller,
    isAdmin
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
