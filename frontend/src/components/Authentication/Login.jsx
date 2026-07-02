import React, { useState } from "react";
import { useNavigate , Link } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { Loader2 } from 'lucide-react';

const schoolName = "ElimuHub";

const Login = () => {
  
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { _user, login, error: authError } = useAuth();
  const navigate = useNavigate();

  const redirectByRole = (user) => {
    const roleRoutes = {
      'teacher': '/teacher',
      'accountant': '/FinancePortal',
      'registrar': '/RegisterPortal',
      'bursar': '/BursarPortal',
      'hr_manager': '/HrPortal',
      'system_admin': '/SystemAdminPortal',
      'principal': '/PrincipalPortal',
      'deputy_principal': '/DeputyPrincipalPortal',
      'director_studies': '/DirectorPortal',
      'student': '/students/dashboard',
      'parent': '/ParentPortal',
    };

    if (user && user.force_password_change) {
      navigate('/force-password-change');
      return;
    }

    const route = roleRoutes[user && user.role] || '/Login';
    navigate(route);
  };

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
      if (result.success) {
        redirectByRole(result.user);
      } else {
        setIsLoggingIn(false);
      }
    } catch {
      setIsLoggingIn(false);
    }
  };

  return (
    // Added dark:bg-gray-900 to the container
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-indigo-50/40 dark:from-gray-950 dark:to-gray-900 flex items-center justify-center p-4 transition-colors duration-300">
      {/* Added dark:bg-gray-800, dark:border-gray-700 */}
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-slate-100 dark:border-gray-700">
        
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-24 w-24 rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-slate-100 dark:border-gray-700 overflow-hidden bg-white">
            <img 
              src="/logo.jpeg" 
              alt="School Logo" 
              className="w-full h-full object-cover"
            />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-800 dark:text-white tracking-tight mb-1">{schoolName}</h2>
          <p className="text-indigo-600 dark:text-indigo-400 text-xs font-semibold tracking-wider uppercase mb-6">Your Gateway to Knowledge.</p>
          
          {authError && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 text-amber-900 dark:text-amber-200 px-4 py-3 rounded-xl mt-4 flex items-center text-sm text-left">
              <span>{authError}</span>
            </div>
          )}
        </div>

        <div className="mt-6">
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-1">
            Enter your credentials to login
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-3">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={credentials.email}
                onChange={handleChange}
                required
                // Added dark mode styles for inputs
                className="w-full px-4 py-2.5 border border-slate-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 transition text-slate-800 dark:text-white text-sm"
                placeholder="Email"
                disabled={isLoggingIn}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-1">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-slate-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 transition text-slate-800 dark:text-white text-sm"
                placeholder="••••••••"
                disabled={isLoggingIn}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full flex items-center justify-center py-3 bg-indigo-600 dark:bg-indigo-500 text-white font-medium rounded-xl hover:bg-indigo-700 dark:hover:bg-indigo-600 transition shadow-sm text-sm"
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
          <Link to="/forgot-password" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline mt-1 inline-block">
            Forgot Password?
          </Link>
        </form>

        {/* Footer */}
        <div className="text-center pt-6 border-t border-slate-100 dark:border-gray-700">
          <p className="text-xs text-slate-400 dark:text-gray-500 tracking-wide">
            © {new Date().getFullYear()} ElimuHub System Core. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;