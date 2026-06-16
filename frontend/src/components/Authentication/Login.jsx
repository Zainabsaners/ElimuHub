// Login.jsx (Cleaned & Optimized)
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { Loader2 } from 'lucide-react';

const schoolName = "ElimuHub";

const Login = () => {
  
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { user, login, error: authError } = useAuth();
  const navigate = useNavigate();

  // Helper function to redirect based on role
  const redirectByRole = (role) => {
    const roleRoutes = {
      'teacher': '/TeacherPortal',
      'accountant': '/FinancePortal',
      'registrar': '/RegisterPortal',
      'bursar': '/BursarPortal',
      'hr_manager': '/HrPortal',
      'system_admin': '/SystemAdminPortal',
      'principal': '/PrincipalPortal',
      'deputy_principal': '/DeputyPrincipalPortal',
      'director_studies': '/DirectorPortal',
      'student': '/StudentPortal',
      'parent': '/ParentPortal',
    };
    
    const route = roleRoutes[role] || '/Login';
    navigate(route);
  };

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      redirectByRole(user.role);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate]);

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    
    try {
      const result = await login(credentials.email, credentials.password);
      if (!result?.success) {
        // Error is captured by AuthContext and displayed via authError
        setIsLoggingIn(false);
      }
    } catch (error) {
      console.error("Login attempt failed:", error);
      setIsLoggingIn(false);
    }
  };

  return (
    
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/40 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-24 w-24 rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-slate-100 overflow-hidden bg-white">
            <img 
              src="/logo.jpeg" 
              alt="School Logo" 
              className="w-full h-full object-cover"
            />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight mb-1">{schoolName}</h2>
          <p className="text-indigo-600 text-xs font-semibold tracking-wider uppercase mb-6">Together We Succeed</p>
          
          {authError && (
            <div className="bg-amber-50 border border-amber-200 text-amber-900 px-4 py-3 rounded-xl mt-4 flex items-center text-sm text-left">
              <svg className="w-5 h-5 mr-2 text-amber-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{authError}</span>
            </div>
          )}
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-3">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={credentials.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-slate-800 text-sm"
                placeholder="Email"
                disabled={isLoggingIn}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-slate-800 text-sm"
                placeholder="••••••••"
                disabled={isLoggingIn}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full flex items-center justify-center py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm text-sm"
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> 
                Verifying Credentials...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center pt-6 border-t border-slate-100">
          <p className="text-xs text-slate-400 tracking-wide">
            © {new Date().getFullYear()} ElimuHub System Core. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;