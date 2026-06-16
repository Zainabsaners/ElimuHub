import React, { useState, useEffect } from 'react';
import { 
  Database, Download, Upload, Clock,
  CheckCircle, AlertCircle, Trash2, Eye, FileText,
  Server, HardDrive, Shield, Calendar, BarChart,
  Play, StopCircle, Settings, Loader,
  ExternalLink, FolderOpen, Copy, RefreshCw, Archive, ShieldCheck
} from 'lucide-react';
import axios from 'axios';

const BackupRestore = () => {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [backupLoading, setBackupLoading] = useState(false);
  const [stats, setStats] = useState({
    totalSize: '0 Bytes',
    totalBackups: 0,
    completedBackups: 0,
    failedBackups: 0,
    avg_duration: 0,
    successRate: 0
  });
  const [activeTab, setActiveTab] = useState('backups');
  const [systemInfo, setSystemInfo] = useState({});
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  const API_BASE_URL = 'http://localhost:8000/api';

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 5000);
  };

  const fetchBackups = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/backups/list`);
      setBackups(response.data.backups || []);
    } catch (error) {
      console.error('Failed to fetch backups:', error);
      showNotification('Failed to load backups', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/backups/stats`);
      setStats(response.data.stats || {});
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchSystemInfo = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/backups/system-info`);
      setSystemInfo(response.data.info || {});
    } catch (error) {
      console.error('Failed to fetch system info:', error);
    }
  };

  const handleStartBackup = async (type = 'full') => {
    if (!window.confirm(`Start ${type} backup? This may take several minutes.`)) {
      return;
    }

    try {
      setBackupLoading(true);
      
      const response = await axios.post(`${API_BASE_URL}/backups/create`, {
        type,
        description: `Manual ${type} backup`
      });
      
      showNotification(response.data.message, 'success');
      fetchBackups();
      fetchStats();
    } catch (error) {
      console.error('Backup failed:', error);
      showNotification(error.response?.data?.message || 'Backup failed', 'error');
    } finally {
      setBackupLoading(false);
    }
  };

  const handleRestoreBackup = async (backupId) => {
    if (!window.confirm('WARNING: This will restore the database from backup and will overwrite current data. Continue?')) {
      return;
    }
    
    const confirm = window.prompt('Type "CONFIRM" to proceed with restore:');
    if (confirm !== 'CONFIRM') {
      return;
    }

    try {
      setBackupLoading(true);
      const response = await axios.post(`${API_BASE_URL}/backups/restore/${backupId}?confirm=true`);
      showNotification(response.data.message, 'success');
    } catch (error) {
      console.error('Restore failed:', error);
      showNotification(error.response?.data?.message || 'Restore failed', 'error');
    } finally {
      setBackupLoading(false);
    }
  };

  const handleDeleteBackup = async (backupId) => {
    if (!window.confirm('Are you sure you want to delete this backup?')) {
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/backups/delete/${backupId}`);
      showNotification('Backup deleted successfully', 'success');
      fetchBackups();
      fetchStats();
    } catch (error) {
      console.error('Delete failed:', error);
      showNotification(error.response?.data?.message || 'Delete failed', 'error');
    }
  };

  const handleDownloadBackup = async (backupId, backupName) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/backups/download/${backupId}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', backupName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showNotification('Download started', 'success');
    } catch (error) {
      console.error('Download failed:', error);
      showNotification('Failed to download backup', 'error');
    }
  };

  const handleCopyPath = (path) => {
    navigator.clipboard.writeText(path);
    showNotification('Path copied to clipboard', 'success');
  };

  const handleOpenBackupFolder = () => {
    if (systemInfo.backup_dir) {
      showNotification(`Backup folder: ${systemInfo.backup_dir}`, 'info');
    }
  };

  const handleCleanBackups = async () => {
    if (!window.confirm('Clean old backups? This will delete backups older than retention period.')) {
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/backups/clean`);
      showNotification(response.data.message, 'success');
      fetchBackups();
      fetchStats();
    } catch (error) {
      console.error('Clean failed:', error);
      showNotification(error.response?.data?.message || 'Clean failed', 'error');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return { date: 'N/A', time: 'N/A', full: 'N/A' };
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString(),
      full: date.toLocaleString()
    };
  };

  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'COMPLETED': return 'bg-emerald-100 text-emerald-800';
      case 'IN_PROGRESS': return 'bg-amber-100 text-amber-800';
      case 'FAILED': return 'bg-rose-100 text-rose-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  useEffect(() => {
    fetchBackups();
    fetchStats();
    fetchSystemInfo();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-25 to-gray-50 p-6 md:p-8 overflow-auto">
      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-xl shadow-lg border ${
          notification.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : notification.type === 'error'
            ? 'bg-rose-50 border-rose-200 text-rose-800'
            : 'bg-blue-50 border-blue-200 text-blue-800'
        }`}>
          <div className="flex items-center gap-3">
            {notification.type === 'success' && <CheckCircle className="h-5 w-5" />}
            {notification.type === 'error' && <AlertCircle className="h-5 w-5" />}
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Database className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Database Backup & Restore</h1>
              <p className="text-gray-600">Secure your data with automated backups and easy restoration</p>
            </div>
          </div>
          <button
            onClick={fetchBackups}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-400 flex items-center gap-2 transition-colors duration-200 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Backups</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalBackups}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Archive className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Storage Used</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalSize}</p>
              </div>
              <div className="p-2 bg-emerald-100 rounded-lg">
                <HardDrive className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.successRate}%</p>
              </div>
              <div className="p-2 bg-amber-100 rounded-lg">
                <ShieldCheck className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Duration</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{formatDuration(stats.avg_duration)}</p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 mb-6">
        {['backups', 'restore', 'settings', 'monitor'].map((tab) => (
          <button
            key={tab}
            className={`px-4 py-3 font-medium rounded-t-lg transition-colors duration-200 ${
              activeTab === tab 
                ? 'border-b-2 border-blue-600 text-blue-600 bg-white' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab(tab)}
          >
            <div className="flex items-center gap-2 capitalize">
              {tab === 'backups' && <Archive className="h-4 w-4" />}
              {tab === 'restore' && <Play className="h-4 w-4" />}
              {tab === 'settings' && <Settings className="h-4 w-4" />}
              {tab === 'monitor' && <BarChart className="h-4 w-4" />}
              {tab}
            </div>
          </button>
        ))}
      </div>

      {/* Backups Tab */}
      {activeTab === 'backups' && (
        <div className="space-y-6">
          {/* Backup Actions */}
          <div className="bg-white rounded-2xl shadow-xs border border-gray-200 p-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Create New Backup</h3>
                <p className="text-gray-600 mt-1">Backup directory: {systemInfo.backup_dir || 'Loading...'}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleOpenBackupFolder}
                  className="px-5 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-400 flex items-center gap-2 transition-colors duration-200"
                >
                  <FolderOpen className="h-4 w-4" />
                  View Folder
                </button>
                <button
                  onClick={handleCleanBackups}
                  className="px-5 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-400 flex items-center gap-2 transition-colors duration-200"
                >
                  <Trash2 className="h-4 w-4" />
                  Clean Old
                </button>
                <button
                  onClick={() => handleStartBackup('full')}
                  disabled={backupLoading}
                  className={`px-5 py-3 rounded-xl flex items-center gap-2 transition-all duration-200 ${
                    backupLoading
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-xs hover:shadow-sm'
                  }`}
                >
                  {backupLoading ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      Creating Backup...
                    </>
                  ) : (
                    <>
                      <Database className="h-4 w-4" />
                      Create Backup
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Backup Type Selection */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => handleStartBackup('full')}
                disabled={backupLoading}
                className="p-4 border border-blue-200 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors duration-200 disabled:opacity-50"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-white rounded-lg">
                    <Database className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-blue-800">Full Backup</p>
                    <p className="text-sm text-blue-600">Complete database</p>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => handleStartBackup('schema')}
                disabled={backupLoading}
                className="p-4 border border-gray-200 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-white rounded-lg">
                    <FileText className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-800">Schema Only</p>
                    <p className="text-sm text-gray-600">Structure only</p>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => handleStartBackup('data')}
                disabled={backupLoading}
                className="p-4 border border-emerald-200 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors duration-200 disabled:opacity-50"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-white rounded-lg">
                    <Database className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-emerald-800">Data Only</p>
                    <p className="text-sm text-emerald-600">Data without schema</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Backups List */}
          <div className="bg-white rounded-2xl shadow-xs border border-gray-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Backup History
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {backups.length} backup{backups.length !== 1 ? 's' : ''} found
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg">
                  Total Size: {stats.totalSize}
                </span>
                <span className="text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg">
                  Verified: {stats.verifiedBackups}
                </span>
              </div>
            </div>
            
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="relative">
                  <div className="h-16 w-16 rounded-full border-4 border-gray-200"></div>
                  <div className="absolute top-0 left-0 h-16 w-16 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
                </div>
                <span className="mt-4 text-gray-600 font-medium">Loading backups...</span>
              </div>
            ) : backups.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Database className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No backups found</h3>
                <p className="text-gray-500 max-w-md mx-auto">Create your first backup to secure your database.</p>
                <button
                  onClick={() => handleStartBackup('full')}
                  disabled={backupLoading}
                  className="mt-6 px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
                >
                  Create First Backup
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Backup Details</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Size</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Created</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {backups.map((backup) => {
                      const formattedDate = formatDate(backup.backup_start);
                      return (
                        <tr key={backup.id} className="hover:bg-gray-50/50 transition-colors duration-150">
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-gray-400" />
                                <p className="font-medium text-gray-900">{backup.backup_name}</p>
                              </div>
                              <button
                                onClick={() => handleCopyPath(backup.file_path)}
                                className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                                title="Copy path"
                              >
                                <Copy className="h-3 w-3" />
                                {backup.file_path?.length > 40 
                                  ? backup.file_path.substring(0, 40) + '...'
                                  : backup.file_path || 'No path'
                                }
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${
                              backup.backup_type === 'FULL' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                              backup.backup_type === 'SCHEMA' ? 'bg-gray-50 text-gray-700 border border-gray-100' :
                              'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            }`}>
                              {backup.backup_type}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-gray-700 font-medium">{backup.file_size || 'N/A'}</p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-gray-900">{formattedDate.date}</p>
                              <p className="text-xs text-gray-500">{formattedDate.time}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(backup.status)}`}>
                                {backup.status}
                              </span>
                              {backup.verification_status && (
                                <ShieldCheck className="h-4 w-4 text-emerald-500" title="Verified" />
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleDownloadBackup(backup.id, backup.backup_name)}
                                className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                                title="Download Backup"
                              >
                                <Download className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleRestoreBackup(backup.id)}
                                className="p-2 text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors duration-200"
                                title="Restore Backup"
                              >
                                <Play className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteBackup(backup.id)}
                                className="p-2 text-gray-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors duration-200"
                                title="Delete Backup"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Restore Tab */}
      {activeTab === 'restore' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-xs border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-amber-100 rounded-lg">
                <AlertCircle className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Database Restore</h3>
                <p className="text-gray-600">Restore database from backup files</p>
              </div>
            </div>

            <div className="space-y-8">
              {/* Warning */}
              <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-rose-800 text-lg mb-2">⚠️ Critical Operation Warning</h4>
                    <p className="text-rose-700">
                      Restoring a backup will overwrite ALL current database data. This operation cannot be undone.
                      Ensure you have a current backup before proceeding. System will be unavailable during restore.
                    </p>
                  </div>
                </div>
              </div>

              {/* Backup Selection */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Select Backup to Restore</h4>
                {backups.filter(b => b.status === 'COMPLETED').length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl">
                    <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No completed backups available for restore</p>
                    <p className="text-sm text-gray-400 mt-2">Create a backup first before attempting restore</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                    {backups
                      .filter(b => b.status === 'COMPLETED')
                      .map(backup => {
                        const formattedDate = formatDate(backup.backup_start);
                        return (
                          <div key={backup.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors duration-200">
                            <div className="flex items-start gap-3 mb-3 sm:mb-0">
                              <FileText className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="font-medium text-gray-900">{backup.backup_name}</p>
                                <div className="flex flex-wrap items-center gap-4 mt-2">
                                  <span className="text-sm text-gray-600">{backup.file_size || 'N/A'}</span>
                                  <span className="text-sm text-gray-600">{formattedDate.full}</span>
                                  {backup.verification_status && (
                                    <span className="flex items-center gap-1 text-sm text-emerald-600">
                                      <ShieldCheck className="h-3 w-3" />
                                      Verified
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => handleRestoreBackup(backup.id)}
                              disabled={backupLoading}
                              className="px-4 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-lg hover:from-amber-700 hover:to-amber-800 transition-all duration-200 shadow-xs hover:shadow-sm disabled:opacity-50"
                            >
                              Restore Now
                            </button>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-xs border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">System Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 border border-gray-200 rounded-xl">
                <h4 className="font-medium text-gray-900 mb-3">Database Info</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Database:</span>
                    <span className="font-medium">{systemInfo.database || 'Loading...'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Size:</span>
                    <span className="font-medium">{systemInfo.database_size || 'Loading...'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Host:</span>
                    <span className="font-medium">{systemInfo.host || 'Loading...'}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 border border-gray-200 rounded-xl">
                <h4 className="font-medium text-gray-900 mb-3">Storage Info</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Backup Directory:</span>
                    <span className="font-medium text-right max-w-[200px] truncate">{systemInfo.backup_dir || 'Loading...'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Disk Space:</span>
                    <span className="font-medium">{systemInfo.disk_space || 'Loading...'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Retention Days:</span>
                    <span className="font-medium">{systemInfo.retention_days || '30'} days</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-200">
              <h4 className="font-medium text-gray-900 mb-4">Backup Instructions</h4>
              <div className="space-y-3 text-sm text-gray-600">
                <p>1. Backups are stored in: <code className="bg-gray-100 px-2 py-1 rounded">{systemInfo.backup_dir || '/database_backups'}</code></p>
                <p>2. You can copy backup files to external storage (USB drive, cloud storage, etc.)</p>
                <p>3. For additional safety, store backups in multiple locations</p>
                <p>4. Regular backups are recommended (daily for production systems)</p>
                <p>5. Test restores periodically to ensure backup integrity</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={handleOpenBackupFolder}
                className="px-8 py-3.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-medium transition-colors duration-200"
              >
                Open Backup Folder
              </button>
              <button
                onClick={handleCleanBackups}
                className="px-8 py-3.5 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 font-medium shadow-xs hover:shadow-sm transition-all duration-200"
              >
                Clean Old Backups
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Monitor Tab */}
      {activeTab === 'monitor' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-xs border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Backup Monitoring</h3>

            <div className="space-y-8">
              {/* Performance Metrics */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Performance Metrics</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-5 border border-gray-200 rounded-xl bg-gray-50/50">
                    <p className="text-sm text-gray-600 mb-2">Success Rate</p>
                    <p className="text-3xl font-bold text-emerald-600">{stats.successRate}%</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                      <div 
                        className="bg-emerald-600 h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${stats.successRate}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="p-5 border border-gray-200 rounded-xl bg-gray-50/50">
                    <p className="text-sm text-gray-600 mb-2">Average Duration</p>
                    <p className="text-3xl font-bold text-blue-600">{formatDuration(stats.avg_duration)}</p>
                    <p className="text-sm text-gray-600 mt-2">Last backup: {formatDuration(stats.avg_duration)}</p>
                  </div>
                  <div className="p-5 border border-gray-200 rounded-xl bg-gray-50/50">
                    <p className="text-sm text-gray-600 mb-2">Storage Utilization</p>
                    <p className="text-3xl font-bold text-purple-600">{stats.totalSize}</p>
                    <p className="text-sm text-gray-600 mt-2">{stats.fileBackupCount || 0} backup files</p>
                  </div>
                </div>
              </div>

              {/* Recent Activities */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-900">Recent Activities</h4>
                  <span className="text-sm text-gray-500">{backups.length} total backups</span>
                </div>
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  {backups.slice(0, 10).map(backup => {
                    const formattedDate = formatDate(backup.backup_start);
                    return (
                      <div key={backup.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors duration-200">
                        <div>
                          <p className="font-medium text-gray-900">
                            <span className={`inline-block h-2 w-2 rounded-full mr-2 ${
                              backup.status === 'COMPLETED' ? 'bg-emerald-500' :
                              backup.status === 'IN_PROGRESS' ? 'bg-amber-500' :
                              'bg-rose-500'
                            }`}></span>
                            {backup.backup_name}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {formattedDate.full} • {backup.file_size}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(backup.status)}`}>
                            {backup.status}
                          </span>
                          {backup.verification_status && (
                            <ShieldCheck className="h-4 w-4 text-emerald-500" title="Verified" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BackupRestore;