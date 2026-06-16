import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, FileText, CheckCircle, 
  Clock, AlertCircle, Calendar, DollarSign,
  TrendingUp, Activity
} from 'lucide-react';

const HrDashboard = () => {
  const [stats, setStats] = useState({
    totalStaff: 156,
    activeStaff: 142,
    pendingApplications: 8,
    onLeave: 12,
    recruitmentRequests: 5,
    approvedThisMonth: 4,
    pendingApprovals: 3,
    monthlyPayroll: 'KSh 4,850,000'
  });

  const [recentActivities, setRecentActivities] = useState([
    { id: 1, action: 'New teacher application submitted', user: 'John Doe', time: '2 hours ago', status: 'pending' },
    { id: 2, action: 'Admin approved recruitment request', user: 'Board Committee', time: 'Yesterday', status: 'approved' },
    { id: 3, action: 'Staff registration completed', user: 'HR Manager', time: '2 days ago', status: 'completed' },
    { id: 4, action: 'Leave request submitted', user: 'Mary Johnson', time: '3 days ago', status: 'pending' },
    { id: 5, action: 'Payroll processed for March', user: 'Finance Dept', time: '1 week ago', status: 'completed' }
  ]);

  const [upcomingEvents, setUpcomingEvents] = useState([
    { id: 1, title: 'Interview: Math Teacher', date: 'Tomorrow, 10:00 AM', type: 'interview' },
    { id: 2, title: 'Staff Meeting', date: 'April 15, 2024', type: 'meeting' },
    { id: 3, title: 'Payroll Processing', date: 'April 30, 2024', type: 'deadline' },
    { id: 4, title: 'Performance Reviews', date: 'May 5-10, 2024', type: 'review' }
  ]);

  return (
    <div className="min-h-screen bg-gray-50 p-6 overflow-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">HR Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back, HR Manager. Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Staff" 
          value={stats.totalStaff} 
          icon={<Users className="h-6 w-6" />}
          color="bg-blue-500"
          trend="+12% from last month"
        />
        <StatCard 
          title="Pending Applications" 
          value={stats.pendingApplications} 
          icon={<FileText className="h-6 w-6" />}
          color="bg-amber-500"
          trend="Requires attention"
        />
        <StatCard 
          title="On Leave" 
          value={stats.onLeave} 
          icon={<Calendar className="h-6 w-6" />}
          color="bg-red-500"
          trend="3 returning tomorrow"
        />
        <StatCard 
          title="Monthly Payroll" 
          value={stats.monthlyPayroll} 
          icon={<DollarSign className="h-6 w-6" />}
          color="bg-green-500"
          trend="On track"
        />
      </div>

      {/* Charts and Recruitment Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Recruitment Status */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Recruitment Pipeline</h2>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <UserPlus className="inline mr-2 h-4 w-4" />
              New Recruitment
            </button>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <PipelineStage title="Applications" count={15} color="bg-blue-100 text-blue-800" />
            <PipelineStage title="Screening" count={8} color="bg-amber-100 text-amber-800" />
            <PipelineStage title="Interview" count={5} color="bg-purple-100 text-purple-800" />
            <PipelineStage title="Pending Approval" count={3} color="bg-red-100 text-red-800" />
          </div>
          <div className="mt-6">
            <h3 className="font-medium text-gray-700 mb-3">Recent Recruitment Activities</h3>
            <div className="space-y-3">
              {recentActivities.slice(0, 3).map(activity => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Upcoming Events</h2>
          <div className="space-y-4">
            {upcomingEvents.map(event => (
              <EventItem key={event.id} event={event} />
            ))}
          </div>
          <button className="w-full mt-6 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
            View All Events
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickAction 
            icon={<UserPlus />}
            title="Recruit Staff"
            description="Start new recruitment"
            color="bg-blue-50 text-blue-600"
            href="/hr/recruitment"
          />
          <QuickAction 
            icon={<FileText />}
            title="Process Payroll"
            description="Manage salaries"
            color="bg-green-50 text-green-600"
            href="/hr/payroll"
          />
          <QuickAction 
            icon={<Calendar />}
            title="Leave Management"
            description="Approve leave requests"
            color="bg-amber-50 text-amber-600"
            href="/hr/staffmng"
          />
          <QuickAction 
            icon={<Users />}
            title="Staff Directory"
            description="View all staff"
            color="bg-purple-50 text-purple-600"
            href="/hr/staff"
          />
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

const PipelineStage = ({ title, count, color }) => (
  <div className="text-center">
    <div className={`${color} rounded-lg py-4 mb-2`}>
      <p className="text-2xl font-bold">{count}</p>
    </div>
    <p className="text-sm font-medium text-gray-700">{title}</p>
  </div>
);

const ActivityItem = ({ activity }) => (
  <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
    <div>
      <p className="font-medium text-gray-800">{activity.action}</p>
      <p className="text-sm text-gray-500">{activity.user} • {activity.time}</p>
    </div>
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
      activity.status === 'approved' ? 'bg-green-100 text-green-800' :
      activity.status === 'pending' ? 'bg-amber-100 text-amber-800' :
      'bg-blue-100 text-blue-800'
    }`}>
      {activity.status}
    </span>
  </div>
);

const EventItem = ({ event }) => (
  <div className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
    <div className={`p-2 rounded-lg mr-4 ${
      event.type === 'interview' ? 'bg-blue-100 text-blue-600' :
      event.type === 'meeting' ? 'bg-green-100 text-green-600' :
      event.type === 'deadline' ? 'bg-red-100 text-red-600' :
      'bg-purple-100 text-purple-600'
    }`}>
      <Calendar className="h-5 w-5" />
    </div>
    <div className="flex-1">
      <p className="font-medium text-gray-800">{event.title}</p>
      <p className="text-sm text-gray-500">{event.date}</p>
    </div>
  </div>
);

const QuickAction = ({ icon, title, description, color, href }) => (
  <a href={href} className="block p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
    <div className={`p-3 rounded-lg w-fit mb-3 ${color}`}>
      {icon}
    </div>
    <h3 className="font-semibold text-gray-800 mb-1">{title}</h3>
    <p className="text-sm text-gray-600">{description}</p>
  </a>
);

export default HrDashboard;