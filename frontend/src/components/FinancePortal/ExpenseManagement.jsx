import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { 
  FiPlus, 
  FiTrash2, 
  FiEdit, 
  FiDollarSign, 
  FiPieChart, 
  FiSearch, 
  FiDownload,
  FiCheckCircle,
  FiClock,
  FiAlertTriangle,
  FiX,
  FiMoreVertical,
  FiLoader,
  FiRefreshCw,
  FiBell,
  FiAlertCircle,
  FiXCircle,
  FiFileText
} from "react-icons/fi";
import api from '../../api';

// Toast Notification Component
const Toast = React.memo(({ show, message, type, onClose }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => onClose(), 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  const bgColor = {
    success: 'bg-linear-to-r from-green-500 to-emerald-500',
    error: 'bg-linear-to-r from-red-500 to-rose-500',
    info: 'bg-linear-to-r from-indigo-500 to-indigo-500',
    warning: 'bg-linear-to-r from-yellow-500 to-amber-500'
  }[type] || 'bg-linear-to-r from-indigo-500 to-indigo-500';

  const icon = {
    success: <FiCheckCircle className="text-white" size={20} />,
    error: <FiXCircle className="text-white" size={20} />,
    info: <FiBell className="text-white" size={20} />,
    warning: <FiAlertCircle className="text-white" size={20} />
  }[type] || <FiBell className="text-white" size={20} />;

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className={`${bgColor} text-white rounded-xl shadow-lg p-4 min-w-[300px] flex items-center gap-3`}>
        <div className="shrink-0">{icon}</div>
        <div className="flex-grow"><p className="font-medium">{message}</p></div>
        <button onClick={onClose} className="shrink-0 text-white hover:text-gray-200">
          <FiX size={18} />
        </button>
      </div>
    </div>
  );
});

const ExpenseManagement = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "info" });
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [newExpense, setNewExpense] = useState({
    title: "",
    category: "",
    amount: "",
    date: new Date().toISOString().split('T')[0],
    vendor: "",
    payment_method: "",
    description: ""
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const [stats, setStats] = useState({
    totalExpenses: 0,
    approvedExpenses: 0,
    pendingExpenses: 0,
    cancelledExpenses: 0,
    monthlyBudget: 500000,
    categoriesBreakdown: {}
  });

  const hasFetchedRef = useRef(false);

  const showToast = useCallback((message, type = "info") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "info" }), 3000);
  }, []);

  const closeToast = useCallback(() => {
    setToast({ show: false, message: "", type: "info" });
  }, []);

  const checkAuth = useCallback(() => {
    const token = localStorage.getItem('token');
    const isAuth = !!token;
    setIsAuthenticated(isAuth);
    return isAuth;
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('session_id');
    setIsAuthenticated(false);
    setExpenses([]);
    window.location.href = '/Login';
  }, []);

  const fetchExpenses = useCallback(async () => {
    if (!checkAuth()) {
      setExpenses([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const response = await api.get('/api/expenses/');
      
      let data = response.data;
      if (data && typeof data === 'object') {
        if (data.data && Array.isArray(data.data)) {
          data = data.data;
        } else if (data.results && Array.isArray(data.results)) {
          data = data.results;
        } else if (Array.isArray(data)) {
          // data is already an array, keep it as is
        } else {
          const arrayKeys = Object.keys(data).filter(key => Array.isArray(data[key]));
          if (arrayKeys.length > 0) {
            data = data[arrayKeys[0]];
          } else {
            data = [];
          }
        }
      } else {
        data = [];
      }
      
      setExpenses(Array.isArray(data) ? data : []);
      
      if (Array.isArray(data) && data.length === 0) {
        showToast('No expenses found. Create your first expense!', 'info');
      }
      
    } catch (error) {
      console.error("Failed to fetch expenses:", error);
      
      if (error.response?.status === 401) {
        showToast('Session expired. Please login again.', 'error');
        handleLogout();
      } else {
        showToast('Failed to load expenses. Please try again.', 'error');
      }
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  }, [checkAuth, showToast, handleLogout]);

  const fetchCategories = useCallback(async () => {
    if (!checkAuth()) return;
    
    try {
      const response = await api.get('/api/expense-categories/');
      const data = response.data.results || response.data.data || response.data;
      setExpenseCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setExpenseCategories([]);
    }
  }, [checkAuth]);

  const fetchPaymentMethods = useCallback(async () => {
    if (!checkAuth()) return;
    
    try {
      const response = await api.get('/api/payment-methods/');
      const data = response.data.results || response.data.data || response.data;
      setPaymentMethods(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      setPaymentMethods([]);
    }
  }, [checkAuth]);

  // Filter expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      const categoryName = expense.category?.name || expense.category || '';
      
      const matchesSearch = (expense.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (expense.vendor || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (expense.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           categoryName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = categoryFilter === "all" || 
                             (expense.category?.id?.toString() === categoryFilter) || 
                             (expense.category === categoryFilter);
      
      const matchesStatus = statusFilter === "all" || expense.status === statusFilter;
      const matchesDate = (!dateRange.start || (expense.date || '') >= dateRange.start) &&
                         (!dateRange.end || (expense.date || '') <= dateRange.end);

      return matchesSearch && matchesCategory && matchesStatus && matchesDate;
    });
  }, [expenses, searchTerm, categoryFilter, statusFilter, dateRange]);

  // Helper function to safely escape CSV fields
  const escapeCSV = (value) => {
    if (value === null || value === undefined) return '""';
    const stringValue = String(value);
    return `"${stringValue.replace(/"/g, '""')}"`;
  };

  // Download Report Function
  const downloadReport = useCallback(async () => {
    if (!checkAuth()) {
      showToast('Please login to download reports', 'error');
      return;
    }

    if (expenses.length === 0) {
      showToast('No expenses to export', 'warning');
      return;
    }

    try {
      setDownloading(true);
      showToast('Generating report...', 'info');

      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
      
      const headers = [
        'Title',
        'Category',
        'Amount (KES)',
        'Date',
        'Vendor',
        'Payment Method',
        'Status',
        'Description'
      ];

      const dataToExport = filteredExpenses.length > 0 ? filteredExpenses : expenses;

      // Create CSV rows with proper escaping
      const rows = dataToExport.map(expense => [
        escapeCSV(expense.title || ''),
        escapeCSV(expense.category?.name || expense.category || 'Uncategorized'),
        expense.amount || 0,
        expense.date || '',
        escapeCSV(expense.vendor || ''),
        escapeCSV(expense.payment_method?.name || expense.payment_method || 'N/A'),
        expense.status || 'pending',
        escapeCSV(expense.description || '')
      ]);

      let csvContent = headers.join(',') + '\n';
      rows.forEach(row => {
        csvContent += row.join(',') + '\n';
      });

      // Add summary
      const totalAmount = dataToExport.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
      const approvedCount = dataToExport.filter(e => e.status === 'approved').length;
      const pendingCount = dataToExport.filter(e => e.status === 'pending').length;
      const cancelledCount = dataToExport.filter(e => e.status === 'cancelled').length;

      csvContent += '\n';
      csvContent += '"Summary",,,,,,\n';
      csvContent += `"Total Expenses",${dataToExport.length},,,,,,\n`;
      csvContent += `"Total Amount","${totalAmount.toFixed(2)}",,,,,,\n`;
      csvContent += `"Approved",${approvedCount},,,,,,\n`;
      csvContent += `"Pending",${pendingCount},,,,,,\n`;
      csvContent += `"Cancelled",${cancelledCount},,,,,,\n`;

      // Create and download the file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `expense_report_${dateStr}_${timeStr}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast(`Report downloaded successfully! (${dataToExport.length} expenses)`, 'success');
      
    } catch (error) {
      console.error('Download error:', error);
      showToast('Failed to download report. Please try again.', 'error');
    } finally {
      setDownloading(false);
    }
  }, [checkAuth, expenses, filteredExpenses, showToast]);

  // Download as JSON
  const downloadJSONReport = useCallback(async () => {
    if (!checkAuth()) {
      showToast('Please login to download reports', 'error');
      return;
    }

    if (expenses.length === 0) {
      showToast('No expenses to export', 'warning');
      return;
    }

    try {
      setDownloading(true);
      
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
      
      const dataToExport = filteredExpenses.length > 0 ? filteredExpenses : expenses;
      
      const reportData = {
        generatedAt: now.toISOString(),
        totalExpenses: dataToExport.length,
        totalAmount: dataToExport.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0),
        summary: {
          approved: dataToExport.filter(e => e.status === 'approved').length,
          pending: dataToExport.filter(e => e.status === 'pending').length,
          cancelled: dataToExport.filter(e => e.status === 'cancelled').length,
        },
        expenses: dataToExport.map(expense => ({
          title: expense.title || '',
          category: expense.category?.name || expense.category || 'Uncategorized',
          amount: parseFloat(expense.amount) || 0,
          date: expense.date || '',
          vendor: expense.vendor || '',
          payment_method: expense.payment_method?.name || expense.payment_method || 'N/A',
          status: expense.status || 'pending',
          description: expense.description || ''
        }))
      };

      const jsonContent = JSON.stringify(reportData, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `expense_report_${dateStr}_${timeStr}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast(`Report downloaded successfully! (${dataToExport.length} expenses)`, 'success');
      
    } catch (error) {
      console.error('Download error:', error);
      showToast('Failed to download report. Please try again.', 'error');
    } finally {
      setDownloading(false);
    }
  }, [checkAuth, expenses, filteredExpenses, showToast]);

  useEffect(() => {
    if (hasFetchedRef.current) return;
    
    const token = localStorage.getItem('token');
    
    if (token) {
      setIsAuthenticated(true);
      fetchExpenses();
      fetchCategories();
      fetchPaymentMethods();
      hasFetchedRef.current = true;
    } else {
      setIsAuthenticated(false);
      showToast('Please login to view expenses', 'warning');
      hasFetchedRef.current = true;
    }
  }, [fetchExpenses, fetchCategories, fetchPaymentMethods, showToast]);

  useEffect(() => {
    const totalAmount = expenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
    const approvedAmount = expenses.filter(e => e.status === "approved").reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
    const pendingAmount = expenses.filter(e => e.status === "pending").reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
    const cancelledAmount = expenses.filter(e => e.status === "cancelled").reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);

    const categoriesBreakdown = {};
    expenses.forEach(expense => {
      const categoryName = expense.category?.name || expense.category || 'Uncategorized';
      if (categoryName) {
        categoriesBreakdown[categoryName] = (categoriesBreakdown[categoryName] || 0) + (parseFloat(expense.amount) || 0);
      }
    });

    setStats({
      totalExpenses: totalAmount,
      approvedExpenses: approvedAmount,
      pendingExpenses: pendingAmount,
      cancelledExpenses: cancelledAmount,
      monthlyBudget: 500000,
      categoriesBreakdown
    });
  }, [expenses]);

  const handleCreateExpense = async (e) => {
    e.preventDefault();
    if (!checkAuth()) {
      showToast('Please login to create expenses', 'error');
      return;
    }
    
    if (parseFloat(newExpense.amount || 0) <= 0) {
      showToast('Amount must be greater than zero', 'error');
      return;
    }

    try {
      setFormLoading(true);
      
      const expenseData = {
        title: newExpense.title,
        category: newExpense.category ? parseInt(newExpense.category) : null,
        amount: parseFloat(newExpense.amount),
        date: newExpense.date,
        vendor: newExpense.vendor,
        payment_method: newExpense.payment_method ? parseInt(newExpense.payment_method) : null,
        description: newExpense.description
      };
      
      const response = await api.post('/api/expenses/', expenseData);
      const data = response.data.data || response.data;
      setExpenses([data, ...expenses]);
      setNewExpense({
        title: "",
        category: "",
        amount: "",
        date: new Date().toISOString().split('T')[0],
        vendor: "",
        payment_method: "",
        description: ""
      });
      setShowModal(false);
      showToast('Expense submitted successfully', 'success');
      fetchExpenses();
      
    } catch (error) {
      console.error("Expense Save Error:", error);
      
      if (error.response?.status === 401) {
        showToast('Session expired. Please login again.', 'error');
        handleLogout();
      } else {
        const errorMsg = error.response?.data?.error || 'Failed to create expense';
        showToast(errorMsg, 'error');
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateExpense = async (e) => {
    e.preventDefault();
    if (!checkAuth()) {
      showToast('Please login to update expenses', 'error');
      return;
    }
    
    if (!editingExpense) return;
    if (parseFloat(editingExpense.amount || 0) <= 0) {
      showToast('Amount must be greater than zero', 'error');
      return;
    }

    try {
      setFormLoading(true);
      
      const expenseData = {
        title: editingExpense.title,
        category: editingExpense.category ? parseInt(editingExpense.category) : null,
        amount: parseFloat(editingExpense.amount),
        date: editingExpense.date,
        vendor: editingExpense.vendor,
        payment_method: editingExpense.payment_method ? parseInt(editingExpense.payment_method) : null,
        description: editingExpense.description,
        status: editingExpense.status
      };
      
      const response = await api.put(`/api/expenses/${editingExpense.id}/`, expenseData);
      const data = response.data.data || response.data;
      setExpenses(expenses.map(e => e.id === editingExpense.id ? data : e));
      setShowModal(false);
      setEditingExpense(null);
      setIsEditMode(false);
      showToast('Expense updated successfully!', 'success');
      fetchExpenses();
      
    } catch (error) {
      console.error("Expense Update Error:", error);
      
      if (error.response?.status === 401) {
        showToast('Session expired. Please login again.', 'error');
        handleLogout();
      } else {
        showToast(error.response?.data?.error || 'Failed to update expense', 'error');
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!checkAuth()) {
      showToast('Please login to delete expenses', 'error');
      return;
    }
    
    if (!window.confirm('Are you sure you want to delete this expense?')) return;

    setDeletingId(id);
    try {
      await api.delete(`/api/expenses/${id}/`);
      setExpenses(expenses.filter(e => e.id !== id));
      showToast('Expense deleted successfully!', 'success');
      fetchExpenses();
    } catch (error) {
      console.error("Delete Error:", error);
      
      if (error.response?.status === 401) {
        showToast('Session expired. Please login again.', 'error');
        handleLogout();
      } else {
        showToast(error.response?.data?.error || 'Failed to delete expense', 'error');
      }
    } finally {
      setDeletingId(null);
    }
  };

  const updateExpenseStatus = async (id, status) => {
    if (!checkAuth()) {
      showToast('Please login to update status', 'error');
      return;
    }
    
    try {
      const expense = expenses.find(e => e.id === id);
      if (!expense) return;

      const updatedExpense = { 
        ...expense, 
        status,
        category: expense.category?.id || expense.category,
        payment_method: expense.payment_method?.id || expense.payment_method
      };
      
      const response = await api.put(`/api/expenses/${id}/`, updatedExpense);
      const data = response.data.data || response.data;
      setExpenses(expenses.map(e => e.id === id ? data : e));
      setActiveDropdown(null);
      showToast(`Expense ${status} successfully`, 'success');
      fetchExpenses();
      
    } catch (error) {
      console.error("Status Update Error:", error);
      
      if (error.response?.status === 401) {
        showToast('Session expired. Please login again.', 'error');
        handleLogout();
      } else {
        showToast('Failed to update status', 'error');
      }
    }
  };

  const handleEdit = (expense) => {
    const editData = {
      ...expense,
      category: expense.category?.id || expense.category || '',
      payment_method: expense.payment_method?.id || expense.payment_method || ''
    };
    setEditingExpense(editData);
    setIsEditMode(true);
    setShowModal(true);
  };

  const openModal = () => {
    if (!checkAuth()) {
      showToast('Please login to create expenses', 'error');
      return;
    }
    
    setNewExpense({
      title: "",
      category: "",
      amount: "",
      date: new Date().toISOString().split('T')[0],
      vendor: "",
      payment_method: "",
      description: ""
    });
    setIsEditMode(false);
    setEditingExpense(null);
    setShowModal(true);
  };

  const toggleDropdown = (id) => {
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  useEffect(() => {
    const handleClickOutside = () => {
      setActiveDropdown(null);
    };
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const getStatusBadge = (status) => {
    const styles = {
      approved: "bg-green-100 text-green-800 border-green-200",
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      cancelled: "bg-red-100 text-red-800 border-red-200"
    };
    return `px-3 py-1 rounded-full text-sm font-medium border ${styles[status] || styles.pending}`;
  };

  const getStatusIcon = (status) => {
    const icons = {
      approved: <FiCheckCircle className="text-green-600" />,
      pending: <FiClock className="text-yellow-600" />,
      cancelled: <FiAlertTriangle className="text-red-600" />
    };
    return icons[status] || icons.pending;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency', currency: 'KES', minimumFractionDigits: 0
    }).format(amount || 0);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <FiAlertCircle className="mx-auto text-yellow-500 text-5xl mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-4">Please login to view and manage expenses.</p>
          <button 
            onClick={() => window.location.href = '/Login'}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Toast show={toast.show} message={toast.message} type={toast.type} onClose={closeToast} />

      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <FiDollarSign className="text-blue-600" />
              Expense Management
            </h1>
            <p className="text-gray-600 mt-2">Track and manage all school expenditures</p>
          </div>
          <div className="flex items-center gap-4 mt-4 lg:mt-0">
            <button 
              onClick={fetchExpenses}
              disabled={loading}
              className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-colors"
            >
              <FiRefreshCw className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button 
              onClick={openModal}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors"
            >
              <FiPlus />
              New Expense
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Expenses</p>
                <p className="text-2xl font-bold text-gray-800">{formatCurrency(stats.totalExpenses)}</p>
                <p className="text-sm text-gray-500 mt-1">{expenses.length} records</p>
              </div>
              <FiDollarSign className="text-blue-500 text-2xl" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Approved</p>
                <p className="text-2xl font-bold text-gray-800">{formatCurrency(stats.approvedExpenses)}</p>
                <p className="text-sm text-green-600 mt-1">
                  {stats.monthlyBudget > 0 ? ((stats.approvedExpenses / stats.monthlyBudget) * 100).toFixed(1) : 0}% of budget
                </p>
              </div>
              <FiCheckCircle className="text-green-500 text-2xl" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-amber-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Pending</p>
                <p className="text-2xl font-bold text-gray-800">{formatCurrency(stats.pendingExpenses)}</p>
                <p className="text-sm text-amber-600 mt-1">{expenses.filter(e => e.status === "pending").length} requests</p>
              </div>
              <FiClock className="text-amber-500 text-2xl" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Cancelled</p>
                <p className="text-2xl font-bold text-gray-800">{formatCurrency(stats.cancelledExpenses)}</p>
                <p className="text-sm text-red-600 mt-1">{expenses.filter(e => e.status === "cancelled").length} cancelled</p>
              </div>
              <FiAlertTriangle className="text-red-500 text-2xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Modal for New/Edit Expense */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <FiPlus className="text-green-600" />
                {isEditMode ? 'Edit Expense' : 'Add New Expense'}
              </h2>
              <button 
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiX className="text-gray-500" />
              </button>
            </div>

            <form onSubmit={isEditMode ? handleUpdateExpense : handleCreateExpense} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Expense Title *</label>
                <input
                  type="text"
                  value={isEditMode ? editingExpense?.title || '' : newExpense.title}
                  onChange={(e) => {
                    if (isEditMode) {
                      setEditingExpense({...editingExpense, title: e.target.value});
                    } else {
                      setNewExpense({...newExpense, title: e.target.value});
                    }
                  }}
                  placeholder="e.g., Classroom Maintenance, Textbooks Purchase"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <select
                    value={isEditMode ? editingExpense?.category || '' : newExpense.category}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (isEditMode) {
                        setEditingExpense({...editingExpense, category: value});
                      } else {
                        setNewExpense({...newExpense, category: value});
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  >
                    <option value="">Select Category</option>
                    {expenseCategories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method *</label>
                  <select
                    value={isEditMode ? editingExpense?.payment_method || '' : newExpense.payment_method}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (isEditMode) {
                        setEditingExpense({...editingExpense, payment_method: value});
                      } else {
                        setNewExpense({...newExpense, payment_method: value});
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  >
                    <option value="">Select Method</option>
                    {paymentMethods.map(method => (
                      <option key={method.id} value={method.id}>
                        {method.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount (KES) *</label>
                  <input
                    type="number"
                    value={isEditMode ? editingExpense?.amount || '' : newExpense.amount}
                    onChange={(e) => {
                      if (isEditMode) {
                        setEditingExpense({...editingExpense, amount: parseFloat(e.target.value) || 0});
                      } else {
                        setNewExpense({...newExpense, amount: e.target.value});
                      }
                    }}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                  <input
                    type="date"
                    value={isEditMode ? editingExpense?.date || '' : newExpense.date}
                    onChange={(e) => {
                      if (isEditMode) {
                        setEditingExpense({...editingExpense, date: e.target.value});
                      } else {
                        setNewExpense({...newExpense, date: e.target.value});
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vendor *</label>
                <input
                  type="text"
                  value={isEditMode ? editingExpense?.vendor || '' : newExpense.vendor}
                  onChange={(e) => {
                    if (isEditMode) {
                      setEditingExpense({...editingExpense, vendor: e.target.value});
                    } else {
                      setNewExpense({...newExpense, vendor: e.target.value});
                    }
                  }}
                  placeholder="Vendor/Supplier name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={isEditMode ? editingExpense?.description || '' : newExpense.description}
                  onChange={(e) => {
                    if (isEditMode) {
                      setEditingExpense({...editingExpense, description: e.target.value});
                    } else {
                      setNewExpense({...newExpense, description: e.target.value});
                    }
                  }}
                  placeholder="Provide details about this expense..."
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={formLoading}
                  className="flex-1 bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-semibold disabled:opacity-50"
                >
                  {formLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <FiLoader className="animate-spin" />
                      {isEditMode ? 'Updating...' : 'Submitting...'}
                    </span>
                  ) : (
                    isEditMode ? 'Update Expense' : 'Submit Expense'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Quick Stats Sidebar */}
        <div className="xl:col-span-1">
          <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2 mb-6">
              <FiPieChart className="text-purple-600" />
              Expense Overview
            </h2>

            {/* Category Breakdown */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">By Category</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {Object.entries(stats.categoriesBreakdown)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 8)
                  .map(([category, amount]) => (
                    <div key={category} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                      <span className="text-sm text-gray-700">{category}</span>
                      <span className="font-semibold text-indigo-600">{formatCurrency(amount)}</span>
                    </div>
                  ))}
                {Object.keys(stats.categoriesBreakdown).length === 0 && (
                  <p className="text-gray-500 text-sm">No expenses recorded</p>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-3">
              <button 
                onClick={openModal}
                className="w-full bg-indigo-600 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors font-semibold"
              >
                <FiPlus />
                New Expense
              </button>
              
              {/* Download Report Button */}
              <div className="relative">
                <button 
                  onClick={downloadReport}
                  disabled={downloading || expenses.length === 0}
                  className={`w-full px-4 py-3 rounded-lg flex items-center justify-center gap-2 font-semibold transition-colors ${
                    downloading || expenses.length === 0
                      ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {downloading ? (
                    <>
                      <FiLoader className="animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FiDownload />
                      Download Report (CSV)
                    </>
                  )}
                </button>
                {expenses.length === 0 && (
                  <p className="text-xs text-gray-500 mt-1 text-center">No data to export</p>
                )}
              </div>

              {/* Download as JSON button */}
              <button 
                onClick={downloadJSONReport}
                disabled={downloading || expenses.length === 0}
                className={`w-full px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-sm transition-colors ${
                  downloading || expenses.length === 0
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                }`}
              >
                <FiFileText />
                Export as JSON
              </button>
            </div>
          </div>
        </div>

        {/* Expenses List */}
        <div className="xl:col-span-2">
          <div className="bg-white rounded-xl shadow-lg p-6">
            {/* Filters */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <FiPieChart className="text-blue-600" />
                Expense Records
                {filteredExpenses.length > 0 && (
                  <span className="text-sm font-normal text-gray-500">
                    ({filteredExpenses.length} of {expenses.length})
                  </span>
                )}
              </h2>
              
              <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search expenses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full sm:w-64"
                  />
                </div>
                
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">All Categories</option>
                  {expenseCategories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">All Status</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Date Range Filter */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="flex items-end">
                <button 
                  onClick={() => setDateRange({ start: "", end: "" })}
                  className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Clear Dates
                </button>
              </div>
            </div>

            {/* Expenses Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Expense Details</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Category</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Amount</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                        <FiLoader className="animate-spin mx-auto text-3xl mb-3" />
                        <p>Loading expenses...</p>
                      </td>
                    </tr>
                  ) : filteredExpenses.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                        <FiSearch className="mx-auto text-gray-400 text-3xl mb-3" />
                        <p>No expenses found matching your criteria</p>
                        <button 
                          onClick={fetchExpenses}
                          className="mt-2 text-indigo-600 hover:text-indigo-800"
                        >
                          Refresh list
                        </button>
                      </td>
                    </tr>
                  ) : (
                    filteredExpenses.map((expense) => (
                      <tr key={expense.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <div>
                            <p className="font-medium text-gray-800">{expense.title}</p>
                            <p className="text-sm text-gray-500">{expense.vendor}</p>
                            {expense.description && (
                              <p className="text-xs text-gray-400 mt-1">{expense.description}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                            {expense.category?.name || expense.category || 'Uncategorized'}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <p className="font-semibold text-gray-800">{formatCurrency(expense.amount)}</p>
                          <p className="text-sm text-gray-500">{expense.payment_method?.name || expense.payment_method}</p>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600">{expense.date}</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(expense.status)}
                            <span className={getStatusBadge(expense.status)}>
                              {expense.status ? expense.status.charAt(0).toUpperCase() + expense.status.slice(1) : 'Pending'}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 relative">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleEdit(expense)}
                              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="Edit Expense"
                            >
                              <FiEdit />
                            </button>
                            <div className="relative">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleDropdown(expense.id);
                                }}
                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              >
                                <FiMoreVertical />
                              </button>
                              
                              {activeDropdown === expense.id && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                                  <div className="py-1">
                                    <button
                                      onClick={() => updateExpenseStatus(expense.id, "pending")}
                                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                      <FiClock className="text-yellow-600" />
                                      Mark as Pending
                                    </button>
                                    <button
                                      onClick={() => updateExpenseStatus(expense.id, "approved")}
                                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                      <FiCheckCircle className="text-green-600" />
                                      Mark as Approved
                                    </button>
                                    <button
                                      onClick={() => updateExpenseStatus(expense.id, "cancelled")}
                                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                      <FiAlertTriangle className="text-red-600" />
                                      Mark as Cancelled
                                    </button>
                                    <hr className="my-1" />
                                    <button
                                      onClick={() => handleDelete(expense.id)}
                                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                      disabled={deletingId === expense.id}
                                    >
                                      {deletingId === expense.id ? (
                                        <FiLoader className="animate-spin" />
                                      ) : (
                                        <FiTrash2 />
                                      )}
                                      Delete Expense
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0%); opacity: 1; }
        }
        .animate-slide-in { animation: slide-in 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default ExpenseManagement;