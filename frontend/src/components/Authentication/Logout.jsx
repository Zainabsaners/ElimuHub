import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { CircularProgress, Box, Typography } from '@mui/material';

const Logout = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    const performLogout = async () => {
      try {
        // 1. Clear state and storage in the context
        logout(); 
        
        // 2. Immediate redirect to /Login
        // Use replace: true to prevent the user from going back to the dashboard
        navigate('/Login', { replace: true });
      } catch (err) {
        console.error("Logout error:", err);
        navigate('/Login');
      }
    };

    performLogout();
  }, [logout, navigate]);

  return (
    <Box 
      display="flex" 
      flexDirection="column"
      justifyContent="center" 
      alignItems="center" 
      minHeight="100vh"
      bgcolor="#f5f5f5"
    >
      {/* Updated to your brand Red (#ef4444) */}
      <CircularProgress sx={{ color: '#ef4444', mb: 2 }} />
      <Typography variant="h6" sx={{ color: '#b91c1c', fontWeight: 'bold' }}>
        Logging out...
      </Typography>
    </Box>
  );
};

export default Logout;