import React, { useState, useEffect } from 'react';
import { 
  Users, Database, Settings, Shield, Activity, 
  AlertCircle, Server, FileText, Key
} from 'lucide-react';
// , Globe,
  // BarChart, Lock, Eye, Edit, Trash2, Plus,
  // Download, Upload, Refresh, Search, Filter
const AdminDashboard = () => {
  const [systemStats, setSystemStats] = useState({
    totalUsers: 156,
    activeSessions: 42,
    databaseSize: '2.4 GB',
    auditLogs: '1,245',
    backupCount: 12,
    systemHealth: 'Excellent',
    apiRequests: '4,523',
    storageUsed: '65%'
  });

  const [recentActivities, setRecentActivities] = useState([
    { id: 1, user: 'admin', action: 'User account created', table: 'sms_app_user', timestamp: '2024-03-25 14:30', ip: '192.168.1.100' },
    { id: 2, user: 'hr_manager', action: 'Staff record updated', table: 'sms_app_staff', timestamp: '2024-03-25 13:15', ip: '192.168.1.101' },
    { id: 3, user: 'finance', action: 'Fee transaction recorded', table: 'sms_app_feetransaction', timestamp: '2024-03-25 11:45', ip: '192.168.1.102' },
    { id: 4, user: 'admin', action: 'System settings updated', table: 'sms_app_systemsetting', timestamp: '2024-03-25 10:20', ip: '192.168.1.100' },
    { id: 5, user: 'teacher', action: 'Exam results entered', table: 'sms_app_examresult', timestamp: '2024-03-25 09:30', ip: '192.168.1.103' }
  ]);

  const [systemAlerts, setSystemAlerts] = useState([
    { id: 1, severity: 'high', message: 'Database backup overdue', timestamp: '2 hours ago' },
    { id: 2, severity: 'medium', message: 'Storage usage above 80% threshold', timestamp: '5 hours ago' },
    { id: 3, severity: 'low', message: 'User login attempts from unusual location', timestamp: 'Yesterday' }
  ]);

  return (
    <div className="min-h-screen bg-gray-50 p-6 overflow-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">System Administration</h1>
        <p className="text-gray-600 mt-2">Complete system management and monitoring dashboard</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Users" 
          value={systemStats.totalUsers} 
          icon={<Users className="h-6 w-6" />}
          color="bg-blue-500"
          trend="+8 this month"
        />
        <StatCard 
          title="Database Size" 
          value={systemStats.databaseSize} 
          icon={<Database className="h-6 w-6" />}
          color="bg-green-500"
          trend="Growing 0.2GB/week"
        />
        <StatCard 
          title="Active Sessions" 
          value={systemStats.activeSessions} 
          icon={<Activity className="h-6 w-6" />}
          color="bg-amber-500"
          trend="42 concurrent"
        />
        <StatCard 
          title="System Health" 
          value={systemStats.systemHealth} 
          icon={<Server className="h-6 w-6" />}
          color="bg-green-500"
          trend="All systems operational"
        />
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Recent Activities */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Recent System Activities</h2>
            <button className="px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg">
              View All Logs
            </button>
          </div>
          <div className="space-y-4">
            {recentActivities.map(activity => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        </div>

        {/* System Alerts */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">System Alerts</h2>
            <span className="px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full">
              {systemAlerts.length} Active
            </span>
          </div>
          <div className="space-y-4">
            {systemAlerts.map(alert => (
              <AlertItem key={alert.id} alert={alert} />
            ))}
          </div>
        </div>
      </div>

      {/* Quick Admin Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Quick Admin Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <AdminAction 
            icon={<Users />}
            title="Manage Users"
            description="User accounts"
            href="/admin/users"
          />
          <AdminAction 
            icon={<Database />}
            title="Backup DB"
            description="Database backup"
            href="/admin/backup"
          />
          <AdminAction 
            icon={<Settings />}
            title="System Settings"
            description="Configuration"
            href="/admin/settings"
          />
          <AdminAction 
            icon={<Shield />}
            title="Permissions"
            description="Access control"
            href="/admin/permissions"
          />
          <AdminAction 
            icon={<FileText />}
            title="Audit Logs"
            description="Activity tracking"
            href="/admin/audit"
          />
          <AdminAction 
            icon={<Key />}
            title="API Keys"
            description="Access tokens"
            href="/admin/api"
          />
        </div>
      </div>

      {/* System Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Database Tables Overview</h3>
          <div className="space-y-3">
            <TableStats name="sms_app_user" records="156" size="45 MB" />
            <TableStats name="sms_app_student" records="1,245" size="320 MB" />
            <TableStats name="sms_app_staff" records="142" size="85 MB" />
            <TableStats name="sms_app_examresult" records="12,450" size="780 MB" />
            <TableStats name="sms_app_feetransaction" records="8,956" size="420 MB" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">System Health Metrics</h3>
          <div className="space-y-4">
            <MetricItem label="CPU Usage" value="42%" color="bg-green-500" />
            <MetricItem label="Memory Usage" value="68%" color="bg-amber-500" />
            <MetricItem label="Storage Used" value={systemStats.storageUsed} color="bg-blue-500" />
            <MetricItem label="Network Traffic" value="125 MB/s" color="bg-purple-500" />
            <MetricItem label="API Response Time" value="125ms" color="bg-green-500" />
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color, trend }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm text-gray-600 mb-2">{title}</p>
        <p className="text-3xl font-bold text-gray-800">{value}</p>
        <p className="text-sm text-gray-500 mt-2">{trend}</p>
      </div>
      <div className={`p-3 rounded-lg ${color} text-white`}>
        {icon}
      </div>
    </div>
  </div>
);

const ActivityItem = ({ activity }) => (
  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
    <div className="flex-1">
      <p className="font-medium text-gray-800">{activity.action}</p>
      <div className="flex items-center text-sm text-gray-500 mt-1">
        <span className="bg-gray-100 px-2 py-1 rounded mr-3">{activity.table}</span>
        <span className="mr-3">by {activity.user}</span>
        <span>{activity.timestamp}</span>
      </div>
    </div>
    <span className="text-sm text-gray-500">{activity.ip}</span>
  </div>
);

const AlertItem = ({ alert }) => (
  <div className={`flex items-start p-3 border rounded-lg ${
    alert.severity === 'high' ? 'border-red-200 bg-red-50' :
    alert.severity === 'medium' ? 'border-amber-200 bg-amber-50' :
    'border-blue-200 bg-blue-50'
  }`}>
    <AlertCircle className={`h-5 w-5 mt-0.5 mr-3 ${
      alert.severity === 'high' ? 'text-red-600' :
      alert.severity === 'medium' ? 'text-amber-600' :
      'text-blue-600'
    }`} />
    <div className="flex-1">
      <p className="font-medium text-gray-800">{alert.message}</p>
      <p className="text-sm text-gray-500 mt-1">{alert.timestamp}</p>
    </div>
  </div>
);

const AdminAction = ({ icon, title, description, href }) => (
  <a href={href} className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
    <div className="p-3 bg-blue-100 text-blue-600 rounded-lg mb-3">
      {icon}
    </div>
    <h3 className="font-semibold text-gray-800 text-center mb-1">{title}</h3>
    <p className="text-sm text-gray-600 text-center">{description}</p>
  </a>
);

const TableStats = ({ name, records, size }) => (
  <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
    <div>
      <p className="font-mono text-sm text-gray-800">{name}</p>
      <p className="text-xs text-gray-500">{records} records</p>
    </div>
    <span className="text-sm text-gray-700">{size}</span>
  </div>
);

const MetricItem = ({ label, value, color }) => (
  <div>
    <div className="flex justify-between mb-1">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <span className="text-sm font-medium text-gray-700">{value}</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div 
        className={`h-2 rounded-full ${color}`}
        style={{ width: value.replace('%', '') + '%' }}
      ></div>
    </div>
  </div>
);

export default AdminDashboard;