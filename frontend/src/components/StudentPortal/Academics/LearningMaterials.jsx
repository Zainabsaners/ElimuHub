import React, { useState, useEffect, useCallback } from 'react';
import { 
  FiBook, FiRefreshCw, FiDownload, FiEye, FiVideo,
  FiFile, FiImage, FiLink, FiCalendar, FiClock,
  FiBookOpen, FiFilter, FiSearch, FiPlay, FiFileText,
  FiMonitor, FiHeadphones
} from 'react-icons/fi';
import { useAuth } from '../../Authentication/AuthContext';
import { useTheme } from "@/hooks/useTheme";
import toast from 'react-hot-toast';

const LearningMaterials = () => {
  const { authenticatedFetch } = useAuth();
  const { theme } = useTheme();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

  const fetchMaterials = useCallback(async (showToast = false) => {
    try {
      setError(null);
      if (!showToast) setLoading(true);
      
      const url = `${API_BASE}/api/students/learning-materials/`;
      console.log('Fetching learning materials from:', url);
      
      const response = await authenticatedFetch(url);
      
      if (!response) {
        throw new Error('No response from server');
      }
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('Learning materials data:', result);
      
      setMaterials(result.data || []);
      
      if (showToast) {
        toast.success('Learning materials updated!');
      }
    } catch (error) {
      console.error('Learning materials fetch error:', error);
      setError(error.message || 'Failed to load learning materials');
      toast.error('Failed to load learning materials');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [authenticatedFetch, API_BASE]);

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  const handleRefresh = useCallback(async () => {
    if (refreshing) return;
    setRefreshing(true);
    await fetchMaterials(true);
  }, [fetchMaterials, refreshing]);

  const handleView = (material) => {
    if (material.content_url) {
      window.open(material.content_url, '_blank');
    } else if (material.file_path) {
      // If file_path exists, construct URL
      const fileUrl = `${API_BASE}${material.file_path}`;
      window.open(fileUrl, '_blank');
    } else {
      toast.info('No file attached to view');
    }
  };

  const handleDownload = (material) => {
    if (material.file_path) {
      const fileUrl = `${API_BASE}${material.file_path}`;
      // Create download link
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = material.file_path.split('/').pop() || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Downloading...');
    } else if (material.content_url) {
      window.open(material.content_url, '_blank');
      toast.info('Opening in new tab...');
    } else {
      toast.info('No file available to download');
    }
  };

  const getContentTypeColor = (type) => {
    switch (type) {
      case 'Video': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'Document': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800';
      case 'Presentation': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800';
      case 'Image': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800';
      case 'Link': return 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800';
      case 'Audio': return 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400 border-pink-200 dark:border-pink-800';
      case 'Quiz': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
      default: return 'bg-gray-100 dark:bg-gray-700/30 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-700';
    }
  };

  const getContentTypeIcon = (type) => {
    switch (type) {
      case 'Video': return <FiVideo className="text-blue-500 text-xl" />;
      case 'Document': return <FiFileText className="text-green-500 text-xl" />;
      case 'Presentation': return <FiMonitor className="text-orange-500 text-xl" />;
      case 'Image': return <FiImage className="text-purple-500 text-xl" />;
      case 'Link': return <FiLink className="text-cyan-500 text-xl" />;
      case 'Audio': return <FiHeadphones className="text-pink-500 text-xl" />;
      case 'Quiz': return <FiBookOpen className="text-yellow-500 text-xl" />;
      default: return <FiBook className="text-gray-500 text-xl" />;
    }
  };

  const getContentTypeEmoji = (type) => {
    switch (type) {
      case 'Video': return '🎬';
      case 'Document': return '📄';
      case 'Presentation': return '📊';
      case 'Image': return '🖼️';
      case 'Link': return '🔗';
      case 'Audio': return '🎵';
      case 'Quiz': return '📝';
      default: return '📚';
    }
  };

  const filteredMaterials = materials.filter(material => {
    if (filter !== 'all' && material.content_type !== filter) {
      return false;
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        material.title.toLowerCase().includes(term) ||
        material.course_code.toLowerCase().includes(term) ||
        material.course_title.toLowerCase().includes(term) ||
        (material.description && material.description.toLowerCase().includes(term))
      );
    }
    return true;
  });

  const contentTypes = ['all', ...new Set(materials.map(m => m.content_type))];
  const typeCounts = materials.reduce((acc, m) => {
    acc[m.content_type] = (acc[m.content_type] || 0) + 1;
    return acc;
  }, {});

  if (loading) {
    return (
      <div className={`p-4 md:p-6 min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => (
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
            <FiBook className="text-red-500 text-5xl mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-red-700 dark:text-red-300 mb-2">Unable to Load Learning Materials</h3>
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
              <FiBook className="text-indigo-500" />
              Learning Materials
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Access course materials, videos, and resources
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

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg border-l-4 border-indigo-500">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{materials.length}</h3>
          </div>
          {Object.entries(typeCounts).slice(0, 3).map(([type, count]) => (
            <div key={type} className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg border-l-4 border-gray-300">
              <p className="text-sm text-gray-500 dark:text-gray-400">{type}s</p>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{count}</h3>
            </div>
          ))}
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search materials..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {contentTypes.map(type => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filter === type
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {type === 'all' ? 'All' : type}
              </button>
            ))}
          </div>
        </div>

        {/* Materials Grid */}
        {filteredMaterials.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center border border-gray-200 dark:border-gray-700">
            <FiBook className="text-5xl mx-auto mb-4 opacity-30" />
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No Learning Materials</h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm 
                ? `No materials found matching "${searchTerm}"` 
                : filter === 'all' 
                ? 'No learning materials available for your courses.' 
                : `No ${filter} materials available.`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMaterials.map((material) => {
              const hasFile = material.file_path || material.content_url;
              
              return (
                <div
                  key={material.id}
                  className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border ${getContentTypeColor(material.content_type)} hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
                >
                  <div className="p-5">
                    <div className="flex items-start gap-3">
                      <div className={`p-3 rounded-lg shrink-0 ${getContentTypeColor(material.content_type)}`}>
                        {getContentTypeIcon(material.content_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getContentTypeEmoji(material.content_type)}</span>
                          <h3 className="font-semibold text-gray-800 dark:text-white truncate">
                            {material.title}
                          </h3>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {material.course_code} - {material.course_title}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <FiCalendar className="text-xs" />
                            {new Date(material.publish_date).toLocaleDateString()}
                          </span>
                          {material.duration_minutes && (
                            <span className="flex items-center gap-1">
                              <FiClock className="text-xs" />
                              {material.duration_minutes} min
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {material.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 line-clamp-2">
                        {material.description}
                      </p>
                    )}
                    
                    {/* ✅ Buttons - Always Visible */}
                    <div className="mt-4 flex gap-2">
                      {hasFile ? (
                        <>
                          <button
                            onClick={() => handleView(material)}
                            className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition border border-indigo-200 dark:border-indigo-800"
                          >
                            <FiEye /> View
                          </button>
                          <button
                            onClick={() => handleDownload(material)}
                            className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition"
                          >
                            <FiDownload /> Download
                          </button>
                        </>
                      ) : (
                        <div className="w-full text-center text-sm text-gray-400 dark:text-gray-500 py-2">
                          <span>No file attached</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default LearningMaterials;
