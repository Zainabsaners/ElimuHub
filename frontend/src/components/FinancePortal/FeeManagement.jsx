import React, { useState, useEffect, useMemo, useCallback } from "react";
import { 
  FiPlus, FiTrash2, FiEdit, FiBook, 
  FiLayers, FiSearch, 
  FiCreditCard, FiBarChart2,
  FiCheckCircle, FiXCircle, FiRefreshCw,
  FiX, FiLoader,
  FiAlertCircle, FiBell,
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
    success: 'bg-gradient-to-r from-green-500 to-emerald-500',
    error: 'bg-gradient-to-r from-red-500 to-rose-500',
    info: 'bg-gradient-to-r from-indigo-500 to-indigo-500',
    warning: 'bg-gradient-to-r from-yellow-500 to-amber-500'
  }[type] || 'bg-gradient-to-r from-indigo-500 to-indigo-500';

  const icon = {
    success: <FiCheckCircle className="text-white" size={20} />,
    error: <FiXCircle className="text-white" size={20} />,
    info: <FiBell className="text-white" size={20} />,
    warning: <FiAlertCircle className="text-white" size={20} />
  }[type] || <FiBell className="text-white" size={20} />;

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className={`${bgColor} text-white rounded-xl shadow-lg p-4 min-w-[300px] flex items-center gap-3`}>
        <div className="flex-shrink-0">{icon}</div>
        <div className="flex-grow"><p className="font-medium">{message}</p></div>
        <button onClick={onClose} className="flex-shrink-0 text-white hover:text-gray-200">
          <FiX size={18} />
        </button>
      </div>
    </div>
  );
});

// Category Form Component
const CategoryForm = React.memo(({ 
  isEditMode, editingItem, newCategory, onCategoryChange, 
  onSubmit, onCancel, loading
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
              value={formData.category_code || ''}
              onChange={(e) => onCategoryChange('category_code', e.target.value.toUpperCase())}
              placeholder="e.g., TUITION001"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.category_name || ''}
              onChange={(e) => onCategoryChange('category_name', e.target.value)}
              placeholder="e.g., Tuition Fee"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => onCategoryChange('description', e.target.value)}
            rows="2"
            placeholder="Brief description of this fee category..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
            <select
              value={formData.frequency || 'Termly'}
              onChange={(e) => onCategoryChange('frequency', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Termly">Termly</option>
              <option value="Monthly">Monthly</option>
              <option value="Annual">Annual</option>
              <option value="One-Time">One-Time</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">GL Account Code</label>
            <input
              type="text"
              value={formData.gl_account_code || ''}
              onChange={(e) => onCategoryChange('gl_account_code', e.target.value)}
              placeholder="e.g., 4101"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.is_mandatory !== undefined ? formData.is_mandatory : true}
              onChange={(e) => onCategoryChange('is_mandatory', e.target.checked)}
              className="mr-2 rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-700">Mandatory Fee</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.is_active !== undefined ? formData.is_active : true}
              onChange={(e) => onCategoryChange('is_active', e.target.checked)}
              className="mr-2 rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-700">Active</span>
          </label>
        </div>
      </div>
      
      <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
          Cancel
        </button>
        <button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50">
          {loading ? <span className="flex items-center gap-2"><FiLoader className="animate-spin" /> Saving...</span> : (isEditMode ? 'Update' : 'Create')}
        </button>
      </div>
    </form>
  );
});

// Structure Form Component
const StructureForm = React.memo(({ 
  isEditMode, editingItem, newStructure, onStructureChange,
  onSubmit, onCancel, loading, academicYears, classes, feeCategories 
}) => {
  const formData = isEditMode && editingItem ? editingItem : newStructure;
  
  // Validation before submit
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate amount is positive
    if (parseFloat(formData.amount || 0) <= 0) {
      // This will show toast via parent
      return false;
    }
    
    onSubmit(e);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year <span className="text-red-500">*</span></label>
            <select
              value={formData.academic_year || ''}
              onChange={(e) => onStructureChange('academic_year', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="">Select Year</option>
              {academicYears.map(year => <option key={year} value={year}>{year}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Term <span className="text-red-500">*</span></label>
            <select
              value={formData.term || 'Term 1'}
              onChange={(e) => onStructureChange('term', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="Term 1">Term 1</option>
              <option value="Term 2">Term 2</option>
              <option value="Term 3">Term 3</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Class <span className="text-red-500">*</span></label>
            <select
              value={formData.class_id || ''}
              onChange={(e) => onStructureChange('class_id', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="">Select Class</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>{cls.class_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fee Category <span className="text-red-500">*</span></label>
            <select
              value={formData.category || ''}
              onChange={(e) => onStructureChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="">Select Category</option>
              {feeCategories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.category_name}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (KES) <span className="text-red-500">*</span></label>
            <input
              type="number"
              value={formData.amount || ''}
              onChange={(e) => onStructureChange('amount', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              step="0.01"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Amount must be greater than zero</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date <span className="text-red-500">*</span></label>
            <input
              type="date"
              value={formData.due_date || ''}
              onChange={(e) => onStructureChange('due_date', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.is_active !== undefined ? formData.is_active : true}
              onChange={(e) => onStructureChange('is_active', e.target.checked)}
              className="mr-2 rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-700">Active</span>
          </label>
        </div>
      </div>
      
      <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
          Cancel
        </button>
        <button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50">
          {loading ? <span className="flex items-center gap-2"><FiLoader className="animate-spin" /> Saving...</span> : (isEditMode ? 'Update' : 'Create')}
        </button>
      </div>
    </form>
  );
});

// Modal Component
const Modal = React.memo(({ show, onClose, title, children }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-1 rounded-full">
            <FiX size={20} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
});

// Stat Card Component
const StatCard = ({ title, value, subValue, icon, color }) => {
  const Icon = icon;
  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
          {subValue && <p className="text-xs mt-2 text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full inline-block">{subValue}</p>}
        </div>
        <div className={`p-3 rounded-xl ${color} shadow-sm`}>
          <Icon className="text-white text-2xl" />
        </div>
      </div>
    </div>
  );
};

// Main Component
const FeeManagement = () => {
  const [feeCategories, setFeeCategories] = useState([]);
  const [feeStructures, setFeeStructures] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [classes, setClasses] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showStructureModal, setShowStructureModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "info" });
  const [filters, setFilters] = useState({ academic_year: "", term: "", class_id: "" });
  const [statistics, setStatistics] = useState({
    categories: { total: 0, active: 0 },
    structures: { total: 0, active: 0, total_amount: 0 },
    transactions: { total_transactions: 0, completed_transactions: 0, total_collected: 0, collection_rate: 0 }
  });

  // New Category Form State
  const [newCategory, setNewCategory] = useState({
    category_code: "", category_name: "", description: "",
    frequency: "Termly", is_mandatory: true, is_active: true, gl_account_code: ""
  });

  // New Structure Form State
  const [newStructure, setNewStructure] = useState({
    academic_year: "", term: "Term 1", class_id: "", category: "",
    amount: "", due_date: "", late_fee_percentage: 5, late_fee_after_days: 15,
    installment_allowed: false, max_installments: 1, discount_allowed: false,
    max_discount_percentage: 0, is_active: true
  });

  const availableTerms = ["Term 1", "Term 2", "Term 3"];

  const showToast = useCallback((message, type = "info") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "info" }), 3000);
  }, []);

  const closeToast = useCallback(() => {
    setToast({ show: false, message: "", type: "info" });
  }, []);

  // Fetch all data
  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      
      const [dashRes, catRes, structRes, transRes, classRes, yearRes] = await Promise.all([
        api.get('/api/fees/dashboard/'),
        api.get('/api/fees/categories/'),
        api.get('/api/fees/structures/'),
        api.get('/api/fees/transactions/?limit=100'),
        api.get('/api/classes/'),
        api.get('/api/fees/structures/academic-years/')
      ]);

      const rawCat = catRes.data.results || catRes.data.data || catRes.data;
      setFeeCategories(Array.isArray(rawCat) ? rawCat : []);

      const rawStruct = structRes.data.results || structRes.data.data || structRes.data;
      setFeeStructures(Array.isArray(rawStruct) ? rawStruct : []);

      const rawTrans = transRes.data.results || transRes.data.data || transRes.data;
      setTransactions(Array.isArray(rawTrans) ? rawTrans : []);

      setClasses(classRes.data.data || []);
      setAcademicYears(yearRes.data.data || []);

      if (dashRes.data.success || dashRes.data.data) {
        const stats = dashRes.data.data || dashRes.data;
        setStatistics({
          categories: stats.categories || { total: 0, active: 0 },
          structures: stats.structures || { total: 0, active: 0, total_amount: 0 },
          transactions: stats.transactions || { total_transactions: 0, completed_transactions: 0, total_collected: 0, collection_rate: 0 }
        });
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      showToast('Failed to load data. Please refresh.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // CRUD: Create Category
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      const response = await api.post('/api/fees/categories/', newCategory);
      
      if (response.data.success || response.status === 201) {
        const newCat = response.data.data || response.data;
        setFeeCategories([newCat, ...feeCategories]);
        setNewCategory({ category_code: "", category_name: "", description: "", frequency: "Termly", is_mandatory: true, is_active: true, gl_account_code: "" });
        setShowCategoryModal(false);
        showToast('Category created successfully!', 'success');
        await fetchAllData();
      }
    } catch (error) {
      console.error('Error creating category:', error);
      showToast(error.response?.data?.error || 'Failed to create category', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  // CRUD: Update Category
  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    if (!editingItem) return;
    try {
      setFormLoading(true);
      const response = await api.put(`/api/fees/categories/${editingItem.id}/`, editingItem);
      
      if (response.data.success) {
        setFeeCategories(feeCategories.map(c => c.id === editingItem.id ? (response.data.data || response.data) : c));
        setShowCategoryModal(false);
        setEditingItem(null);
        setIsEditMode(false);
        showToast('Category updated successfully!', 'success');
        await fetchAllData();
      }
    } catch (error) {
      console.error('Error updating category:', error);
      showToast(error.response?.data?.error || 'Failed to update category', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  // CRUD: Create Structure with validation
  const handleCreateStructure = async (e) => {
    e.preventDefault();
    
    // Validate amount
    if (parseFloat(newStructure.amount || 0) <= 0) {
      showToast('Amount must be greater than zero', 'error');
      return;
    }
    
    try {
      setFormLoading(true);
      const response = await api.post('/api/fees/structures/', newStructure);
      
      if (response.data.success || response.status === 201) {
        const newStruct = response.data.data || response.data;
        setFeeStructures([newStruct, ...feeStructures]);
        setNewStructure({ academic_year: "", term: "Term 1", class_id: "", category: "", amount: "", due_date: "", late_fee_percentage: 5, late_fee_after_days: 15, installment_allowed: false, max_installments: 1, discount_allowed: false, max_discount_percentage: 0, is_active: true });
        setShowStructureModal(false);
        showToast('Fee structure created successfully!', 'success');
        await fetchAllData();
      }
    } catch (error) {
      console.error('Error creating structure:', error);
      showToast(error.response?.data?.error || 'Failed to create structure', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  // CRUD: Update Structure with validation
  const handleUpdateStructure = async (e) => {
    e.preventDefault();
    if (!editingItem) return;
    
    // Validate amount
    if (parseFloat(editingItem.amount || 0) <= 0) {
      showToast('Amount must be greater than zero', 'error');
      return;
    }
    
    try {
      setFormLoading(true);
      const response = await api.put(`/api/fees/structures/${editingItem.id}/`, editingItem);
      
      if (response.data.success) {
        setFeeStructures(feeStructures.map(s => s.id === editingItem.id ? (response.data.data || response.data) : s));
        setShowStructureModal(false);
        setEditingItem(null);
        setIsEditMode(false);
        showToast('Fee structure updated successfully!', 'success');
        await fetchAllData();
      }
    } catch (error) {
      console.error('Error updating structure:', error);
      showToast(error.response?.data?.error || 'Failed to update structure', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  // CRUD: Delete with loading state
  const handleDelete = async (type, id) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}? This action cannot be undone.`)) return;
    
    setDeletingId(id);
    try {
      const endpoint = type === 'category' 
        ? `/api/fees/categories/${id}/` 
        : `/api/fees/structures/${id}/`;
      await api.delete(endpoint);
      
      if (type === 'category') {
        setFeeCategories(feeCategories.filter(c => c.id !== id));
      } else {
        setFeeStructures(feeStructures.filter(s => s.id !== id));
      }
      showToast(`${type} deleted successfully!`, 'success');
      await fetchAllData();
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
      showToast(error.response?.data?.error || `Failed to delete ${type}`, 'error');
    } finally {
      setDeletingId(null);
    }
  };

  // Edit handlers
  const handleEditCategory = (category) => {
    setEditingItem({...category});
    setIsEditMode(true);
    setShowCategoryModal(true);
  };

  const handleEditStructure = (structure) => {
    setEditingItem({...structure});
    setIsEditMode(true);
    setShowStructureModal(true);
  };

  // Filtered data
  const getFilteredStructures = useMemo(() => {
    return feeStructures.filter(s => {
      const matchesSearch = !searchTerm || 
        s.category_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.class_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.academic_year?.includes(searchTerm);
      const matchesYear = !filters.academic_year || s.academic_year === filters.academic_year;
      const matchesTerm = !filters.term || s.term === filters.term;
      const matchesClass = !filters.class_id || s.class_id == filters.class_id;
      return matchesSearch && matchesYear && matchesTerm && matchesClass;
    });
  }, [feeStructures, searchTerm, filters]);

  const getFilteredCategories = useMemo(() => {
    return feeCategories.filter(c => 
      !searchTerm || 
      c.category_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.category_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [feeCategories, searchTerm]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency', currency: 'KES', minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const getStatusBadge = (isActive) => {
    return isActive 
      ? 'bg-green-100 text-green-800 border border-green-200' 
      : 'bg-red-100 text-red-800 border border-red-200';
  };

  return (
    <div className="p-4 bg-gradient-to-br from-gray-50 to-indigo-50 min-h-screen">
      <Toast show={toast.show} message={toast.message} type={toast.type} onClose={closeToast} />
      
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Fee Management System</h1>
            <p className="text-gray-600 mt-1">Manage fee categories, structures, and transactions</p>
          </div>
          <button onClick={fetchAllData} className="px-4 py-2 bg-white text-gray-700 rounded-lg flex items-center gap-2 hover:bg-gray-50 border border-gray-200 shadow-sm">
            <FiRefreshCw className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatCard
            title="Fee Categories"
            value={statistics.categories.total || 0}
            subValue={`${statistics.categories.active || 0} active`}
            icon={FiBook}
            color="bg-gradient-to-r from-blue-500 to-cyan-500"
          />
          <StatCard
            title="Fee Structures"
            value={statistics.structures.total || 0}
            subValue={formatCurrency(statistics.structures.total_amount || 0)}
            icon={FiLayers}
            color="bg-gradient-to-r from-purple-500 to-pink-500"
          />
          <StatCard
            title="Transactions"
            value={statistics.transactions.total_transactions || 0}
            subValue={`${statistics.transactions.completed_transactions || 0} completed`}
            icon={FiCreditCard}
            color="bg-gradient-to-r from-green-500 to-emerald-500"
          />
          <StatCard
            title="Collection Rate"
            value={`${statistics.transactions.collection_rate || 0}%`}
            subValue={formatCurrency(statistics.transactions.total_collected || 0)}
            icon={FiBarChart2}
            color="bg-gradient-to-r from-orange-500 to-amber-500"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5 mb-8">
          <div className="flex flex-wrap gap-3">
            <button onClick={() => { setShowCategoryModal(true); setIsEditMode(false); setEditingItem(null); }} 
              className="px-4 py-3 bg-indigo-50 text-indigo-700 rounded-lg flex items-center gap-2 hover:bg-indigo-100 border border-indigo-200">
              <FiPlus /> New Category
            </button>
            <button onClick={() => { setShowStructureModal(true); setIsEditMode(false); setEditingItem(null); }} 
              className="px-4 py-3 bg-purple-50 text-purple-700 rounded-lg flex items-center gap-2 hover:bg-purple-100 border border-purple-200">
              <FiPlus /> New Structure
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2 mb-6">
          <nav className="flex space-x-1">
            {['dashboard', 'categories', 'structures', 'transactions'].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 text-sm font-medium capitalize rounded-lg transition-all ${
                  activeTab === tab ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'
                }`}>
                {tab === 'dashboard' ? 'Dashboard' : 
                 tab === 'categories' ? 'Categories' :
                 tab === 'structures' ? 'Structures' : 'Transactions'}
              </button>
            ))}
          </nav>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50" />
            </div>
            <select className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm bg-gray-50"
              value={filters.academic_year} onChange={(e) => setFilters({...filters, academic_year: e.target.value})}>
              <option value="">All Years</option>
              {academicYears.map(year => <option key={year} value={year}>{year}</option>)}
            </select>
            <select className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm bg-gray-50"
              value={filters.term} onChange={(e) => setFilters({...filters, term: e.target.value})}>
              <option value="">All Terms</option>
              {availableTerms.map(term => <option key={term} value={term}>{term}</option>)}
            </select>
            <select className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm bg-gray-50"
              value={filters.class_id} onChange={(e) => setFilters({...filters, class_id: e.target.value})}>
              <option value="">All Classes</option>
              {classes.map(cls => <option key={cls.id} value={cls.id}>{cls.class_name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-bold mb-4">Recent Fee Structures</h3>
                <div className="space-y-4">
                  {feeStructures.slice(0, 5).map(s => (
                    <div key={s.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between">
                        <div><p className="font-medium">{s.category_name}</p><p className="text-sm text-gray-600">{s.class_name}</p></div>
                        <div className="text-right"><p className="font-bold">{formatCurrency(s.amount)}</p>
                          <span className={`text-xs px-3 py-1 rounded-full ${getStatusBadge(s.is_active)}`}>
                            {s.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-4">Recent Transactions</h3>
                <div className="space-y-4">
                  {transactions.slice(0, 5).map(t => (
                    <div key={t.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between">
                        <div><p className="font-medium">{t.student_name || 'Student'}</p>
                          <p className="text-sm text-gray-600">{t.transaction_no}</p></div>
                        <div className="text-right"><p className="font-bold">{formatCurrency(t.amount_kes)}</p>
                          <span className={`text-xs px-3 py-1 rounded-full ${t.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {t.status || 'Pending'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Categories */}
        {activeTab === 'categories' && (
          <div>
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold">Fee Categories ({getFilteredCategories.length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Code</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Name</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Frequency</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredCategories.map(c => (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4"><code className="text-indigo-600 font-mono text-sm bg-indigo-50 px-3 py-1.5 rounded-lg">{c.category_code}</code></td>
                      <td className="px-6 py-4"><p className="font-medium">{c.category_name}</p></td>
                      <td className="px-6 py-4"><span className="text-sm font-medium px-3 py-1 bg-gray-100 rounded-full">{c.frequency}</span></td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${getStatusBadge(c.is_active)}`}>
                          {c.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleEditCategory(c)} 
                            className="text-indigo-600 hover:bg-indigo-50 p-2 rounded-lg border border-indigo-100"
                            disabled={deletingId === c.id}
                          >
                            <FiEdit size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete('category', c.id)} 
                            className="text-red-600 hover:bg-red-50 p-2 rounded-lg border border-red-100"
                            disabled={deletingId === c.id}
                          >
                            {deletingId === c.id ? <FiLoader className="animate-spin" size={16} /> : <FiTrash2 size={16} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Structures */}
        {activeTab === 'structures' && (
          <div>
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold">Fee Structures ({getFilteredStructures.length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Year</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Class</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Category</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Amount</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredStructures.map(s => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4"><p className="font-medium">{s.academic_year}</p><p className="text-xs text-gray-500">{s.term}</p></td>
                      <td className="px-6 py-4"><p className="font-medium">{s.class_name}</p></td>
                      <td className="px-6 py-4"><p className="font-medium">{s.category_name}</p></td>
                      <td className="px-6 py-4"><p className="font-bold">{formatCurrency(s.amount)}</p></td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${getStatusBadge(s.is_active)}`}>
                          {s.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleEditStructure(s)} 
                            className="text-indigo-600 hover:bg-indigo-50 p-2 rounded-lg border border-indigo-100"
                            disabled={deletingId === s.id}
                          >
                            <FiEdit size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete('structure', s.id)} 
                            className="text-red-600 hover:bg-red-50 p-2 rounded-lg border border-red-100"
                            disabled={deletingId === s.id}
                          >
                            {deletingId === s.id ? <FiLoader className="animate-spin" size={16} /> : <FiTrash2 size={16} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Transactions */}
        {activeTab === 'transactions' && (
          <div>
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold">Transactions ({transactions.length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Transaction No</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Student</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Amount</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(t => (
                    <tr key={t.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4"><p className="font-medium text-indigo-600">{t.transaction_no}</p></td>
                      <td className="px-6 py-4"><p className="font-medium">{t.student_name || 'Student'}</p></td>
                      <td className="px-6 py-4"><p className="font-bold">{formatCurrency(t.amount_kes)}</p></td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${t.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {t.status || 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4"><p className="text-sm">{formatDate(t.payment_date)}</p></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Category Modal */}
      <Modal show={showCategoryModal} onClose={() => { setShowCategoryModal(false); setIsEditMode(false); setEditingItem(null); }}
        title={isEditMode ? "Edit Fee Category" : "Create New Fee Category"}>
        <CategoryForm 
          isEditMode={isEditMode}
          editingItem={editingItem}
          newCategory={newCategory}
          onCategoryChange={(field, value) => isEditMode ? setEditingItem({...editingItem, [field]: value}) : setNewCategory({...newCategory, [field]: value})}
          onSubmit={isEditMode ? handleUpdateCategory : handleCreateCategory}
          onCancel={() => { setShowCategoryModal(false); setIsEditMode(false); setEditingItem(null); }}
          loading={formLoading}
          frequencies={["Termly", "Monthly", "Annual", "One-Time"]}
        />
      </Modal>

      {/* Structure Modal */}
      <Modal show={showStructureModal} onClose={() => { setShowStructureModal(false); setIsEditMode(false); setEditingItem(null); }}
        title={isEditMode ? "Edit Fee Structure" : "Create New Fee Structure"}>
        <StructureForm 
          isEditMode={isEditMode}
          editingItem={editingItem}
          newStructure={newStructure}
          onStructureChange={(field, value) => isEditMode ? setEditingItem({...editingItem, [field]: value}) : setNewStructure({...newStructure, [field]: value})}
          onSubmit={isEditMode ? handleUpdateStructure : handleCreateStructure}
          onCancel={() => { setShowStructureModal(false); setIsEditMode(false); setEditingItem(null); }}
          loading={formLoading}
          academicYears={academicYears}
          availableTerms={availableTerms}
          classes={classes}
          feeCategories={feeCategories}
        />
      </Modal>
      
      {/* Add custom CSS for animations */}
      <style>{`
        @keyframes slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in { animation: slide-in 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default FeeManagement;