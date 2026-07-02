/* eslint-disable no-unused-vars */
/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  }, [navigate]);

  useEffect(() => {
    const validateSession = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (token && storedUser) {
        try {
          const response = await fetch(`${API_BASE_URL}/api/auth/validate-token/`, {
            method: 'GET',
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            // ✅ FIX: Update the state with the server-verified user
            setUser(data.user); 
          } else {
            logout(); // Clears storage and state
          }
        } catch (e) {
          logout();
        }
      }
      setLoading(false);
    };

    validateSession();
  }, [logout]);

  const login = async (email, password) => {
    setError(null);
    try {
      const url = `${API_BASE_URL}/api/auth/login/`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, password }),
      });
      
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error(`Invalid response: ${text}`);
      }
      
      if (!response.ok) {
        if (data.error) throw new Error(data.error);
        if (data.detail) throw new Error(data.detail);
        if (data.non_field_errors) throw new Error(data.non_field_errors[0]);
        if (data.email) throw new Error(data.email[0]);
        if (data.password) throw new Error(data.password[0]);
        throw new Error(`Login failed (${response.status})`);
      }
      
      const token = data.access || data.token || data.access_token;
      let userData = data.user || {};
      
      if (!token) {
        throw new Error('Authentication Error - No token received');
      }
      
      if (!userData.email) userData.email = email;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      
      return { success: true, user: userData };
      
    } catch (err) {
      console.error('AuthProvider - Login error:', err);
      const errorMessage = err.message || 'Login failed. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const authenticatedFetch = useCallback(async (url, options = {}) => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.warn('No token found, redirecting to login');
      navigate('/login');
      return;
    }
    
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    };
    
    // Only set Content-Type if it's not FormData
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }
    
    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });
      
      // Handle 401 - Token expired
      if (response.status === 401) {
        console.warn('Token expired, logging out');
        logout();
        return;
      }
      
      return response;
    } catch (error) {
      console.error('Authenticated fetch error:', error);
      throw error;
    }
  }, [navigate, logout]);

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }, []);

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    getAuthHeaders,
    authenticatedFetch,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
