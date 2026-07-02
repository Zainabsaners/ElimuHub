import React, { useState } from 'react';
import { FiUser, FiArrowLeft, FiCheckCircle, FiAlertCircle, FiClock } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
  const [admissionNo, setAdmissionNo] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [_success, setSuccess] = useState('');

  const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_BASE}/api/auth/request-reset/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ admission_no: admissionNo }),
      });

      const data = await response.json();

      if (data.success) {
        setSubmitted(true);
        setSuccess(data.message);
      } else {
        setError(data.error || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('Password reset request error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 transition-colors duration-300">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiCheckCircle className="text-green-600 dark:text-green-400 text-4xl" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Request Sent!</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Your password reset request has been sent to the administrator.
            </p>
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4 mb-6 text-sm text-gray-500 dark:text-gray-400 text-left space-y-2">
              <p>📋 <strong>Admission Number:</strong> {admissionNo}</p>
              <p>⏳ <strong>Status:</strong> Pending Approval</p>
              <p>📌 The administrator will review your request and generate a temporary password.</p>
              <p className="text-xs text-gray-400 mt-2">You will be notified when your request is processed.</p>
            </div>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              <FiArrowLeft /> Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 transition-colors duration-300">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiUser className="text-indigo-600 dark:text-indigo-400 text-3xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Forgot Password?</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Enter your admission number and we'll send a reset request to the administrator.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
            <FiAlertCircle className="shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Admission Number
            </label>
            <input
              type="text"
              value={admissionNo}
              onChange={(e) => setAdmissionNo(e.target.value.toUpperCase())}
              className="w-full p-3 bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition uppercase"
              placeholder="ADM-202606-1"
              required
            />
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Enter your admission number (e.g., ADM-202606-1)
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Submitting...' : 'Request Reset'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/login" className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm inline-flex items-center gap-1">
            <FiArrowLeft /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
