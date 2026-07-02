/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  RefreshCw,
  FileText,
  CreditCard,
  AlertCircle,
  CheckCircle,
  User
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const BursarDashboard = () => {
  const [currentDate, setCurrentDate] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [user, setUser] = useState({ username: 'Bursar', role: 'Bursar' });
  const [timeFrame, setTimeFrame] = useState('monthly');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  
  
  // Dashboard data
  const [dashboardData, setDashboardData] = useState({
    totalStudents: 0,
    paidStudents: 0,
    pendingStudents: 0,
    totalRevenue: 0,
    todayCollections: 0,
    recentPayments: [],
    paymentMethods: {},
    stats: {}
  });

  // Initialize
  useEffect(() => {
    updateDateTime();
    const timeInterval = setInterval(updateDateTime, 60000);
    
    fetchDashboardData();
    fetchUserData();
    
    return () => clearInterval(timeInterval);
  }, [timeFrame]);

  // Update date and time
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

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': token?.startsWith('Bearer ') ? token : `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      // 1. We hit the unified Fee Dashboard and Student Stats endpoints
      const [feeDashRes, studentsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/fees/dashboard/`, config),
        axios.get(`${API_BASE_URL}/api/students/statistics/`, config)
      ]);

      // 2. Map data from StudentStatisticsView
      const studentStats = studentsRes.data.data || {};
      
      // 3. Map data from FeeDashboardAPIView
      const feeData = feeDashRes.data.data || {};
      const transactionStats = feeData.transactions || {};

      setDashboardData({
        totalStudents: studentStats.total_students || 0, // Should now show 5
        paidStudents: studentStats.active_students || 0, 
        pendingStudents: (studentStats.total_students || 0) - (studentStats.active_students || 0),
        totalRevenue: parseFloat(transactionStats.total_collected || 0),
        todayCollections: parseFloat(transactionStats.total_collected || 0), // Adjust if backend adds daily key
        recentPayments: feeData.recent_transactions || [],
        paymentMethods: feeData.payment_methods || [],
        stats: transactionStats
      });
    } catch (error) {
      console.error('Bursar Dashboard Sync Error:', error.response?.data || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch user data
  const fetchUserData = async () => {
    try {
      // First try to get it from localStorage to avoid a network call
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
        return;
      }

      // If not in storage, fetch from your actual UserViewSet 'me' action
      const token = localStorage.getItem('token');
      const config = {
        headers: { 'Authorization': token?.startsWith('Bearer ') ? token : `Bearer ${token}` }
      };
      
      const response = await axios.get(`${API_BASE_URL}/api/users/me/`, config);
      if (response.data) {
        setUser(response.data);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };
  const stats = React.useMemo(() => {
  const total = dashboardData?.totalStudents || 0;
  const paid = dashboardData?.paidStudents || 0;
  const percentage = total > 0 ? Math.round((paid / total) * 100) : 0;
  return {
    paidPercentage: percentage,
    pendingPercentage: 100 - percentage
  };
}, [dashboardData.totalStudents, dashboardData.paidStudents]);
  
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50 w-full">
      {/* Header */}
      <header className="w-full bg-white shadow-sm border-b border-gray-200">
        <div className="w-full px-4 md:px-6 py-4 md:py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-linear-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-xl md:text-2xl font-bold text-gray-800">Welcome, {user.username}</h1>
                <p className="text-gray-600 flex items-center">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  <strong>Status:</strong> {user.role}
                </p>
              </div>
            </div>
            <div className="text-right w-full md:w-auto">
              <div className="flex items-center justify-end space-x-2 text-gray-700">
                <Calendar className="w-5 h-5" />
                <p className="font-medium text-sm md:text-base">{currentDate}</p>
              </div>
              <div className="flex items-center justify-end space-x-2 text-gray-600 mt-1">
                <Clock className="w-5 h-5" />
                <p className="text-sm md:text-base">{currentTime}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="w-full px-4 md:px-6 py-4 md:py-6">
        {/* Controls */}
        <div className="w-full mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold text-gray-800">Dashboard Overview</h2>
            <button
              onClick={fetchDashboardData}
              disabled={isLoading}
              className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          
          <select 
            value={timeFrame}
            onChange={(e) => setTimeFrame(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full md:w-auto bg-white"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>

        {/* Stats Cards */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          {/* Total Students */}
          <div className="bg-linear-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Total Students</h3>
                <p className="text-2xl md:text-3xl font-bold">
                  {dashboardData.totalStudents.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <Users className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 text-sm opacity-90">
              <div className="flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span>Active students enrolled</span>
              </div>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="bg-linear-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Total Revenue</h3>
                <p className="text-2xl md:text-3xl font-bold">
                  KSh {dashboardData.totalRevenue.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 text-sm opacity-90">
              <div className="flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span>Total collections to date</span>
              </div>
            </div>
          </div>

          {/* Today's Collections */}
          <div className="bg-linear-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Today's Collections</h3>
                <p className="text-2xl md:text-3xl font-bold">
                  KSh {dashboardData.todayCollections.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <CreditCard className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 text-sm opacity-90">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                <span>Collections for {new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Transaction Stats */}
          <div className="bg-linear-to-br from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Transactions</h3>
                <p className="text-2xl md:text-3xl font-bold">
                  {dashboardData.stats.total_transactions || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <FileText className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 text-sm opacity-90">
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  <span>{dashboardData.stats.completed_transactions || 0} completed</span>
                </div>
                <div className="flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  <span>{dashboardData.stats.pending_transactions || 0} pending</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts and Data Section */}
        <div className="w-full grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
          {/* Recent Payments */}
          <div className="xl:col-span-2 bg-white p-4 md:p-6 rounded-xl shadow-sm w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Recent Payments</h3>
              <button 
                onClick={() => window.location.href = '/bursar/payments'}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                View All →
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-150">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Method
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {dashboardData.recentPayments.length > 0 ? (
                    dashboardData.recentPayments.map((payment, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <div>
                            <div className="font-medium text-gray-900">
                              {payment.first_name} {payment.last_name}
                            </div>
                            <div className="text-sm text-gray-500">{payment.admission_no}</div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="font-semibold text-green-600">
                            KSh {parseFloat(payment.amount_kes || 0).toLocaleString()}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900">
                          {new Date(payment.payment_date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            payment.payment_mode === 'Mobile Money' ? 'bg-green-100 text-green-800' :
                            payment.payment_mode === 'Cash' ? 'bg-blue-100 text-blue-800' :
                            payment.payment_mode === 'Bank Transfer' ? 'bg-purple-100 text-purple-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {payment.payment_mode}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            payment.status === 'VERIFIED' ? 'bg-green-100 text-green-800' :
                            payment.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                            payment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-indigo-100 text-indigo-800'
                          }`}>
                            {payment.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                        No recent payments found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm w-full">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Methods Distribution</h3>
            <div className="space-y-4 w-full">
              {Array.isArray(dashboardData.paymentMethods) && dashboardData.paymentMethods.length > 0 ? (
                dashboardData.paymentMethods.map((methodObj, index) => {
                  // ✅ MOVING CALCULATIONS INSIDE THE MAP FUNCTION
                  const totalRevenueForBar = dashboardData.totalRevenue || 1;
                  const barWidth = `${(Number(methodObj.total_amount) / totalRevenueForBar) * 100}%`;

                  return (
                    <div key={index} className="space-y-2 w-full">
                      <div className="flex justify-between text-sm w-full">
                        <span className="font-medium text-gray-700">{methodObj.payment_mode}</span>
                        <span className="text-gray-600">KSh {Number(methodObj.total_amount).toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-indigo-600"
                          style={{ width: barWidth }} 
                        ></div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-gray-500 py-8">
                  No payment method data available
                </div>
              )}
            </div>
            {/* Quick Stats */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Quick Stats</h4>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Transactions:</span>
                  <span className="font-medium">{dashboardData.stats.total_transactions || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Unique Students:</span>
                  <span className="font-medium">{dashboardData.stats.unique_students || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Avg Transaction:</span>
                  <span className="font-medium">
                    KSh {Math.round(parseFloat(dashboardData.stats.average_amount || 0)).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Collection Efficiency */}
          <div className="bg-linear-to-br from-indigo-50 to-indigo-100 border border-indigo-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Collection Efficiency</h3>
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600 mb-2">
                {dashboardData.totalStudents > 0 ? Math.round((dashboardData.paidStudents / dashboardData.totalStudents) * 100) : 0}%
              </div>
              <p className="text-sm text-gray-600">Fee collection rate</p>
              <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full bg-indigo-500"
                  style={{ width: `${dashboardData.totalStudents > 0 ? Math.round((dashboardData.paidStudents / dashboardData.totalStudents) * 100) : 0}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-linear-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">System Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Last Sync</span>
                <span className="text-sm text-gray-600">{new Date().toLocaleTimeString()}</span>
              </div>
              
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-linear-to-br from-indigo-50 to-indigo-100 border border-indigo-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
            <button 
                onClick={() => navigate('/BursarPortal/Payment')} // Full path for HashRouter
                className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Process Payment
              </button>
                          {/* <div className="space-y-3">
              <button 
                onClick={() => window.location.href = '/bursar/payment'}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left flex items-center justify-between"
              >
                <span className="font-medium text-gray-700">Process Payment</span>
                <span className="text-blue-600">→</span>
              </button>
              <button 
                onClick={() => window.location.href = '/bursar/reports'}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left flex items-center justify-between"
              >
                <span className="font-medium text-gray-700">Generate Report</span>
                <span className="text-blue-600">→</span>
              </button>
              <button 
                onClick={() => window.location.href = '/bursar/records'}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left flex items-center justify-between"
              >
                <span className="font-medium text-gray-700">View Records</span>
                <span className="text-blue-600">→</span>
              </button>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BursarDashboard;