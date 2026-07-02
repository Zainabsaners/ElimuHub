import React, { useState, useEffect, useCallback } from 'react';
import { 
  FiBookOpen, FiRefreshCw, FiUser, FiClock, FiAward, 
  FiBarChart2, FiCheckCircle, FiCalendar, FiTrendingUp,
  FiChevronRight, FiInfo, FiFileText, FiX
} from 'react-icons/fi';
import { useAuth } from '../../Authentication/AuthContext';
import { useTheme } from "@/hooks/useTheme";
import toast from 'react-hot-toast';

const Courses = () => {
  const { authenticatedFetch } = useAuth();
  const { theme } = useTheme();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

  const fetchCourses = useCallback(async (showToast = false) => {
    try {
      setError(null);
      if (!showToast) setLoading(true);
      
      const url = `${API_BASE}/api/students/courses/`;
      console.log('Fetching courses from:', url);
      
      const response = await authenticatedFetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('Courses data:', result);
      
      setCourses(result.data || []);
      
      if (showToast) {
        toast.success('Courses updated!');
      }
    } catch (error) {
      console.error('Courses fetch error:', error);
      setError(error.message || 'Failed to load courses');
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [authenticatedFetch, API_BASE]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleRefresh = useCallback(async () => {
    if (refreshing) return;
    setRefreshing(true);
    await fetchCourses(true);
  }, [fetchCourses, refreshing]);

  const handleViewCourse = (course) => {
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCourse(null);
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'text-green-500';
    if (progress >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getProgressBgColor = (progress) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
      case 'Completed':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
      case 'Dropped':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
      case 'Suspended':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
      default:
        return 'bg-gray-100 dark:bg-gray-700/30 text-gray-700 dark:text-gray-400';
    }
  };

  // Course Detail Modal
  const CourseModal = ({ course, onClose }) => {
    if (!course) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <FiBookOpen className="text-indigo-500 text-xl" />
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  {course.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{course.code}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
            >
              <FiX className="text-xl" />
            </button>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</h4>
                <p className="text-gray-700 dark:text-gray-300 mt-1">{course.description || 'No description available'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Teacher</h4>
                  <p className="text-gray-700 dark:text-gray-300">{course.teacher || 'TBA'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Credits</h4>
                  <p className="text-gray-700 dark:text-gray-300">{course.credits || 0}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Duration</h4>
                  <p className="text-gray-700 dark:text-gray-300">{course.duration_weeks || 12} Weeks</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</h4>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(course.enrollment_status)}`}>
                    {course.enrollment_status || 'Active'}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Progress</h4>
                <div className="mt-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Completion</span>
                    <span className={`font-medium ${getProgressColor(course.progress || 0)}`}>
                      {course.progress || 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${getProgressBgColor(course.progress || 0)}`}
                      style={{ width: `${Math.min(course.progress || 0, 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => {
                    onClose();
                    toast.info('Course content coming soon!');
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                  <FiBookOpen />
                  Start Learning
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`p-4 md:p-6 min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-3"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                  <div className="mt-4 h-2 bg-gray-200 dark:bg-gray-700 rounded"></div>
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
            <FiBookOpen className="text-red-500 text-5xl mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-red-700 dark:text-red-300 mb-2">Unable to Load Courses</h3>
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

  // Stats
  const totalCourses = courses.length;
  const activeCourses = courses.filter(c => c.enrollment_status === 'Active').length;
  const completedCourses = courses.filter(c => c.enrollment_status === 'Completed').length;
  const avgProgress = courses.length > 0 
    ? Math.round(courses.reduce((acc, c) => acc + (c.progress || 0), 0) / courses.length)
    : 0;

  return (
    <>
      <div className={`p-4 md:p-6 min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <FiBookOpen className="text-indigo-500" />
                My Courses
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                View all your enrolled courses and progress
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg border-l-4 border-indigo-500">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Courses</p>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                {totalCourses}
              </h3>
            </div>
            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg border-l-4 border-green-500">
              <p className="text-sm text-gray-500 dark:text-gray-400">Active</p>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                {activeCourses}
              </h3>
            </div>
            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg border-l-4 border-blue-500">
              <p className="text-sm text-gray-500 dark:text-gray-400">Completed</p>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                {completedCourses}
              </h3>
            </div>
            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg border-l-4 border-yellow-500">
              <p className="text-sm text-gray-500 dark:text-gray-400">Avg Progress</p>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                {avgProgress}%
              </h3>
            </div>
          </div>

          {/* Courses Grid */}
          {courses.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center border border-gray-200 dark:border-gray-700">
              <FiBookOpen className="text-5xl mx-auto mb-4 opacity-30" />
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No Courses Enrolled</h3>
              <p className="text-gray-500 dark:text-gray-400">
                You are not enrolled in any courses yet. Check with your academic advisor.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <FiBookOpen className="text-indigo-500 shrink-0" />
                          <p className="font-semibold text-gray-800 dark:text-white truncate">
                            {course.code}
                          </p>
                        </div>
                        <h3 className="text-lg font-medium text-gray-800 dark:text-white mt-1 line-clamp-2">
                          {course.title}
                        </h3>
                      </div>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ml-2 ${getStatusBadge(course.enrollment_status)}`}>
                        {course.enrollment_status || 'Active'}
                      </span>
                    </div>

                    {course.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
                        {course.description}
                      </p>
                    )}

                    <div className="mt-3 space-y-1">
                      <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                        <FiUser className="text-xs" />
                        Teacher: {course.teacher || 'TBA'}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <FiAward className="text-xs" />
                          {course.credits || 0} Credits
                        </span>
                        <span className="flex items-center gap-1">
                          <FiClock className="text-xs" />
                          {course.duration_weeks || 12} Weeks
                        </span>
                        <span className="flex items-center gap-1">
                          <FiCalendar className="text-xs" />
                          {new Date(course.enrollment_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Progress</span>
                        <span className={`font-medium ${getProgressColor(course.progress || 0)}`}>
                          {course.progress || 0}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${getProgressBgColor(course.progress || 0)}`}
                          style={{ width: `${Math.min(course.progress || 0, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* View Course Button - Opens Modal */}
                    <button
                      onClick={() => handleViewCourse(course)}
                      className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition"
                    >
                      <FiTrendingUp />
                      View Course
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Course Modal */}
      {isModalOpen && selectedCourse && (
        <CourseModal course={selectedCourse} onClose={handleCloseModal} />
      )}
    </>
  );
};

export default Courses;
