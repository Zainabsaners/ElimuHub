/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { 
  FiPlus, 
  FiTrash2, 
  FiEdit, 
  FiDollarSign, 
  FiPieChart, 
  FiFilter, 
  FiSearch, 
  FiDownload,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiAlertTriangle,
  FiTrendingUp,
  FiTrendingDown,
  FiX,
  FiMoreVertical
} from "react-icons/fi";
import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const ExpenseManagement = () => {
  // State for expenses
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        'Authorization': token?.startsWith('Bearer ') ? token : `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
  };

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      // Note the /api/ prefix and trailing slash
      const response = await axios.get(`${API_BASE_URL}/api/expenses/`, getAuthHeaders());
      if (response.data.success) {
        setExpenses(response.data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch expenses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);
                                                                     

  // State for new expense form
  const [newExpense, setNewExpense] = useState({
    title: "",
    category: "",
    amount: "",
    date: new Date().toISOString().split('T')[0],
    vendor: "",
    payment_method: "",
    description: ""
  });

  // State for filters and search
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  // State for modal and dropdown
  const [showModal, setShowModal] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  // Statistics state
  const [stats, setStats] = useState({
    totalExpenses: 0,
    approvedExpenses: 0,
    pendingExpenses: 0,
    cancelledExpenses: 0,
    monthlyBudget: 500000,
    categoriesBreakdown: {}
  });

  // Categories
  const expenseCategories = [
    "Academic Supplies",
    "Utilities",
    "Sports & Activities",
    "Staff Development",
    "Building Maintenance",
    "Equipment Maintenance",
    "Grounds Maintenance",
    "Vehicle Maintenance",
    "Security Maintenance",
    "Salaries",
    "Rent",
    "Security",
    "Transport",
    "Food & Catering",
    "Technology",
    "Other"
  ];

  const paymentMethods = ["Cash", "Mobile Money", "Bank Transfer", "Cheque", "Credit Card"];

  // Calculate statistics
  useEffect(() => {
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const approvedExpenses = expenses
      .filter(expense => expense.status === "approved")
      .reduce((sum, expense) => sum + expense.amount, 0);
    const pendingExpenses = expenses
      .filter(expense => expense.status === "pending")
      .reduce((sum, expense) => sum + expense.amount, 0);
    const cancelledExpenses = expenses
      .filter(expense => expense.status === "cancelled")
      .reduce((sum, expense) => sum + expense.amount, 0);

    // Category breakdown
    const categoriesBreakdown = {};
    expenses.forEach(expense => {
      categoriesBreakdown[expense.category] = (categoriesBreakdown[expense.category] || 0) + expense.amount;
    });

    setStats({
      totalExpenses,
      approvedExpenses,
      pendingExpenses,
      cancelledExpenses,
      monthlyBudget: 500000,
      categoriesBreakdown
    });
  }, [expenses]);

  // Add new expense
  const addExpense = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const config = getAuthHeaders();
      const response = await axios.post(`${API_BASE_URL}/api/expenses/`, newExpense, config);

      if (response.data) {
        // Add the new expense from backend to the top of the list
        setExpenses([response.data, ...expenses]); 
        setShowModal(false);
        showToast("Expense submitted for approval", "success");
      }
    } catch (error) {
      console.error("Expense Save Error:", error.response?.data);
      alert("Error: " + JSON.stringify(error.response?.data));
    } finally {
      setLoading(false);
    }
  };

  // Update expense status
  const updateExpenseStatus = (id, status) => {
    setExpenses(expenses.map(expense => 
      expense.id === id ? { 
        ...expense, 
        status, 
        approvedBy: status === "approved" ? "Accountant" : "" 
      } : expense
    ));
    setActiveDropdown(null); // Close dropdown after status change
  };

  // Delete expense
  const deleteExpense = (id) => {
    setExpenses(expenses.filter(expense => expense.id !== id));
    setActiveDropdown(null); // Close dropdown after delete
  };

  // Filter expenses
  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || expense.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || expense.status === statusFilter;
    const matchesDate = (!dateRange.start || expense.date >= dateRange.start) &&
                       (!dateRange.end || expense.date <= dateRange.end);

    return matchesSearch && matchesCategory && matchesStatus && matchesDate;
  });

  // Get status badge style
  const getStatusBadge = (status) => {
    const styles = {
      approved: "bg-green-100 text-green-800 border-green-200",
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      cancelled: "bg-red-100 text-red-800 border-red-200"
    };
    return `px-3 py-1 rounded-full text-sm font-medium border ${styles[status]}`;
  };

  // Get status icon
  const getStatusIcon = (status) => {
    const icons = {
      approved: <FiCheckCircle className="text-green-600" />,
      pending: <FiClock className="text-yellow-600" />,
      cancelled: <FiAlertTriangle className="text-red-600" />
    };
    return icons[status];
  };

  // Open modal and reset form
  const openModal = () => {
    setNewExpense({
      title: "",
      category: "",
      amount: "",
      date: new Date().toISOString().split('T')[0],
      vendor: "",
      payment_method: "",
      description: ""
    });
    setShowModal(true);
  };

  // Toggle dropdown
  const toggleDropdown = (id) => {
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setActiveDropdown(null);
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
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
            <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-colors">
              <FiDownload />
              Export Report
            </button>
            <button 
              onClick={openModal}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
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
                <p className="text-2xl font-bold text-gray-800">Ksh {stats.totalExpenses.toLocaleString()}</p>
                <p className="text-sm text-gray-500 mt-1">This month</p>
              </div>
              <FiDollarSign className="text-blue-500 text-2xl" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Approved Expenses</p>
                <p className="text-2xl font-bold text-gray-800">Ksh {stats.approvedExpenses.toLocaleString()}</p>
                <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                  <FiTrendingDown />
                  {(stats.approvedExpenses / stats.monthlyBudget * 100).toFixed(1)}% of budget
                </p>
              </div>
              <FiCheckCircle className="text-green-500 text-2xl" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-amber-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Pending Approval</p>
                <p className="text-2xl font-bold text-gray-800">Ksh {stats.pendingExpenses.toLocaleString()}</p>
                <p className="text-sm text-amber-600 mt-1">{expenses.filter(e => e.status === "pending").length} requests</p>
              </div>
              <FiClock className="text-amber-500 text-2xl" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Cancelled Expenses</p>
                <p className="text-2xl font-bold text-gray-800">Ksh {stats.cancelledExpenses.toLocaleString()}</p>
                <p className="text-sm text-red-600 mt-1">{expenses.filter(e => e.status === "cancelled").length} cancelled</p>
              </div>
              <FiAlertTriangle className="text-red-500 text-2xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Modal for New Expense */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <FiPlus className="text-green-600" />
                Add New Expense
              </h2>
              <button 
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiX className="text-gray-500" />
              </button>
            </div>

            <form onSubmit={addExpense} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Expense Title *</label>
                <input
                  type="text"
                  value={newExpense.title}
                  onChange={(e) => setNewExpense({...newExpense, title: e.target.value})}
                  placeholder="e.g., Classroom Maintenance, Textbooks Purchase"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <select
                    value={newExpense.category}
                    onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select Category</option>
                    {expenseCategories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method *</label>
                  <select
                    value={newExpense.payment_method}
                    onChange={(e) => setNewExpense({...newExpense, payment_method: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select Method</option>
                    {paymentMethods.map(method => (
                      <option key={method} value={method}>{method}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount (Ksh) *</label>
                  <input
                    type="number"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                  <input
                    type="date"
                    value={newExpense.date}
                    onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vendor *</label>
                <input
                  type="text"
                  value={newExpense.vendor}
                  onChange={(e) => setNewExpense({...newExpense, vendor: e.target.value})}
                  placeholder="Vendor/Supplier name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                  placeholder="Provide details about this expense, maintenance work done, items purchased, etc."
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                >
                  Submit Expense Request
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

            {/* Maintenance Focus */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Maintenance Expenses</h3>
              <div className="space-y-2">
                {Object.entries(stats.categoriesBreakdown)
                  .filter(([category]) => category.includes('Maintenance'))
                  .map(([category, amount]) => (
                    <div key={category} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                      <span className="text-sm text-gray-700">{category}</span>
                      <span className="font-semibold text-blue-600">Ksh {amount.toLocaleString()}</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-3">
              <button 
                onClick={openModal}
                className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors font-semibold"
              >
                <FiPlus />
                New Maintenance Request
              </button>
              <button className="w-full bg-green-600 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-green-700 transition-colors font-semibold">
                <FiDownload />
                Download Maintenance Report
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
              </h2>
              
              <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search expenses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64"
                  />
                </div>
                
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Categories</option>
                  {expenseCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  {filteredExpenses.map((expense) => (
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
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          expense.category.includes('Maintenance') 
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {expense.category}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-semibold text-gray-800">Ksh {expense.amount.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">{expense.paymentMethod}</p>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">{expense.date}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(expense.status)}
                          <span className={getStatusBadge(expense.status)}>
                            {expense.status.charAt(0).toUpperCase() + expense.status.slice(1)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 relative">
                        <div className="flex items-center gap-2">
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
                            
                            {/* Status Dropdown Menu */}
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
                                    onClick={() => deleteExpense(expense.id)}
                                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                  >
                                    <FiTrash2 />
                                    Delete Expense
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredExpenses.length === 0 && (
                <div className="text-center py-8">
                  <FiSearch className="mx-auto text-gray-400 text-3xl mb-3" />
                  <p className="text-gray-500">No expenses found matching your criteria</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseManagement;