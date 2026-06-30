import React, { useState, useEffect, useCallback } from 'react';
import { 
  FiFileText, FiRefreshCw, FiCalendar, FiClock, FiUser,
  FiCheckCircle, FiAlertCircle, FiDownload, FiEye,
  FiBookOpen, FiFilter
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Authentication/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import toast from 'react-hot-toast';

const Assignments = () => {
  const { authenticatedFetch } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');

  const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

  const fetchAssignments = useCallback(async (showToast = false) => {
    try {
      setError(null);
      if (!showToast) setLoading(true);
      
      const url = `${API_BASE}/api/students/assignments/`;
      console.log('Fetching assignments from:', url);
      
      const response = await authenticatedFetch(url);
      
      if (!response) {
        throw new Error('No response from server');
      }
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('Assignments data:', result);
      
      setAssignments(result.data || []);
      
      if (showToast) {
        toast.success('Assignments updated!');
      }
    } catch (error) {
      console.error('Assignments fetch error:', error);
      setError(error.message || 'Failed to load assignments');
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [authenticatedFetch, API_BASE]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const handleRefresh = useCallback(async () => {
    if (refreshing) return;
    setRefreshing(true);
    await fetchAssignments(true);
  }, [fetchAssignments, refreshing]);

  const handleView = (assignmentId) => {
    navigate(`/student/academics/assignments/${assignmentId}`);
  };

  const filteredAssignments = assignments.filter(assignment => {
    if (filter === 'all') return true;
    if (filter === 'pending') return assignment.submission_status === 'Not Submitted';
    if (filter === 'submitted') return assignment.submission_status === 'Submitted' || assignment.submission_status === 'Graded';
    return true;
  });

  const getStatusBadge = (assignment) => {
    if (assignment.submission_status === 'Graded') {
      return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
    }
    if (assignment.submission_status === 'Submitted') {
      return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
    }
    if (assignment.submission_status === 'Late') {
      return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
    }
    return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
  };

  const getStatusText = (assignment) => {
    if (assignment.submission_status === 'Graded') {
      return '✅ Graded';
    }
    if (assignment.submission_status === 'Submitted') {
      return 'Submitted';
    }
    if (assignment.submission_status === 'Late') {
      return '⏰ Late';
    }
    return '⏳ Pending';
  };

  if (loading) {
    return (
      <div className={`p-4 md:p-6 min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-3"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 md:p-6 min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-8 text-center">
            <FiFileText className="text-red-500 text-5xl mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-red-700 dark:text-red-300 mb-2">Unable to Load Assignments</h3>
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
            >
              <FiRefreshCw className={refreshing ? 'animate-spin' : ''} />
              {refreshing ? 'Retrying...' : 'Try Again'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const stats = {
    total: assignments.length,
    pending: assignments.filter(a => a.submission_status === 'Not Submitted').length,
    submitted: assignments.filter(a => a.submission_status === 'Submitted' || a.submission_status === 'Graded').length,
  };

  return (
    <div className={`p-4 md:p-6 min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <FiFileText className="text-indigo-500" />
              Assignments
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              View and submit your course assignments
            </p>
          </div>
          <div className="mt-3 md:mt-0">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg shadow-md hover:shadow-lg transition text-sm border border-gray-200 dark:border-gray-700 disabled:opacity-50"
            >
              <FiRefreshCw className={refreshing ? 'animate-spin' : ''} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg border-l-4 border-indigo-500">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{stats.total}</h3>
          </div>
          <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg border-l-4 border-yellow-500">
            <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{stats.pending}</h3>
          </div>
          <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg border-l-4 border-green-500">
            <p className="text-sm text-gray-500 dark:text-gray-400">Submitted</p>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{stats.submitted}</h3>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === 'pending'
                ? 'bg-yellow-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('submitted')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === 'submitted'
                ? 'bg-green-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Submitted
          </button>
        </div>

        {/* Assignments List */}
        {filteredAssignments.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center border border-gray-200 dark:border-gray-700">
            <FiFileText className="text-5xl mx-auto mb-4 opacity-30" />
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No Assignments</h3>
            <p className="text-gray-500 dark:text-gray-400">
              {filter === 'all' 
                ? 'You have no assignments at the moment.' 
                : filter === 'pending' 
                ? 'All assignments have been submitted! 🎉' 
                : 'No submitted assignments found.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAssignments.map((assignment) => (
              <div
                key={assignment.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-xl transition"
              >
                <div className="p-5">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <FiFileText className="text-indigo-500 flex-shrink-0" />
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white truncate">
                          {assignment.title}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {assignment.course_code} - {assignment.course_title}
                      </p>
                      {assignment.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                          {assignment.description}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <FiUser className="text-xs" />
                          {assignment.teacher || 'TBA'}
                        </span>
                        <span className="flex items-center gap-1">
                          <FiCalendar className="text-xs" />
                          Posted: {new Date(assignment.publish_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-start md:items-end gap-2">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(assignment)}`}>
                        {getStatusText(assignment)}
                      </span>
                      <button
                        onClick={() => handleView(assignment.id)}
                        className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition"
                      >
                        <FiEye /> View
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Assignments;
