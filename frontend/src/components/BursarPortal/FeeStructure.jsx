/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Search,
  Filter,
  Download,
  Printer,
  Edit2,
  Eye,
  PlusCircle,
  Trash2,
  RefreshCw,
  DollarSign,
  Building,
  Users,
  Calendar,
  TrendingUp,
  FileText,
  Bell,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  AlertCircle,
  MoreVertical
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            'Authorization': token?.startsWith('Bearer ') ? token : `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };
};

const FeeStructure = () => {
  // State management
  const [feeStructures, setFeeStructures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    academic_year: '',
    term: '',
    class_id: '',
    is_active: 'all'
  });
  
  // UI states
  const [selectedStructure, setSelectedStructure] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  const [expandedRows, setExpandedRows] = useState(new Set());
  
  // Filter options
  const [academicYears, setAcademicYears] = useState([]);
  const [classes, setClasses] = useState([]);
  const [terms] = useState(['Term 1', 'Term 2', 'Term 3', 'Term 4', 'Annual']);
  const [currentPeriod, setCurrentPeriod] = useState({ academic_year: 'Loading...', term: 'Loading...' });

  // Initialize
  useEffect(() => {
    const initializeDashboard = async () => {
    await fetchCurrentPeriod();
    fetchFeeStructures();
    fetchFilterOptions();
  };
  initializeDashboard();
}, []);
  
  const fetchCurrentPeriod = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/fees/current-period/`, getAuthHeaders());
      if (response.data.success) {
        setCurrentPeriod(response.data.data);
        // Automatically set filters to the current term
        setFilters(prev => ({
          ...prev,
          academic_year: response.data.data.academic_year,
          term: response.data.data.term
        }));
      }
    } catch (error) {
      console.error("Could not fetch current period:", error);
    }
  };

  // Fetch filter options
  const fetchFilterOptions = async () => {
    try {
      const headers = getAuthHeaders();
      
      // 1. Fetch academic years
      const yearsResponse = await axios.get(`${API_BASE_URL}/api/fees/structures/academic-years/`, headers);
      // Django returns this as a list in the 'data' field based on your views.py
      const yearsList = yearsResponse.data.data || yearsResponse.data || [];
      setAcademicYears(yearsList);
      
      // 2. Fetch classes - ADDED trailing slash to /api/classes/
      const classesResponse = await axios.get(`${API_BASE_URL}/api/classes/`, headers);
      
      // UNWRAP LOGIC: Check for .results (pagination) then .data (custom wrapper)
      const classData = classesResponse.data.results || classesResponse.data.data || classesResponse.data;
      setClasses(Array.isArray(classData) ? classData : []);
      
      console.log("Filter options loaded:", { years: yearsList, classes: classData });
    } catch (error) {
      console.error('Error fetching filter options:', error.response?.data || error.message);
    }
  };

  // Fetch fee structures
  const fetchFeeStructures = async () => {
  setLoading(true);
  try {
    // Add /api/fees/ and use getAuthHeaders()
    const response = await axios.get(`${API_BASE_URL}/api/fees/structures/`, getAuthHeaders());
    
    // Unwrap Django response (paginated results or direct data)
    const data = response.data.results || response.data.data || response.data;
    setFeeStructures(Array.isArray(data) ? data : []);
    setError(null);
  } catch (error) {
    console.error('Error fetching fee structures:', error);
    setError('Failed to load fee structures');
  } finally {
    setLoading(false);
   }
  };

  // Fetch structure details
  const fetchStructureDetails = async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/fees/structures/${id}/`, getAuthHeaders());
      setSelectedStructure(response.data.data);
      setShowDetailModal(true);
    } catch (error) {
      console.error('Error fetching structure details:', error);
      showNotification('error', 'Failed to load structure details');
    }
  };

  // Notification handler
  const showNotification = (type, message, duration = 5000) => {
    setNotification({ show: true, type, message });
    setTimeout(() => setNotification({ show: false, type: '', message: '' }), duration);
  };

  // Toggle row expansion
  const toggleRowExpansion = (id) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(id)) {
      newExpandedRows.delete(id);
    } else {
      newExpandedRows.add(id);
    }
    setExpandedRows(newExpandedRows);
  };

  // Apply filters
  const applyFilters = () => {
    fetchFeeStructures();
    setShowFilters(false);
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      academic_year: '',
      term: '',
      class_id: '',
      is_active: 'all'
    });
    fetchFeeStructures();
  };

  // Export data
  const exportData = (format) => {
    // Implement export functionality
    showNotification('info', `${format} export feature coming soon`);
  };

  // Calculate statistics
  const calculateStats = () => {
    const activeStructures = feeStructures.filter(s => s.is_active);
    const inactiveStructures = feeStructures.filter(s => !s.is_active);
    
    const totalAmount = feeStructures.reduce((sum, s) => sum + parseFloat(s.amount || 0), 0);
    const averageAmount = feeStructures.length > 0 ? totalAmount / feeStructures.length : 0;
    
    const uniqueClasses = [...new Set(feeStructures.map(s => s.class_name))].length;
    const uniqueCategories = [...new Set(feeStructures.map(s => s.category_name))].length;
    
    return {
      totalStructures: feeStructures.length,
      activeStructures: activeStructures.length,
      inactiveStructures: inactiveStructures.length,
      totalAmount,
      averageAmount,
      uniqueClasses,
      uniqueCategories,
      lastUpdated: new Date().toLocaleDateString()
    };
  };

  const stats = calculateStats();

  // Filter fee structures based on search
  const filteredStructures = feeStructures.filter(structure => {
    const searchLower = searchTerm.toLowerCase();
    return (
      structure.class_name?.toLowerCase().includes(searchLower) ||
      structure.category_name?.toLowerCase().includes(searchLower) ||
      structure.academic_year?.toLowerCase().includes(searchLower) ||
      structure.term?.toLowerCase().includes(searchLower)
    );
  });
  const generateInvoices = async () => {
  // Access the dynamic state we set from the current-period API
  const targetYear = currentPeriod.academic_year; 
  const targetTerm = currentPeriod.term;

  if (targetYear === 'Loading...' || targetYear === 'None') {
    showNotification('error', "No active academic term found for today's date.");
    return;
  }

  if (!window.confirm(`Bill students for ${targetTerm}, ${targetYear}?`)) return;
  
  setLoading(true);
  try {
    const response = await axios.post(`${API_BASE_URL}/api/fees/generate-invoices/`, {
        academic_year: targetYear, 
        term: targetTerm
    }, getAuthHeaders());
    
    // This should now return "Successfully generated 5 invoices"
    showNotification('success', response.data.message);
    fetchFeeStructures(); 
  } catch (error) {
    showNotification('error', "Invoicing failed. Verify student class assignments.");
  } finally {
    setLoading(false);
   }
  };

  // Render methods
  const renderNotification = () => (
    notification.show && (
      <div className={`fixed top-4 right-4 z-50 max-w-sm w-full animate-slide-in ${
        notification.type === 'error' ? 'bg-red-50 border-red-200' :
        notification.type === 'success' ? 'bg-green-50 border-green-200' :
        'bg-blue-50 border-blue-200'
      } border rounded-lg shadow-lg p-4 transition-all duration-300`}>
        <div className="flex items-start">
          <div className={`flex-shrink-0 ${
            notification.type === 'error' ? 'text-red-400' :
            notification.type === 'success' ? 'text-green-400' :
            'text-blue-400'
          }`}>
            {notification.type === 'error' ? (
              <AlertCircle className="w-5 h-5" />
            ) : notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <Bell className="w-5 h-5" />
            )}
          </div>
          <div className="ml-3 flex-1">
            <p className={`text-sm font-medium ${
              notification.type === 'error' ? 'text-red-800' :
              notification.type === 'success' ? 'text-green-800' :
              'text-blue-800'
            }`}>
              {notification.message}
            </p>
          </div>
          <button
            onClick={() => setNotification({ show: false, type: '', message: '' })}
            className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
      </div>
    )
  );

  const renderStatsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Structures */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600 mb-1">Total Structures</p>
            <p className="text-2xl font-bold text-gray-800">{stats.totalStructures}</p>
          </div>
          <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
        </div>
        <div className="mt-4 flex items-center text-sm">
          <div className="flex items-center text-green-600">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>{stats.activeStructures} active</span>
          </div>
          <div className="ml-4 text-gray-500">
            {stats.inactiveStructures} inactive
          </div>
        </div>
      </div>

      {/* Total Amount */}
      <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-green-600 mb-1">Total Amount</p>
            <p className="text-2xl font-bold text-gray-800">
              KSh {stats.totalAmount.toLocaleString()}
            </p>
          </div>
          <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          Avg: KSh {Math.round(stats.averageAmount).toLocaleString()}
        </div>
      </div>

      {/* Classes & Categories */}
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-purple-600 mb-1">Classes & Categories</p>
            <div className="flex items-center space-x-4">
              <div>
                <p className="text-xl font-bold text-gray-800">{stats.uniqueClasses}</p>
                <p className="text-xs text-gray-600">Classes</p>
              </div>
              <div>
                <p className="text-xl font-bold text-gray-800">{stats.uniqueCategories}</p>
                <p className="text-xs text-gray-600">Categories</p>
              </div>
            </div>
          </div>
          <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
            <Building className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      {/* Last Updated */}
      <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-orange-600 mb-1">System Status</p>
            <p className="text-lg font-bold text-gray-800">{stats.lastUpdated}</p>
            <p className="text-xs text-gray-600">Last Updated</p>
          </div>
          <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
            <Calendar className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderFilters = () => (
    <div className={`bg-white rounded-xl shadow-lg border border-gray-200 mb-6 transition-all duration-300 ${
      showFilters ? 'p-6' : 'p-0 border-0'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Filter Structures</h3>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Academic Year</label>
            <select
              value={filters.academic_year}
              onChange={(e) => setFilters({...filters, academic_year: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Years</option>
              {academicYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Term</label>
            <select
              value={filters.term}
              onChange={(e) => setFilters({...filters, term: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Terms</option>
              {terms.map(term => (
                <option key={term} value={term}>{term}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
            <select
              value={filters.class_id}
              onChange={(e) => setFilters({...filters, class_id: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Classes</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>{cls.class_name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filters.is_active}
              onChange={(e) => setFilters({...filters, is_active: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
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
              onClick={applyFilters}
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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by class, category, year, or term..."
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        
        
        <div className="flex items-center space-x-3">
          <button
            onClick={generateInvoices}
            disabled={loading}
            className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center shadow-md"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Bill All Students
          </button>
          <button
            onClick={fetchFeeStructures}
            disabled={loading}
            className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          
          <div className="relative">
            <button
              onClick={() => exportData('excel')}
              className="px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
          
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

  const renderFeeStructuresTable = () => {
    if (loading) {
      return (
        <div className="bg-white rounded-xl shadow-sm p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading fee structures...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="text-center text-red-600">
            <AlertCircle className="w-12 h-12 mx-auto mb-4" />
            <p className="text-lg font-semibold mb-2">{error}</p>
            <button
              onClick={fetchFeeStructures}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    if (filteredStructures.length === 0) {
      return (
        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="text-center text-gray-600">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-semibold mb-2">No fee structures found</p>
            <p className="text-gray-500">Try adjusting your filters or search criteria</p>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-800 to-gray-900">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                  Academic Year & Term
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                  Class & Category
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                  Fee Details
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                  Payment Terms
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
              {filteredStructures.map((structure) => (
                <React.Fragment key={structure.id}>
                  <tr className="hover:bg-blue-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                          <Calendar className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{structure.academic_year}</div>
                          <div className="text-sm text-gray-500">{structure.term}</div>
                          <div className="text-xs text-gray-400">
                            Due: {new Date(structure.due_date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{structure.class_name}</div>
                      <div className="text-sm text-gray-600">{structure.category_name}</div>
                      <div className="text-xs text-gray-500">{structure.category_code}</div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="text-lg font-bold text-green-600">
                        KSh {parseFloat(structure.amount).toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">
                        Frequency: {structure.frequency}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {structure.installment_allowed && (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            Installments: {structure.max_installments}
                          </span>
                        )}
                        {structure.discount_allowed && (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800 ml-2">
                            Discount: {structure.max_discount_percentage}%
                          </span>
                        )}
                        <div className="text-xs text-gray-500">
                          Late Fee: {structure.late_fee_percentage}% after {structure.late_fee_after_days} days
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        structure.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {structure.is_active ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => toggleRowExpansion(structure.id)}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title={expandedRows.has(structure.id) ? 'Collapse' : 'Expand'}
                        >
                          {expandedRows.has(structure.id) ? 
                            <ChevronUp className="w-4 h-4" /> : 
                            <ChevronDown className="w-4 h-4" />
                          }
                        </button>
                        
                        <button
                          onClick={() => fetchStructureDetails(structure.id)}
                          className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        <div className="relative">
                          <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                  
                  {/* Expanded row with additional details */}
                  {expandedRows.has(structure.id) && (
                    <tr className="bg-gray-50">
                      <td colSpan="6" className="px-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">Payment Information</h4>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">GL Account:</span>
                                <span className="font-medium">{structure.gl_account_code || 'Not set'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Mandatory:</span>
                                <span className={`font-medium ${structure.is_mandatory ? 'text-green-600' : 'text-yellow-600'}`}>
                                  {structure.is_mandatory ? 'Yes' : 'No'}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">Created By</h4>
                            <div className="space-y-1 text-sm">
                              <div className="text-gray-900">{structure.created_by_name || 'System'}</div>
                              <div className="text-gray-500 text-xs">
                                {new Date(structure.created_at).toLocaleString()}
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">Quick Actions</h4>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => exportData('structure')}
                                className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                              >
                                Export
                              </button>
                              <button
                                onClick={() => fetchStructureDetails(structure.id)}
                                className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                              >
                                View Full
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
            
            <tfoot className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <td colSpan="2" className="px-6 py-4">
                  <div className="font-semibold text-gray-900">
                    {filteredStructures.length} structure(s) found
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="text-sm text-gray-600">Total Amount:</div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="text-lg font-bold text-green-700">
                    KSh {filteredStructures.reduce((sum, s) => sum + parseFloat(s.amount || 0), 0).toLocaleString()}
                  </div>
                </td>
                <td colSpan="2" className="px-6 py-4">
                  <div className="text-sm text-gray-600 text-right">
                    Average: KSh {Math.round(filteredStructures.reduce((sum, s) => sum + parseFloat(s.amount || 0), 0) / filteredStructures.length).toLocaleString()}
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
    showDetailModal && selectedStructure && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Fee Structure Details</h3>
                <p className="text-gray-600">{selectedStructure.class_name} • {selectedStructure.category_name}</p>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Basic Information */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Academic Year:</span>
                    <span className="font-semibold">{selectedStructure.academic_year}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Term:</span>
                    <span className="font-semibold">{selectedStructure.term}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Class:</span>
                    <span className="font-semibold">{selectedStructure.class_name} ({selectedStructure.class_code})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-semibold">{selectedStructure.category_name}</span>
                  </div>
                </div>
              </div>

              {/* Financial Details */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Financial Details</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="text-xl font-bold text-green-600">
                      KSh {parseFloat(selectedStructure.amount).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Due Date:</span>
                    <span className="font-semibold">
                      {new Date(selectedStructure.due_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Frequency:</span>
                    <span className="font-semibold">{selectedStructure.frequency}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Terms */}
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Payment Terms</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-white rounded-lg">
                  <div className="text-sm text-gray-600 mb-2">Installment Allowed</div>
                  <div className={`text-lg font-semibold ${selectedStructure.installment_allowed ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedStructure.installment_allowed ? 'Yes' : 'No'}
                  </div>
                  {selectedStructure.installment_allowed && (
                    <div className="text-sm text-gray-500">
                      Max: {selectedStructure.max_installments} installments
                    </div>
                  )}
                </div>
                
                <div className="text-center p-4 bg-white rounded-lg">
                  <div className="text-sm text-gray-600 mb-2">Discount Allowed</div>
                  <div className={`text-lg font-semibold ${selectedStructure.discount_allowed ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedStructure.discount_allowed ? 'Yes' : 'No'}
                  </div>
                  {selectedStructure.discount_allowed && (
                    <div className="text-sm text-gray-500">
                      Max: {selectedStructure.max_discount_percentage}%
                    </div>
                  )}
                </div>
                
                <div className="text-center p-4 bg-white rounded-lg">
                  <div className="text-sm text-gray-600 mb-2">Late Fee Policy</div>
                  <div className="text-lg font-semibold text-orange-600">
                    {selectedStructure.late_fee_percentage}%
                  </div>
                  <div className="text-sm text-gray-500">
                    After {selectedStructure.late_fee_after_days} days
                  </div>
                </div>
              </div>
            </div>

            {/* Status & Audit */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Status & Audit Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center mb-3">
                    <span className="text-gray-600 mr-4">Status:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      selectedStructure.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedStructure.is_active ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div className="flex items-center mb-1">
                      <Calendar className="w-4 h-4 mr-2" />
                      Created: {new Date(selectedStructure.created_at).toLocaleString()}
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      Created by: {selectedStructure.created_by_name || 'System'}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h5 className="text-sm font-semibold text-gray-700 mb-2">Description</h5>
                  <p className="text-gray-600 text-sm">
                    {selectedStructure.description || 'No description provided.'}
                  </p>
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
                onClick={() => exportData('structure-detail')}
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

  const renderSidebarInfo = () => {
  // Define static fallback data for the demo until settings API is fully integrated
  const defaultChannels = [
    { id: 1, key: 'MPESA Paybill', value: '247247' },
    { id: 2, key: 'KCB Bank Acc', value: '1234567890' }
  ];

  return (
    <div className="lg:col-span-1 space-y-6">
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-lg p-6 text-white">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <DollarSign className="w-5 h-5 mr-2" />
          Payment Channels
        </h3>
        <div className="space-y-4">
          {defaultChannels.map(channel => (
            <div key={channel.id} className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <span className="font-bold text-white">{channel.key[0]}</span>
                </div>
                <div>
                  <p className="font-semibold">{channel.key}</p>
                  <p className="text-blue-100 text-sm">{channel.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Stats</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <span className="text-gray-700">Active Structures</span>
            <span className="font-bold text-blue-600">{stats.activeStructures}</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <span className="text-gray-700">Total Amount</span>
            <span className="font-bold text-green-600">
              KSh {Math.round(stats.totalAmount / 1000)}K
            </span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
            <span className="text-gray-700">Unique Classes</span>
            <span className="font-bold text-purple-600">{stats.uniqueClasses}</span>
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">System Information</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Last Sync:</span>
            <span className="font-medium">{new Date().toLocaleTimeString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Data Version:</span>
            <span className="font-medium">v1.2.3</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Next Review:</span>
            <span className="font-medium">Dec 2025</span>
          </div>
          <div className="pt-3 border-t border-gray-200">
            <button
              onClick={fetchFeeStructures}
              disabled={loading}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6 lg:p-8">
      {renderNotification()}
      {renderDetailModal()}

      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Fee Structure Management
              </h1>
              <p className="text-gray-600 text-lg">
                View and manage fee structures configured by the accounting department
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Current Term</p>
                    <p className="font-bold text-gray-800">
                      {currentPeriod.term !== 'Loading...' 
                        ? `${currentPeriod.term}, ${currentPeriod.academic_year}` 
                        : "Loading Period..."}</p>
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-6">
            {renderStatsCards()}
            {renderFilters()}
            {renderSearchBar()}
            {renderFeeStructuresTable()}
          </div>
          
          {renderSidebarInfo()}
        </div>
      </div>

      {/* Add CSS for animations */}
      <style >{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default FeeStructure;