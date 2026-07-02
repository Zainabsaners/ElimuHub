import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Search,
  Filter,
  Download,
  Printer,
  RefreshCw,
  Eye,
  FileText,
  Calendar,
  DollarSign,
  TrendingUp,
  Users,
  MoreVertical,
  ChevronDown,
  ChevronUp
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


const PaymentRecords = () => {
  // State management
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters
  const [filters, setFilters] = useState({
    start_date: '',
    end_date: '',
    status: 'all',
    payment_mode: 'all',
    search_term: ''
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  

  // Initialize
  useEffect(() => {
    fetchTransactions();
    fetchTransactionStats();
  }, [fetchTransactions, fetchTransactionStats]);

  // Apply filters whenever filters change
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Fetch transactions
  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.start_date) params.start_date = filters.start_date;
      if (filters.end_date) params.end_date = filters.end_date;
      if (filters.status && filters.status !== 'all') params.status = filters.status;
      if (filters.payment_mode && filters.payment_mode !== 'all') params.payment_mode = filters.payment_mode;

      // ADDED /api/fees/ prefix and getAuthHeaders()
      const response = await axios.get(`${API_BASE_URL}/api/fees/transactions/`, {
        ...getAuthHeaders(),
        params
      });

      // Handle Django REST Framework's results/data structure
      const data = response.data.results || response.data.data || response.data;
      setTransactions(Array.isArray(data) ? data : []);
      setError(null);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Fetch transaction statistics
  const fetchTransactionStats = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);

      const response = await axios.get(`${API_BASE_URL}/api/fees/transactions/stats/`, {
        ...getAuthHeaders(),
        params: {
          start_date: filters.start_date,
          end_date: filters.end_date

        }
      });
      setStats(response.data.data || response.data);
    } catch (error) {
      console.error('Error fetching transaction stats:', error);
    }
  }, [filters]);

  // Fetch transaction details
  const fetchTransactionDetails = async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/fees/transactions/${id}/`, getAuthHeaders());
      setSelectedTransaction(response.data.data);
      setShowDetailModal(true);
    } catch (error) {
      console.error('Error fetching transaction details:', error);
      showNotification('error', 'Failed to load transaction details');
    }
  };

  // Apply filters
  const applyFilters = useCallback(() => {
    let filtered = [...transactions];

    // Apply search term filter
    if (filters.search_term) {
      const searchLower = filters.search_term.toLowerCase();
      filtered = filtered.filter(transaction =>
        transaction.transaction_no?.toLowerCase().includes(searchLower) ||
        transaction.student_name?.toLowerCase().includes(searchLower) || 
        transaction.admission_no?.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(transaction => transaction.status === filters.status);
    }

    // Apply payment mode filter
    if (filters.payment_mode && filters.payment_mode !== 'all') {
      filtered = filtered.filter(transaction => transaction.payment_mode === filters.payment_mode);
    }

    setFilteredTransactions(filtered);
  }, [filters, transactions]);

  // Notification handler
  const showNotification = (type, message, duration = 5000) => {
    setNotification({ show: true, type, message });
    setTimeout(() => setNotification({ show: false, type: '', message: '' }), duration);
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      start_date: '',
      end_date: '',
      status: 'all',
      payment_mode: 'all',
      search_term: ''
    });
  };

  // Export data
  const exportData = (format) => {
    if (format === 'csv') {
      // Convert to CSV
      const headers = ['Transaction No', 'Student', 'Admission No', 'Amount', 'Date', 'Method', 'Status'];
      const rows = filteredTransactions.map(transaction => [
        transaction.transaction_no,
        `${transaction.first_name} ${transaction.last_name}`,
        transaction.admission_no,
        transaction.amount_kes,
        new Date(transaction.payment_date).toLocaleDateString(),
        transaction.payment_mode,
        transaction.status
      ]);
      
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    }
    
    showNotification('success', `Data exported as ${format.toUpperCase()}`);
  };

 const downloadReceiptPDF = async (transaction) => {
  if (!transaction) return;

  const getBase64Logo = () => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = '/logo.jpeg'; 
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width; canvas.height = img.height;
        canvas.getContext('2d').drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/jpeg'));
      };
      img.onerror = () => resolve('');
    });
  };

  const logoBase64 = await getBase64Logo();
  // Formatting currencies 
  const termlyFee = parseFloat(transaction.total_invoiced_amount || 0).toLocaleString('en-KE', { minimumFractionDigits: 2 });
  const termTotalPaid = parseFloat(transaction.term_total_paid || 0).toLocaleString('en-KE', { minimumFractionDigits: 2 });
  const currentPaid = parseFloat(transaction.amount_kes || 0).toLocaleString('en-KE', { minimumFractionDigits: 2 });
  const balance = parseFloat(transaction.student_balance || 0).toLocaleString('en-KE', { minimumFractionDigits: 2 });

  const htmlContent = `
    <html>
      <head>
        <style>
          @media print { @page { margin: 0; } body { margin: 1cm; } }
          body { font-family: sans-serif; color: #1a1a1a; padding: 20px; }
          .receipt { border: 2px solid #b91c1c; padding: 30px; max-width: 750px; margin: auto; border-radius: 10px; }
          .header { text-align: center; border-bottom: 2px solid #b91c1c; margin-bottom: 20px; padding-bottom: 10px; }
          .school-name { color: #b91c1c; font-size: 28px; font-weight: 900; margin: 0; }
          .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f3f4f6; }
          .label { font-weight: bold; color: #4b5563; }
          .summary-box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; margin-top: 20px; border-radius: 8px; }
          .highlight { background: #fef2f2; padding: 20px; border-radius: 8px; margin-top: 15px; border: 1px solid #fee2e2; }
          .balance-val { color: #b91c1c; font-size: 22px; font-weight: 800; }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <img src="${logoBase64}" style="width:70px; height:70px;" />
            <h1 class="school-name">ELIMUHUB</h1>
            <p style="font-weight:bold;">OFFICIAL PAYMENT RECEIPT</p>
          </div>
          
          <div class="row"><span class="label">Receipt No:</span><span>${transaction.transaction_no}</span></div>
          <div class="row"><span class="label">Invoice No:</span><span>${transaction.invoice_no || 'N/A'}</span></div>
          <div class="row"><span class="label">Student:</span><span>${transaction.student_name}</span></div>
          <div class="row"><span class="label">Class/Term:</span><span>${transaction.class_name} - ${transaction.invoice_term}</span></div>

          <div class="summary-box">
            <div class="row" style="border:0;"><span class="label">Actual Termly Fee:</span><span>KSh ${termlyFee}</span></div>
            <div class="row" style="border:0;"><span class="label">Cumulative Paid This Term:</span><span style="color: #2563eb; font-weight: bold;">KSh ${termTotalPaid}</span></div>
          </div>
          
          <div class="highlight">
            <div class="row" style="border:0;"><span class="label" style="font-size:16px;">AMOUNT PAID (THIS TRANSACTION):</span><b style="color: #059669; font-size:18px;">KSh ${currentPaid}</b></div>
            <div class="row" style="border:0; border-top: 2px dashed #b91c1c; padding-top: 15px; margin-top: 15px;">
              <span class="label" style="font-size:16px;">OUTSTANDING BALANCE:</span>
              <span class="balance-val">KSh ${balance}</span>
            </div>
          </div>

          <div class="footer" style="text-align:center; margin-top:40px; font-size:10px; color:#999;">
            <p>*** Computer Generated Official Receipt ***</p>
            <p>© ${new Date().getFullYear()} ELIMUHUB MS • Generated on ${new Date().toLocaleString()}</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const printWindow = window.open(url, '_blank');
  if (printWindow) {
    printWindow.onload = () => {
      printWindow.print();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    };
  }
};
  
  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'VERIFIED':
        return 'bg-green-100 text-green-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'REVERSED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get payment method color
  const getMethodColor = (method) => {
    switch (method) {
      case 'Mobile Money':
        return 'bg-green-50 text-green-700 border border-green-200';
      case 'Cash':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'Bank Transfer':
        return 'bg-purple-50 text-purple-700 border border-purple-200';
      case 'Cheque':
        return 'bg-yellow-50 text-yellow-700 border border-yellow-200';
      default:
        return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format time
  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Render components
  const renderNotification = () => (
    notification.show && (
      <div className={`fixed top-4 right-4 z-50 max-w-sm w-full animate-slide-in ${
        notification.type === 'error' ? 'bg-red-50 border-red-200' :
        notification.type === 'success' ? 'bg-green-50 border-green-200' :
        'bg-blue-50 border-blue-200'
      } border rounded-lg shadow-lg p-4 transition-all duration-300`}>
        <div className="flex items-start justify-between">
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium">
              {notification.message}
            </p>
          </div>
          <button
            onClick={() => setNotification({ show: false, type: '', message: '' })}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
      </div>
    )
  );

  const renderFilters = () => (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 mb-6 transition-all duration-300 ${
      showFilters ? 'p-6' : 'p-0 border-0'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Filter Transactions</h3>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          {showFilters ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          <span className="ml-2">{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
        </button>
      </div>

      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              value={filters.start_date}
              onChange={(e) => setFilters({...filters, start_date: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              value={filters.end_date}
              onChange={(e) => setFilters({...filters, end_date: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="VERIFIED">Verified</option>
              <option value="COMPLETED">Completed</option>
              <option value="PENDING">Pending</option>
              <option value="REVERSED">Reversed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
            <select
              value={filters.payment_mode}
              onChange={(e) => setFilters({...filters, payment_mode: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Methods</option>
              <option value="Mobile Money">Mobile Money</option>
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Cheque">Cheque</option>
            </select>
          </div>

          <div className="md:col-span-2 lg:col-span-4 flex justify-end space-x-3 pt-4">
            <button
              onClick={clearFilters}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Clear Filters
            </button>
            <button
              onClick={() => {
                fetchTransactions();
                fetchTransactionStats();
                setShowFilters(false);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderSearchBar = () => (
    <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={filters.search_term}
              onChange={(e) => setFilters({...filters, search_term: e.target.value})}
              placeholder="Search by transaction no, student name, or admission number..."
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchTransactions}
            disabled={loading}
            className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          
          <button
            onClick={() => exportData('csv')}
            className="px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </button>
          
          <button
            onClick={() => exportData('print')}
            className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
          >
            <Printer className="w-4 h-4 mr-2" />
            Print
          </button>
        </div>
      </div>
    </div>
  );

  const renderStatsCards = () => {
    if (!stats) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-linear-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 mb-1">Total Collected</p>
              <p className="text-2xl font-bold text-gray-800">
                KSh {parseFloat(stats.total_collected || 0).toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            Avg: KSh {Math.round(parseFloat(stats.average_amount || 0)).toLocaleString()}
          </div>
        </div>

        <div className="bg-linear-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 mb-1">Total Transactions</p>
              <p className="text-2xl font-bold text-gray-800">{stats.total_transactions || 0}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <div className="flex items-center text-green-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>{stats.completed_count || 0} completed</span>
            </div>
          </div>
        </div>

        <div className="bg-linear-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600 mb-1">Unique Students</p>
              <p className="text-2xl font-bold text-gray-800">{stats?.transactions?.unique_students || 0}</p>
            </div>
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-linear-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600 mb-1">Time Period</p>
              <p className="text-lg font-bold text-gray-800">
                {filters.start_date ? formatDate(filters.start_date) : 'All Time'}
              </p>
              {filters.end_date && (
                <p className="text-sm text-gray-600">to {formatDate(filters.end_date)}</p>
              )}
            </div>
            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTransactionsTable = () => {
    if (loading) {
      return (
        <div className="bg-white rounded-xl shadow-sm p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading transactions...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="text-center text-red-600">
            <p className="text-lg font-semibold mb-2">{error}</p>
            <button
              onClick={fetchTransactions}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    if (filteredTransactions.length === 0) {
      return (
        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="text-center text-gray-600">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-semibold mb-2">No transactions found</p>
            <p className="text-gray-500">Try adjusting your filters or search criteria</p>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-linear-to-r from-gray-800 to-gray-900">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                  Transaction Details
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                  Student Information
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                  Payment Details
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-blue-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-semibold text-gray-900">{transaction.transaction_no}</div>
                      <div className="text-sm text-gray-600">
                        {formatDate(transaction.payment_date)} at {formatTime(transaction.payment_date)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Invoice: {transaction.invoice_no || 'N/A'}
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-semibold text-gray-900">
                        {transaction.first_name} {transaction.last_name}
                      </div>
                      <div className="text-sm text-gray-600">{transaction.admission_no}</div>
                      <div className="text-xs text-gray-500">
                        {transaction.class_name || 'No class info'}
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="text-lg font-bold text-green-600">
                      KSh {parseFloat(transaction.amount_kes || 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">
                      {transaction.currency} {transaction.amount}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getMethodColor(transaction.payment_mode)}`}>
                        {transaction.payment_mode}
                      </span>
                      {transaction.payment_reference && (
                        <div className="text-xs text-gray-600">
                          Ref: {transaction.payment_reference}
                        </div>
                      )}
                      {transaction.mobile_money_no && (
                        <div className="text-xs text-gray-600">
                          M-PESA: {transaction.mobile_money_no}
                        </div>
                      )}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                      {transaction.status}
                    </span>
                    {transaction.verified_at && (
                      <div className="text-xs text-gray-500 mt-1">
                        Verified: {formatDate(transaction.verified_at)}
                      </div>
                    )}
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => fetchTransactionDetails(transaction.id)}
                        className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => downloadReceiptPDF(transaction)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Download PDF"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                      
                      <div className="relative">
                        <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            
            <tfoot className="bg-linear-to-r from-gray-50 to-gray-100">
              <tr>
                <td colSpan="2" className="px-6 py-4">
                  <div className="font-semibold text-gray-900">
                    {filteredTransactions.length} transaction(s) found
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="text-sm text-gray-600">Total Amount:</div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="text-lg font-bold text-green-700">
                    KSh {filteredTransactions.reduce((sum, t) => sum + parseFloat(t.amount_kes || 0), 0).toLocaleString()}
                  </div>
                </td>
                <td colSpan="2" className="px-6 py-4">
                  <div className="text-sm text-gray-600 text-right">
                    Showing last {filteredTransactions.length} records
                  </div>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    );
  };

  const renderDetailModal = () => (
    showDetailModal && selectedTransaction && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Transaction Details</h3>
                <p className="text-gray-600">{selectedTransaction.transaction_no}</p>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Transaction Information</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transaction No:</span>
                    <span className="font-semibold">{selectedTransaction.transaction_no}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Date:</span>
                    <span className="font-semibold">
                      {formatDate(selectedTransaction.payment_date)} {formatTime(selectedTransaction.payment_date)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedTransaction.status)}`}>
                      {selectedTransaction.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created:</span>
                    <span className="font-semibold">
                      {formatDate(selectedTransaction.created_at)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Financial Details</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="text-xl font-bold text-green-600">
                      KSh {parseFloat(selectedTransaction.amount_kes || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Currency:</span>
                    <span className="font-semibold">{selectedTransaction.currency} {selectedTransaction.amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Exchange Rate:</span>
                    <span className="font-semibold">{selectedTransaction.exchange_rate || 1}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method:</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getMethodColor(selectedTransaction.payment_mode)}`}>
                      {selectedTransaction.payment_mode}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Student Information</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-semibold">
                      {selectedTransaction.first_name} {selectedTransaction.last_name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Admission No:</span>
                    <span className="font-semibold">{selectedTransaction.admission_no}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Class:</span>
                    <span className="font-semibold">{selectedTransaction.class_name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Guardian:</span>
                    <span className="font-semibold">
                      {selectedTransaction.guardian_name} ({selectedTransaction.guardian_phone})
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Payment Information</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Reference:</span>
                    <span className="font-semibold">{selectedTransaction.payment_reference || 'N/A'}</span>
                  </div>
                  {selectedTransaction.bank_name && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bank:</span>
                      <span className="font-semibold">{selectedTransaction.bank_name}</span>
                    </div>
                  )}
                  {selectedTransaction.cheque_no && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cheque No:</span>
                      <span className="font-semibold">{selectedTransaction.cheque_no}</span>
                    </div>
                  )}
                  {selectedTransaction.mobile_money_no && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">M-PESA No:</span>
                      <span className="font-semibold">{selectedTransaction.mobile_money_no}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Invoice Information</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Invoice No:</span>
                  <span className="font-semibold">{selectedTransaction.invoice_no || 'N/A'}</span>
                </div>
                {selectedTransaction.invoice_no && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Academic Year:</span>
                      <span className="font-semibold">{selectedTransaction.invoice_year}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Term:</span>
                      <span className="font-semibold">{selectedTransaction.invoice_term}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Audit Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Collection</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Collected By:</span>
                      <span className="font-medium">{selectedTransaction.collected_by_name || 'N/A'}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Verification</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Verified By:</span>
                      <span className="font-medium">{selectedTransaction.verified_by_name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Verified At:</span>
                      <span className="font-medium">
                        {selectedTransaction.verified_at ? formatDate(selectedTransaction.verified_at) : 'Not verified'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 p-6 bg-gray-50 rounded-b-2xl">
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => exportData('transaction-detail')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Export Details
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  );

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50 p-4 md:p-6 lg:p-8">
      {renderNotification()}
      {renderDetailModal()}

      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Payment Records
              </h1>
              <p className="text-gray-600 text-lg">
                View and manage all student fee payment transactions
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Records</p>
                    <p className="font-bold text-gray-800">{filteredTransactions.length}</p>
                  </div>
                  <div className="h-8 w-px bg-gray-200"></div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Role</p>
                    <p className="font-bold text-blue-600">Bursar</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {renderStatsCards()}
          {renderFilters()}
          {renderSearchBar()}
          {renderTransactionsTable()}
        </div>
      </div>
    </div>
  );
};

export default PaymentRecords;