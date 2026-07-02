import React, { useState, useEffect, useCallback } from 'react';
import { FiCreditCard, FiRefreshCw, FiCreditCard as FiCard } from 'react-icons/fi';
import { useAuth } from '../../Authentication/AuthContext';
import toast from 'react-hot-toast';

const PaymentHistory = () => {
  const { authenticatedFetch } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [_error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');

  const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

  const fetchPayments = useCallback(async (showToast = false) => {
    try {
      setError(null);
      if (!showToast) setLoading(true);
      const response = await authenticatedFetch(`${API_BASE}/api/students/finance/`);
      if (!response) throw new Error('No response');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setTransactions(data.transactions || []);
      if (showToast) toast.success('Payment history updated!');
    } catch (err) {
      console.error(err);
      setError(err.message);
      toast.error('Failed to load payment history');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [API_BASE, authenticatedFetch]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPayments(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-900/30 text-green-400 border border-green-800';
      case 'Pending': return 'bg-yellow-900/30 text-yellow-400 border border-yellow-800';
      case 'Failed': return 'bg-red-900/30 text-red-400 border border-red-800';
      default: return 'bg-gray-800 text-gray-400 border border-gray-700';
    }
  };

  const filteredTransactions = transactions.filter(t => {
    if (filter === 'all') return true;
    return t.status === filter;
  });

  if (loading) {
    return (
      <div className="p-4 md:p-6 min-h-screen bg-gray-900">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-800 rounded w-48"></div>
          <div className="h-64 bg-gray-800 rounded w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 min-h-screen bg-gray-900 text-gray-100">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2 text-white">
            <FiCreditCard className="text-indigo-400" /> Payment History
          </h1>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition"
          >
            <FiRefreshCw className={refreshing ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Summary Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Paid', val: transactions.reduce((s, t) => s + (t.amount_kes || 0), 0), color: 'border-green-500' },
            { label: 'Successful', val: transactions.filter(t => t.status === 'Completed').length, color: 'border-indigo-500' },
            { label: 'Pending/Failed', val: transactions.filter(t => t.status !== 'Completed').length, color: 'border-yellow-500' }
          ].map((item, idx) => (
            <div key={idx} className={`bg-gray-800 p-4 rounded-xl border-l-4 ${item.color}`}>
              <p className="text-sm text-gray-400">{item.label}</p>
              <p className="text-2xl font-bold text-white">
                {typeof item.val === 'number' && item.label.includes('Paid') ? `KSh ${item.val.toLocaleString()}` : item.val}
              </p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-4">
          {['all', 'Completed', 'Pending', 'Failed'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === f ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-gray-800 rounded-xl shadow overflow-hidden border border-gray-700">
          <table className="w-full">
            <thead className="bg-gray-950/50">
              <tr>
                {['Transaction', 'Date', 'Mode', 'Amount', 'Status'].map(h => (
                  <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredTransactions.map(t => (
                <tr key={t.id} className="hover:bg-gray-750 transition">
                  <td className="px-6 py-4 text-sm text-gray-200">{t.transaction_no}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">{new Date(t.payment_date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">{t.payment_mode}</td>
                  <td className="px-6 py-4 text-sm font-bold text-white text-right">KSh {t.amount_kes?.toLocaleString()}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(t.status)}`}>
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PaymentHistory;