/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { Chart } from 'chart.js/auto';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

// Changed 'rejected' layout from red to a high-contrast warm gray/slate
const statusColors = {
  pending: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  completed: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  'in-progress': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  'approved': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  'rejected': { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300' }
};

// Updated notification background tracking colors from red variants to indigo
const notificationColors = {
  warning: { bg: 'bg-blue-50', icon: 'text-blue-600' },
  info: { bg: 'bg-amber-50', icon: 'text-amber-600' },
  success: { bg: 'bg-green-50', icon: 'text-green-600' },
  admission: { bg: 'bg-indigo-50', icon: 'text-indigo-600' }
};

function Dashboard() {
  const [currentDate, setCurrentDate] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [dashboardData, setDashboardData] = useState({
    stats: {},
    admissionTrends: {},
    notifications: [],
    activities: [],
    deadlines: [],
    todaySummary: {},
    recentStudents: [],
    classDistribution: {}
  });

  useEffect(() => {
    fetchDashboardData();
    updateDateTime();
    
    const timeInterval = setInterval(updateDateTime, 60000);
    const dataRefreshInterval = setInterval(fetchDashboardData, 300000);
    
    return () => {
      clearInterval(timeInterval);
      clearInterval(dataRefreshInterval);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

    const token = localStorage.getItem('token');
    const config = {
      headers: {
        'Authorization': token?.startsWith('Bearer ') ? token : `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };
      
      const statsRes = await axios.get(`${API_BASE_URL}/api/students/statistics/`, config);
      const studentsRes = await axios.get(`${API_BASE_URL}/api/students/`, config);
      const classesRes = await axios.get(`${API_BASE_URL}/api/classes/`, config);
      
      if (statsRes.data) {
        const students = studentsRes.data?.results?.data || studentsRes.data?.data || studentsRes.data || [];
        const classes = classesRes.data?.results?.data || classesRes.data?.data || classesRes.data || [];
        
        const totalStudents = students.length;
        const activeStudents = students.filter(s => s.status?.toLowerCase() === 'active').length;
        const maleStudents = students.filter(s => s.gender?.toLowerCase() === 'male').length;
        const femaleStudents = students.filter(s => s.gender?.toLowerCase() === 'female').length;

        const today = new Date().toISOString().split('T')[0];
        const todayRegistrations = students.filter(s => s.admission_date === today).length;
        
        const recentStudents = students.slice(0, 5) || [];
        
        const classDistribution = {};
        if (students && classes) {
          students.forEach(student => {
            const classId = student.current_class;
            if (classId) {
              const classObj = classes.find(c => c.id == classId);
              const className = classObj ? classObj.class_name : 'Unassigned';
              classDistribution[className] = (classDistribution[className] || 0) + 1;
            }
          });
        }
        
        const admissionTrends = generateAdmissionTrends(students);
        
        setDashboardData({
          stats: {
            totalStudents,
            activeStudents,
            todayRegistrations,
            maleStudents,
            femaleStudents,
            admissionRate: totalStudents > 0 ? Math.round((activeStudents / totalStudents) * 100) : 0
          },
          admissionTrends: generateAdmissionTrends(students),
          notifications: [
            { id: 1, type: 'admission', icon: 'user-plus', title: `${todayRegistrations} new admission(s) today`, time: 'Today', read: false },
            { id: 2, type: 'warning', icon: 'exclamation-circle', title: `${students.filter(s => !s.current_class_id).length} students need class assignment`, time: 'Today', read: false },
            { id: 3, type: 'info', icon: 'file-alt', title: 'Registration ongoing for next term', time: 'Yesterday', read: true },
            { id: 4, type: 'success', icon: 'check-circle', title: 'Database sync completed successfully', time: 'Today', read: true }
          ],
          activities: generateRecentActivities(students),
          deadlines: [
            { id: 1, title: 'Term 1 Registration', daysLeft: 5, status: 'warning' },
            { id: 2, title: 'Document Verification', daysLeft: 7, status: 'info' },
            { id: 3, title: 'Fee Payment Deadline', daysLeft: 10, status: 'success' }
          ],
          todaySummary: {
            newApplications: todayRegistrations,
            approved: activeStudents,
            pendingReview: 0,
            rejected: 0
          },
          recentStudents: students.slice(0, 5),
          classDistribution
        });
      }
      
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError('Failed to load dashboard data. Please check your connection.');
      
      setDashboardData({
        stats: {
          totalStudents: 0,
          activeStudents: 0,
          todayRegistrations: 0,
          maleStudents: 0,
          femaleStudents: 0,
          admissionRate: 0
        },
        admissionTrends: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          applications: [0, 0, 0, 0, 0, 0],
          enrollments: [0, 0, 0, 0, 0, 0]
        },
        notifications: [
          { id: 1, type: 'admission', icon: 'user-plus', title: '0 new admission applications received', time: 'Today', read: false },
          { id: 2, type: 'warning', icon: 'exclamation-circle', title: '0 admission forms need verification', time: 'Today', read: false },
          { id: 3, type: 'info', icon: 'file-alt', title: 'Registration deadline in 5 days', time: 'Yesterday', read: true },
          { id: 4, type: 'success', icon: 'check-circle', title: '0 students successfully enrolled today', time: 'Today', read: true }
        ],
        activities: [
          { id: 1, date: 'Today, 10:30 AM', activity: 'No recent activities', student: '', status: '', type: '' },
          { id: 2, date: 'Today, 9:15 AM', activity: '', student: '', status: '', type: '' },
          { id: 3, date: 'Yesterday, 3:45 PM', activity: '', student: '', status: '', type: '' }
        ],
        deadlines: [
          { id: 1, title: 'Term 1 Registration', daysLeft: 5, status: 'warning' },
          { id: 2, title: 'Document Verification', daysLeft: 7, status: 'info' },
          { id: 3, title: 'Fee Payment', daysLeft: 10, status: 'success' }
        ],
        todaySummary: {
          newApplications: 0,
          approved: 0,
          pendingReview: 0,
          rejected: 0
        },
        recentStudents: [],
        classDistribution: {}
      });
    } finally {
      setLoading(false);
    }
  };

  const generateAdmissionTrends = (students) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const labels = [];
    const applications = [];
    
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      labels.push(months[monthIndex]);
      applications.push(0);
    }
    
    const enrollments = applications.map(count => 0);
    
    return { labels, applications, enrollments };
  };

  const generateRecentActivities = (students) => {
    const activities = [];
    
    if (!students || students.length === 0) {
      return [
        { id: 1, date: 'No data', activity: 'No recent activities', student: '', status: '', type: '' }
      ];
    }
    
    const recent = students.slice(0, 5);
    
    recent.forEach((student, index) => {
      const hoursAgo = index + 1;
      const date = hoursAgo === 1 ? 'Today' : hoursAgo <= 24 ? 'Yesterday' : `${hoursAgo} days ago`;
      const time = `${9 + index}:${index % 2 === 0 ? '30' : '15'} ${index < 3 ? 'AM' : 'PM'}`;
      
      activities.push({
        id: index + 1,
        date: `${date}, ${time}`,
        activity: 'New admission application',
        student: `${student.first_name} ${student.last_name}`,
        status: 'pending',
        type: 'admission'
      });
    });
    
    return activities;
  };

  const updateDateTime = () => {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    setCurrentDate(now.toLocaleDateString('en-US', options));
    
    let hours = now.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutes = now.getMinutes().toString().padStart(2, '0');
    setCurrentTime(`${hours}:${minutes} ${ampm}`);
  };

  useEffect(() => {
    if (!dashboardData.admissionTrends || !dashboardData.admissionTrends.labels) return;
    
    const ctx = document.getElementById('admissionChart');
    if (ctx) {
      if (ctx.chartInstance) {
        ctx.chartInstance.destroy();
      }

      const admissionChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: dashboardData.admissionTrends.labels,
          datasets: [
            {
              label: 'Applications Received',
              data: dashboardData.admissionTrends.applications,
              backgroundColor: 'rgba(79, 70, 229, 0.1)', // Indigo opacity
              borderColor: 'rgba(79, 70, 229, 1)',       // Indigo boundary
              borderWidth: 2,
              tension: 0.4,
              fill: true
            },
            {
              label: 'Successful Enrollments',
              data: dashboardData.admissionTrends.enrollments,
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              borderColor: 'rgba(34, 197, 94, 1)',
              borderWidth: 2,
              tension: 0.4,
              fill: true
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              title: { display: true, text: 'Number of Students' },
              grid: { color: 'rgba(0, 0, 0, 0.05)' }
            },
            x: { grid: { color: 'rgba(0, 0, 0, 0.05)' } }
          },
          plugins: {
            legend: { position: 'top', labels: { padding: 20, usePointStyle: true } },
            tooltip: { mode: 'index', intersect: false }
          },
          interaction: { intersect: false, mode: 'nearest' }
        }
      });
      
      ctx.chartInstance = admissionChart;
    }

    const classCtx = document.getElementById('classDistributionChart');
    if (classCtx) {
      if (classCtx.chartInstance) {
        classCtx.chartInstance.destroy();
      }

      const classChart = new Chart(classCtx, {
        type: 'doughnut',
        data: {
          labels: Object.keys(dashboardData.classDistribution),
          datasets: [{
            data: Object.values(dashboardData.classDistribution),
            backgroundColor: [
              'rgba(79, 70, 229, 0.8)', // Indigo
              'rgba(34, 197, 94, 0.8)', // Green
              'rgba(245, 158, 11, 0.8)', // Amber
              'rgba(168, 85, 247, 0.8)', // Purple
              'rgba(6, 182, 212, 0.8)'   // Cyan
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'right' } }
        }
      });
      
      classCtx.chartInstance = classChart;
    }
  }, [dashboardData.admissionTrends, dashboardData.classDistribution]);

  const markAsRead = async (id) => {
    try {
      setDashboardData(prev => ({
        ...prev,
        notifications: prev.notifications.map(notification => 
          notification.id === id ? { ...notification, read: true } : notification
        )
      }));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  if (loading && !dashboardData.stats.totalStudents) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading registrar dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans overflow-x-hidden">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-gray-200">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            {/* Border-indigo-500 and text-indigo-600 updates */}
            <div className="w-14 h-14 rounded-full border-2 border-indigo-500 bg-indigo-50 flex items-center justify-center">
              <i className="fas fa-user-tie text-indigo-600 text-2xl"></i>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Registrar Dashboard</h1>
              <p className="text-gray-600">Academics & Admissions Management</p>
              {error && (
                <div className="mt-1 flex items-center text-sm text-amber-600">
                  <i className="fas fa-exclamation-triangle mr-2"></i>
                  <span>{error}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-col md:items-end space-y-2">
            <p className="text-gray-700 font-medium">{currentDate}</p>
            <p className="text-gray-600">{currentTime}</p>
          </div>
        </header>

        {/* Changed borders from custom color variables to indigo layout profiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <StatCard title="Total Students" value={dashboardData.stats.totalStudents || "0"} icon="users" color="border-indigo-500" trend={`${dashboardData.stats.todayRegistrations || 0} new today`} trendPositive />
          <StatCard title="Active Students" value={dashboardData.stats.activeStudents || "0"} icon="user-check" color="border-green-500" trend={`${dashboardData.stats.admissionRate || 0}% admission rate`} trendPositive />
          <StatCard title="Male Students" value={dashboardData.stats.maleStudents || "0"} icon="male" color="border-amber-500" trend={`${dashboardData.stats.maleStudents ? Math.round((dashboardData.stats.maleStudents / dashboardData.stats.totalStudents) * 100) : 0}% of total`} trendPositive />
          <StatCard title="Female Students" value={dashboardData.stats.femaleStudents || "0"} icon="female" color="border-purple-500" trend={`${dashboardData.stats.femaleStudents ? Math.round((dashboardData.stats.femaleStudents / dashboardData.stats.totalStudents) * 100) : 0}% of total`} trendPositive />
          <StatCard title="Today's Admissions" value={dashboardData.stats.todayRegistrations || "0"} icon="user-plus" color="border-indigo-600" trend="Daily registrations" trendPositive />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Admission Trends</h3>
              {/* text-indigo-600 hover:text-indigo-800 */}
              <button onClick={fetchDashboardData} className="px-3 py-1 text-sm text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors">
                <i className="fas fa-sync-alt mr-2"></i>
                Refresh Data
              </button>
            </div>
            <div className="h-72"><canvas id="admissionChart"></canvas></div>
            <div className="mt-4 text-sm text-gray-600"><p>Track monthly applications and successful enrollments.</p></div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Class Distribution</h3>
              <div className="h-56"><canvas id="classDistributionChart"></canvas></div>
              {Object.keys(dashboardData.classDistribution).length === 0 && <p className="text-sm text-gray-500 text-center mt-4">No class distribution data available</p>}
            </div>

            {/* Changed background targets here from red/blue to indigo matrices */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Registrar Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <QuickActionButton icon="user-plus" label="New Admission" color="bg-indigo-600 hover:bg-indigo-700" onClick={() => {}} />
                <QuickActionButton icon="users" label="Manage Students" color="bg-green-500 hover:bg-green-600" onClick={() => {}} />
                <QuickActionButton icon="file-alt" label="Generate Reports" color="bg-amber-500 hover:bg-amber-600" onClick={() => {}} />
                <QuickActionButton icon="chalkboard-teacher" label="Class Setup" color="bg-purple-500 hover:bg-purple-600" onClick={() => {}} />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between"><h3 className="text-lg font-semibold text-gray-800">Recently Admitted Students</h3></div>
            <div className="divide-y divide-gray-200">
              {dashboardData.recentStudents?.length > 0 ? (
                dashboardData.recentStudents.map((student, index) => (
                  <div key={index} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center mr-3">
                          <i className={`fas fa-${student.gender === 'male' ? 'male' : 'female'} text-indigo-600`}></i>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{student.first_name} {student.last_name}</h4>
                          <p className="text-sm text-gray-600">{student.admission_no || 'No ID'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm text-gray-600">{student.admission_date ? new Date(student.admission_date).toLocaleDateString() : 'No date'}</span>
                        <div className="mt-1"><span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${student.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{student.status || 'unknown'}</span></div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-6 py-8 text-center text-gray-500"><i className="fas fa-users text-3xl mb-3 text-gray-300"></i><p>No recent students found</p></div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-semibold text-gray-800">System Alerts</h3><span className="text-sm text-indigo-600 font-medium cursor-pointer hover:text-indigo-800">View All</span></div>
              <div className="space-y-3">
                {dashboardData.notifications?.map(notification => (
                  <NotificationItem key={notification.id} notification={notification} onClick={() => markAsRead(notification.id)} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color, trend, trendPositive }) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-5 border-t-4 ${color}`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
        <i className={`fas fa-${icon} text-3xl opacity-20`} style={{ color: color.replace('border-', '').replace('-500', '').replace('-600', '') }}></i>
      </div>
      {trend && (
        <div className="mt-3 flex items-center text-xs">
          <i className={`fas fa-${trendPositive ? 'arrow-up text-green-500' : 'arrow-down text-red-500'} mr-1`}></i>
          <span className={trendPositive ? 'text-green-600' : 'text-red-600'}>{trend}</span>
        </div>
      )}
    </div>
  );
}

function QuickActionButton({ icon, label, color, onClick }) {
  return (
    <button className={`${color} text-white rounded-lg p-4 flex flex-col items-center justify-center transition-all hover:scale-105 active:scale-95`} onClick={onClick}>
      <i className={`fas fa-${icon} text-xl mb-2`}></i>
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}

function NotificationItem({ notification, onClick }) {
  return (
    <div className={`flex items-start p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${!notification.read ? 'bg-indigo-50/50' : ''}`} onClick={onClick}>
      <div className={`shrink-0 w-10 h-10 rounded-full ${notificationColors[notification.type]?.bg || 'bg-gray-50'} flex items-center justify-center mr-3`}>
        <i className={`fas fa-${notification.icon} ${notificationColors[notification.type]?.icon || 'text-gray-600'}`}></i>
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm truncate ${!notification.read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>{notification.title}</p>
        <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
      </div>
    </div>
  );
}

export default Dashboard;