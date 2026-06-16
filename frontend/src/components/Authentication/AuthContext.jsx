/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
// context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
//import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
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

  //const navigate = useNavigate();

  // Initialize auth from localStorage (unchanged)
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (token && storedUser) {
        try {
          // Make sure token has Bearer prefix
          const tokenValue = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
          
          const response = await fetch(`${API_BASE_URL}/api/auth/validate-token/`, {
            headers: { 
              'Authorization': tokenValue,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            setUser(data.user);
          } else {
            logout();
          }
        } catch (err) {
          
          logout();
        }
      }
      setLoading(false);
    };
    initializeAuth();
  }, []);

  // Auto refresh token (unchanged)
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      if (user) refreshToken();
    }, 55 * 60 * 1000);
    return () => clearInterval(refreshInterval);
  }, [user]);

  const login = async (email, password) => {
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/login/`, {
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
          // Check for specific error formats
          if (data.error) {
            throw new Error(data.error);
          }
          if (data.detail) {
            throw new Error(data.detail);
          }
          if (data.non_field_errors) {
            throw new Error(data.non_field_errors[0]);
          }
          if (data.email) {
            throw new Error(data.email[0]);
          }
          if (data.password) {
            throw new Error(data.password[0]);
          }
          throw new Error(`Login failed (${response.status})`);
        }
        
        // Extract data
        const token = data.access || data.token || data.access_token;
        const refresh_token = data.refresh || data.refresh_token;
        let userData = data.user || {};
        
        if (!token) {
          throw new Error('Auntentication Error');
        }
        
        // Ensure user data has required fields
        if (!userData.email) {
          userData.email = email;
        }
        if (!userData.role) {
          userData.role = 'user'; // Default role
        }
        
        // Save to localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('refresh_token', refresh_token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        if (data.session_id) {
          localStorage.setItem('session_id', data.session_id);
        }
        
        setUser(userData);
        return { success: true, user: userData };
        
      } catch (err) {
        
        const errorMessage = err.message || 'Login failed. Please try again.';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
  };

  const logout = async () => {
    // 1. Fire the backend logout call
    
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refresh_token');
    
    fetch(`${API_BASE_URL}/api/auth/logout/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    }).catch(console.error);
    
    // 2. IMMEDIATELY clear the state so redirect logic doesn't see a user
    localStorage.clear();
    setUser(null);
   // navigate('/Login'); // Redirect to login page after logout
  };

  const refreshToken = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) return logout();
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/refresh-token/`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
      
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token || data.access);
      } else {
        logout();
      }
    } catch (err) {
      
      logout();
    }
  };
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    
    if (token) {
      // Make sure token has Bearer prefix
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
