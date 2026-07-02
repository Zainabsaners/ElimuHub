import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FileText,
  Download,
  Calendar,
  Filter,
  RefreshCw,
  TrendingUp,
  Users,
  DollarSign,
  CreditCard,
  BarChart3,
  PieChart,
  LineChart,
  Eye,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://*.onrender.com";

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            'Authorization': token?.startsWith('Bearer ') ? token : `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };
};

const Report = () => {
  const [selectedReport, setSelectedReport] = useState('financial');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [studentCount, setStudentCount] = useState(0);
  const [activeChart, setActiveChart] = useState(0);
  const [currentPeriod, setCurrentPeriod] = useState(null);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });

  const showNotification = (type, message, duration = 5000) => {
    setNotification({ show: true, type, message });
    setTimeout(() => setNotification({ show: false, type: '', message: '' }), duration);
  };

  const reportTypes = [
    { id: 'financial', name: 'Financial Summary', icon: <DollarSign className="w-5 h-5" />, description: 'Overview of revenue and student participation' },
    { id: 'collection', name: 'Fee Collection', icon: <CreditCard className="w-5 h-5" />, description: 'Breakdown by class and method' },
    { id: 'outstanding', name: 'Outstanding Fees', icon: <FileText className="w-5 h-5" />, description: 'Analysis of pending fees and defaulters' },
    { id: 'student', name: 'Student Payments', icon: <Users className="w-5 h-5" />, description: 'Individual student payment histories' }
  ];

  useEffect(() => {
    const initializeReports = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/api/fees/current-period/`, getAuthHeaders());
        if (response.data.success) {
          const period = response.data.data;
          setCurrentPeriod(period);
          // Sync dates to the term boundary
          setDateRange({
            startDate: period.start_date || dateRange.startDate,
            endDate: period.end_date || dateRange.endDate
          });
        }
      } catch (error) {
        console.error("Period fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    initializeReports();
    fetchStudentCount();
  }, []);

  useEffect(() => {
    if (currentPeriod) fetchReportData();
  }, [selectedReport, currentPeriod, dateRange]);

  const fetchStudentCount = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/students/?limit=1`, getAuthHeaders());
      const count = response.data.count ?? response.data.results?.count ?? 0;
      setStudentCount(count);
    } catch (error) {
      setStudentCount(0);
    }
  };

  const fetchReportData = async () => {
  setIsLoading(true);
  try {
    const params = {
      start_date: dateRange.startDate,
      end_date: dateRange.endDate,
      academic_year: currentPeriod?.academic_year,
      term: currentPeriod?.term
    };

    const endpoint = selectedReport === 'financial' 
      ? '/api/fees/transactions/stats/' 
      : '/api/fees/transactions/';

    const response = await axios.get(`${API_BASE_URL}${endpoint}`, {
      ...getAuthHeaders(),
      params
    });

    // ✅ FIX 1: Extract data correctly for both Stats and List endpoints
    // For Stats: data is in response.data.data.transactions
    // For List: data is in response.data.results or response.data.data
    const responsePayload = response.data.data || response.data;

    const rawData = response.data.data || response.data;
    const listData = response.data.results || (rawData.transactions ? [] : rawData) || [];
    
    let transformedData = {};
    switch (selectedReport) {
      case 'financial':
        transformedData = transformFinancialData(rawData, rawData.recent_transactions || []);
        break;
      case 'collection':
        transformedData = transformCollectionData(listData);
        break;
      case 'outstanding':
        transformedData = transformOutstandingData(listData);
        break;
      case 'student':
        transformedData = transformStudentData(listData);
        break;
      default:
        transformedData = {};
    }

    setReportData(transformedData);
  } catch (error) {
    console.error("Report Fetch Error:", error);
    showNotification('error', 'Failed to refresh report data');
  } finally {
    setIsLoading(false);
  }
};

  const transformFinancialData = (stats, rawList = []) => {
  if (!stats) return getDefaultReportData();
  
  const transactionsStats = stats.transactions || stats;

  return {
    title: 'Financial Summary Report',
    description: 'Comprehensive overview of all financial transactions and revenue',
    metrics: [
      { 
        label: 'Total Revenue', 
        value: `KSh ${parseFloat(transactionsStats.total_collected || 0).toLocaleString()}`,
        icon: <DollarSign className="w-5 h-5" />
      },
      { 
        label: 'Transactions', 
        value: (transactionsStats.total_transactions || 0).toLocaleString(),
        icon: <FileText className="w-5 h-5" />
      },
      { 
        label: 'Average Amount', 
        value: `KSh ${Math.round(parseFloat(transactionsStats.average_amount || 0)).toLocaleString()}`,
        icon: <TrendingUp className="w-5 h-5" />
      },
      { 
        label: 'Unique Students', 
        value: (transactionsStats.unique_students || 0).toLocaleString(),
        icon: <Users className="w-5 h-5" />
      }
    ],
    charts: [
      { id: 'revenue', name: 'Revenue Trend', type: 'line' },
      { id: 'methods', name: 'Payment Methods', type: 'pie' },
      { id: 'collection', name: 'Collection Rate', type: 'bar' }
    ],
    // ✅ FIX: Populate this with the actual list instead of []
    recentTransactions: Array.isArray(rawList) ? rawList.slice(0, 10) : []
  };
};

  const transformStudentData = (data) => {
    const list = Array.isArray(data) ? data : [];
    const total = list.reduce((sum, t) => sum + parseFloat(t.amount_kes || 0), 0);
    return {
      title: 'Student Payment Report',
      description: 'Transaction history for the current term',
      metrics: [
        { label: 'Total Students', value: studentCount.toLocaleString(), icon: <Users className="w-5 h-5" /> },
        { label: 'Payments Count', value: list.length.toString(), icon: <CheckCircle className="w-5 h-5" /> },
        { label: 'Total Amount', value: `KSh ${total.toLocaleString()}`, icon: <DollarSign className="w-5 h-5" /> },
        { label: 'Term', value: currentPeriod?.term || 'N/A', icon: <Calendar className="w-5 h-5" /> }
      ],
      charts: [
        { id: 'methods', name: 'Method Split', type: 'pie' },
        { id: 'time', name: 'Daily volume', type: 'line' },
        { id: 'class', name: 'Class Revenue', type: 'bar' }
      ],
      recentTransactions: list.slice(0, 10)
    };
  };

  const calculateChange = (value) => '+10%'; 

  const getDefaultReportData = () => ({
    title: 'Loading Report...',
    description: 'Fetching data from server...',
    metrics: Array(4).fill({ label: 'Loading...', value: '--', icon: <RefreshCw className="animate-spin" /> }),
    charts: Array(3).fill({ id: 'l', name: 'Loading...', type: 'bar' }),
    recentTransactions: []
  });

  const handleExport = (format) => {
    if (format === 'pdf') window.print();
    else showNotification('info', `Exporting as ${format.toUpperCase()}...`);
  };

  const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString() : 'N/A';

  const getMethodColor = (method) => {
    const colors = { 'Mobile Money': 'bg-green-100 text-green-800', 'Cash': 'bg-blue-100 text-blue-800' };
    return colors[method] || 'bg-gray-100 text-gray-800';
  };

  const renderChartPlaceholder = (chart, index) => (
    <div key={index} className={`border-2 rounded-xl p-6 text-center cursor-pointer ${activeChart === index ? 'border-blue-300 bg-blue-50' : 'border-gray-200'}`} onClick={() => setActiveChart(index)}>
      <div className="h-24 flex items-end justify-center mb-4 space-x-1">
        {Array(8).fill(0).map((_, i) => <div key={i} className="w-2 bg-blue-400" style={{ height: `${Math.random() * 100}%` }} />)}
      </div>
      <p className="font-medium text-gray-800">{chart.name}</p>
      <button onClick={(e) => { e.stopPropagation(); showNotification('info', `Drilling down into ${chart.name}`); }} className="mt-4 px-4 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 flex items-center mx-auto">
        <Eye className="w-4 h-4 mr-2" /> View Details
      </button>
    </div>
  );

  const currentReport = reportData || getDefaultReportData();


  // Transform collection data
  const transformCollectionData = (data) => {
    const list = Array.isArray(data) ? data : (data.results || []);
    const total = list.reduce((sum, t) => sum + parseFloat(t.amount_kes || 0), 0);
    return {
      title: 'Fee Collection Report',
      description: 'Breakdown of fee collections by class and method',
      metrics: [
        { label: 'Total Collected', value: `KSh ${total.toLocaleString()}`, icon: <DollarSign className="w-5 h-5" />, change: '+8%' },
        { label: 'Daily Average', value: `KSh ${(total / (list.length || 1)).toLocaleString()}`, icon: <TrendingUp className="w-5 h-5" />, change: '0%' },
        { label: 'Transaction Count', value: list.length.toString(), icon: <FileText className="w-5 h-5" />, change: '+5%' },
        { label: 'Term', value: currentPeriod?.term || 'N/A', icon: <Calendar className="w-5 h-5" />, change: '0%' }
      ],
      charts: [{ id: 'c1', name: 'Daily Collections', type: 'bar' }, { id: 'c2', name: 'Methods', type: 'pie' }],
      recentTransactions: list.slice(0, 10)
    };
  };

  // Transform outstanding data
  const transformOutstandingData = (data) => {
    const list = Array.isArray(data) ? data : (data.results || []);
    return {
      title: 'Outstanding Fees Report',
      description: 'Analysis of students with pending fee balances',
      metrics: [
        { label: 'Students with Debt', value: list.length.toString(), icon: <Users className="w-5 h-5" />, change: '-2%' },
        { label: 'Term Range', value: currentPeriod?.term || 'Current', icon: <Calendar className="w-5 h-5" />, change: '0%' },
        { label: 'Status', value: 'Generated', icon: <CheckCircle className="w-5 h-5" />, change: '0%' },
        { label: 'Report ID', value: 'REP-2026', icon: <FileText className="w-5 h-5" />, change: '0%' }
      ],
      charts: [{ id: 'o1', name: 'Aging Analysis', type: 'pie' }, { id: 'o2', name: 'By Class', type: 'bar' }],
      recentTransactions: list.slice(0, 10)
    };
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50 p-4 md:p-8">
      {notification.show && (
        <div className="fixed top-4 right-4 z-50 max-w-sm w-full bg-blue-600 text-white rounded-lg shadow-lg p-4 flex justify-between items-center">
          <span>{notification.message}</span>
          <button onClick={() => setNotification({ ...notification, show: false })}>✕</button>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Financial Reports</h1>
            <p className="text-gray-600">Analyze termly performance for {currentPeriod?.academic_year}</p>
          </div>
          <div className="mt-4 flex space-x-2">
            <button onClick={() => handleExport('pdf')} className="flex items-center px-4 py-2 bg-white border rounded-lg shadow-sm hover:bg-gray-50">
              <Download className="w-4 h-4 mr-2" /> PDF
            </button>
            <button onClick={fetchReportData} className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border">
              <h3 className="font-semibold mb-4 flex items-center"><Filter className="w-4 h-4 mr-2" /> Categories</h3>
              {reportTypes.map(r => (
                <button key={r.id} onClick={() => setSelectedReport(r.id)} className={`w-full text-left p-3 rounded-lg mb-2 flex items-center ${selectedReport === r.id ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}>
                  <span className="mr-3">{r.icon}</span> {r.name}
                </button>
              ))}
            </div>
            
            <div className="bg-white p-4 rounded-xl shadow-sm border">
              <h3 className="font-semibold mb-4">Date Range</h3>
              <input type="date" value={dateRange.startDate} onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})} className="w-full mb-3 p-2 border rounded" />
              <input type="date" value={dateRange.endDate} onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})} className="w-full p-2 border rounded" />
            </div>
          </div>

          <div className="lg:col-span-3 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {currentReport.metrics.map((m, i) => (
                <div key={i} className="bg-white p-6 rounded-xl shadow-sm border">
                  <div className="flex justify-between items-start mb-2">
                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600">{m.icon}</div>
                    {m.change && <span className="text-xs font-bold text-green-600">{m.change}</span>}
                  </div>
                  <p className="text-sm text-gray-500">{m.label}</p>
                  <p className="text-2xl font-bold">{m.value}</p>
                </div>
              ))}
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <h3 className="font-bold mb-6">Visual Analytics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {currentReport.charts.map((c, i) => renderChartPlaceholder(c, i))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="p-6 border-b bg-gray-50 flex justify-between items-center">
                <h3 className="font-bold">Termly Transaction Data</h3>
              </div>
              <div className="overflow-x-auto">
                {currentReport.recentTransactions.length > 0 ? (
                  <table className="w-full">
                    <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                      <tr>
                        <th className="px-6 py-4 text-left">Student</th>
                        <th className="px-6 py-4 text-left">Adm No</th>
                        <th className="px-6 py-4 text-right">Amount</th>
                        <th className="px-6 py-4 text-left">Date</th>
                        <th className="px-6 py-4 text-left">Method</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {currentReport.recentTransactions.map((t, i) => (
                        <tr key={i} className="hover:bg-gray-50 text-sm">
                          <td className="px-6 py-4 font-medium">{t.first_name} {t.last_name}</td>
                          <td className="px-6 py-4">{t.admission_no}</td>
                          <td className="px-6 py-4 text-right font-bold text-green-600">KSh {parseFloat(t.amount_kes || 0).toLocaleString()}</td>
                          <td className="px-6 py-4 text-gray-500">{formatDate(t.payment_date)}</td>
                          <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-bold ${getMethodColor(t.payment_mode)}`}>{t.payment_mode}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-12 text-center text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p>No transactions found for this term range.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Report;