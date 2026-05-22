import { createContext, useContext, useState, useEffect } from 'react';
import API from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')) || null; }
    catch { return null; }
  });
  const [loading, setLoading] = useState(false);

  // Persist user to localStorage
  useEffect(() => {
    if (user) localStorage.setItem('user', JSON.stringify(user));
    else localStorage.removeItem('user');
  }, [user]);

  const login = async (email, password) => {
    const { data } = await API.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    await API.post('/auth/logout').catch(() => {});
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const register = async (formData) => {
    const { data } = await API.post('/auth/register', formData);
    return data;
  };

  const verifyOTP = async (email, otp) => {
    const { data } = await API.post('/auth/verify-otp', { email, otp });
    if (data.token) {
      localStorage.setItem('token', data.token);
      setUser(data.user);
    }
    return data;
  };

  const forgotPassword = async (email) => {
    const { data } = await API.post('/auth/forgot-password', { email });
    return data;
  };

  const verifyForgotOTP = async (email, otp) => {
    const { data } = await API.post('/auth/verify-forgot-otp', { email, otp });
    return data;
  };

  const resetPassword = async (email, resetToken, newPassword) => {
    const { data } = await API.post('/auth/reset-password', { email, resetToken, newPassword });
    return data;
  };

  return (
    <AuthContext.Provider value={{ user, loading, setLoading, login, logout, register, verifyOTP, forgotPassword, verifyForgotOTP, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
