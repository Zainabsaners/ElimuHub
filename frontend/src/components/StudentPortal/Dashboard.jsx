import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiDollarSign, 
  FiBookOpen, 
  FiCalendar, 
  FiClock, 
  FiActivity,
  FiUser,
  FiBell,
  FiAlertCircle,
  FiTrendingUp,
  FiTrendingDown,
  FiCreditCard,
  FiRefreshCw,
  FiCheckCircle
} from 'react-icons/fi';
import { FaMoneyBillWave, FaGraduationCap } from 'react-icons/fa';
import { useAuth } from '../../components/Authentication/AuthContext';
import { useTheme } from "@/hooks/useTheme";
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

// ==================== SKELETON LOADER COMPONENTS ====================
const StatCardSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg animate-pulse">
    <div className="flex justify-between items-start">
      <div className="flex-1">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-2"></div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
      </div>
      <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
    </div>
  </div>
);

const ActivitySkeleton = () => (
  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg animate-pulse">
    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-full"></div>
    <div className="flex-1">
      <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4 mb-1"></div>
      <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/4"></div>
    </div>
  </div>
);

// ==================== STAT CARD COMPONENT ====================
const StatCard = ({ title, value, icon, color, subtitle, trend, loading, onClick }) => {
  if (loading) {
    return <StatCardSkeleton />;
  }

  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
    indigo: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400',
  };

  const borderColorClasses = {
    blue: 'border-l-4 border-blue-500',
    green: 'border-l-4 border-green-500',
    red: 'border-l-4 border-red-500',
    indigo: 'border-l-4 border-indigo-500',
    purple: 'border-l-4 border-purple-500',
    yellow: 'border-l-4 border-yellow-500',
  };

  const iconColor = color || 'blue';
  const iconContainerClass = colorClasses[iconColor] || colorClasses.blue;
  const borderClass = borderColorClasses[iconColor] || borderColorClasses.blue;

  // Safe value formatting
  let displayValue = 'N/A';
  if (value !== undefined && value !== null) {
    if (typeof value === 'number') {
      if (title.toLowerCase().includes('gpa')) {
        displayValue = value.toFixed(2);
      } else if (title.toLowerCase().includes('balance') || title.toLowerCase().includes('amount')) {
        displayValue = `KSh ${value.toLocaleString()}`;
      } else {
        displayValue = value;
      }
    } else {
      displayValue = value;
    }
  }

  return (
    <div 
      className={`bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ${borderClass} cursor-pointer hover:scale-[1.02]`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
      aria-label={`${title}: ${displayValue}`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{title}</p>
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white mt-1">
            {displayValue}
          </h3>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1 mt-1">
              {trend.type === 'up' ? (
                <FiTrendingUp className="text-green-500 text-xs" aria-hidden="true" />
              ) : trend.type === 'down' ? (
                <FiTrendingDown className="text-red-500 text-xs" aria-hidden="true" />
              ) : null}
              <span className={`text-xs ${trend.type === 'up' ? 'text-green-500' : trend.type === 'down' ? 'text-red-500' : 'text-gray-500'}`}>
                {trend.label}
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg shrink-0 ${iconContainerClass}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

// ==================== ACTIVITY ITEM COMPONENT ====================
const ActivityItem = ({ icon, message, time, type = 'default' }) => {
  const bgColors = {
    success: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    warning: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400',
    danger: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
    info: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    default: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400',
  };

  const bgClass = bgColors[type] || bgColors.default;

  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors duration-200 group">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 ${bgClass}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-700 dark:text-gray-300 truncate group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
          {message}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500">{time}</p>
      </div>
    </div>
  );
};

// ==================== DEADLINE ITEM COMPONENT ====================
const DeadlineItem = ({ title, date, daysLeft: propDaysLeft }) => {
  // Memoize daysLeft calculation to avoid recalculation on every render
  const daysLeft = useMemo(() => {
    if (propDaysLeft !== undefined) return propDaysLeft;
    const now = new Date();
    const deadlineDate = new Date(date);
    const diffTime = deadlineDate.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }, [date, propDaysLeft]);

  const isUrgent = daysLeft <= 3;
  const isNear = daysLeft <= 7;

  const urgencyColor = isUrgent 
    ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' 
    : isNear 
      ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
      : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400';

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors duration-200">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-800 dark:text-white text-sm truncate">{title}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(date).toLocaleDateString()}</p>
      </div>
      <span className={`text-xs px-3 py-1 rounded-full font-medium shrink-0 ${urgencyColor}`}>
        {daysLeft === 0 ? 'Today!' : `${daysLeft} day${daysLeft > 1 ? 's' : ''}`}
      </span>
    </div>
  );
};

// ==================== MAIN DASHBOARD COMPONENT ====================
const Dashboard = () => {
  const { authenticatedFetch, user } = useAuth();
  const { theme } = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const refreshTimeout = useRef(null);

  const fetchDashboard = useCallback(async (showToast = false) => {
  try {
    setError(null);
    if (!showToast) setLoading(true);
    
    const response = await authenticatedFetch(`${API_BASE}/api/students/dashboard/`);
    
    // ✅ Check if response exists before accessing .ok
    if (!response) {
      throw new Error('No response from server');
    }
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    setData(result);
    
    if (showToast) {
      toast.success('Dashboard updated!');
    }
  } catch (error) {
    console.error('Dashboard fetch error:', error);
    setError(error.message || 'Failed to load dashboard data');
      
      if (showToast) {
        toast.error('Failed to refresh dashboard. Please try again.', {
          duration: 4000,
          position: 'bottom-right',
        });
      }
      
      // Fallback data to prevent UI breakage
      setData({
        stats: {
          balance: 0,
          gpa: '0.00',
          attendance: 0,
          courses: 0,
          completed_courses: 0,
          total_credits: 0,
        },
        upcoming_deadlines: [],
        current_term: {
          term: 'N/A',
          academic_year: 'N/A',
          weeks_remaining: 0,
          total_weeks: 14,
        },
        financial_summary: {
          total_paid: 0,
          total_due: 0,
        },
        recent_activity: [],
        notifications: [],
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [authenticatedFetch]);

  useEffect(() => {
    fetchDashboard();
    
    // Cleanup timeout on unmount - copy ref value to a variable
    const timeoutId = refreshTimeout.current;
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [fetchDashboard]);

  const handleRefresh = useCallback(async () => {
    if (refreshing) return;
    setRefreshing(true);
    await fetchDashboard(true);
  }, [fetchDashboard, refreshing]);

  // Memoize filtered/sorted data to prevent unnecessary recalculations
  const sortedDeadlines = useMemo(() => {
    if (!data?.upcoming_deadlines?.length) return [];
    return [...data.upcoming_deadlines].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA - dateB;
    });
  }, [data?.upcoming_deadlines]);

  const recentActivity = useMemo(() => {
    if (!data?.recent_activity?.length) return [];
    return data.recent_activity.slice(0, 5);
  }, [data?.recent_activity]);

  const notifications = useMemo(() => {
    if (!data?.notifications?.length) return [];
    return data.notifications.slice(0, 3);
  }, [data?.notifications]);

  // Loading Skeleton
  if (loading) {
    return (
      <div className={`p-4 md:p-6 min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto">
          {/* Header Skeleton */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
            </div>
            <div className="mt-3 md:mt-0 flex items-center gap-3">
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-32 animate-pulse"></div>
            </div>
          </div>

          {/* Stats Grid Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>

          {/* Main Content Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4 animate-pulse"></div>
                {[1, 2, 3].map((i) => (
                  <ActivitySkeleton key={i} />
                ))}
              </div>
            </div>
            <div>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4 animate-pulse"></div>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg mb-2 animate-pulse"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className={`p-4 md:p-6 min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-8 text-center">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-red-700 dark:text-red-300 mb-2">
              Unable to Load Dashboard
            </h3>
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiRefreshCw className={refreshing ? 'animate-spin' : ''} />
              {refreshing ? 'Retrying...' : 'Try Again'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { stats, current_term, financial_summary } = data || {};

  return (
    <div className={`p-4 md:p-6 min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              Welcome back, {user?.first_name || 'Student'}! 👋
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base flex items-center gap-2">
              <span>{current_term?.term || 'Term 1'}</span>
              <span className="text-gray-300 dark:text-gray-600">•</span>
              <span>{current_term?.academic_year || '2025-2026'}</span>
            </p>
          </div>
          <div className="mt-3 md:mt-0 flex items-center gap-3 flex-wrap">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg shadow-md hover:shadow-lg transition text-sm border border-gray-200 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Refresh dashboard"
            >
              <FiRefreshCw className={refreshing ? 'animate-spin' : ''} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Weeks Remaining
              </span>
              <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full text-sm font-semibold">
                {current_term?.weeks_remaining || 6}/{current_term?.total_weeks || 14}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 mb-6">
          <StatCard
            title="Outstanding Balance"
            value={stats?.balance}
            icon={<FiDollarSign className="text-xl" />}
            color="red"
            subtitle={stats?.balance > 0 ? '⚠️ Pending payment' : '✅ All cleared'}
            trend={stats?.balance > 0 ? { type: 'down', label: 'Overdue' } : { type: 'up', label: 'Settled' }}
            onClick={() => window.location.href = '/student/finance'}
          />

          <StatCard
            title="Current GPA"
            value={stats?.gpa}
            icon={<FaGraduationCap className="text-xl" />}
            color="indigo"
            subtitle={`${stats?.completed_courses || 0} courses completed`}
          />

          <StatCard
            title="Attendance Rate"
            value={`${stats?.attendance || 0}%`}
            icon={<FiCalendar className="text-xl" />}
            color="green"
            subtitle="This term"
            trend={stats?.attendance >= 90 ? { type: 'up', label: 'Excellent' } : stats?.attendance >= 75 ? { type: 'up', label: 'Good' } : { type: 'down', label: 'Needs improvement' }}
          />

          <StatCard
            title="Current Courses"
            value={stats?.courses || 0}
            icon={<FiBookOpen className="text-xl" />}
            color="purple"
            subtitle={`${stats?.total_credits || 0} total credits`}
            onClick={() => window.location.href = '/student/academics'}
          />
        </div>

        {/* Financial Summary Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 mb-6 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <FiCheckCircle className="text-green-500" aria-hidden="true" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Paid:</span>
                <span className="font-semibold text-green-600 dark:text-green-400">
                  KSh {financial_summary?.total_paid?.toLocaleString() || '0'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FiDollarSign className="text-red-500" aria-hidden="true" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Due:</span>
                <span className="font-semibold text-red-600 dark:text-red-400">
                  KSh {financial_summary?.total_due?.toLocaleString() || '0'}
                </span>
              </div>
            </div>
            <Link
              to="/student/finance"
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium flex items-center gap-1"
            >
              View Full Statement →
            </Link>
          </div>
        </div>

        {/* Notifications Bar */}
        {notifications.length > 0 && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 rounded-lg flex items-start gap-3 mb-6" role="alert">
            <FiBell className="text-amber-600 dark:text-amber-400 text-xl mt-0.5 shrink-0" aria-hidden="true" />
            <div className="flex-1 min-w-0">
              <p className="text-amber-800 dark:text-amber-300 font-medium">
                You have {notifications.length} notification{notifications.length > 1 ? 's' : ''}
              </p>
              <ul className="mt-1 space-y-1">
                {notifications.map((notif, idx) => (
                  <li key={idx} className="text-sm text-amber-700 dark:text-amber-400 truncate">
                    • {notif.message}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity - Left Column */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <FiActivity aria-hidden="true" /> Recent Activity
              </h3>
              <Link
                to="/student/activity"
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium flex items-center gap-1"
              >
                View all →
              </Link>
            </div>
            {recentActivity.length > 0 ? (
              <div className="space-y-2">
                {recentActivity.map((activity, index) => (
                  <ActivityItem
                    key={index}
                    icon={activity.icon || '📝'}
                    message={activity.message}
                    time={activity.time}
                    type={activity.type}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <FiActivity className="text-3xl mx-auto mb-2 opacity-30" aria-hidden="true" />
                <p className="text-sm">No recent activity</p>
              </div>
            )}
          </div>

          {/* Upcoming Deadlines - Right Column */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5 border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-4">
              <FiClock aria-hidden="true" /> Upcoming Deadlines
            </h3>
            {sortedDeadlines.length > 0 ? (
              <div className="space-y-2">
                {sortedDeadlines.slice(0, 5).map((deadline, index) => (
                  <DeadlineItem
                    key={index}
                    title={deadline.title}
                    date={deadline.date}
                    daysLeft={deadline.days_left}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <FiClock className="text-3xl mx-auto mb-2 opacity-30" aria-hidden="true" />
                <p className="text-sm">No upcoming deadlines</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            to="/student/academics"
            className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 text-center group border border-gray-200 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-800"
          >
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center mx-auto group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/40 transition-all duration-200">
              <FiBookOpen className="text-indigo-600 dark:text-indigo-400 text-xl" aria-hidden="true" />
            </div>
            <p className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              Academics
            </p>
          </Link>

          <Link
            to="/student/finance"
            className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 text-center group border border-gray-200 dark:border-gray-700 hover:border-green-200 dark:hover:border-green-800"
          >
            <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center justify-center mx-auto group-hover:bg-green-100 dark:group-hover:bg-green-900/40 transition-all duration-200">
              <FaMoneyBillWave className="text-green-600 dark:text-green-400 text-xl" aria-hidden="true" />
            </div>
            <p className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
              Finance
            </p>
          </Link>

          <Link
            to="/student/attendance"
            className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 text-center group border border-gray-200 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800"
          >
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mx-auto group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 transition-all duration-200">
              <FiCalendar className="text-blue-600 dark:text-blue-400 text-xl" aria-hidden="true" />
            </div>
            <p className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              Attendance
            </p>
          </Link>

          <Link
            to="/student/profile"
            className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 text-center group border border-gray-200 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-800"
          >
            <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mx-auto group-hover:bg-purple-100 dark:group-hover:bg-purple-900/40 transition-all duration-200">
              <FiUser className="text-purple-600 dark:text-purple-400 text-xl" aria-hidden="true" />
            </div>
            <p className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
              Profile
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
