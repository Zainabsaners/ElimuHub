/* eslint-disable no-unused-vars */

/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  

  useEffect(() => {
    
    
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    
    
    if (token && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        
        setUser(userData);
      } catch (e) {
        console.error('AuthProvider - Error parsing stored user:', e);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    } else {
      console.log('AuthProvider - No stored credentials found');
    }
    
    setLoading(false);
    
  }, []);

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
      if (!userData.role) userData.role = 'registrar';
      
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

  const logout = () => {
    
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (token) {
      const tokenValue = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      headers['Authorization'] = tokenValue;
    }
    return headers;
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    getAuthHeaders,
    isAuthenticated: !!user,
  };

  

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
