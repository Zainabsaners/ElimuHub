import React, { useState, useEffect, useCallback } from 'react';
import { FiUsers, FiBookOpen, FiCalendar, FiActivity, FiRefreshCw, FiChevronRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useAuth } from '../Authentication/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const TeacherDashboard = () => {
  const { authenticatedFetch } = useAuth();
  const { theme } = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

  const fetchData = useCallback(async (showToast = false) => {
    try {
      if (!showToast) setLoading(true);
      const response = await authenticatedFetch(`${API_BASE}/api/teacher/dashboard/`);
      if (!response) throw new Error('No response');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result = await response.json();
      setData(result.data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [authenticatedFetch, API_BASE]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (error) return <div className="p-10 text-center text-red-500">Error: {error}</div>;

  const { teacher, stats, class_stats, recent_activities } = data || {};

  return (
    <div className={`p-4 md:p-6 min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
            Welcome, {teacher?.name || 'Teacher'}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400">{teacher?.email}</p>
        </div>
        <button onClick={() => { setRefreshing(true); fetchData(true); }} disabled={refreshing} className="p-2 bg-white dark:bg-gray-800 rounded-full shadow hover:shadow-md transition disabled:opacity-50">
          <FiRefreshCw className={refreshing ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg border-l-4 border-indigo-500">
          <p className="text-sm text-gray-500 dark:text-gray-400">My Classes</p>
          <h3 className="text-2xl font-bold">{stats?.total_classes || 0}</h3>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg border-l-4 border-green-500">
          <p className="text-sm text-gray-500 dark:text-gray-400">Students</p>
          <h3 className="text-2xl font-bold">{stats?.total_students || 0}</h3>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg border-l-4 border-purple-500">
          <p className="text-sm text-gray-500 dark:text-gray-400">Subjects</p>
          <h3 className="text-2xl font-bold">{stats?.total_subjects || 0}</h3>
        </div>
      </div>

      {/* Class Stats */}
      <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">My Classes</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {class_stats?.map((cls) => (
          <Link key={cls.class_id} to={`/teacher/classes/${cls.class_id}`} className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{cls.class_name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{cls.subjects?.join(', ')}</p>
              </div>
              <FiChevronRight className="text-gray-400 mt-1" />
            </div>
            <div className="flex gap-4 mt-3 text-sm">
              <span className="flex items-center gap-1"><FiUsers /> {cls.student_count}</span>
              <span className="flex items-center gap-1"><FiCalendar /> Present: {cls.today_attendance}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Activities */}
      <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">Recent Activities</h2>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border border-gray-200 dark:border-gray-700">
        {recent_activities?.length > 0 ? (
          recent_activities.map((act, idx) => (
            <div key={idx} className="flex items-center gap-3 p-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
              <FiActivity className="text-indigo-500" />
              <div className="flex-1">
                <p className="text-sm text-gray-700 dark:text-gray-300">{act.title}</p>
                <p className="text-xs text-gray-400">{new Date(act.time).toLocaleString()}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No recent activities</p>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;
