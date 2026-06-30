import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'https://backend-roan-psi-19.vercel.app';
const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('hirestack_token'));

  useEffect(() => {
    const savedToken = localStorage.getItem('hirestack_token');
    if (savedToken) {
      setToken(savedToken);
      // Validate token by fetching profile
      axios.get(`${API_BASE}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${savedToken}` }
      })
        .then(res => {
          setUser(res.data.user);
        })
        .catch(() => {
          // Token invalid — clear it
          localStorage.removeItem('hirestack_token');
          setToken(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const res = await axios.post(`${API_BASE}/api/auth/login`, { email, password });
      const { user: userData, token: newToken } = res.data;
      setUser(userData);
      setToken(newToken);
      localStorage.setItem('hirestack_token', newToken);
      return true;
    } catch (err) {
      const message = err.response?.data?.error || 'Login failed';
      throw new Error(message);
    }
  };

  const register = async (name, email, password, company = '') => {
    try {
      const res = await axios.post(`${API_BASE}/api/auth/register`, { name, email, password, company });
      const { user: userData, token: newToken } = res.data;
      setUser(userData);
      setToken(newToken);
      localStorage.setItem('hirestack_token', newToken);
      return true;
    } catch (err) {
      const message = err.response?.data?.error || 'Registration failed';
      throw new Error(message);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('hirestack_token');
  };

  const updatePlan = (plan) => {
    if (user) {
      setUser({ ...user, subscription_tier: plan });
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updatePlan, token }}>
      {children}
    </AuthContext.Provider>
  );
};