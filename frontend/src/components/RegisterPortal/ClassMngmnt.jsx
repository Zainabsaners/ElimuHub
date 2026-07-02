import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, RefreshCw, School, CheckCircle, Users, 
  BarChart3, AlertCircle, X, Loader2, Info,
  Edit2, Trash2, Eye
} from 'lucide-react';
import { classes, teachers } from '../../api';

// Custom notification component
const Notification = ({ type, message, onClose, duration = 5000 }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onClose?.(), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getStyles = () => {
    switch (type) {
      case 'success': return 'bg-green-50 border-green-200 text-green-800';
      case 'error': return 'bg-red-50 border-red-200 text-red-800';
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info': return 'bg-blue-50 border-blue-200 text-blue-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error': return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'warning': return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'info': return <Info className="h-5 w-5 text-blue-500" />;
      default: return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  if (!visible) return null;

  return (
    <div 
      className={`fixed top-4 right-4 z-50 max-w-md w-full md:w-auto animate-slide-in ${getStyles()} rounded-lg border p-4 shadow-lg`}
      style={{ animation: 'slideIn 0.3s ease-out' }}
    >
      <div className="flex items-start">
        {getIcon()}
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium">
            {type === 'success' ? 'Success' : type === 'error' ? 'Error' : type === 'warning' ? 'Warning' : 'Info'}
          </p>
          <p className="text-sm mt-1">{message}</p>
        </div>
        <button
          onClick={() => {
            setVisible(false);
            setTimeout(() => onClose?.(), 300);
          }}
          className="ml-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", cancelText = "Cancel", type = "warning" }) => {
  if (!isOpen) return null;

  const getButtonStyles = () => {
    switch (type) {
      case 'danger': return 'bg-red-600 hover:bg-red-700 focus:ring-red-500';
      case 'success': return 'bg-green-600 hover:bg-green-700 focus:ring-green-500';
      default: return 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <AlertCircle className={`h-6 w-6 ${type === 'danger' ? 'text-red-500' : type === 'success' ? 'text-green-500' : 'text-yellow-500'} mr-3`} />
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
          <p className="text-gray-600 mb-6">{message}</p>
          <div className="flex justify-end space-x-3">
            <button onClick={onClose} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`px-4 py-2 text-white rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${getButtonStyles()}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

function ClassManagement() {
  const [classesList, setClassesList] = useState([]);
  const [loading, setLoading] = useState({ classes: true, teachers: true, streams: true });
  const [notifications, setNotifications] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [teachersList, setTeachersList] = useState([]);
  const [streamsList, setStreamsList] = useState([]);
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    data: null,
    action: null
  });
  
  // Form state
  const [formData, setFormData] = useState({
    class_code: '',
    class_name: '',
    numeric_level: '',
    stream: '',
    capacity: 40,
    class_teacher_id: '',
    is_active: true
  });

  const [formErrors, setFormErrors] = useState({});

  const addNotification = useCallback((type, message) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, type, message }]);
  }, []);

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Fetch data using api.js
  const fetchData = useCallback(async () => {
    try {
      setLoading({ classes: true, teachers: true, streams: true });
      
      // Fetch classes
      const classesRes = await classes.getAll();
      const classData = classesRes.data.data || classesRes.data || [];
      setClassesList(classData);

      // Fetch streams
      const streamsRes = await classes.getStreams();
      const streamData = streamsRes.data.data || streamsRes.data || [];
      setStreamsList(streamData);

      // Fetch teachers
      const teachersRes = await teachers.getAll();
      const teacherData = teachersRes.data.data || teachersRes.data || [];
      setTeachersList(teacherData);

    } catch (error) {
      console.error('Fetch error:', error);
      addNotification('error', 'Error fetching data. Please check your connection.');
    } finally {
      setLoading({ classes: false, teachers: false, streams: false });
    }
  }, [addNotification]);

  useEffect(() => {
    fetchData();
  }, [fetchData, addNotification]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.class_code.trim()) {
      errors.class_code = 'Class code is required';
    } else if (classesList.some(c => c.class_code === formData.class_code)) {
      errors.class_code = 'Class code already exists';
    }
    
    if (!formData.class_name.trim()) {
      errors.class_name = 'Class name is required';
    }
    
    if (!formData.numeric_level) {
      errors.numeric_level = 'Numeric level is required';
    } else if (formData.numeric_level < 1 || formData.numeric_level > 12) {
      errors.numeric_level = 'Level must be between 1 and 12';
    }
    
    if (formData.capacity < 1 || formData.capacity > 100) {
      errors.capacity = 'Capacity must be between 1 and 100';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      addNotification('warning', 'Please fix the errors in the form');
      return;
    }

    try {
      const response = await classes.create(formData);
      
      if (response.data.success) {
        addNotification('success', `Class "${formData.class_name}" created successfully!`);
        await fetchData();
        resetForm();
        setShowCreateModal(false);
      } else {
        addNotification('error', response.data.error || 'Failed to create class');
      }
    } catch (error) {
      console.error('Create error:', error);
      addNotification('error', 'Failed to create class. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      class_code: '',
      class_name: '',
      numeric_level: '',
      stream: '',
      capacity: 40,
      class_teacher_id: '',
      is_active: true
    });
    setFormErrors({});
  };

  const openConfirmation = (action, data) => {
    setConfirmationModal({
      isOpen: true,
      action,
      data
    });
  };

  const handleToggleActive = async (classId) => {
    try {
      const cls = classesList.find(c => c.id === classId);
      const newStatus = !cls.is_active;
      
      const response = await classes.update(classId, { is_active: newStatus });

      if (response.data.success) {
        addNotification('success', `Class ${newStatus ? 'activated' : 'deactivated'} successfully!`);
        await fetchData();
      } else {
        addNotification('error', response.data.error || 'Failed to update class');
      }
    } catch (error) {
      console.error('Toggle error:', error);
      addNotification('error', 'Failed to update class. Please try again.');
    }
  };

  const handleDelete = async (classId) => {
    try {
      const response = await classes.delete(classId);

      if (response.data.success) {
        addNotification('success', 'Class deleted successfully!');
        await fetchData();
      } else {
        addNotification('error', response.data.error || 'Failed to delete class');
      }
    } catch (error) {
      console.error('Delete error:', error);
      addNotification('error', 'Failed to delete class. Please try again.');
    }
  };

  // Calculate statistics
  const getStatistics = () => {
    const totalClasses = classesList.length;
    const activeClasses = classesList.filter(c => c.is_active).length;
    const totalCapacity = classesList.reduce((sum, c) => sum + (c.capacity || 0), 0);
    const averageCapacity = totalClasses > 0 ? Math.round(totalCapacity / totalClasses) : 0;
    const totalStudents = classesList.reduce((sum, c) => sum + (c.current_students || 0), 0);

    return { totalClasses, activeClasses, totalCapacity, averageCapacity, totalStudents };
  };

  const stats = getStatistics();

  // Add animation style
  const animationStyle = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    .animate-slide-in { animation: slideIn 0.3s ease-out; }
  `;

  return (
    <div className="min-h-screen bg-gray-50">
      <style>{animationStyle}</style>
      
      {/* Notifications */}
      {notifications.map(notification => (
        <Notification
          key={notification.id}
          type={notification.type}
          message={notification.message}
          onClose={() => removeNotification(notification.id)}
        />
      ))}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={() => setConfirmationModal({ isOpen: false, data: null, action: null })}
        onConfirm={() => {
          if (confirmationModal.action === 'toggle') {
            handleToggleActive(confirmationModal.data.id);
          } else if (confirmationModal.action === 'delete') {
            handleDelete(confirmationModal.data.id);
          }
        }}
        title={
          confirmationModal.action === 'toggle' 
            ? `${confirmationModal.data?.is_active ? 'Deactivate' : 'Activate'} Class`
            : 'Delete Class'
        }
        message={
          confirmationModal.action === 'toggle'
            ? `Are you sure you want to ${confirmationModal.data?.is_active ? 'deactivate' : 'activate'} ${confirmationModal.data?.class_name}?`
            : `Are you sure you want to delete ${confirmationModal.data?.class_name}? This action cannot be undone.`
        }
        confirmText={confirmationModal.action === 'delete' ? 'Delete' : 'Confirm'}
        type={confirmationModal.action === 'delete' ? 'danger' : 'warning'}
      />

      <div className="p-4 md:p-6">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Class Management</h1>
              <p className="text-gray-600 mt-1 text-sm md:text-base">Create and manage classes for the academic year</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Class
              </button>
              <button
                onClick={fetchData}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center justify-center"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading.classes ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 md:mb-8">
          <div className="bg-white rounded-xl shadow border border-gray-200 p-4 md:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Classes</p>
                <p className="text-2xl md:text-3xl font-bold text-gray-800 mt-2">
                  {loading.classes ? '...' : stats.totalClasses}
                </p>
              </div>
              <div className="w-12 h-12 md:w-14 md:h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                <School className="h-6 w-6 md:h-7 md:w-7 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow border border-gray-200 p-4 md:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Active Classes</p>
                <p className="text-2xl md:text-3xl font-bold text-gray-800 mt-2">
                  {loading.classes ? '...' : stats.activeClasses}
                </p>
              </div>
              <div className="w-12 h-12 md:w-14 md:h-14 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="h-6 w-6 md:h-7 md:w-7 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow border border-gray-200 p-4 md:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Students</p>
                <p className="text-2xl md:text-3xl font-bold text-gray-800 mt-2">
                  {loading.classes ? '...' : stats.totalStudents}
                </p>
              </div>
              <div className="w-12 h-12 md:w-14 md:h-14 bg-amber-100 rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 md:h-7 md:w-7 text-amber-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow border border-gray-200 p-4 md:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Avg. Capacity</p>
                <p className="text-2xl md:text-3xl font-bold text-gray-800 mt-2">
                  {loading.classes ? '...' : stats.averageCapacity}
                </p>
              </div>
              <div className="w-12 h-12 md:w-14 md:h-14 bg-purple-100 rounded-xl flex items-center justify-center">
                <BarChart3 className="h-6 w-6 md:h-7 md:w-7 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
          <div className="px-4 md:px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-800">All Classes</h3>
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full self-start sm:self-auto">
                {loading.classes ? '...' : classesList.length} classes
              </span>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            {loading.classes ? (
              <div className="p-8 md:p-12 text-center">
                <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto" />
                <p className="mt-4 text-gray-600">Loading classes...</p>
              </div>
            ) : classesList.length === 0 ? (
              <div className="p-8 md:p-12 text-center">
                <School className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700">No classes found</h3>
                <p className="text-gray-500 mt-1 mb-4">Create your first class to get started</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create New Class
                </button>
              </div>
            ) : (
              <div className="block md:hidden">
                {/* Mobile view */}
                <div className="divide-y divide-gray-200">
                  {classesList.map(cls => (
                    <div key={cls.id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                            <School className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{cls.class_name}</h4>
                            <p className="text-sm text-gray-600">
                              {cls.class_code} • Level {cls.numeric_level}
                              {cls.stream && ` • ${cls.stream}`}
                            </p>
                          </div>
                        </div>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          cls.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          <span className={`w-2 h-2 rounded-full mr-1 ${
                            cls.is_active ? 'bg-green-500' : 'bg-red-500'
                          }`}></span>
                          {cls.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm">
                          <Users className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-gray-600">Capacity:</span>
                          <span className="font-medium ml-1">
                            {cls.current_students || 0}/{cls.capacity}
                          </span>
                        </div>
                        
                        <div className="flex items-center text-sm">
                          <Eye className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-gray-600">Teacher:</span>
                          <span className="font-medium ml-1">
                            {cls.class_teacher_name || 'Not assigned'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${Math.min(100, ((cls.current_students || 0) / cls.capacity) * 100)}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 text-center mb-4">
                        {Math.round(((cls.current_students || 0) / cls.capacity) * 100)}% filled
                      </p>
                      
                      <div className="flex justify-between space-x-2">
                        <button
                          onClick={() => openConfirmation('toggle', cls)}
                          className={`flex-1 px-3 py-1.5 rounded text-xs font-medium ${
                            cls.is_active
                              ? 'bg-red-50 text-red-700 hover:bg-red-100'
                              : 'bg-green-50 text-green-700 hover:bg-green-100'
                          }`}
                        >
                          {cls.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => openConfirmation('delete', cls)}
                          className="flex-1 px-3 py-1.5 bg-red-50 text-red-700 rounded text-xs font-medium hover:bg-red-100"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Desktop table view */}
            {!loading.classes && classesList.length > 0 && (
              <table className="hidden md:table min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class Details</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {classesList.map(cls => (
                    <tr key={cls.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                            <School className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{cls.class_name}</h4>
                            <div className="flex flex-wrap items-center mt-1 gap-1">
                              <span className="text-sm text-gray-600">Code: {cls.class_code}</span>
                              <span className="text-xs text-gray-400">•</span>
                              <span className="text-sm text-gray-600">Level: {cls.numeric_level}</span>
                              {cls.stream && (
                                <>
                                  <span className="text-xs text-gray-400">•</span>
                                  <span className="text-sm text-gray-600">Stream: {cls.stream}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {cls.class_teacher_name ? (
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-2">
                              <Users className="h-4 w-4 text-gray-500" />
                            </div>
                            <span className="text-sm text-gray-700 truncate max-w-[150px]">
                              {cls.class_teacher_name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">Not assigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="flex items-center">
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                              <div 
                                className="bg-green-600 h-2.5 rounded-full" 
                                style={{ width: `${Math.min(100, ((cls.current_students || 0) / cls.capacity) * 100)}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                              {cls.current_students || 0}/{cls.capacity}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {Math.round(((cls.current_students || 0) / cls.capacity) * 100)}% filled
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          cls.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          <span className={`w-2 h-2 rounded-full mr-2 ${
                            cls.is_active ? 'bg-green-500' : 'bg-red-500'
                          }`}></span>
                          {cls.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openConfirmation('toggle', cls)}
                            className={`px-3 py-1.5 rounded text-xs font-medium ${
                              cls.is_active
                                ? 'bg-red-50 text-red-700 hover:bg-red-100'
                                : 'bg-green-50 text-green-700 hover:bg-green-100'
                            }`}
                          >
                            {cls.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => openConfirmation('delete', cls)}
                            className="px-3 py-1.5 bg-red-50 text-red-700 rounded text-xs font-medium hover:bg-red-100"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Info Panel */}
        <div className="mt-6 p-4 md:p-6 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex items-start">
            <Info className="h-5 w-5 md:h-6 md:w-6 text-blue-500 mr-3 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Class Management Information</h4>
              <ul className="text-sm text-blue-700 space-y-1.5">
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 mr-2 shrink-0" />
                  Classes are used for student placement and timetable scheduling
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 mr-2 shrink-0" />
                  Each class requires a unique class code for identification
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 mr-2 shrink-0" />
                  Class teachers can be assigned to manage specific classes
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 mr-2 shrink-0" />
                  Deactivated classes won't appear in student enrollment options
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Create Class Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 md:p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="px-4 md:px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">Create New Class</h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="p-4 md:p-6 overflow-auto max-h-[70vh]">
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div className="bg-white rounded-lg p-4 md:p-5 border border-gray-200">
                    <h4 className="font-semibold text-gray-700 mb-4">Basic Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Class Code <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="class_code"
                          value={formData.class_code}
                          onChange={handleInputChange}
                          className={`w-full px-3 md:px-4 py-2 md:py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            formErrors.class_code ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="e.g., C-101, C-102"
                          required
                        />
                        {formErrors.class_code && (
                          <p className="text-red-500 text-xs mt-1">{formErrors.class_code}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">Unique identifier for the class</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Class Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="class_name"
                          value={formData.class_name}
                          onChange={handleInputChange}
                          className={`w-full px-3 md:px-4 py-2 md:py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            formErrors.class_name ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="e.g., Grade 1"
                          required
                        />
                        {formErrors.class_name && (
                          <p className="text-red-500 text-xs mt-1">{formErrors.class_name}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Numeric Level <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="numeric_level"
                          value={formData.numeric_level}
                          onChange={handleInputChange}
                          className={`w-full px-3 md:px-4 py-2 md:py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            formErrors.numeric_level ? 'border-red-300' : 'border-gray-300'
                          }`}
                          required
                        >
                          <option value="">Select Level</option>
                          {Array.from({length: 12}, (_, i) => i + 1).map(level => (
                            <option key={level} value={level}>Level {level}</option>
                          ))}
                        </select>
                        {formErrors.numeric_level && (
                          <p className="text-red-500 text-xs mt-1">{formErrors.numeric_level}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">Academic level (1-12)</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Stream
                        </label>
                        <select
                          name="stream"
                          value={formData.stream}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select Stream</option>
                          {streamsList.map((stream) => (
                            <option key={stream.id} value={stream.id}>
                              {stream.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Class Details */}
                  <div className="bg-white rounded-lg p-4 md:p-5 border border-gray-200">
                    <h4 className="font-semibold text-gray-700 mb-4">Class Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Class Capacity
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            name="capacity"
                            value={formData.capacity}
                            onChange={handleInputChange}
                            min="1"
                            max="100"
                            className={`w-full px-3 md:px-4 py-2 md:py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              formErrors.capacity ? 'border-red-300' : 'border-gray-300'
                            }`}
                          />
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                            students
                          </div>
                        </div>
                        {formErrors.capacity && (
                          <p className="text-red-500 text-xs mt-1">{formErrors.capacity}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">Maximum students in this class</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Class Teacher
                        </label>
                        <select
                          name="class_teacher_id"
                          value={formData.class_teacher_id}
                          onChange={handleInputChange}
                          className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select Teacher</option>
                          {teachersList.map(teacher => (
                            <option key={teacher.id} value={teacher.id}>
                              {teacher.full_name || `${teacher.first_name} ${teacher.last_name}`}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="is_active"
                          name="is_active"
                          checked={formData.is_active}
                          onChange={handleInputChange}
                          className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="is_active" className="ml-3 text-gray-700">
                          <span className="font-medium">Active Class</span>
                          <p className="text-sm text-gray-500 mt-1">Class will be available for student enrollment</p>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="bg-gray-50 rounded-lg p-4 md:p-5 border border-gray-200">
                    <h4 className="font-semibold text-gray-700 mb-4">Class Preview</h4>
                    <div className="p-4 bg-white rounded-lg border border-gray-300">
                      <div className="flex items-center mb-3">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                          <School className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
                        </div>
                        <div>
                          <h5 className="font-bold text-gray-800">
                            {formData.class_name || 'Class Name'}
                          </h5>
                          <p className="text-sm text-gray-600">
                            Code: {formData.class_code || 'CLASS-CODE'} • Level: {formData.numeric_level || '0'}
                            {formData.stream && ` • Stream: ${formData.stream}`}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Capacity:</span>{' '}
                          <span className="font-medium">{formData.capacity} students</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Status:</span>{' '}
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            formData.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {formData.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-gray-200 flex flex-col sm:flex-row justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      resetForm();
                    }}
                    className="px-4 md:px-6 py-2 md:py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 md:px-8 py-2 md:py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center"
                    disabled={loading.classes || loading.teachers}
                  >
                    {(loading.classes || loading.teachers) ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Class
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClassManagement;