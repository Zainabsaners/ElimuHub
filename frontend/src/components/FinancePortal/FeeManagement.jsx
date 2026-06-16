/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { 
  FiPlus, FiTrash2, FiEdit, FiDollarSign, FiBook, 
  FiLayers, FiSearch, FiDownload, FiFilter, 
  FiCreditCard, FiBarChart2, FiCalendar, FiPercent,
  FiCheckCircle, FiXCircle, FiFileText, FiRefreshCw,
  FiEye, FiPrinter, FiSave, FiX, FiUser, 
  FiTrendingUp, FiTrendingDown, FiDatabase, FiLoader,
  FiChevronDown, FiChevronUp, FiGrid, FiList, FiSettings,
  FiAlertCircle, FiBell, FiAward,
} from "react-icons/fi";
import axios from 'axios';

// Django API Base URL - Changed to Django port 8000
const API_BASE_URL = import.meta.env.VITE_API_URL || "https://*.onrender.com";

// FIXED: Create separate CategoryForm component
const CategoryForm = React.memo(({ 
  isEditMode, 
  editingItem, 
  newCategory, 
  onCategoryChange, 
  onStructureChange,
  frequencies,
  academicYears,
  availableTerms,
  classes,
  feeCategories,
  onSubmit,
  onCancel,
  loading,
  onStructureSubmit,
  isStructureEditMode,
  newStructure,
  structureLoading
}) => {
  const formData = isEditMode && editingItem ? editingItem : newCategory;
  
  return (
    <form onSubmit={onSubmit}>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.category_code}
              onChange={(e) => onCategoryChange('category_code', e.target.value)}
              placeholder="e.g., Tuit0001, lib0002"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Unique identifier</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.category_name}
              onChange={(e) => onCategoryChange('category_name', e.target.value)}
              placeholder="e.g., Tuition Fee"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => onCategoryChange('description', e.target.value)}
            rows="2"
            placeholder="Brief description of this fee category..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
            <select
              value={formData.frequency}
              onChange={(e) => onCategoryChange('frequency', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {frequencies.map(freq => (
                <option key={freq} value={freq}>{freq.replace('_', ' ')}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">GL Account Code</label>
            <input
              type="text"
              value={formData.gl_account_code}
              onChange={(e) => onCategoryChange('gl_account_code', e.target.value)}
              placeholder="e.g., 4101"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">For accounting integration</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.is_mandatory}
              onChange={(e) => onCategoryChange('is_mandatory', e.target.checked)}
              className="mr-2 rounded text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Mandatory Fee (All students must pay)</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => onCategoryChange('is_active', e.target.checked)}
              className="mr-2 rounded text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Active</span>
          </label>
        </div>
      </div>
      
      <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-md hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <FiLoader className="animate-spin" />
              Saving...
            </span>
          ) : isEditMode ? 'Update Category' : 'Create Category'}
        </button>
      </div>
    </form>
  );
});

