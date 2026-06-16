import React, { useState, useEffect } from 'react';
import { 
  Settings, Save,Globe, Lock, Bell, 
  Mail, Database, Shield, Key, Users, Calendar,
  FileText, Upload, Download, Eye, EyeOff,
  CheckCircle, XCircle, AlertCircle, Server
} from 'lucide-react';

const SystemSettings = () => {
  const [settings, setSettings] = useState({
    // General Settings
    schoolName: 'Prestige High School',
    schoolAddress: '123 Main Street, Nairobi, Kenya',
    schoolPhone: '+254 700 123 456',
    schoolEmail: 'info@school.ac.ke',
    websiteUrl: 'https://school.ac.ke',
    academicYear: '2023-2024',
    timezone: 'Africa/Nairobi',
    dateFormat: 'DD/MM/YYYY',
    language: 'en',
    
    // Security Settings
    passwordMinLength: 8,
    passwordRequireUppercase: true,
    passwordRequireLowercase: true,
    passwordRequireNumbers: true,
    passwordRequireSpecial: true,
    maxLoginAttempts: 5,
    lockoutDuration: 30,
    sessionTimeout: 60,
    mfaRequired: false,
    ipWhitelist: '',
    
    // Email Settings
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpUsername: 'noreply@school.ac.ke',
    smtpUseTls: true,
    emailFrom: 'Prestige High School <noreply@school.ac.ke>',
    
    // Database Settings
    dbBackupEnabled: true,
    dbBackupTime: '02:00',
    dbBackupRetention: 30,
    dbAutoOptimize: true,
    
    // Notification Settings
    notifyNewUser: true,
    notifyFailedLogin: true,
    notifySystemAlert: true,
    notifyBackupComplete: true,
    
    // API Settings
    apiEnabled: true,
    apiRateLimit: 100,
    apiKeyExpiry: 90,
    apiLogging: true
  });

  const [activeTab, setActiveTab] = useState('general');
  const [changedSettings, setChangedSettings] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setChangedSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = () => {
    // Save settings to backend
    alert('Settings saved successfully!');
    setChangedSettings({});
  };

  const handleResetToDefault = () => {
    if (window.confirm('Are you sure you want to reset all settings to default?')) {
      // Reset settings logic
      alert('Settings reset to default.');
    }
  };

  const handleExportSettings = () => {
    // Export settings logic
    alert('Settings exported successfully!');
  };

  const handleImportSettings = () => {
    // Import settings logic
    alert('Settings imported successfully!');
  };

  const hasChanges = Object.keys(changedSettings).length > 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6 overflow-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">System Settings</h1>
        <p className="text-gray-600 mt-2">Configure system-wide settings and preferences</p>
      </div>

      {/* Settings Container */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-gray-200 overflow-x-auto">
          <button
            className={`px-6 py-4 font-medium whitespace-nowrap ${activeTab === 'general' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('general')}
          >
            <Globe className="inline h-4 w-4 mr-2" />
            General
          </button>
          <button
            className={`px-6 py-4 font-medium whitespace-nowrap ${activeTab === 'security' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('security')}
          >
            <Lock className="inline h-4 w-4 mr-2" />
            Security
          </button>
          <button
            className={`px-6 py-4 font-medium whitespace-nowrap ${activeTab === 'email' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('email')}
          >
            <Mail className="inline h-4 w-4 mr-2" />
            Email
          </button>
          <button
            className={`px-6 py-4 font-medium whitespace-nowrap ${activeTab === 'database' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('database')}
          >
            <Database className="inline h-4 w-4 mr-2" />
            Database
          </button>
          <button
            className={`px-6 py-4 font-medium whitespace-nowrap ${activeTab === 'notifications' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('notifications')}
          >
            <Bell className="inline h-4 w-4 mr-2" />
            Notifications
          </button>
          <button
            className={`px-6 py-4 font-medium whitespace-nowrap ${activeTab === 'api' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('api')}
          >
            <Key className="inline h-4 w-4 mr-2" />
            API
          </button>
          <button
            className={`px-6 py-4 font-medium whitespace-nowrap ${activeTab === 'advanced' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('advanced')}
          >
            <Settings className="inline h-4 w-4 mr-2" />
            Advanced
          </button>
        </div>

        {/* Settings Content */}
        <div className="p-6">
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">General Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">School Name *</label>
                  <input
                    type="text"
                    value={settings.schoolName}
                    onChange={(e) => handleSettingChange('schoolName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year *</label>
                  <input
                    type="text"
                    value={settings.academicYear}
                    onChange={(e) => handleSettingChange('academicYear', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">School Address</label>
                <textarea
                  rows="2"
                  value={settings.schoolAddress}
                  onChange={(e) => handleSettingChange('schoolAddress', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={settings.schoolPhone}
                    onChange={(e) => handleSettingChange('schoolPhone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={settings.schoolEmail}
                    onChange={(e) => handleSettingChange('schoolEmail', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
                  <input
                    type="url"
                    value={settings.websiteUrl}
                    onChange={(e) => handleSettingChange('websiteUrl', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                  <select
                    value={settings.timezone}
                    onChange={(e) => handleSettingChange('timezone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="Africa/Nairobi">Africa/Nairobi (EAT)</option>
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">America/New York (EST)</option>
                    <option value="Europe/London">Europe/London (GMT)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Format</label>
                  <select
                    value={settings.dateFormat}
                    onChange={(e) => handleSettingChange('dateFormat', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                  <select
                    value={settings.language}
                    onChange={(e) => handleSettingChange('language', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="en">English</option>
                    <option value="sw">Swahili</option>
                    <option value="fr">French</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Security Settings</h3>
              
              <div className="space-y-4">
                <h4 className="font-medium text-gray-700">Password Policy</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Password Length</label>
                    <input
                      type="number"
                      min="6"
                      max="32"
                      value={settings.passwordMinLength}
                      onChange={(e) => handleSettingChange('passwordMinLength', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Session Timeout (minutes)</label>
                    <input
                      type="number"
                      min="5"
                      max="480"
                      value={settings.sessionTimeout}
                      onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Login Attempts</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={settings.maxLoginAttempts}
                      onChange={(e) => handleSettingChange('maxLoginAttempts', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Lockout Duration (minutes)</label>
                    <input
                      type="number"
                      min="1"
                      max="1440"
                      value={settings.lockoutDuration}
                      onChange={(e) => handleSettingChange('lockoutDuration', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-gray-700">Password Requirements</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.passwordRequireUppercase}
                        onChange={(e) => handleSettingChange('passwordRequireUppercase', e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Require uppercase letters</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.passwordRequireLowercase}
                        onChange={(e) => handleSettingChange('passwordRequireLowercase', e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Require lowercase letters</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.passwordRequireNumbers}
                        onChange={(e) => handleSettingChange('passwordRequireNumbers', e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Require numbers</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.passwordRequireSpecial}
                        onChange={(e) => handleSettingChange('passwordRequireSpecial', e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Require special characters</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-gray-700">Multi-Factor Authentication</h4>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.mfaRequired}
                      onChange={(e) => handleSettingChange('mfaRequired', e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Require MFA for all users</span>
                  </label>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700 mb-2">IP Whitelist</h4>
                  <textarea
                    rows="3"
                    value={settings.ipWhitelist}
                    onChange={(e) => handleSettingChange('ipWhitelist', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                    placeholder="Enter IP addresses (one per line)"
                  />
                  <p className="text-sm text-gray-500 mt-1">Leave empty to allow access from any IP address.</p>
                </div>
              </div>
            </div>
          )}

          {/* Email Settings */}
          {activeTab === 'email' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Email Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Host</label>
                  <input
                    type="text"
                    value={settings.smtpHost}
                    onChange={(e) => handleSettingChange('smtpHost', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Port</label>
                  <input
                    type="number"
                    value={settings.smtpPort}
                    onChange={(e) => handleSettingChange('smtpPort', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Username</label>
                  <input
                    type="text"
                    value={settings.smtpUsername}
                    onChange={(e) => handleSettingChange('smtpUsername', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value="••••••••"
                      onChange={(e) => handleSettingChange('smtpPassword', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From Email Address</label>
                <input
                  type="email"
                  value={settings.emailFrom}
                  onChange={(e) => handleSettingChange('emailFrom', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-gray-700">Connection Security</h4>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.smtpUseTls}
                    onChange={(e) => handleSettingChange('smtpUseTls', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Use TLS/SSL encryption</span>
                </label>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-blue-800">Test Email Configuration</p>
                    <p className="text-sm text-blue-700 mt-1">
                      Send a test email to verify your SMTP settings are working correctly.
                    </p>
                    <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                      Send Test Email
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Database Settings */}
          {activeTab === 'database' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Database Settings</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800">Automatic Backups</p>
                    <p className="text-sm text-gray-600">Schedule automatic database backups</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.dbBackupEnabled}
                      onChange={(e) => handleSettingChange('dbBackupEnabled', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {settings.dbBackupEnabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ml-6 pl-4 border-l-2 border-gray-200">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Backup Time</label>
                      <input
                        type="time"
                        value={settings.dbBackupTime}
                        onChange={(e) => handleSettingChange('dbBackupTime', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Retention Days</label>
                      <input
                        type="number"
                        min="1"
                        max="365"
                        value={settings.dbBackupRetention}
                        onChange={(e) => handleSettingChange('dbBackupRetention', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <h4 className="font-medium text-gray-700">Maintenance</h4>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.dbAutoOptimize}
                      onChange={(e) => handleSettingChange('dbAutoOptimize', e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Automatic database optimization</span>
                  </label>
                </div>

                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-amber-600 mr-2 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-amber-800">Database Information</p>
                      <div className="mt-2 space-y-1 text-sm text-amber-700">
                        <p>• Current size: 4.2 GB</p>
                        <p>• Last backup: 2024-03-25 02:00</p>
                        <p>• Next optimization: 2024-03-31 01:00</p>
                      </div>
                      <button className="mt-3 px-4 py-2 border border-amber-600 text-amber-600 rounded-lg hover:bg-amber-50 text-sm">
                        View Database Stats
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Settings */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Notification Settings</h3>
              
              <div className="space-y-4">
                <h4 className="font-medium text-gray-700">System Notifications</h4>
                
                <div className="space-y-3">
                  <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div>
                      <p className="font-medium text-gray-800">New User Registration</p>
                      <p className="text-sm text-gray-600">Notify when a new user account is created</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.notifyNewUser}
                      onChange={(e) => handleSettingChange('notifyNewUser', e.target.checked)}
                      className="h-5 w-5 text-blue-600"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div>
                      <p className="font-medium text-gray-800">Failed Login Attempts</p>
                      <p className="text-sm text-gray-600">Notify on multiple failed login attempts</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.notifyFailedLogin}
                      onChange={(e) => handleSettingChange('notifyFailedLogin', e.target.checked)}
                      className="h-5 w-5 text-blue-600"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div>
                      <p className="font-medium text-gray-800">System Alerts</p>
                      <p className="text-sm text-gray-600">Notify on critical system events</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.notifySystemAlert}
                      onChange={(e) => handleSettingChange('notifySystemAlert', e.target.checked)}
                      className="h-5 w-5 text-blue-600"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div>
                      <p className="font-medium text-gray-800">Backup Completion</p>
                      <p className="text-sm text-gray-600">Notify when database backup completes</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.notifyBackupComplete}
                      onChange={(e) => handleSettingChange('notifyBackupComplete', e.target.checked)}
                      className="h-5 w-5 text-blue-600"
                    />
                  </label>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Notification Channels</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-sm text-gray-700">Email</span>
                    </label>
                    <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-sm text-gray-700">SMS</span>
                    </label>
                    <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-sm text-gray-700">In-App</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* API Settings */}
          {activeTab === 'api' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">API Settings</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800">API Access</p>
                    <p className="text-sm text-gray-600">Enable/disable API access to the system</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.apiEnabled}
                      onChange={(e) => handleSettingChange('apiEnabled', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {settings.apiEnabled && (
                  <div className="space-y-6 ml-6 pl-4 border-l-2 border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Rate Limit (requests/hour)</label>
                        <input
                          type="number"
                          min="10"
                          max="10000"
                          value={settings.apiRateLimit}
                          onChange={(e) => handleSettingChange('apiRateLimit', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">API Key Expiry (days)</label>
                        <input
                          type="number"
                          min="1"
                          max="365"
                          value={settings.apiKeyExpiry}
                          onChange={(e) => handleSettingChange('apiKeyExpiry', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-700">API Logging</h4>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.apiLogging}
                          onChange={(e) => handleSettingChange('apiLogging', e.target.checked)}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">Enable API request logging</span>
                      </label>
                    </div>

                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <h4 className="font-medium text-gray-800 mb-2">API Endpoints</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center">
                          <span className="font-mono bg-gray-100 px-2 py-1 rounded mr-2">GET</span>
                          <span className="text-gray-700">/api/users</span>
                        </div>
                        <div className="flex items-center">
                          <span className="font-mono bg-gray-100 px-2 py-1 rounded mr-2">POST</span>
                          <span className="text-gray-700">/api/auth/login</span>
                        </div>
                        <div className="flex items-center">
                          <span className="font-mono bg-gray-100 px-2 py-1 rounded mr-2">PUT</span>
                          <span className="text-gray-700">/api/users/{'{id}'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Advanced Settings */}
          {activeTab === 'advanced' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Advanced Settings</h3>
              
              <div className="space-y-4">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-red-800">Warning</p>
                      <p className="text-sm text-red-700 mt-1">
                        These settings are for advanced users only. Incorrect configuration may cause system instability.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">System Log Level</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option value="DEBUG">DEBUG (Most verbose)</option>
                    <option value="INFO">INFO (Default)</option>
                    <option value="WARNING">WARNING</option>
                    <option value="ERROR">ERROR</option>
                    <option value="CRITICAL">CRITICAL (Least verbose)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cache TTL (seconds)</label>
                  <input
                    type="number"
                    min="60"
                    max="86400"
                    defaultValue="3600"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Session Storage</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option value="database">Database</option>
                    <option value="redis">Redis</option>
                    <option value="filesystem">File System</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-gray-700">Debug Mode</h4>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm text-gray-700">Enable debug mode (not recommended for production)</span>
                  </label>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-gray-700">Data Import/Export</h4>
                  <div className="flex gap-3">
                    <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center">
                      <Upload className="h-4 w-4 mr-2" />
                      Import Settings
                    </button>
                    <button 
                      onClick={handleExportSettings}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export Settings
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Bar */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
          <div>
            {hasChanges && (
              <div className="flex items-center text-amber-600">
                <AlertCircle className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">You have unsaved changes</span>
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleResetToDefault}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Reset to Default
            </button>
            <button
              onClick={handleSaveSettings}
              disabled={!hasChanges}
              className={`px-4 py-2 rounded-lg flex items-center ${
                hasChanges
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;