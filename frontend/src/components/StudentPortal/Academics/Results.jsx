import React, { useState, useEffect, useCallback } from 'react';
import { 
  FiTrendingUp, FiBookOpen, FiBarChart2, FiAward, FiDownload, 
  FiRefreshCw, FiChevronDown, FiChevronUp, FiClipboard, FiFileText,
  FiAlertCircle
} from 'react-icons/fi';
import { useAuth } from '../../Authentication/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import toast from 'react-hot-toast';

const Results = () => {
  const { authenticatedFetch } = useAuth();
  const { theme } = useTheme();
  const [data, setData] = useState({
    summaries: [],
    report_cards: [],
    assignments: [],
    current_term: {},
    summary_stats: {
      total_courses: 0,
      completed_courses: 0,
      latest_rating: null,
      has_summaries: false,
      has_report_cards: false,
      has_assignments: false,
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedSummaries, setExpandedSummaries] = useState(new Set());
  const [activeTab, setActiveTab] = useState('summaries');

  const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

  const fetchResults = useCallback(async (showToast = false) => {
    try {
      setError(null);
      if (!showToast) setLoading(true);
      
      console.log('Fetching academic data from:', `${API_BASE}/api/students/academics/`);
      
      const response = await authenticatedFetch(`${API_BASE}/api/students/academics/`);
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('Academic data received:', result);
      
      setData(result);
      if (showToast) {
        toast.success('Results updated successfully!');
      }
    } catch (error) {
      console.error('Results fetch error:', error);
      setError(error.message || 'Failed to load results');
      toast.error('Failed to load academic results');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [authenticatedFetch, API_BASE]);

  // ✅ useEffect to fetch data on component mount
  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const handleRefresh = useCallback(async () => {
    if (refreshing) return;
    setRefreshing(true);
    await fetchResults(true);
  }, [fetchResults, refreshing]);

  const toggleSummary = (id) => {
    setExpandedSummaries(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const getRatingColor = (rating) => {
    switch (rating) {
      case 'EE': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
      case 'ME': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
      case 'AE': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
      case 'BE': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
      default: return 'bg-gray-100 dark:bg-gray-700/30 text-gray-700 dark:text-gray-400';
    }
  };

  const getRatingLabel = (rating) => {
    switch (rating) {
      case 'EE': return 'Exceeding Expectations';
      case 'ME': return 'Meeting Expectations';
      case 'AE': return 'Approaching Expectations';
      case 'BE': return 'Below Expectations';
      default: return 'Not Rated';
    }
  };

  const EmptyState = ({ icon, title, message }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center border border-gray-200 dark:border-gray-700">
      <div className="text-5xl mb-4 opacity-30">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">{title}</h3>
      <p className="text-gray-500 dark:text-gray-400">{message}</p>
    </div>
  );

  // Error State
  if (error) {
    return (
      <div className={`p-4 md:p-6 min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-8 text-center">
            <FiAlertCircle className="text-red-500 text-5xl mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-red-700 dark:text-red-300 mb-2">Unable to Load Results</h3>
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

  // Loading State
  if (loading) {
    return (
      <div className={`p-4 md:p-6 min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                </div>
              ))}
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4"></div>
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg mb-2">
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4 mb-1"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { summaries, report_cards, assignments, current_term, summary_stats } = data;

  // Tab content rendering
  const renderTabContent = () => {
    switch (activeTab) {
      case 'summaries':
        return (
          <div>
            {summary_stats.has_summaries ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {summaries.map((summary) => (
                  <div
                    key={summary.id}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-xl transition"
                  >
                    <div
                      className="px-5 py-4 cursor-pointer flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/30 transition"
                      onClick={() => toggleSummary(summary.id)}
                    >
                      <div>
                        <p className="font-medium text-gray-800 dark:text-white">
                          {summary.learning_area_name || 'Learning Area'}
                        </p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRatingColor(summary.final_rating)}`}>
                            {summary.final_rating || 'NR'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {summary.rating_label || getRatingLabel(summary.final_rating)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            {Number(summary.final_internal_value)?.toFixed(2) || 'N/A'}
                          </p>
                        </div>
                        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                          {expandedSummaries.has(summary.id) ? <FiChevronUp /> : <FiChevronDown />}
                        </button>
                      </div>
                    </div>
                    {expandedSummaries.has(summary.id) && (
                      <div className="px-5 py-4 bg-gray-50 dark:bg-gray-700/30 border-t border-gray-200 dark:border-gray-700">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Progression</p>
                            <p className="font-medium text-gray-700 dark:text-gray-300">
                              {summary.progression_status || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Term</p>
                            <p className="font-medium text-gray-700 dark:text-gray-300">
                              {summary.term_name || 'N/A'}
                            </p>
                          </div>
                        </div>
                        {summary.teacher_comment && (
                          <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded-lg">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Teacher's Comment</p>
                            <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{summary.teacher_comment}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState 
                icon={<FiClipboard />}
                title="No Results Yet"
                message="You don't have any termly results recorded yet. Check back after assessments are completed."
              />
            )}
          </div>
        );

      case 'report_cards':
        return (
          <div>
            {summary_stats.has_report_cards ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {report_cards.map((report) => (
                  <div
                    key={report.id}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 dark:text-white truncate">
                          {report.report_type || 'Report Card'}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {report.academic_year} - {report.term}
                        </p>
                        <span className="inline-block mt-2 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
                          Published
                        </span>
                      </div>
                      <button className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition">
                        <FiDownload className="text-lg" />
                      </button>
                    </div>
                    {report.teacher_remarks && (
                      <p className="mt-3 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                        {report.teacher_remarks}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState 
                icon={<FiFileText />}
                title="No Report Cards"
                message="No published report cards are available for you yet. They will appear here once released by your teachers."
              />
            )}
          </div>
        );

      case 'assignments':
        return (
          <div>
            {summary_stats.has_assignments ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {assignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg flex-shrink-0">
                        <FiBookOpen className="text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 dark:text-white truncate">
                          {assignment.content_title}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {assignment.course_code} - {assignment.course_name}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            assignment.status === 'Upcoming' 
                              ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                              : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          }`}>
                            {assignment.status || 'Published'}
                          </span>
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            {new Date(assignment.publish_date || assignment.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState 
                icon={<FiBookOpen />}
                title="No Assignments"
                message="You don't have any assignments currently. Check back later or contact your teachers."
              />
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`p-4 md:p-6 min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <FiTrendingUp className="text-indigo-500" />
              Academic Results
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {current_term?.term} • {current_term?.academic_year}
            </p>
          </div>
          <div className="mt-3 md:mt-0 flex items-center gap-3">
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

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg border-l-4 border-indigo-500">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Courses</p>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
              {summary_stats.total_courses || 0}
            </h3>
          </div>
          <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg border-l-4 border-green-500">
            <p className="text-sm text-gray-500 dark:text-gray-400">Completed</p>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
              {summary_stats.completed_courses || 0}
            </h3>
          </div>
          <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg border-l-4 border-yellow-500">
            <p className="text-sm text-gray-500 dark:text-gray-400">Latest Rating</p>
            <h3 className={`text-2xl font-bold ${getRatingColor(summary_stats.latest_rating)}`}>
              {summary_stats.latest_rating || 'N/A'}
            </h3>
          </div>
          <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg border-l-4 border-purple-500">
            <p className="text-sm text-gray-500 dark:text-gray-400">Assignments</p>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
              {assignments.length || 0}
            </h3>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('summaries')}
            className={`px-4 py-2 text-sm font-medium transition ${
              activeTab === 'summaries'
                ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <span className="flex items-center gap-2">
              <FiBarChart2 /> Termly Results
            </span>
          </button>
          <button
            onClick={() => setActiveTab('report_cards')}
            className={`px-4 py-2 text-sm font-medium transition ${
              activeTab === 'report_cards'
                ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <span className="flex items-center gap-2">
              <FiAward /> Report Cards
            </span>
          </button>
          <button
            onClick={() => setActiveTab('assignments')}
            className={`px-4 py-2 text-sm font-medium transition ${
              activeTab === 'assignments'
                ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <span className="flex items-center gap-2">
              <FiClipboard /> Assignments
            </span>
          </button>
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </div>
    </div>
  );
};

export default Results;