// FIXED: Create separate StructureForm component
const StructureForm = React.memo(({ 
  isEditMode, 
  editingItem, 
  newStructure, 
  onCategoryChange, 
  onStructureChange,
  frequencies,
  academicYears,
  availableTerms,
  classes,
  feeCategories,
  onSubmit,
  onCancel,
  loading,
  onStructureSubmit,
  isStructureEditMode,
  structureLoading
}) => {
  const formData = isStructureEditMode && editingItem ? editingItem : newStructure;
  
  return (
    <form onSubmit={onStructureSubmit}>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Academic Year <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.academic_year}
              onChange={(e) => onStructureChange('academic_year', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select Year</option>
              {academicYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Term <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.term}
              onChange={(e) => onStructureChange('term', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select Term</option>
              {availableTerms.map(term => (
                <option key={term.value} value={term.value}>{term.label}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Class <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.class_id}
              onChange={(e) => onStructureChange('class_id', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select Class</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>
                  {cls.class_name} ({cls.class_code})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fee Category <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.category}
              onChange={(e) => onStructureChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select Category</option>
              {feeCategories/*.filter(c => c.is_active)*/.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.category_name} ({cat.category_code})
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount (KES) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => onStructureChange('amount', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              step="0.01"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Due Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.due_date}
              onChange={(e) => onStructureChange('due_date', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Late Fee Percentage</label>
            <div className="relative">
              <input
                type="number"
                value={formData.late_fee_percentage}
                onChange={(e) => onStructureChange('late_fee_percentage', parseFloat(e.target.value) || 0)}
                step="0.01"
                min="0"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-8"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Late Fee After (Days)</label>
            <input
              type="number"
              value={formData.late_fee_after_days}
              onChange={(e) => onStructureChange('late_fee_after_days', parseInt(e.target.value) || 0)}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.installment_allowed}
              onChange={(e) => onStructureChange('installment_allowed', e.target.checked)}
              className="mr-2 rounded text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Allow Installments</span>
          </label>
          
          {formData.installment_allowed && (
            <div className="ml-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Installments</label>
              <input
                type="number"
                value={formData.max_installments}
                onChange={(e) => onStructureChange('max_installments', parseInt(e.target.value) || 1)}
                min="1"
                max="12"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.discount_allowed}
              onChange={(e) => onStructureChange('discount_allowed', e.target.checked)}
              className="mr-2 rounded text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Allow Discounts</span>
          </label>
          
          {formData.discount_allowed && (
            <div className="ml-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Discount (%)</label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.max_discount_percentage}
                  onChange={(e) => onStructureChange('max_discount_percentage', parseFloat(e.target.value) || 0)}
                  step="0.01"
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-8"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
              </div>
            </div>
          )}
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => onStructureChange('is_active', e.target.checked)}
              className="mr-2 rounded text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Active</span>
          </label>
        </div>
      </div>
      
      <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={structureLoading}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-md hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow"
        >
          {structureLoading ? (
            <span className="flex items-center gap-2">
              <FiLoader className="animate-spin" />
              Saving...
            </span>
          ) : isStructureEditMode ? 'Update Structure' : 'Create Structure'}
        </button>
      </div>
    </form>
  );
});

// FIXED: Create separate Modal component
const Modal = React.memo(({ show, onClose, title, children }) => {
  if (!show) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-1 rounded-full transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
});

// Toast Notification Component (Instead of alert)
const Toast = React.memo(({ show, message, type, onClose }) => {
  if (!show) return null;

  const bgColor = {
    success: 'bg-gradient-to-r from-green-500 to-emerald-500',
    error: 'bg-gradient-to-r from-red-500 to-rose-500',
    info: 'bg-gradient-to-r from-blue-500 to-indigo-500',
    warning: 'bg-gradient-to-r from-yellow-500 to-amber-500'
  }[type] || 'bg-gradient-to-r from-blue-500 to-indigo-500';

  const icon = {
    success: <FiCheckCircle className="text-white" size={20} />,
    error: <FiXCircle className="text-white" size={20} />,
    info: <FiBell className="text-white" size={20} />,
    warning: <FiAlertCircle className="text-white" size={20} />
  }[type] || <FiBell className="text-white" size={20} />;

  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className={`${bgColor} text-white rounded-xl shadow-lg p-4 min-w-[300px] flex items-center gap-3`}>
        <div className="flex-shrink-0">
          {icon}
        </div>
        <div className="flex-grow">
          <p className="font-medium">{message}</p>
        </div>
        <button 
          onClick={onClose}
          className="flex-shrink-0 text-white hover:text-gray-200 transition-colors"
        >
          <FiX size={18} />
        </button>
      </div>
    </div>
  );
});

// Main component
const FeeManagement = () => {
  // State for data
  const [feeCategories, setFeeCategories] = useState([]);
  const [feeStructures, setFeeStructures] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [classes, setClasses] = useState([]);
  
  // Loading states
  const [loading, setLoading] = useState({
    categories: false,
    structures: false,
    transactions: false,
    statistics: false,
    classes: false,
    academicYears: false,
    form: false
  });

  // Form states
  const [newCategory, setNewCategory] = useState({
    category_code: "",
    category_name: "",
    description: "",
    frequency: "Termly",
    is_mandatory: true,
    is_active: true,
    gl_account_code: ""
  });

  const [newStructure, setNewStructure] = useState({
    academic_year: "",
    term: "Term 1",
    class_id: "",
    category: "",
    amount: "",
    due_date: "",
    late_fee_percentage: 5.00,
    late_fee_after_days: 15,
    installment_allowed: false,
    max_installments: 1,
    discount_allowed: false,
    max_discount_percentage: 0,
    is_active: true
  });

  // Edit states
  const [editingItem, setEditingItem] = useState(null);
  const [editMode, setEditMode] = useState({
    category: false,
    structure: false
  });

  // UI states
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState({
    category: false,
    structure: false
  });
  const [filters, setFilters] = useState({
    academic_year: "",
    term: "",
    class_id: "",
    status: "",
    payment_mode: ""
  });

  // Toast notification state
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "info" // success, error, info, warning
  });

  // Real data from database
  const [academicYears, setAcademicYears] = useState([]);
  const [availableTerms, setAvailableTerms] = useState([
    { value: "Term 1", label: "Term 1" },
    { value: "Term 2", label: "Term 2" },
    { value: "Term 3", label: "Term 3" },
    { value: "Semester 1", label: "Semester 1" },
    { value: "Semester 2", label: "Semester 2" },
    { value: "ANNUAL", label: "Annual" }
  ]);

  const [frequencies] = useState(["Termly", "Monthly", "Annual", "One-Time"]);

  // Statistics
  const [statistics, setStatistics] = useState({
    categories: { total: 0, active: 0 },
    structures: { total: 0, active: 0, total_amount: 0 },
    transactions: { 
      total: 0, 
      completed: 0, 
      pending: 0, 
      total_collected: 0 
    },
    collection_rate: 0
  });

  // Show toast notification (replaces window.alert)
  const showToast = useCallback((message, type = "info") => {
    setToast({
      show: true,
      message,
      type
    });
  }, []);

  // Close toast
  const closeToast = useCallback(() => {
    setToast({
      show: false,
      message: "",
      type: "info"
    });
  }, []);

  // FIXED: Optimized form handlers with useCallback
  const handleCategoryChange = useCallback((field, value) => {
    if (editMode.category && editingItem) {
      setEditingItem(prev => ({
        ...prev,
        [field]: field === 'category_code' ? value.toUpperCase() : value
      }));
    } else {
      setNewCategory(prev => ({
        ...prev,
        [field]: field === 'category_code' ? value.toUpperCase() : value
      }));
    }
  }, [editMode.category, editingItem]);

  const handleStructureChange = useCallback((field, value) => {
    if (editMode.structure && editingItem) {
      setEditingItem(prev => ({
        ...prev,
        [field]: value
      }));
    } else {
      setNewStructure(prev => ({
        ...prev,
        [field]: value
      }));
    }
  }, [editMode.structure, editingItem]);

  // Fetch classes from database
  const fetchClasses = async () => {
    try {
      setLoading(prev => ({ ...prev, classes: true }));
      const response = await axios.get(`${API_BASE_URL}/classes/`);
      
      if (response.data.success) {
        setClasses(response.data.data || []);
      } else {
        console.error('Failed to load classes:', response.data.message);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(prev => ({ ...prev, classes: false }));
    }
  };

  // Fetch academic years from database
  const fetchAcademicYears = async () => {
    try {
      setLoading(prev => ({ ...prev, academicYears: true }));
      const response = await axios.get(`${API_BASE_URL}/fees/structures/academic-years`);
      
      if (response.data.success) {
        setAcademicYears(response.data.data || []);
        
        if (response.data.data.length > 0 && !newStructure.academic_year) {
          setNewStructure(prev => ({
            ...prev,
            academic_year: response.data.data[0]
          }));
        } else if (response.data.data.length === 0) {
          const currentYear = new Date().getFullYear();
          const currentMonth = new Date().getMonth();
          const defaultYear = currentMonth >= 6 ? `${currentYear}-${currentYear + 1}` : `${currentYear - 1}-${currentYear}`;
          
          setAcademicYears([defaultYear]);
          setNewStructure(prev => ({
            ...prev,
            academic_year: defaultYear
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching academic years:', error);
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth();
      const defaultYear = currentMonth >= 6 ? `${currentYear}-${currentYear + 1}` : `${currentYear - 1}-${currentYear}`;
      
      setAcademicYears([defaultYear]);
      setNewStructure(prev => ({
        ...prev,
        academic_year: defaultYear
      }));
    } finally {
      setLoading(prev => ({ ...prev, academicYears: false }));
    }
  };

  const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  if (!token) return { headers: { 'Content-Type': 'application/json' } };
  return {
    headers: {
      'Authorization': token?.startsWith('Bearer ') ? token : `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
};

  // Fetch fee categories
 /* const fetchFeeCategories = async () => {
  try {
    setLoading(prev => ({ ...prev, categories: true }));
    const response = await axios.get(`${API_URL}/api/fees/categories/`, getAuthHeaders());
    
    // Safety check for the data structure
    const list = response.data.results || response.data.data || response.data;
    setFeeCategories(Array.isArray(list) ? list : []);
  } catch (error) {
    console.error('Error fetching fee categories:', error);
    showToast('Failed to load categories', 'error');
  } finally {
    setLoading(prev => ({ ...prev, categories: false }));
  }
};

  // Fetch fee structures
  const fetchFeeStructures = async () => {
    try {
      setLoading(prev => ({ ...prev, structures: true }));
      const response = await axios.get(`${API_BASE_URL}/fees/structures`);
      
      if (response.data.success) {
        setFeeStructures(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching fee structures:', error);
    } finally {
      setLoading(prev => ({ ...prev, structures: false }));
    }
  };

  // Fetch transactions
  const fetchTransactions = async () => {
    try {
      setLoading(prev => ({ ...prev, transactions: true }));
      const response = await axios.get(`${API_BASE_URL}/fees/transactions?limit=100`);
      
      if (response.data.success) {
        setTransactions(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(prev => ({ ...prev, transactions: false }));
    }
  };

  // Fetch statistics
  const fetchStatistics = async () => {
    try {
      setLoading(prev => ({ ...prev, statistics: true }));
      
      const [categoriesRes, structuresRes, transactionsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/fees/categories/stats`),
        axios.get(`${API_BASE_URL}/fees/structures/stats`),
        axios.get(`${API_BASE_URL}/fees/transactions/stats`)
      ]);

      setStatistics({
        categories: categoriesRes.data.success ? categoriesRes.data.data : { total: 0, active: 0 },
        structures: structuresRes.data.success ? structuresRes.data.data : { total: 0, active: 0, total_amount: 0 },
        transactions: transactionsRes.data.success ? transactionsRes.data.data : { 
          total: 0, completed: 0, pending: 0, total_collected: 0 
        },
        collection_rate: 0
      });

    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(prev => ({ ...prev, statistics: false }));
    }
  };*/

  const fetchAllData = async () => {
  try {
    setLoading({ categories: true, structures: true, transactions: true, statistics: true, classes: true, academicYears: true });
    const config = getAuthHeaders(); 

    // Note the plural /api/fees/... and the trailing slashes /
    const [dashRes, catRes, structRes, transRes, classRes, yearRes] = await Promise.all([
      axios.get(`${API_BASE_URL}/api/fees/dashboard/`, config),
      axios.get(`${API_BASE_URL}/api/fees/categories/`, config),
      axios.get(`${API_BASE_URL}/api/fees/structures/`, config),
      axios.get(`${API_BASE_URL}/api/fees/transactions/?limit=100`, config),
      axios.get(`${API_BASE_URL}/api/classes/`, config),
      axios.get(`${API_BASE_URL}/api/fees/structures/academic-years/`, config)
    ]);

    // Update Statistics
    if (dashRes.data.success) setStatistics(dashRes.data.data);
    
    // UNWRAP CATEGORIES: Django routers usually return { "results": [...] } or just the array [...]
    if (catRes.status === 200) {
        // This is the most robust unwrap for Django
        const rawCat = catRes.data.results || catRes.data.data || catRes.data;
        const finalArray = Array.isArray(rawCat) ? rawCat : (rawCat.results || []);
        setFeeCategories(finalArray);
        console.log("Categories fetched successfully:", finalArray.length);
    }
    
    // UNWRAP STRUCTURES
    if (structRes.status === 200) {
        const rawStruct = structRes.data.results || structRes.data.data || structRes.data;
        setFeeStructures(Array.isArray(rawStruct) ? rawStruct : []);
    }

    if (classRes.data.success) setClasses(classRes.data.data || []);
    if (yearRes.data.success) setAcademicYears(yearRes.data.data || []);

    showToast('Data synced with Render', 'success');
  } catch (error) {
    console.error('Detailed Sync Error:', error.response?.data || error.message);
    showToast('Server connection failed', 'error');
  } finally {
    setLoading({ categories: false, structures: false, transactions: false, statistics: false, classes: false, academicYears: false });
  }
};

  // Fetch all data
  /*const fetchAllData = async () => {
    try {
      await Promise.all([
        fetchFeeCategories(),
        fetchFeeStructures(),
        fetchTransactions(),
        fetchStatistics(),
        fetchClasses(),
        fetchAcademicYears()
      ]);
      
      showToast('Data refreshed successfully', 'success');
    } catch (error) {
      console.error('Error fetching all data:', error);
      showToast('Error refreshing data', 'error');
    }
  };*/

  // Initialize on component mount
  useEffect(() => {
    fetchAllData();
  }, []);

  // CRUD Operations for Categories
  const createCategory = async (e) => {
    e.preventDefault();
    try {
      setLoading(prev => ({ ...prev, form: true }));
      const response = await axios.post(`${API_BASE_URL}/api/fees/categories/`, newCategory, getAuthHeaders());
      
      if (response.data.success) {
        setFeeCategories([response.data.data, ...feeCategories]);
        setNewCategory({
          category_code: "",
          category_name: "",
          description: "",
          frequency: "TERM",
          is_mandatory: true,
          is_active: true,
          gl_account_code: ""
        });
        setShowForm({ ...showForm, category: false });
        showToast('Category created successfully', 'success');
      } else {
        showToast(response.data.message || 'Error creating category', 'error');
      }
    } catch (error) {
      console.error('Error creating category:', error);
      showToast(error.response?.data?.message || 'Error creating category', 'error');
    } finally {
      setLoading(prev => ({ ...prev, form: false }));
    }
  };

  const updateCategory = async (e) => {
    e.preventDefault();
    if (!editingItem) return;
    
    try {
      setLoading(prev => ({ ...prev, form: true }));
      const response = await axios.put(`${API_BASE_URL}/fees/categories/${editingItem.id}`, editingItem, getAuthHeaders());
      
      if (response.data.success) {
        setFeeCategories(feeCategories.map(item => 
          item.id === editingItem.id ? response.data.data : item
        ));
        setEditingItem(null);
        setEditMode({ ...editMode, category: false });
        setShowForm({ ...showForm, category: false });
        showToast('Category updated successfully', 'success');
      } else {
        showToast(response.data.message || 'Error updating category', 'error');
      }
    } catch (error) {
      console.error('Error updating category:', error);
      showToast(error.response?.data?.message || 'Error updating category', 'error');
    } finally {
      setLoading(prev => ({ ...prev, form: false }));
    }
  };

  const editCategory = (category) => {
    setEditingItem({...category});
    setEditMode({ ...editMode, category: true });
    setShowForm({ ...showForm, category: true });
  };

  // CRUD Operations for Structures
  const createStructure = async (e) => {
    e.preventDefault();
    try {
      setLoading(prev => ({ ...prev, form: true }));
      const response = await axios.post(`${API_BASE_URL}/api/fees/structures/`, newStructure, getAuthHeaders());
      
      if (response.data.success) {
        setFeeStructures([response.data.data, ...feeStructures]);
        
        fetchAcademicYears();
        
        setNewStructure({
          academic_year: academicYears[0] || "",
          term: "TERM_1",
          class_id: "",
          category: "",
          amount: "",
          due_date: "",
          late_fee_percentage: 5.00,
          late_fee_after_days: 15,
          installment_allowed: false,
          max_installments: 1,
          discount_allowed: false,
          max_discount_percentage: 0,
          is_active: true
        });
        
        setShowForm({ ...showForm, structure: false });
        showToast('Fee structure created successfully', 'success');
      } else {
        showToast(response.data.message || 'Error creating structure', 'error');
      }
    } catch (error) {
      console.error('Error creating structure:', error);
      showToast(error.response?.data?.message || 'Error creating structure', 'error');
    } finally {
      setLoading(prev => ({ ...prev, form: false }));
    }
  };

  const updateStructure = async (e) => {
    e.preventDefault();
    if (!editingItem) return;
    
    try {
      setLoading(prev => ({ ...prev, form: true }));
      const response = await axios.put(`${API_BASE_URL}/api/fees/structures/${editingItem.id}`, editingItem, getAuthHeaders());
      
      if (response.data.success) {
        setFeeStructures(feeStructures.map(item => 
          item.id === editingItem.id ? response.data.data : item
        ));
        setEditingItem(null);
        setEditMode({ ...editMode, structure: false });
        setShowForm({ ...showForm, structure: false });
        showToast('Fee structure updated successfully', 'success');
      } else {
        showToast(response.data.message || 'Error updating structure', 'error');
      }
    } catch (error) {
      console.error('Error updating structure:', error);
      showToast(error.response?.data?.message || 'Error updating structure', 'error');
    } finally {
      setLoading(prev => ({ ...prev, form: false }));
    }
  };

  const editStructure = (structure) => {
    setEditingItem({...structure});
    setEditMode({ ...editMode, structure: true });
    setShowForm({ ...showForm, structure: true });
  };

  const deleteItem = async (type, id) => {
  if (!window.confirm(`Are you sure?`)) return;

  try {
    const config = getAuthHeaders(); // <--- Add this!
    const endpoint = type === 'category' 
      ? `${API_BASE_URL}/api/fees/categories/${id}/`
      : `${API_BASE_URL}/api/fees/structures/${id}/`;
    
    const response = await axios.delete(endpoint, config); // <--- Pass config here
    
    if (response.status === 204 || response.data.success) {
      // update state...
      showToast("Deleted successfully", "success");
      fetchAllData(); // Refresh to be safe
    }
  } catch (error) {
    console.error("Delete error:", error.response?.data);
  }
};

  // FIXED: Use useMemo for filtered data
  const getFilteredStructures = useMemo(() => {
    return feeStructures.filter(structure => {
      const matchesSearch = searchTerm === "" || 
        structure.category_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        structure.class_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        structure.academic_year?.includes(searchTerm) ||
        structure.category_code?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesYear = !filters.academic_year || structure.academic_year === filters.academic_year;
      const matchesTerm = !filters.term || structure.term === filters.term;
      const matchesClass = !filters.class_id || structure.class_id== filters.class_id;

      return matchesSearch && matchesYear && matchesTerm && matchesClass;
    });
  }, [feeStructures, searchTerm, filters]);

  const getFilteredCategories = useMemo(() => {
    return feeCategories.filter(category => {
      return searchTerm === "" || 
        category.category_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.category_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description?.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [feeCategories, searchTerm]);

  // Helper functions
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPaymentMethodBadge = (method) => {
    const styles = {
      CASH: "bg-green-100 text-green-800 border border-green-200",
      MPESA: "bg-blue-100 text-blue-800 border border-blue-200",
      BANK_TRANSFER: "bg-purple-100 text-purple-800 border border-purple-200",
      CHEQUE: "bg-yellow-100 text-yellow-800 border border-yellow-200",
      CREDIT_CARD: "bg-red-100 text-red-800 border border-red-200",
      BANK_DEPOSIT: "bg-cyan-100 text-cyan-800 border border-cyan-200",
      OTHER: "bg-gray-100 text-gray-800 border border-gray-200"
    };
    return `px-2 py-1 rounded-full text-xs font-medium ${styles[method] || "bg-gray-100 text-gray-800 border border-gray-200"}`;
  };

  const handleQuickAction = (action) => {
    switch(action) {
      case 'add_category':
        setShowForm({ ...showForm, category: true });
        setActiveTab('categories');
        break;
      case 'add_structure':
        setShowForm({ ...showForm, structure: true });
        setActiveTab('structures');
        break;
      case 'refresh':
        fetchAllData();
        break;
      case 'export':
        showToast('Export feature coming soon', 'info');
        break;
      default:
        break;
    }
  };

  // Reset form when modal closes
  const resetForms = () => {
    setShowForm({ category: false, structure: false });
    setEditingItem(null);
    setEditMode({ category: false, structure: false });
    
    if (!editMode.category) {
      setNewCategory({
        category_code: "",
        category_name: "",
        description: "",
        frequency: "TERM",
        is_mandatory: true,
        is_active: true,
        gl_account_code: ""
      });
    }
    
    if (!editMode.structure) {
      setNewStructure({
        academic_year: academicYears[0] || "",
        term: "TERM_1",
        class_id: "",
        category: "",
        amount: "",
        due_date: "",
        late_fee_percentage: 5.00,
        late_fee_after_days: 15,
        installment_allowed: false,
        max_installments: 1,
        discount_allowed: false,
        max_discount_percentage: 0,
        is_active: true
      });
    }
  };

  // Dashboard Statistics Cards
  const StatCard = ({ title, value, subValue, icon: Icon, color, trend }) => {
    return (
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
            {subValue && (
              <p className={`text-xs mt-2 font-medium ${
                trend === 'up' ? 'text-green-600 bg-green-50 px-2 py-1 rounded-full inline-block' : 
                trend === 'down' ? 'text-red-600 bg-red-50 px-2 py-1 rounded-full inline-block' : 
                'text-blue-600 bg-blue-50 px-2 py-1 rounded-full inline-block'
              }`}>
                {subValue}
              </p>
            )}
          </div>
          <div className={`p-3 rounded-xl ${color} shadow-sm`}>
            <Icon className="text-white text-2xl" />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      {/* Toast Notification */}
      <Toast 
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={closeToast}
      />
      
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Fee Management System</h1>
            <p className="text-gray-600 mt-1">Accountant Portal - Manage fee categories and structures</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => handleQuickAction('refresh')}
              className="px-4 py-2 bg-white text-gray-700 rounded-lg flex items-center gap-2 hover:bg-gray-50 border border-gray-200 shadow-sm hover:shadow transition-all"
              disabled={loading.statistics}
            >
              <FiRefreshCw className={loading.statistics ? 'animate-spin' : ''} />
              Refresh Data
            </button>
          </div>
        </div>

        {/* Statistics Dashboard with beautiful colors */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatCard
            title="Fee Categories"
            value={statistics.categories.count}
            subValue={`${statistics.categories.active_count} active`}
            icon={FiBook}
            color="bg-gradient-to-r from-blue-500 to-cyan-500"
          />
          
          <StatCard
            title="Fee Structures Total"
            value={statistics.structures.total}
            subValue={formatCurrency(statistics.structures.total_amount)}
            icon={FiLayers}
            color="bg-gradient-to-r from-purple-500 to-pink-500"
          />
          
          <StatCard
            title="Total Transactions"
            value={statistics.transactions.total_transactions}
            subValue={`${statistics.transactions.completed_transactions} completed`}
            icon={FiCreditCard}
            color="bg-gradient-to-r from-green-500 to-emerald-500"
          />
          
          <StatCard
            title="Collection Rate"
            value={`${statistics.transactions.collection_rate}%`}
            subValue={`KES ${formatCurrency(statistics.transactions.total_collected)}`}
            icon={FiBarChart2}
            color="bg-gradient-to-r from-orange-500 to-amber-500"
          />
        </div>

        {/* Quick Actions - Beautiful card with gradient border */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5 mb-8 relative overflow-hidden">
          {/* Gradient border effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-xl"></div>
          
          <div className="relative">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className="text-lg font-bold text-gray-800">Quick Actions</h3>
                <p className="text-sm text-gray-500 mt-1">Common tasks for fee management</p>
              </div>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                Accountant
              </span>
            </div>
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={() => handleQuickAction('add_category')}
                className="px-4 py-3 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 rounded-lg flex items-center gap-2 hover:from-blue-100 hover:to-blue-200 border border-blue-200 shadow-sm hover:shadow transition-all hover:-translate-y-0.5"
              >
                <FiPlus className="text-blue-600" />
                <span className="font-medium">New Category</span>
              </button>
              <button 
                onClick={() => handleQuickAction('add_structure')}
                className="px-4 py-3 bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 rounded-lg flex items-center gap-2 hover:from-purple-100 hover:to-purple-200 border border-purple-200 shadow-sm hover:shadow transition-all hover:-translate-y-0.5"
              >
                <FiPlus className="text-purple-600" />
                <span className="font-medium">New Structure</span>
              </button>
              <button 
                onClick={() => setActiveTab('transactions')}
                className="px-4 py-3 bg-gradient-to-r from-green-50 to-green-100 text-green-700 rounded-lg flex items-center gap-2 hover:from-green-100 hover:to-green-200 border border-green-200 shadow-sm hover:shadow transition-all hover:-translate-y-0.5"
              >
                <FiEye className="text-green-600" />
                <span className="font-medium">View Transactions</span>
              </button>
              <button 
                onClick={() => handleQuickAction('export')}
                className="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 rounded-lg flex items-center gap-2 hover:from-gray-100 hover:to-gray-200 border border-gray-200 shadow-sm hover:shadow transition-all hover:-translate-y-0.5"
              >
                <FiDownload className="text-gray-600" />
                <span className="font-medium">Export Report</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabs Navigation - Modern design */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2 mb-6">
          <nav className="flex space-x-1">
            {['dashboard', 'categories', 'structures', 'transactions'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 text-sm font-medium capitalize rounded-lg transition-all ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {tab === 'dashboard' ? 'Dashboard' : 
                 tab === 'categories' ? 'Categories' :
                 tab === 'structures' ? 'Structures' : 'Transactions'}
              </button>
            ))}
          </nav>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, code, class..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <select 
                className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                value={filters.academic_year}
                onChange={(e) => setFilters({...filters, academic_year: e.target.value})}
              >
                <option value="">All Years</option>
                {academicYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              
              <select 
                className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                value={filters.term}
                onChange={(e) => setFilters({...filters, term: e.target.value})}
              >
                <option value="">All Terms</option>
                {availableTerms.map(term => (
                  <option key={term.value} value={term.value}>{term.label}</option>
                ))}
              </select>
              
              <select 
                className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                value={filters.class_id}
                onChange={(e) => setFilters({...filters, class_id: e.target.value})}
              >
                <option value="">All Classes</option>
                {classes.map(cls => (
                  <option key={cls.id} value={cls.id}>
                    {cls.class_name} ({cls.class_code})
                  </option>
                ))}
              </select>
              
              {activeTab === 'transactions' && (
                <select 
                  className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                >
                  <option value="">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="VERIFIED">Verified</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Structures */}
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-gray-800">Recent Fee Structures</h3>
                  <button 
                    onClick={() => setActiveTab('structures')}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View All →
                  </button>
                </div>
                <div className="space-y-4">
                  {feeStructures.slice(0, 5).map(structure => (
                    <div key={structure.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors group">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors">{structure.category_name}</p>
                          <p className="text-sm text-gray-600 mt-1">{structure.class_name} • {structure.academic_year}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-800 text-lg">{formatCurrency(structure.amount)}</p>
                          <span className={`text-xs px-3 py-1 rounded-full font-medium ${structure.is_active ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
                            {structure.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 flex justify-between items-center text-xs text-gray-500">
                        <span>Due: {formatDate(structure.due_date)}</span>
                        <span className="px-2 py-1 bg-gray-100 rounded">{structure.term.replace('_', ' ')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Transactions */}
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-gray-800">Recent Transactions</h3>
                  <button 
                    onClick={() => setActiveTab('transactions')}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View All →
                  </button>
                </div>
                <div className="space-y-4">
                  {transactions.slice(0, 5).map(transaction => (
                    <div key={transaction.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors group">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors">{transaction.admission_no}</p>
                          <p className="text-sm text-gray-600 mt-1">{transaction.first_name} {transaction.last_name}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-800 text-lg">{formatCurrency(transaction.amount_kes)}</p>
                          <span className={getPaymentMethodBadge(transaction.payment_mode)}>
                            {transaction.payment_mode}
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 flex justify-between items-center text-xs text-gray-500">
                        <span>{transaction.transaction_no}</span>
                        <span>{formatDate(transaction.payment_date)}</span>
                      </div>
                      <div className="mt-2">
                        <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                          transaction.status === 'COMPLETED' ? 'bg-green-100 text-green-800 border border-green-200' :
                          transaction.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                          transaction.status === 'VERIFIED' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                          'bg-red-100 text-red-800 border border-red-200'
                        }`}>
                          {transaction.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div>
            <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-lg font-bold text-gray-800">Fee Categories</h3>
                <p className="text-gray-600 text-sm mt-1">Manage all fee categories in the system</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleQuickAction('add_category')}
                  className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-sm flex items-center gap-2 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all"
                >
                  <FiPlus size={16} />
                  Add Category
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Code</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Frequency</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">GL Account</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {getFilteredCategories.map(category => (
                    <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <code className="text-blue-600 font-mono text-sm bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">{category.category_code}</code>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-800">{category.category_name}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600 max-w-xs truncate">{category.description || '-'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium px-3 py-1 bg-gray-100 rounded-full">{category.frequency}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${category.is_mandatory ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-green-100 text-green-800 border border-green-200'}`}>
                          {category.is_mandatory ? 'Mandatory' : 'Optional'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <code className="text-sm text-gray-600 font-mono bg-gray-50 px-2 py-1 rounded border border-gray-200">{category.gl_account_code || '-'}</code>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${category.is_active ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
                          {category.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => editCategory(category)}
                            className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors border border-blue-100"
                            title="Edit"
                          >
                            <FiEdit size={16} />
                          </button>
                          <button 
                            onClick={() => deleteItem('category', category.id)}
                            className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors border border-red-100"
                            title="Delete"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {getFilteredCategories.length === 0 && (
                <div className="text-center py-12">
                  <FiBook className="mx-auto text-gray-300 text-5xl mb-4" />
                  <p className="text-gray-500 text-lg font-medium">No fee categories found</p>
                  <p className="text-gray-400 text-sm mt-2">Start by creating your first fee category</p>
                  <button 
                    onClick={() => handleQuickAction('add_category')}
                    className="mt-4 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all"
                  >
                    <FiPlus className="inline mr-2" />
                    Create First Category
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Structures Tab */}
        {activeTab === 'structures' && (
          <div>
            <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-lg font-bold text-gray-800">Fee Structures</h3>
                <p className="text-gray-600 text-sm mt-1">Manage fee structures for academic years, classes, and categories</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleQuickAction('add_structure')}
                  className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-sm flex items-center gap-2 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all"
                >
                  <FiPlus size={16} />
                  Add Structure
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Academic Year</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Class</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Due Date</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Late Fee</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Installments</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {getFilteredStructures.map(structure => (
                    <tr key={structure.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-800">{structure.academic_year}</p>
                          <p className="text-xs text-gray-500 mt-1 px-2 py-1 bg-gray-100 rounded-full inline-block">{structure.term.replace('_', ' ')}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-800">{structure.class_name}</p>
                          <p className="text-xs text-gray-500">Level {structure.numeric_level}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-800">{structure.category_name}</p>
                          <p className="text-xs text-gray-500">{structure.category_code}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-800 text-lg">{formatCurrency(structure.amount)}</p>
                        <div className="flex gap-1 mt-2">
                          {structure.installment_allowed && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full border border-blue-200">Installments</span>
                          )}
                          {structure.discount_allowed && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full border border-green-200">Discounts</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-800 font-medium">{formatDate(structure.due_date)}</p>
                      </td>
                      <td className="px-6 py-4">
                        {structure.late_fee_percentage > 0 ? (
                          <div>
                            <p className="text-sm text-red-600 font-medium">{structure.late_fee_percentage}%</p>
                            <p className="text-xs text-gray-500">after {structure.late_fee_after_days} days</p>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-400">None</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {structure.installment_allowed ? (
                          <p className="text-sm font-medium">Max {structure.max_installments}</p>
                        ) : (
                          <p className="text-sm text-gray-400">Not allowed</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${structure.is_active ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
                          {structure.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => editStructure(structure)}
                            className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors border border-blue-100"
                            title="Edit"
                          >
                            <FiEdit size={16} />
                          </button>
                          <button 
                            onClick={() => deleteItem('structure', structure.id)}
                            className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors border border-red-100"
                            title="Delete"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {getFilteredStructures.length === 0 && (
                <div className="text-center py-12">
                  <FiLayers className="mx-auto text-gray-300 text-5xl mb-4" />
                  <p className="text-gray-500 text-lg font-medium">No fee structures found</p>
                  <p className="text-gray-400 text-sm mt-2">Create fee structures for different classes and categories</p>
                  <button 
                    onClick={() => handleQuickAction('add_structure')}
                    className="mt-4 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all"
                  >
                    <FiPlus className="inline mr-2" />
                    Create First Structure
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Transactions Tab (View Only) */}
        {activeTab === 'transactions' && (
          <div>
            <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-lg font-bold text-gray-800">Fee Transactions (View Only)</h3>
                <p className="text-gray-600 text-sm mt-1">Payments processed by bursar department</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                  Read Only
                </span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Transaction No</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Student</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Method</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Reference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {transactions.map(transaction => (
                    <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-medium text-blue-600">{transaction.transaction_no}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-800">{transaction.first_name} {transaction.last_name}</p>
                          <p className="text-xs text-gray-500 mt-1">{transaction.admission_no}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium">{formatDate(transaction.payment_date)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-800 text-lg">{formatCurrency(transaction.amount_kes)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={getPaymentMethodBadge(transaction.payment_mode)}>
                          {transaction.payment_mode}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                          transaction.status === 'COMPLETED' ? 'bg-green-100 text-green-800 border border-green-200' :
                          transaction.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                          transaction.status === 'VERIFIED' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                          'bg-red-100 text-red-800 border border-red-200'
                        }`}>
                          {transaction.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600 font-mono bg-gray-50 px-3 py-1.5 rounded border border-gray-200">{transaction.payment_reference || '-'}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {transactions.length === 0 && (
                <div className="text-center py-12">
                  <FiCreditCard className="mx-auto text-gray-300 text-5xl mb-4" />
                  <p className="text-gray-500 text-lg font-medium">No transactions found</p>
                  <p className="text-gray-400 text-sm mt-2">Transactions will appear here when payments are made</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Category Modal */}
      <Modal 
        show={showForm.category} 
        onClose={resetForms}
        title={editMode.category ? "Edit Fee Category" : "Create New Fee Category"}
      >
        <CategoryForm 
          isEditMode={editMode.category}
          editingItem={editingItem}
          newCategory={newCategory}
          onCategoryChange={handleCategoryChange}
          onStructureChange={handleStructureChange}
          frequencies={frequencies}
          academicYears={academicYears}
          availableTerms={availableTerms}
          classes={classes}
          feeCategories={feeCategories}
          onSubmit={editMode.category ? updateCategory : createCategory}
          onCancel={resetForms}
          loading={loading.form}
          onStructureSubmit={editMode.structure ? updateStructure : createStructure}
          isStructureEditMode={editMode.structure}
          newStructure={newStructure}
          structureLoading={loading.form}
        />
      </Modal>

      {/* Structure Modal */}
      <Modal 
        show={showForm.structure} 
        onClose={resetForms}
        title={editMode.structure ? "Edit Fee Structure" : "Create Fee Structure"}
      >
        <StructureForm 
          isEditMode={editMode.category}
          editingItem={editingItem}
          newCategory={newCategory}
          onCategoryChange={handleCategoryChange}
          onStructureChange={handleStructureChange}
          frequencies={frequencies}
          academicYears={academicYears}
          availableTerms={availableTerms}
          classes={classes}
          feeCategories={feeCategories}
          onSubmit={editMode.category ? updateCategory : createCategory}
          onCancel={resetForms}
          loading={loading.form}
          onStructureSubmit={editMode.structure ? updateStructure : createStructure}
          isStructureEditMode={editMode.structure}
          newStructure={newStructure}
          structureLoading={loading.form}
        />
      </Modal>

      {/* Add custom CSS for animations */}
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
      `}</style>
    </div>
  );
};

export default FeeManagement;