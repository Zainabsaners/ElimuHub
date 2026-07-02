import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiDollarSign, 
  FiFileText, 
  FiPrinter, 
  FiDownload,
  FiCreditCard,
  FiCalendar,
  FiCheckCircle,
  FiAlertCircle,
  FiRefreshCw,
  FiChevronDown,
  FiChevronUp,
  FiEye
} from 'react-icons/fi';
import { FaMoneyBillWave, FaReceipt } from 'react-icons/fa';
import { useAuth } from '../../Authentication/AuthContext';
import { useTheme } from "@/hooks/useTheme";
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

const FeeStatement = () => {
  const { authenticatedFetch } = useAuth();
  const { theme } = useTheme();
  const [data, setData] = useState({
    invoices: [],
    transactions: [],
    summary: {
      total_due: 0,
      total_paid: 0,
      balance: 0,
    }
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedInvoices, setExpandedInvoices] = useState(new Set());
  const [filter, setFilter] = useState('all');

  const fetchFinanceData = useCallback(async (showToast = false) => {
    try {
      if (!showToast) setLoading(true);
      
      const response = await authenticatedFetch(`${API_BASE}/api/students/finance/`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      setData(result);
      
      if (showToast) {
        toast.success('Fee statement updated!', {
          duration: 3000,
          position: 'bottom-right',
        });
      }
    } catch (error) {
      console.error('Finance fetch error:', error);
      toast.error('Failed to load fee statement', {
        duration: 4000,
        position: 'bottom-right',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [authenticatedFetch]);

  useEffect(() => {
    fetchFinanceData();
  }, [fetchFinanceData]);

  const handleRefresh = useCallback(async () => {
    if (refreshing) return;
    setRefreshing(true);
    await fetchFinanceData(true);
  }, [fetchFinanceData, refreshing]);

  const toggleInvoice = (invoiceId) => {
    setExpandedInvoices(prev => {
      const newSet = new Set(prev);
      if (newSet.has(invoiceId)) {
        newSet.delete(invoiceId);
      } else {
        newSet.add(invoiceId);
      }
      return newSet;
    });
  };

  // Filter invoices based on selected filter
  const filteredInvoices = useMemo(() => {
    if (!data.invoices) return [];
    
    return data.invoices.filter(invoice => {
      if (filter === 'all') return true;
      if (filter === 'pending') return invoice.status === 'Pending' || invoice.status === 'Partial';
      if (filter === 'paid') return invoice.status === 'Paid';
      if (filter === 'overdue') return invoice.status === 'Overdue';
      return true;
    });
  }, [data.invoices, filter]);

  // Calculate stats for dashboard cards
  const stats = useMemo(() => {
    const totalInvoices = data.invoices?.length || 0;
    const paidInvoices = data.invoices?.filter(inv => inv.status === 'Paid').length || 0;
    const pendingInvoices = data.invoices?.filter(inv => inv.status === 'Pending' || inv.status === 'Partial').length || 0;
    const overdueInvoices = data.invoices?.filter(inv => inv.status === 'Overdue').length || 0;
    
    return {
      totalInvoices,
      paidInvoices,
      pendingInvoices,
      overdueInvoices,
    };
  }, [data.invoices]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
      case 'Pending': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
      case 'Partial': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
      case 'Overdue': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
      default: return 'bg-gray-100 dark:bg-gray-700/30 text-gray-700 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Paid': return <FiCheckCircle className="text-green-500" />;
      case 'Pending': return <FiAlertCircle className="text-yellow-500" />;
      case 'Partial': return <FiDollarSign className="text-blue-500" />;
      case 'Overdue': return <FiAlertCircle className="text-red-500" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className={`p-4 md:p-6 min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                </div>
              ))}
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4"></div>
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 md:p-6 min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <FaMoneyBillWave className="text-indigo-500" />
              Fee Statement
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Review your fee status and payment history
            </p>
          </div>
          <div className="mt-3 md:mt-0 flex items-center gap-3 flex-wrap">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg shadow-md hover:shadow-lg transition text-sm border border-gray-200 dark:border-gray-700 disabled:opacity-50"
            >
              <FiRefreshCw className={refreshing ? 'animate-spin' : ''} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition text-sm"
            >
              <FiPrinter />
              Print
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg border-l-4 border-indigo-500">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Due</p>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
              KSh {data.summary?.total_due?.toLocaleString() || '0'}
            </h3>
          </div>
          <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg border-l-4 border-green-500">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Paid</p>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
              KSh {data.summary?.total_paid?.toLocaleString() || '0'}
            </h3>
          </div>
          <div className={`bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg border-l-4 ${data.summary?.balance > 0 ? 'border-red-500' : 'border-green-500'}`}>
            <p className="text-sm text-gray-500 dark:text-gray-400">Balance</p>
            <h3 className={`text-2xl font-bold ${data.summary?.balance > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
              KSh {data.summary?.balance?.toLocaleString() || '0'}
            </h3>
          </div>
          <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg border-l-4 border-purple-500">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Invoices</p>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
              {stats.totalInvoices}
            </h3>
          </div>
        </div>

        {/* Quick Stats Mini Cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">Paid</p>
            <p className="text-lg font-bold text-green-600 dark:text-green-400">{stats.paidInvoices}</p>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">Pending</p>
            <p className="text-lg font-bold text-yellow-600 dark:text-yellow-400">{stats.pendingInvoices}</p>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">Overdue</p>
            <p className="text-lg font-bold text-red-600 dark:text-red-400">{stats.overdueInvoices}</p>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === 'pending'
                ? 'bg-yellow-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('paid')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === 'paid'
                ? 'bg-green-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Paid
          </button>
          <button
            onClick={() => setFilter('overdue')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === 'overdue'
                ? 'bg-red-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Overdue
          </button>
        </div>

        {/* Invoices List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <FaReceipt />
              Invoices
            </h2>
            <span className="text-sm text-gray-500">{filteredInvoices.length} invoices</span>
          </div>

          {filteredInvoices.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <FiFileText className="text-4xl mx-auto mb-3 opacity-30" />
              <p>No invoices found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredInvoices.map((invoice) => (
                <div key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                  {/* Invoice Header */}
                  <div 
                    className="px-6 py-4 cursor-pointer"
                    onClick={() => toggleInvoice(invoice.id)}
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${getStatusColor(invoice.status)}`}>
                          {getStatusIcon(invoice.status)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 dark:text-white">
                            {invoice.invoice_no || `INV-${invoice.id}`}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {invoice.academic_year} - {invoice.term}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                          {invoice.status}
                        </span>
                        <span className="font-semibold text-gray-800 dark:text-white">
                          KSh {invoice.total_amount?.toLocaleString() || '0'}
                        </span>
                        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                          {expandedInvoices.has(invoice.id) ? <FiChevronUp /> : <FiChevronDown />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Invoice Details (Expanded) */}
                  {expandedInvoices.has(invoice.id) && (
                    <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Due Date</p>
                          <p className="font-medium text-gray-700 dark:text-gray-300">
                            {new Date(invoice.due_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Subtotal</p>
                          <p className="font-medium text-gray-700 dark:text-gray-300">
                            KSh {invoice.subtotal?.toLocaleString() || '0'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Balance</p>
                          <p className={`font-medium ${invoice.balance_amount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            KSh {invoice.balance_amount?.toLocaleString() || '0'}
                          </p>
                        </div>
                      </div>

                      {/* Invoice Items */}
                      {invoice.items && invoice.items.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Items</p>
                          <div className="space-y-2">
                            {invoice.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center p-2 bg-white dark:bg-gray-700/30 rounded-lg">
                                <div>
                                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.description}</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {item.quantity} × KSh {item.unit_price?.toLocaleString()}
                                  </p>
                                </div>
                                <p className="text-sm font-semibold text-gray-800 dark:text-white">
                                  KSh {item.net_amount?.toLocaleString() || '0'}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payment History */}
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <FiCreditCard />
              Payment History
            </h2>
          </div>

          {data.transactions?.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <FiDollarSign className="text-4xl mx-auto mb-3 opacity-30" />
              <p>No payment transactions found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/30">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Transaction</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Mode</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Amount</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {data.transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                      <td className="px-6 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {transaction.transaction_no}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {new Date(transaction.payment_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {transaction.payment_mode}
                      </td>
                      <td className="px-6 py-3 text-sm font-semibold text-gray-800 dark:text-white text-right">
                        KSh {transaction.amount_kes?.toLocaleString() || '0'}
                      </td>
                      <td className="px-6 py-3 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          transaction.status === 'Completed' 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                            : transaction.status === 'Pending'
                            ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                        }`}>
                          {transaction.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeeStatement;
