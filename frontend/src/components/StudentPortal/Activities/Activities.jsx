import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../Authentication/AuthContext';
//import { useTheme } from "@/hooks/useTheme";
import { FiRefreshCw, FiClock, FiActivity, FiFileText, FiDollarSign, FiCalendar, FiBookOpen } from 'react-icons/fi';

const Activities = () => {
  const { authenticatedFetch } = useAuth();
  //const { theme } = useTheme();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

  const fetchActivities = useCallback(async (showToast = false) => {
    try {
      setError(null);
      if (!showToast) setLoading(true);
      const response = await authenticatedFetch(`${API_BASE}/api/students/activities/`);
      if (!response) throw new Error('No response');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result = await response.json();
      setActivities(result.data || []);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [authenticatedFetch, API_BASE]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchActivities(true);
  };

  const getIcon = (type) => {
    switch (type) {
      case 'assignment_submission': return <FiFileText className="text-blue-500" />;
      case 'fee_payment': return <FiDollarSign className="text-green-500" />;
      case 'attendance': return <FiCalendar className="text-yellow-500" />;
      case 'invoice_generated': return <FiBookOpen className="text-purple-500" />;
      default: return <FiActivity className="text-gray-500" />;
    }
  };

  if (loading) return <div className="p-10 text-center">Loading activities...</div>;
  if (error) return <div className="p-10 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="p-4 md:p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <FiActivity /> Recent Activities
        </h1>
        <button onClick={handleRefresh} disabled={refreshing} className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 disabled:opacity-50">
          <FiRefreshCw className={refreshing ? 'animate-spin' : ''} />
        </button>
      </div>
      <div className="space-y-3">
        {activities.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 p-8">No recent activities</div>
        ) : (
          activities.map((act, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="mt-1">{getIcon(act.type)}</div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800 dark:text-white">{act.title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{act.description}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 flex items-center gap-1">
                  <FiClock className="inline" /> {new Date(act.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Activities;