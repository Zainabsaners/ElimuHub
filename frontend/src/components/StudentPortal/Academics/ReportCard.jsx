import React, { useState, useEffect, useCallback } from 'react';
import { 
  FiDownload, FiFileText, FiRefreshCw, FiEye, FiCalendar,
  FiAward, FiUser, FiBookOpen, FiCheckCircle, FiClock, FiX
} from 'react-icons/fi';
import { useAuth } from '../../Authentication/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import toast from 'react-hot-toast';

const ReportCard = () => {
  const { authenticatedFetch } = useAuth();
  const { theme } = useTheme();
  const [reportCards, setReportCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

  const fetchReportCards = useCallback(async (showToast = false) => {
    try {
      setError(null);
      if (!showToast) setLoading(true);
      
      const url = `${API_BASE}/api/students/academics/`;
      console.log('Fetching report cards from:', url);
      
      const response = await authenticatedFetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('Report cards data:', result.report_cards);
      
      setReportCards(result.report_cards || []);
      
      if (showToast) {
        toast.success('Report cards updated!');
      }
    } catch (error) {
      console.error('Report cards fetch error:', error);
      setError(error.message || 'Failed to load report cards');
      toast.error('Failed to load report cards');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [authenticatedFetch, API_BASE]);

  useEffect(() => {
    fetchReportCards();
  }, [fetchReportCards]);

  const handleRefresh = useCallback(async () => {
    if (refreshing) return;
    setRefreshing(true);
    await fetchReportCards(true);
  }, [fetchReportCards, refreshing]);

  const handleView = (report) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedReport(null);
  };

  const handleDownload = async (reportId) => {
    setDownloading(true);
    const toastId = toast.loading('Generating PDF...');
    
    try {
      // ✅ FIXED: Use the correct router endpoint 'cbe-report-cards'
      const url = `${API_BASE}/api/cbe-report-cards/${reportId}/download/`;
      console.log('Downloading from:', url);
      
      const response = await authenticatedFetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      // Get the blob from response
      const blob = await response.blob();
      
      // Create download link
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `report_card_${reportId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      toast.success('Report card downloaded successfully!', { id: toastId });
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download report card. Please try again.', { id: toastId });
    } finally {
      setDownloading(false);
    }
  };

  const getStatusColor = (isPublished) => {
    return isPublished 
      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
      : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
  };

  const getStatusText = (isPublished) => {
    return isPublished ? 'Published' : 'Draft';
  };

  // Modal Component
  const ReportModal = ({ report, onClose }) => {
    if (!report) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Modal Header */}
          <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <FiAward className="text-indigo-500 text-xl" />
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  {report.report_type || 'Report Card'}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {report.academic_year} - {report.term}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
            >
              <FiX className="text-xl" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6">
            {/* Student Info */}
            <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Student</p>
                <p className="font-medium text-gray-800 dark:text-white">
                  {report.student_name || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Admission No.</p>
                <p className="font-medium text-gray-800 dark:text-white">
                  {report.admission_no || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Class</p>
                <p className="font-medium text-gray-800 dark:text-white">
                  {report.class_name || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(report.is_published)}`}>
                  {getStatusText(report.is_published)}
                </span>
              </div>
            </div>

            {/* Teacher Remarks */}
            {report.teacher_remarks && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Teacher's Remarks</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                  {report.teacher_remarks}
                </p>
              </div>
            )}

            {/* Head Teacher Remarks */}
            {report.head_teacher_remarks && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Head Teacher's Remarks</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                  {report.head_teacher_remarks}
                </p>
              </div>
            )}

            {/* Download Button */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => handleDownload(report.id)}
                disabled={downloading}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
              >
                <FiDownload />
                {downloading ? 'Downloading...' : 'Download PDF Report'}
              </button>
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
            <h3 className="text-xl font-semibold text-red-700 dark:text-red-300 mb-2">Unable to Load Report Cards</h3>
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
    <>
      <div className={`p-4 md:p-6 min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <FiAward className="text-indigo-500" />
                Report Cards
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                View and download your academic report cards
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg border-l-4 border-indigo-500">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Report Cards</p>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                {reportCards.length}
              </h3>
            </div>
            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg border-l-4 border-green-500">
              <p className="text-sm text-gray-500 dark:text-gray-400">Published</p>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                {reportCards.filter(r => r.is_published).length}
              </h3>
            </div>
            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg border-l-4 border-yellow-500">
              <p className="text-sm text-gray-500 dark:text-gray-400">Drafts</p>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                {reportCards.filter(r => !r.is_published).length}
              </h3>
            </div>
          </div>

          {/* Report Cards Grid */}
          {reportCards.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center border border-gray-200 dark:border-gray-700">
              <FiFileText className="text-5xl mx-auto mb-4 opacity-30" />
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No Report Cards</h3>
              <p className="text-gray-500 dark:text-gray-400">
                No report cards are available yet. They will appear here once published by your teachers.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reportCards.map((report) => (
                <div
                  key={report.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <FiFileText className="text-indigo-500 flex-shrink-0" />
                          <p className="font-medium text-gray-800 dark:text-white truncate">
                            {report.report_type || 'Report Card'}
                          </p>
                        </div>
                        <div className="mt-2 space-y-1">
                          <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <FiCalendar className="text-xs" />
                            {report.academic_year} - {report.term}
                          </p>
                          {report.class_name && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                              <FiBookOpen className="text-xs" />
                              {report.class_name}
                            </p>
                          )}
                          {report.student_name && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                              <FiUser className="text-xs" />
                              {report.student_name}
                            </p>
                          )}
                        </div>
                        <div className="mt-3">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(report.is_published)}`}>
                            {getStatusText(report.is_published)}
                          </span>
                          {report.generated_date && (
                            <span className="ml-2 text-xs text-gray-400">
                              {new Date(report.generated_date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        {report.teacher_remarks && (
                          <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Teacher's Remarks</p>
                            <p className="text-xs text-gray-700 dark:text-gray-300 mt-1 line-clamp-2">
                              {report.teacher_remarks}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center gap-2">
                      <button
                        onClick={() => handleView(report)}
                        className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition"
                      >
                        <FiEye />
                        View
                      </button>
                      <button
                        onClick={() => handleDownload(report.id)}
                        disabled={downloading}
                        className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition disabled:opacity-50"
                      >
                        <FiDownload />
                        {downloading ? '...' : 'Download'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <ReportModal report={selectedReport} onClose={handleCloseModal} />
      )}
    </>
  );
};

export default ReportCard;
