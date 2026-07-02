
import React, { useState, useEffect, useCallback } from 'react';
import { 
  FiClock, FiRefreshCw, FiCalendar, FiUser, FiMapPin,
  FiBookOpen, FiChevronLeft, FiChevronRight, FiInfo,
  FiSun, FiSunrise, FiSunset, FiMoon
} from 'react-icons/fi';
import { useAuth } from '../Authentication/AuthContext';
import { useTheme } from "@/hooks/useTheme";
import toast from 'react-hot-toast';

const Timetable = () => {
  const { authenticatedFetch } = useAuth();
  const { theme } = useTheme();
  const [timetableData, setTimetableData] = useState({
    timetable: [],
    max_periods: 8,
    class_name: '',
    academic_year: '',
    term: '',
    student_name: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [currentDay, _setCurrentDay] = useState(new Date().getDay());
 // const [selectedDay, setSelectedDay] = useState(null);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

  const fetchTimetable = useCallback(async (showToast = false) => {
    try {
      setError(null);
      if (!showToast) setLoading(true);
      
      const url = `${API_BASE}/api/students/timetable/`;
      console.log('Fetching timetable from:', url);
      
      const response = await authenticatedFetch(url);
      
      if (!response) {
        throw new Error('No response from server');
      }
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('Timetable data:', result);
      
      setTimetableData(result.data);
      
      if (showToast) {
        toast.success('Timetable updated!');
      }
    } catch (error) {
      console.error('Timetable fetch error:', error);
      setError(error.message || 'Failed to load timetable');
      toast.error('Failed to load timetable');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [authenticatedFetch, API_BASE]);

  useEffect(() => {
    fetchTimetable();
  }, [fetchTimetable]);

  const handleRefresh = useCallback(async () => {
    if (refreshing) return;
    setRefreshing(true);
    await fetchTimetable(true);
  }, [fetchTimetable, refreshing]);

  const getDayColor = (day) => {
    const colors = {
      Monday: 'border-l-4 border-blue-500',
      Tuesday: 'border-l-4 border-green-500',
      Wednesday: 'border-l-4 border-yellow-500',
      Thursday: 'border-l-4 border-purple-500',
      Friday: 'border-l-4 border-red-500',
      Saturday: 'border-l-4 border-indigo-500',
      Sunday: 'border-l-4 border-gray-500',
    };
    return colors[day] || 'border-l-4 border-gray-500';
  };

  const getPeriodEmoji = (period) => {
    if (period <= 2) return '🌅';
    if (period <= 4) return '☀️';
    if (period <= 6) return '🌤️';
    return '🌙';
  };

  const getDayName = (dayNum) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayNum];
  };

  const isToday = (dayName) => {
    const today = getDayName(currentDay);
    return dayName === today;
  };

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
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
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
            <FiClock className="text-red-500 text-5xl mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-red-700 dark:text-red-300 mb-2">Unable to Load Timetable</h3>
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

  const { timetable, max_periods, class_name, academic_year, term, student_name } = timetableData;

  return (
    <div className={`p-4 md:p-6 min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <FiCalendar className="text-indigo-500" />
              Timetable
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {class_name} • {term} • {academic_year}
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

        {/* Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border-l-4 border-indigo-500">
            <p className="text-sm text-gray-500 dark:text-gray-400">Student</p>
            <p className="text-lg font-semibold text-gray-800 dark:text-white">{student_name}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border-l-4 border-green-500">
            <p className="text-sm text-gray-500 dark:text-gray-400">Class</p>
            <p className="text-lg font-semibold text-gray-800 dark:text-white">{class_name}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border-l-4 border-yellow-500">
            <p className="text-sm text-gray-500 dark:text-gray-400">Term</p>
            <p className="text-lg font-semibold text-gray-800 dark:text-white">{term}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border-l-4 border-purple-500">
            <p className="text-sm text-gray-500 dark:text-gray-400">Periods</p>
            <p className="text-lg font-semibold text-gray-800 dark:text-white">{max_periods}</p>
          </div>
        </div>

        {/* Week Navigation */}
        <div className="flex items-center justify-between mb-4">
          <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition">
            <FiChevronLeft />
          </button>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">This Week</span>
          <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition">
            <FiChevronRight />
          </button>
        </div>

        {/* Timetable Grid */}
        {timetable.length === 0 || timetable.every(day => day.entries.length === 0) ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center border border-gray-200 dark:border-gray-700">
            <FiClock className="text-5xl mx-auto mb-4 opacity-30" />
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No Timetable Found</h3>
            <p className="text-gray-500 dark:text-gray-400">
              No timetable has been set up for your class yet.
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 bg-gray-50 dark:bg-gray-700/30 p-2 border-b border-gray-200 dark:border-gray-700">
              {timetable.map((day) => (
                <div
                  key={day.day}
                  className={`text-center py-2 rounded-lg ${
                    isToday(day.day)
                      ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <div className="text-xs font-medium uppercase">
                    {day.day.slice(0, 3)}
                  </div>
                  <div className="text-sm font-bold">
                    {isToday(day.day) && '⭐'}
                  </div>
                </div>
              ))}
            </div>

            {/* Period Rows */}
            <div className="p-2">
              {Array.from({ length: max_periods }, (_, periodIndex) => {
                const periodNum = periodIndex + 1;
                return (
                  <div key={periodNum} className="grid grid-cols-7 gap-1 mb-1">
                    {/* Period Label */}
                    <div className="flex items-center justify-center text-xs font-medium text-gray-500 dark:text-gray-400 py-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                      <span className="mr-1">{getPeriodEmoji(periodNum)}</span>
                      P{periodNum}
                    </div>
                    
                    {/* Each Day's Entry for this Period */}
                    {timetable.map((day) => {
                      const entry = day.entries.find(e => e.period === periodNum);
                      return (
                        <div
                          key={`${day.day}-${periodNum}`}
                          className={`min-h-[60px] p-2 rounded-lg border ${
                            entry
                              ? `bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 ${getDayColor(day.day)}`
                              : 'bg-gray-50 dark:bg-gray-700/20 border-dashed border-gray-200 dark:border-gray-700'
                          }`}
                        >
                          {entry ? (
                            <div className="h-full flex flex-col justify-center">
                              <div className="text-sm font-medium text-gray-800 dark:text-white truncate">
                                {entry.subject}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 truncate flex items-center gap-1">
                                <FiUser className="text-[10px]" />
                                {entry.teacher}
                              </div>
                              {entry.room && entry.room !== 'N/A' && (
                                <div className="text-xs text-gray-400 dark:text-gray-500 truncate flex items-center gap-1">
                                  <FiMapPin className="text-[10px]" />
                                  {entry.room}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="h-full flex items-center justify-center text-xs text-gray-300 dark:text-gray-600">
                              —
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Timetable;
