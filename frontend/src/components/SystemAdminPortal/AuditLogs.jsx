import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Download, Eye,
  Calendar, User, Database, Shield, AlertCircle,
  CheckCircle, XCircle, Clock, Globe, Key,
  FileText, Users, Trash2, BarChart, Loader,
  RefreshCw, ChevronLeft, ChevronRight, Settings,
  Activity, Lock, Edit, Server
} from 'lucide-react';

// Define API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || "https://*.onrender.com";

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [stats, setStats] = useState({
    total_logs: 0,
    today_activities: 0,
    security_events: 0,
    data_modifications: 0,
    login_events: 0,
    failed_login_events: 0
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1
  });

  const [filters, setFilters] = useState({
    event_type: 'all',
    user_role: 'all',
    operation: 'all',
    status: 'all',
    date_from: '',
    date_to: '',
    search_query: ''
  });

  const [selectedLog, setSelectedLog] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [eventTypes, setEventTypes] = useState([]);
  const [userRoles, setUserRoles] = useState([]);
  const [clearing, setClearing] = useState(false);

  // API Helper Functions
  const api = {
    get: async (endpoint, params = {}) => {
      const url = new URL(`${API_BASE_URL}${endpoint}`);
      Object.keys(params).forEach(key => 
        url.searchParams.append(key, params[key])
      );
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response.json();
    },

    post: async (endpoint, data = {}) => {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response.json();
    }
  };

  // Fetch audit logs
  const fetchAuditLogs = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        page,
        limit: pagination.limit
      };

      // Remove 'all' values
      Object.keys(params).forEach(key => {
        if (params[key] === 'all' || params[key] === '') {
          delete params[key];
        }
      });

      const response = await api.get('/audit-logs', params);
      const { logs: fetchedLogs, total, page: currentPage, limit, totalPages } = response;

      setLogs(fetchedLogs || []);
      setPagination({
        page: currentPage,
        limit,
        total,
        totalPages
      });
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      alert('Failed to fetch audit logs. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const response = await api.get('/audit-logs/stats/summary');
      setStats(response.stats || {
        total_logs: 0,
        today_activities: 0,
        security_events: 0,
        data_modifications: 0,
        failed_events: 0,
        successful_events: 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Set default stats on error
      setStats({
        total_logs: 0,
        today_activities: 0,
        security_events: 0,
        data_modifications: 0,
        failed_events: 0,
        successful_events: 0
      });
    }
  };

  // Fetch metadata (event types and user roles)
  const fetchMetadata = async () => {
    try {
      const [eventTypesRes, userRolesRes] = await Promise.all([
        api.get('/audit-logs/metadata/event-types'),
        api.get('/audit-logs/metadata/user-roles')
      ]);
      setEventTypes(eventTypesRes.eventTypes || []);
      setUserRoles(userRolesRes.userRoles || []);
    } catch (error) {
      console.error('Error fetching metadata:', error);
      setEventTypes([]);
      setUserRoles([]);
    }
  };

  // Export logs
  const handleExportLogs = async (format = 'json') => {
    try {
      setExporting(true);
      const params = { ...filters, format };
      
      // Remove 'all' values
      Object.keys(params).forEach(key => {
        if (params[key] === 'all' || params[key] === '') {
          delete params[key];
        }
      });

      if (format === 'csv') {
        const url = new URL(`${API_BASE_URL}/audit-logs/export/data`);
        Object.keys(params).forEach(key => 
          url.searchParams.append(key, params[key])
        );
        
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) throw new Error('Export failed');
        
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(downloadUrl);
      } else {
        const response = await api.get('/audit-logs/export/data', params);
        
        // Create JSON file download
        const dataStr = JSON.stringify(response, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const downloadUrl = window.URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `audit-logs-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(downloadUrl);
      }
      
      alert(`Audit logs exported successfully as ${format.toUpperCase()}!`);
    } catch (error) {
      console.error('Error exporting logs:', error);
      alert('Failed to export audit logs');
    } finally {
      setExporting(false);
    }
  };

  // Clear all logs
  const handleClearLogs = async () => {
    if (!window.confirm('Are you sure you want to clear all audit logs? This action cannot be undone.')) {
      return;
    }

    try {
      setClearing(true);
      await api.post('/audit-logs/clear');
      alert('Audit logs cleared successfully');
      fetchAuditLogs();
      fetchStats();
    } catch (error) {
      console.error('Error clearing logs:', error);
      alert('Failed to clear audit logs');
    } finally {
      setClearing(false);
    }
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchAuditLogs(newPage);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString()
    };
  };

  // Get event type icon
  const getEventTypeIcon = (eventType) => {
    switch(eventType) {
      case 'USER_LOGIN':
      case 'USER_LOGOUT':
        return <User className="h-4 w-4" />;
      case 'DATA_CREATE':
      case 'DATA_UPDATE':
      case 'DATA_DELETE':
        return <Database className="h-4 w-4" />;
      case 'SECURITY_VIOLATION':
        return <Shield className="h-4 w-4" />;
      case 'SETTINGS_UPDATE':
        return <Settings className="h-4 w-4" />;
      case 'BACKUP_CREATE':
        return <FileText className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getEventTypeColor = (eventType) => {
    switch(eventType) {
      case 'USER_LOGIN':
      case 'USER_LOGOUT':
        return 'bg-blue-50 text-blue-700 border border-blue-100';
      case 'DATA_CREATE':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-100';
      case 'DATA_UPDATE':
        return 'bg-amber-50 text-amber-700 border border-amber-100';
      case 'DATA_DELETE':
        return 'bg-rose-50 text-rose-700 border border-rose-100';
      case 'SECURITY_VIOLATION':
        return 'bg-purple-50 text-purple-700 border border-purple-100';
      case 'SETTINGS_UPDATE':
        return 'bg-indigo-50 text-indigo-700 border border-indigo-100';
      case 'BACKUP_CREATE':
        return 'bg-cyan-50 text-cyan-700 border border-cyan-100';
      default:
        return 'bg-gray-50 text-gray-700 border border-gray-100';
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      event_type: 'all',
      user_role: 'all',
      operation: 'all',
      status: 'all',
      date_from: '',
      date_to: '',
      search_query: ''
    });
  };

  const applyFilters = () => {
    fetchAuditLogs(1);
  };

  // Initial load
  useEffect(() => {
    fetchAuditLogs();
    fetchStats();
    fetchMetadata();
  }, []);

  // Apply filters when they change (with debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAuditLogs(1);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [filters]);

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-25 to-gray-50 p-6 md:p-8 overflow-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Activity className="h-6 w-6 text-blue-600" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Audit Logs</h1>
        </div>
        <p className="text-gray-600">Monitor system activities and user actions in real-time</p>
        <div className="flex items-center gap-2 mt-3">
          <Server className="h-4 w-4 text-gray-400" />
          <code className="text-sm font-mono bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700">
            {API_BASE_URL}
          </code>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-xs border border-gray-200 p-6 hover:shadow-sm transition-shadow duration-200">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Database className="h-5 w-5 text-gray-600" />
            </div>
            <span className="text-sm font-medium text-gray-500">Total</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.total_logs.toLocaleString()}</p>
          <p className="text-sm text-gray-500 mt-1">Audit Logs</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xs border border-gray-200 p-6 hover:shadow-sm transition-shadow duration-200">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-500">Today</span>
          </div>
          <p className="text-3xl font-bold text-blue-600">
            {stats.today_activities.toLocaleString()}
          </p>
          <p className="text-sm text-gray-500 mt-1">Activities</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xs border border-gray-200 p-6 hover:shadow-sm transition-shadow duration-200">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-rose-100 rounded-lg">
              <Lock className="h-5 w-5 text-rose-600" />
            </div>
            <span className="text-sm font-medium text-gray-500">Security</span>
          </div>
          <p className="text-3xl font-bold text-rose-600">
            {(stats.security_events || 0).toLocaleString()}
          </p>
          <p className="text-sm text-gray-500 mt-1">Events</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xs border border-gray-200 p-6 hover:shadow-sm transition-shadow duration-200">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Edit className="h-5 w-5 text-emerald-600" />
            </div>
            <span className="text-sm font-medium text-gray-500">Data</span>
          </div>
          <p className="text-3xl font-bold text-emerald-600">
            {(stats.data_modifications || 0).toLocaleString()}
          </p>
          <p className="text-sm text-gray-500 mt-1">Modifications</p>
        </div>
      </div>

      {/* Action Bar & Filters */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search logs by username, table, IP, or endpoint..."
                className="pl-12 pr-4 py-3.5 w-full border border-gray-300 rounded-xl focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                value={filters.search_query}
                onChange={(e) => handleFilterChange('search_query', e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-5 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-400 flex items-center gap-2 transition-colors duration-200"
            >
              <Filter className="h-4 w-4" />
              <span className="font-medium">Filters</span>
            </button>
            <button
              onClick={() => handleExportLogs('json')}
              disabled={exporting}
              className="px-5 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-400 flex items-center gap-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exporting ? <Loader className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              <span className="font-medium">Export</span>
            </button>
            <button
              onClick={handleClearLogs}
              disabled={clearing}
              className="px-5 py-3 bg-linear-to-r from-rose-600 to-rose-700 text-white rounded-xl hover:from-rose-700 hover:to-rose-800 flex items-center gap-2 shadow-xs hover:shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {clearing ? <Loader className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              <span className="font-medium">Clear Logs</span>
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Advanced Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Event Type</label>
                <select
                  value={filters.event_type}
                  onChange={(e) => handleFilterChange('event_type', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                >
                  <option value="all">All Types</option>
                  {eventTypes.map(type => (
                    <option key={type} value={type}>
                      {type.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">User Role</label>
                <select
                  value={filters.user_role}
                  onChange={(e) => handleFilterChange('user_role', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                >
                  <option value="all">All Roles</option>
                  {userRoles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Operation</label>
                <select
                  value={filters.operation}
                  onChange={(e) => handleFilterChange('operation', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                >
                  <option value="all">All Operations</option>
                  <option value="LOGIN">Login</option>
                  <option value="LOGOUT">Logout</option>
                  <option value="CREATE">Create</option>
                  <option value="UPDATE">Update</option>
                  <option value="DELETE">Delete</option>
                  <option value="FAILED_LOGIN">Failed Login</option>
                  <option value="READ">Read</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                >
                  <option value="all">All Status</option>
                  <option value="SUCCESS">Success</option>
                  <option value="FAILED">Failed</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date From</label>
                <input
                  type="date"
                  value={filters.date_from}
                  onChange={(e) => handleFilterChange('date_from', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date To</label>
                <input
                  type="date"
                  value={filters.date_to}
                  onChange={(e) => handleFilterChange('date_to', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={resetFilters}
                className="px-6 py-3 text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-200 font-medium"
              >
                Reset Filters
              </button>
              <button
                onClick={applyFilters}
                className="px-6 py-3 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-xs hover:shadow-sm"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Audit Logs
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Showing {logs.length} of {pagination.total.toLocaleString()} records
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg">
              Page {pagination.page} of {pagination.totalPages}
            </div>
            <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-xl">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="p-2.5 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="p-2.5 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => fetchAuditLogs(pagination.page)}
                className="p-2.5 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors duration-200"
                title="Refresh"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="relative">
              <div className="h-16 w-16 rounded-full border-4 border-gray-200"></div>
              <div className="absolute top-0 left-0 h-16 w-16 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
            </div>
            <span className="mt-4 text-gray-600 font-medium">Loading audit logs...</span>
            <p className="text-sm text-gray-500 mt-1">Please wait while we fetch the data</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Database className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No audit logs found</h3>
            <p className="text-gray-500 max-w-md mx-auto">Try adjusting your filters or check if there are any activities in the system.</p>
            <button
              onClick={resetFilters}
              className="mt-6 px-5 py-2.5 text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors duration-200"
            >
              Reset all filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5" />
                      Time
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Event Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Table
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Operation
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    IP Address
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {logs.map((log) => {
                  const formattedDate = formatDate(log.event_time);
                  return (
                    <tr key={log.id} className="hover:bg-gray-50/50 transition-colors duration-150 group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                            <p className="text-sm font-medium text-gray-900">{formattedDate.time}</p>
                          </div>
                          <p className="text-xs text-gray-500">{formattedDate.date}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${getEventTypeColor(log.event_type)}`}>
                            {getEventTypeIcon(log.event_type)}
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {log.event_type?.replace(/_/g, ' ') || 'Unknown'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <User className="h-3.5 w-3.5 text-gray-400" />
                            <p className="text-sm font-medium text-gray-900">{log.username || 'Anonymous'}</p>
                          </div>
                          <p className="text-xs text-gray-500 font-mono">{log.user_role || 'N/A'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Database className="h-3.5 w-3.5 text-gray-400" />
                            <p className="text-sm font-medium text-gray-900 font-mono">{log.table_name}</p>
                          </div>
                          {log.record_id && (
                            <p className="text-xs text-gray-500 font-mono">ID: {log.record_id}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${
                          log.operation === 'CREATE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                          log.operation === 'UPDATE' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                          log.operation === 'DELETE' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                          log.operation === 'LOGIN' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                          'bg-gray-50 text-gray-700 border border-gray-100'
                        }`}>
                          {log.operation}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Globe className="h-3.5 w-3.5 text-gray-400" />
                          <span className="text-sm text-gray-900 font-mono">{log.ip_address || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {log.status === 'SUCCESS' ? (
                            <>
                              <div className="h-2 w-2 bg-emerald-500 rounded-full"></div>
                              <span className="text-sm font-medium text-emerald-600">Success</span>
                            </>
                          ) : (
                            <>
                              <div className="h-2 w-2 bg-rose-500 rounded-full"></div>
                              <span className="text-sm font-medium text-rose-600">Failed</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="p-2.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200 opacity-0 group-hover:opacity-100"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-slideUp">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Audit Log Details</h3>
                  <p className="text-gray-600 mt-1">Detailed information about this audit event</p>
                </div>
                <button 
                  onClick={() => setSelectedLog(null)}
                  className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors duration-200"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-8">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Event Time</label>
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-blue-500" />
                      <p className="text-gray-800 font-medium">
                        {formatDate(selectedLog.event_time).date} • {formatDate(selectedLog.event_time).time}
                      </p>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Event Type</label>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${getEventTypeColor(selectedLog.event_type)}`}>
                        {getEventTypeIcon(selectedLog.event_type)}
                      </div>
                      <span className="text-gray-800 font-medium">
                        {selectedLog.event_type?.replace(/_/g, ' ') || 'Unknown'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">User Information</label>
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-gray-800 font-medium">{selectedLog.username || 'Anonymous'}</p>
                        <p className="text-sm text-gray-500">{selectedLog.user_role || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">IP Address</label>
                    <div className="flex items-center gap-3">
                      <Globe className="h-5 w-5 text-gray-500" />
                      <p className="text-gray-800 font-mono font-medium">{selectedLog.ip_address || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Database Information</label>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Database className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="text-gray-800 font-mono font-medium">{selectedLog.table_name}</p>
                          {selectedLog.record_id && (
                            <p className="text-sm text-gray-500">Record ID: {selectedLog.record_id}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Operation</label>
                    <span className={`px-4 py-2 text-sm font-semibold rounded-lg ${
                      selectedLog.operation === 'CREATE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                      selectedLog.operation === 'UPDATE' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                      selectedLog.operation === 'DELETE' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                      'bg-blue-50 text-blue-700 border border-blue-100'
                    }`}>
                      {selectedLog.operation}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Endpoint</label>
                    <div className="flex items-center gap-3">
                      <Key className="h-5 w-5 text-gray-500" />
                      <p className="text-gray-800 font-mono font-medium truncate">{selectedLog.endpoint || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">HTTP Method</label>
                    <span className="px-4 py-2 bg-gray-100 text-gray-800 text-sm font-semibold rounded-lg border border-gray-200">
                      {selectedLog.http_method || 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <div className="flex items-center gap-3">
                    {selectedLog.status === 'SUCCESS' ? (
                      <>
                        <div className="h-3 w-3 bg-emerald-500 rounded-full"></div>
                        <span className="text-emerald-600 font-semibold">Success</span>
                      </>
                    ) : (
                      <>
                        <div className="h-3 w-3 bg-rose-500 rounded-full"></div>
                        <span className="text-rose-600 font-semibold">Failed</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Additional Data */}
                {selectedLog.old_values || selectedLog.new_values ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Data Changes</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedLog.old_values && (
                        <div className="bg-rose-50 p-5 rounded-xl border border-rose-100">
                          <h4 className="text-sm font-semibold text-rose-800 mb-3 flex items-center gap-2">
                            <div className="h-2 w-2 bg-rose-500 rounded-full"></div>
                            Old Values
                          </h4>
                          <pre className="text-xs text-gray-800 bg-white/50 p-4 rounded-lg border border-rose-200 overflow-auto max-h-48">
                            {JSON.stringify(selectedLog.old_values, null, 2)}
                          </pre>
                        </div>
                      )}
                      {selectedLog.new_values && (
                        <div className="bg-emerald-50 p-5 rounded-xl border border-emerald-100">
                          <h4 className="text-sm font-semibold text-emerald-800 mb-3 flex items-center gap-2">
                            <div className="h-2 w-2 bg-emerald-500 rounded-full"></div>
                            New Values
                          </h4>
                          <pre className="text-xs text-gray-800 bg-white/50 p-4 rounded-lg border border-emerald-200 overflow-auto max-h-48">
                            {JSON.stringify(selectedLog.new_values, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}

                <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setSelectedLog(null)}
                    className="px-8 py-3.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-medium transition-colors duration-200"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add custom styles for animations */}
      <style >{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AuditLogs;