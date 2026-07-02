
import React, { useState, useEffect, useCallback } from 'react';
import { 
  FiCalendar, FiRefreshCw, FiCheckCircle, FiXCircle, 
  FiClock, FiAlertCircle, FiBarChart2, FiFilter,
  FiChevronLeft, FiChevronRight, FiInfo, FiDownload,
  FiTrendingUp, FiTrendingDown, FiMinusCircle
} from 'react-icons/fi';
import { useAuth } from '../Authentication/AuthContext';
import { useTheme } from "@/hooks/useTheme";
import toast from 'react-hot-toast';

const Attendance = () => {
  const { authenticatedFetch } = useAuth();
  const { theme } = useTheme();
  const [attendanceData, setAttendanceData] = useState({
    records: [],
    summary: {
      total: 0,
      present: 0,
      absent: 0,
      late: 0,
      excused: 0,
      attendance_percentage: 0,
    },
    chart_data: [],
    recent_attendance: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');
  //const [view, setView] = useState('table'); // 'table' or 'chart'

  const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

  const fetchAttendance = useCallback(async (showToast = false) => {
    try {
      setError(null);
      if (!showToast) setLoading(true);
      
      const url = `${API_BASE}/api/students/attendance/`;
      console.log('Fetching attendance from:', url);
      
      const response = await authenticatedFetch(url);
      
      if (!response) {
        throw new Error('No response from server');
      }
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('Attendance data:', result);
      
      setAttendanceData(result.data);
      
      if (showToast) {
        toast.success('Attendance updated!');
      }
    } catch (error) {
      console.error('Attendance fetch error:', error);
      setError(error.message || 'Failed to load attendance');
      toast.error('Failed to load attendance');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [authenticatedFetch, API_BASE]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const handleRefresh = useCallback(async () => {
    if (refreshing) return;
    setRefreshing(true);
    await fetchAttendance(true);
  }, [fetchAttendance, refreshing]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Present': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
      case 'Absent': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
      case 'Late': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
      case 'Excused': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
      case 'Half-day': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400';
      default: return 'bg-gray-100 dark:bg-gray-700/30 text-gray-700 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Present': return <FiCheckCircle className="text-green-500" />;
      case 'Absent': return <FiXCircle className="text-red-500" />;
      case 'Late': return <FiClock className="text-yellow-500" />;
      case 'Excused': return <FiCheckCircle className="text-blue-500" />;
      default: return <FiMinusCircle className="text-gray-500" />;
    }
  };

  const getFilteredRecords = () => {
    if (filter === 'all') return attendanceData.records;
    return attendanceData.records.filter(r => r.status === filter);
  };

  const filteredRecords = getFilteredRecords();
  const { summary } = attendanceData;

  if (loading) {
    return (
      <div className={`p-4 md:p-6 min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4"></div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                </div>
              ))}
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4"></div>
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex items-center gap-3 p-3 mb-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
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

  if (error) {
    return (
      <div className={`p-4 md:p-6 min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-8 text-center">
            <FiCalendar className="text-red-500 text-5xl mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-red-700 dark:text-red-300 mb-2">Unable to Load Attendance</h3>
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

  return (
    <div className={`p-4 md:p-6 min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <FiCalendar className="text-indigo-500" />
              Attendance
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              View your attendance records and statistics
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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border-l-4 border-indigo-500">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{summary.total}</h3>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border-l-4 border-green-500">
            <p className="text-sm text-gray-500 dark:text-gray-400">Present</p>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{summary.present}</h3>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border-l-4 border-red-500">
            <p className="text-sm text-gray-500 dark:text-gray-400">Absent</p>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{summary.absent}</h3>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border-l-4 border-yellow-500">
            <p className="text-sm text-gray-500 dark:text-gray-400">Late</p>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{summary.late}</h3>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border-l-4 border-blue-500">
            <p className="text-sm text-gray-500 dark:text-gray-400">Rate</p>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{summary.attendance_percentage}%</h3>
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
            onClick={() => setFilter('Present')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === 'Present'
                ? 'bg-green-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Present
          </button>
          <button
            onClick={() => setFilter('Absent')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === 'Absent'
                ? 'bg-red-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Absent
          </button>
          <button
            onClick={() => setFilter('Late')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === 'Late'
                ? 'bg-yellow-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Late
          </button>
          <button
            onClick={() => setFilter('Excused')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === 'Excused'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Excused
          </button>
        </div>

        {/* Attendance Records Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <FiBarChart2 />
              Attendance Records
            </h2>
            <span className="text-sm text-gray-500">{filteredRecords.length} records</span>
          </div>

          {filteredRecords.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <FiCalendar className="text-4xl mx-auto mb-3 opacity-30" />
              <p>No attendance records found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/30">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Class</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Subject</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Time</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                      <td className="px-6 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {new Date(record.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {record.class_name}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {record.subject}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {record.start_time ? record.start_time.slice(0, 5) : 'N/A'}
                      </td>
                      <td className="px-6 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                          {getStatusIcon(record.status)}
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Attendance;
