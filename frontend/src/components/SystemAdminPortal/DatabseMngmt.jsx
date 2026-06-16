import React, { useState } from 'react';
import { 
  Database, Download, Upload, 
  Trash2, Clock, CheckCircle, AlertCircle,
  Server, HardDrive, Lock, Eye, FileText,
  BarChart, Search, Filter, Calendar,
  Shield, Key
} from 'lucide-react';

const DatabaseManagement = () => {
  const [tables, setTables] = useState([
    { name: 'sms_app_user', rows: 156, size: '45 MB', description: 'System users and authentication' },
    { name: 'sms_app_student', rows: 1245, size: '320 MB', description: 'Student information and records' },
    { name: 'sms_app_staff', rows: 142, size: '85 MB', description: 'Staff and employee data' },
    { name: 'sms_app_examresult', rows: 12450, size: '780 MB', description: 'Examination results and grades' },
    { name: 'sms_app_feetransaction', rows: 8956, size: '420 MB', description: 'Fee payments and transactions' },
    { name: 'sms_app_class', rows: 48, size: '12 MB', description: 'Class and stream information' },
    { name: 'sms_app_subject', rows: 32, size: '8 MB', description: 'Subject and curriculum data' },
    { name: 'sms_app_timetable', rows: 1560, size: '95 MB', description: 'Class timetables and schedules' },
  ]);

  const [backups, setBackups] = useState([
    { id: 1, name: 'full_backup_20240325.sql', size: '2.4 GB', type: 'Full', date: '2024-03-25 02:00', status: 'completed' },
    { id: 2, name: 'incremental_20240324.sql', size: '450 MB', type: 'Incremental', date: '2024-03-24 02:00', status: 'completed' },
    { id: 3, name: 'full_backup_20240323.sql', size: '2.3 GB', type: 'Full', date: '2024-03-23 02:00', status: 'completed' },
    { id: 4, name: 'schema_only_20240322.sql', size: '45 MB', type: 'Schema', date: '2024-03-22 02:00', status: 'completed' },
    { id: 5, name: 'backup_in_progress.sql', size: '1.2 GB', type: 'Full', date: '2024-03-25 14:30', status: 'in-progress' },
  ]);

  const [activeTab, setActiveTab] = useState('tables');
  const [selectedTables, setSelectedTables] = useState([]);

  const handleTableSelect = (tableName) => {
    setSelectedTables(prev => 
      prev.includes(tableName) 
        ? prev.filter(name => name !== tableName)
        : [...prev, tableName]
    );
  };

  const handleBackupNow = () => {
    alert('Starting database backup...');
    // Add backup logic here
  };

  const handleRestoreBackup = (backupId) => {
    if (window.confirm('Are you sure you want to restore this backup? This will overwrite current data.')) {
      alert(`Restoring backup ${backupId}...`);
    }
  };

  const handleOptimizeTables = () => {
    alert('Optimizing selected tables...');
  };

  const handleVacuumDatabase = () => {
    alert('Running database VACUUM operation...');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 overflow-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Database Management</h1>
        <p className="text-gray-600 mt-2">Manage database tables, backups, and maintenance operations</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`px-6 py-3 font-medium ${activeTab === 'tables' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('tables')}
        >
          Database Tables
        </button>
        <button
          className={`px-6 py-3 font-medium ${activeTab === 'backup' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('backup')}
        >
          Backups & Restore
        </button>
        <button
          className={`px-6 py-3 font-medium ${activeTab === 'maintenance' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('maintenance')}
        >
          Maintenance
        </button>
        <button
          className={`px-6 py-3 font-medium ${activeTab === 'queries' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('queries')}
        >
          SQL Queries
        </button>
      </div>

      {/* Database Tables Tab */}
      {activeTab === 'tables' && (
        <div className="space-y-6">
          {/* Database Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Database Information</h3>
              <div className="flex items-center text-sm text-gray-600">
                <Server className="h-4 w-4 mr-2" />
                <span>PostgreSQL 16.10</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Size</p>
                <p className="text-2xl font-bold text-gray-800">4.2 GB</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Tables Count</p>
                <p className="text-2xl font-bold text-gray-800">{tables.length}</p>
              </div>
              <div className="p-4 bg-amber-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Rows</p>
                <p className="text-2xl font-bold text-gray-800">
                  {tables.reduce((sum, table) => sum + table.rows, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Tables List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Database Tables</h3>
              <div className="flex gap-3">
                <button
                  onClick={handleOptimizeTables}
                  disabled={selectedTables.length === 0}
                  className={`px-4 py-2 rounded-lg flex items-center ${
                    selectedTables.length === 0
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {/* <Refresh className="h-4 w-4 mr-2" /> */}
                  Optimize Selected
                </button>
                <button
                  onClick={() => setSelectedTables(tables.map(t => t.name))}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Select All
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                      <input
                        type="checkbox"
                        checked={selectedTables.length === tables.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTables(tables.map(t => t.name));
                          } else {
                            setSelectedTables([]);
                          }
                        }}
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Table Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rows</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {tables.map((table) => (
                    <tr key={table.name} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedTables.includes(table.name)}
                          onChange={() => handleTableSelect(table.name)}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Database className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="font-mono text-sm text-gray-800">{table.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-gray-700">{table.rows.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-gray-700">{table.size}</span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600">{table.description}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="p-1 text-amber-600 hover:bg-amber-50 rounded">
                            <FileText className="h-4 w-4" />
                          </button>
                          <button className="p-1 text-green-600 hover:bg-green-50 rounded">
                            <Download className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Backups Tab */}
      {activeTab === 'backup' && (
        <div className="space-y-6">
          {/* Backup Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Database Backups</h3>
                <p className="text-gray-600">Schedule and manage database backups</p>
              </div>
              <div className="flex gap-3">
                <button className="px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center">
                  <Upload className="h-4 w-4 mr-2" />
                  Import Backup
                </button>
                <button
                  onClick={handleBackupNow}
                  className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                >
                  {/* <Backup className="h-4 w-4 mr-2" /> */}
                  Backup Now
                </button>
              </div>
            </div>

            {/* Backup Schedule */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">Automatic Backup Schedule</p>
                  <p className="text-sm text-gray-600">Daily at 02:00 AM • Full backup every Sunday</p>
                </div>
                <button className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                  Edit Schedule
                </button>
              </div>
            </div>
          </div>

          {/* Backups List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Available Backups</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Backup Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {backups.map((backup) => (
                    <tr key={backup.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="font-mono text-sm text-gray-800">{backup.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                          backup.type === 'Full' ? 'bg-blue-100 text-blue-800' :
                          backup.type === 'Incremental' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {backup.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700">{backup.size}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700">{backup.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {backup.status === 'completed' ? (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                              <span className="text-green-600">Completed</span>
                            </>
                          ) : (
                            <>
                              {/* <Refresh className="h-4 w-4 text-amber-500 animate-spin mr-2" /> */}
                              <span className="text-amber-600">In Progress</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleRestoreBackup(backup.id)}
                            className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm font-medium"
                            disabled={backup.status === 'in-progress'}
                          >
                            {/* <Restore className="inline h-3 w-3 mr-1" /> */}
                            Restore
                          </button>
                          <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                            <Download className="h-4 w-4" />
                          </button>
                          <button className="p-1 text-red-600 hover:bg-red-50 rounded">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Backup Storage */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h4 className="font-semibold text-gray-800 mb-4">Storage Usage</h4>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600">Backup Storage</span>
                    <span className="text-sm font-medium text-gray-700">8.2 GB / 50 GB</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '16.4%' }}></div>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  <p>• 30 days retention policy</p>
                  <p>• Automatic cleanup of old backups</p>
                  <p>• Encrypted backups in transit and at rest</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h4 className="font-semibold text-gray-800 mb-4">Backup Settings</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Compression</span>
                  <span className="text-sm font-medium text-green-600">Enabled</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Encryption</span>
                  <span className="text-sm font-medium text-green-600">AES-256</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Verification</span>
                  <span className="text-sm font-medium text-green-600">Automatic</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Remote Storage</span>
                  <span className="text-sm font-medium text-amber-600">Not Configured</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Maintenance Tab */}
      {activeTab === 'maintenance' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Database Maintenance</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="p-5 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg mr-3">
                    {/* <Refresh className="h-5 w-5" /> */}
                  </div>
                  <h4 className="font-semibold text-gray-800">Optimize Tables</h4>
                </div>
                <p className="text-sm text-gray-600 mb-4">Reclaim unused space and defragment tables for better performance.</p>
                <button
                  onClick={handleOptimizeTables}
                  className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Run Optimization
                </button>
              </div>

              <div className="p-5 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-green-100 text-green-600 rounded-lg mr-3">
                    <HardDrive className="h-5 w-5" />
                  </div>
                  <h4 className="font-semibold text-gray-800">Vacuum Database</h4>
                </div>
                <p className="text-sm text-gray-600 mb-4">Clean up dead tuples and update statistics for query planner.</p>
                <button
                  onClick={handleVacuumDatabase}
                  className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Run VACUUM
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-amber-100 text-amber-600 rounded-lg mr-3">
                    <BarChart className="h-5 w-5" />
                  </div>
                  <h4 className="font-semibold text-gray-800">Update Statistics</h4>
                </div>
                <p className="text-sm text-gray-600 mb-4">Refresh query planner statistics for optimal query performance.</p>
                <button className="w-full py-2 border border-amber-600 text-amber-600 rounded-lg hover:bg-amber-50">
                  Update Statistics
                </button>
              </div>

              <div className="p-5 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-red-100 text-red-600 rounded-lg mr-3">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                  <h4 className="font-semibold text-gray-800">Integrity Check</h4>
                </div>
                <p className="text-sm text-gray-600 mb-4">Verify database integrity and check for corruption issues.</p>
                <button className="w-full py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50">
                  Run Integrity Check
                </button>
              </div>
            </div>
          </div>

          {/* Maintenance Schedule */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h4 className="font-semibold text-gray-800 mb-4">Maintenance Schedule</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">Daily Statistics Update</p>
                  <p className="text-sm text-gray-600">Runs every day at 03:00 AM</p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">Active</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">Weekly Optimization</p>
                  <p className="text-sm text-gray-600">Runs every Sunday at 01:00 AM</p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">Active</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">Monthly Integrity Check</p>
                  <p className="text-sm text-gray-600">Runs first day of month at 02:00 AM</p>
                </div>
                <span className="px-3 py-1 bg-amber-100 text-amber-800 text-sm rounded-full">Pending</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SQL Queries Tab */}
      {activeTab === 'queries' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">SQL Query Interface</h3>
            <p className="text-gray-600 mb-6">Execute SQL queries directly on the database. Use with caution.</p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">SQL Query</label>
              <textarea
                rows="6"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                placeholder="SELECT * FROM sms_app_user WHERE is_active = true;"
              />
            </div>

            <div className="flex justify-between items-center">
              <div className="flex gap-3">
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                  Explain Query
                </button>
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                  Format SQL
                </button>
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                  Save Query
                </button>
              </div>
              <div className="flex gap-3">
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                  Clear
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Execute Query
                </button>
              </div>
            </div>
          </div>

          {/* Saved Queries */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h4 className="font-semibold text-gray-800 mb-4">Saved Queries</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h5 className="font-medium text-gray-800">Active Users Count</h5>
                  <button className="text-blue-600 hover:text-blue-800 text-sm">Run</button>
                </div>
                <code className="text-xs text-gray-600 bg-gray-50 p-2 rounded block">
                  SELECT COUNT(*) FROM sms_app_user WHERE is_active = true;
                </code>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h5 className="font-medium text-gray-800">Recent Transactions</h5>
                  <button className="text-blue-600 hover:text-blue-800 text-sm">Run</button>
                </div>
                <code className="text-xs text-gray-600 bg-gray-50 p-2 rounded block">
                  SELECT * FROM sms_app_feetransaction ORDER BY payment_date DESC LIMIT 10;
                </code>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h5 className="font-medium text-gray-800">Student Statistics</h5>
                  <button className="text-blue-600 hover:text-blue-800 text-sm">Run</button>
                </div>
                <code className="text-xs text-gray-600 bg-gray-50 p-2 rounded block">
                  SELECT status, COUNT(*) FROM sms_app_student GROUP BY status;
                </code>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h5 className="font-medium text-gray-800">Staff by Department</h5>
                  <button className="text-blue-600 hover:text-blue-800 text-sm">Run</button>
                </div>
                <code className="text-xs text-gray-600 bg-gray-50 p-2 rounded block">
                  SELECT department, COUNT(*) FROM sms_app_staff GROUP BY department;
                </code>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatabaseManagement;