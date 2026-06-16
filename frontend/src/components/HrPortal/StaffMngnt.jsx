import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  PlusCircle,
  Search,
  Filter,
  X,
  Eye,
  Edit2,
  Trash2,
  UserPlus,
  Download,
  Upload,
  MoreVertical,
  Calendar,
  Phone,
  Mail,
  Building,
  Briefcase,
  DollarSign,
  UserCheck,
  UserX,
  Save,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

// API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL;
// Change these lines:
const API_ENDPOINTS = {
  STAFF: `${API_BASE_URL}/api/staff`,
  STAFF_BY_ID: (id) => `${API_BASE_URL}/api/staff/${id}`,
  TEACHERS: `${API_BASE_URL}/api/staff/teachers`,
  BULK_CREATE: `${API_BASE_URL}/api/staff/bulk`,
  EXPORT: `${API_BASE_URL}/api/staff/export`,
};


const StaffManagement = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formMode, setFormMode] = useState('create'); // 'create' or 'edit'
  const [uploadModal, setUploadModal] = useState(false);
  const [file, setFile] = useState(null);
  const [filters, setFilters] = useState({
    department: '',
    role: '',
    status: '',
    employment_type: '',
    from_date: '',
    to_date: ''
  });

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    username: '',
    password: '',
    date_of_birth: '',
    gender: 'male',
    department: '',
    designation: '',
    employment_type: 'permanent',
    national_id: '',
    basic_salary: '',
    salary_currency: 'KES',
    highest_qualification: '',
    bank_name: '',
    account_number: '',
    permanent_address: '',
    city: '',
    country: 'Kenya',
    emergency_contact: '',
    emergency_contact_name: '',
    role: 'staff',
    marital_status: 'single',
    kra_pin: '',
    nssf_no: '',
    nhif_no: '',
    contract_end_date: '',
    reporting_to: ''
  });

  // Departments for a school
  const departments = [
    'Teaching',
    'Administration',
    'Accounts & Finance',
    'Human Resources',
    'Academic',
    'ICT',
    'Library',
    'Laboratory',
    'Maintenance',
    'Security',
    'Kitchen & Catering',
    'Transport',
    'Medical',
    'Co-curricular',
    'Guidance & Counseling'
  ];

  const roles = [
    'Teacher',
    'Senior Teacher',
    'Head of Department',
    'Deputy Principal',
    'Principal',
    'Accountant',
    'Administrator',
    'Secretary',
    'Librarian',
    'Lab Technician',
    'ICT Officer',
    'Driver',
    'Cook',
    'Nurse',
    'Security Officer',
    'Cleaner',
    'Gardener'
  ];

  const employmentTypes = [
    'Permanent',
    'Contract',
    'Probation',
    'Temporary',
    'Part-time',
    'Intern'
  ];

  const statusOptions = [
    'Active',
    'Inactive',
    'Suspended',
    'On Leave',
    'Terminated',
    'Resigned'
  ];

  const maritalStatuses = [
    'Single',
    'Married',
    'Divorced',
    'Widowed'
  ];

  const banks = [
    'Equity Bank',
    'KCB Bank',
    'Co-operative Bank',
    'Absa Bank',
    'Standard Chartered',
    'NCBA Bank',
    'DTB Bank',
    'Family Bank',
    'Bank of Africa',
    'I&M Bank',
    'Stanbic Bank',
    'Citibank',
    'Sidian Bank',
    'Prime Bank',
    'Guardian Bank'
  ];

  // Fetch staff data
  useEffect(() => {
    fetchStaff();
  }, [filters]);

  const fetchStaff = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      const response = await axios.get(`${API_ENDPOINTS.STAFF}?${params}`);
      setStaff(response.data.data || []);
      toast.success('Staff data loaded successfully');
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to fetch staff data';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      department: '',
      role: '',
      status: '',
      employment_type: '',
      from_date: '',
      to_date: ''
    });
    setSearchTerm('');
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      let response;
      if (formMode === 'create') {
        response = await axios.post(API_ENDPOINTS.STAFF, formData);
        toast.success('Staff member created successfully!');
      } else {
        response = await axios.put(API_ENDPOINTS.STAFF_BY_ID(selectedStaff?.id), formData);
        toast.success('Staff member updated successfully!');
      }

      setShowForm(false);
      resetForm();
      fetchStaff();
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to save staff data';
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      username: '',
      password: '',
      date_of_birth: '',
      gender: 'male',
      department: '',
      designation: '',
      employment_type: 'permanent',
      national_id: '',
      basic_salary: '',
      salary_currency: 'KES',
      highest_qualification: '',
      bank_name: '',
      account_number: '',
      permanent_address: '',
      city: '',
      country: 'Kenya',
      emergency_contact: '',
      emergency_contact_name: '',
      role: 'staff',
      marital_status: 'single',
      kra_pin: '',
      nssf_no: '',
      nhif_no: '',
      contract_end_date: '',
      reporting_to: ''
    });
  };

  // Load staff data for editing
  const handleEditStaff = (staffMember) => {
    setSelectedStaff(staffMember);
    setFormMode('edit');
    setFormData({
      ...staffMember,
      date_of_birth: staffMember.date_of_birth ? staffMember.date_of_birth.split('T')[0] : '',
      contract_end_date: staffMember.contract_end_date ? staffMember.contract_end_date.split('T')[0] : ''
    });
    setShowForm(true);
  };

  // View staff details
  const handleViewStaff = (staffMember) => {
    setSelectedStaff(staffMember);
    setShowDetails(true);
  };

  // Delete staff member
  const handleDeleteStaff = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
      return;
    }

    try {
      await axios.delete(API_ENDPOINTS.STAFF_BY_ID(id));
      toast.success(`${name} has been deleted successfully`);
      fetchStaff();
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to delete staff member';
      toast.error(errorMsg);
    }
  };

  // Export staff data
  const handleExport = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.EXPORT, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `staff_data_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Staff data exported successfully');
    } catch (err) {
      toast.error('Failed to export staff data');
    }
  };

  // Add this function with your other functions (after handleExport)
const downloadTemplate = async () => {
    try {
        // This will download the Excel template
        window.open(`${API_BASE_URL}/api/staff/template`, '_blank');
        toast.success('Excel template downloaded');
    } catch (err) {
        toast.error('Failed to download template');
    }
};

  // Handle bulk upload
  const handleFileUpload = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleBulkUpload = async () => {
    if (!file) {
        toast.error('Please select a file to upload');
        return;
    }

    try {
        // Create FormData for file upload
        const formData = new FormData();
        formData.append('file', file);

        const response = await axios.post(API_ENDPOINTS.BULK_CREATE, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        
        if (response.data.success) {
            toast.success(`✅ ${response.data.message}`);
            
            // Show detailed results
            if (response.data.data.created_staff && response.data.data.created_staff.length > 0) {
                console.log('Created staff:', response.data.data.created_staff);
            }
            
            if (response.data.data.errors && response.data.data.errors.length > 0) {
                console.warn('Upload errors:', response.data.data.errors);
                toast.warning(`Some entries failed: ${response.data.data.failed} errors`);
            }
            
            setUploadModal(false);
            setFile(null);
            fetchStaff(); // Refresh the list
            
        } else {
            toast.error(response.data.error || 'Upload failed');
        }
        
    } catch (err) {
        console.error('Upload error:', err);
        
        if (err.response) {
            const errorMsg = err.response.data?.error || 'Upload failed';
            const details = err.response.data?.details || '';
            toast.error(`${errorMsg}${details ? `: ${details}` : ''}`);
        } else if (err.request) {
            toast.error('Network error: No response from server');
        } else {
            toast.error(err.message || 'Failed to upload file');
        }
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format currency
  const formatCurrency = (amount, currency = 'KES') => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      'Active': 'bg-green-100 text-green-800',
      'Inactive': 'bg-gray-100 text-gray-800',
      'On Leave': 'bg-blue-100 text-blue-800',
      'Suspended': 'bg-yellow-100 text-yellow-800',
      'Terminated': 'bg-red-100 text-red-800',
      'Resigned': 'bg-purple-100 text-purple-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // Filter staff by search term
  const filteredStaff = staff.filter(member =>
    `${member.first_name} ${member.last_name} ${member.email} ${member.staff_id} ${member.department} ${member.designation}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Toaster position="top-right" />
      
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Staff Management</h1>
              <p className="text-gray-600 mt-1">Manage school staff, teachers, and administrators</p>
            </div>
            <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
              <button
                onClick={() => {
                  setFormMode('create');
                  resetForm();
                  setShowForm(true);
                }}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Add Staff
              </button>
              <button
                onClick={() => setUploadModal(true)}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Upload className="w-4 h-4 mr-2" />
                Bulk Upload
              </button>
              <button
                onClick={handleExport}
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
              <button
                onClick={fetchStaff}
                className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name, email, ID, or department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
                {showFilters && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                    Active
                  </span>
                )}
              </button>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <select
                      name="department"
                      value={filters.department}
                      onChange={handleFilterChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All Departments</option>
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <select
                      name="role"
                      value={filters.role}
                      onChange={handleFilterChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All Roles</option>
                      {roles.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      name="status"
                      value={filters.status}
                      onChange={handleFilterChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All Status</option>
                      {statusOptions.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Employment Type</label>
                    <select
                      name="employment_type"
                      value={filters.employment_type}
                      onChange={handleFilterChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All Types</option>
                      {employmentTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-end mt-4">
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Staff</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{staff.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Briefcase className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Teachers</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {staff.filter(s => s.department === 'Teaching').length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Staff</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {staff.filter(s => s.status === 'Active').length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Payroll</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(
                    staff.reduce((sum, s) => sum + (s.basic_salary || 0), 0)
                  )}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Staff Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading staff data...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="w-12 h-12 text-red-500" />
              <p className="mt-4 text-red-600">{error}</p>
              <button
                onClick={fetchStaff}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : filteredStaff.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <UserX className="w-16 h-16 text-gray-400" />
              <p className="mt-4 text-gray-500">No staff members found</p>
              <button
                onClick={() => {
                  setFormMode('create');
                  setShowForm(true);
                }}
                className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Add First Staff Member
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff Details</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department & Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status & Salary</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStaff.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-blue-600 font-semibold">
                                {member.first_name?.[0]}{member.last_name?.[0]}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {member.first_name} {member.last_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {member.staff_id || 'N/A'}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              <Calendar className="inline w-3 h-3 mr-1" />
                              Joined {formatDate(member.employment_date)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{member.department || 'N/A'}</div>
                        <div className="text-sm text-gray-500">{member.designation || 'N/A'}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          <Building className="inline w-3 h-3 mr-1" />
                          {member.employment_type || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm text-gray-900 mb-1">
                          <Phone className="w-4 h-4 mr-2 text-gray-400" />
                          {member.personal_phone || 'N/A'}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Mail className="w-4 h-4 mr-2 text-gray-400" />
                          {member.personal_email || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(member.status)}`}>
                          {member.status || 'N/A'}
                        </span>
                        <div className="mt-2 text-sm font-medium text-gray-900">
                          {formatCurrency(member.basic_salary, member.salary_currency)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewStaff(member)}
                            className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditStaff(member)}
                            className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteStaff(member.id, `${member.first_name} ${member.last_name}`)}
                            className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add/Edit Staff Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  {formMode === 'create' ? 'Add New Staff Member' : 'Edit Staff Member'}
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Personal Information */}
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
                    <input
                      type="date"
                      name="date_of_birth"
                      value={formData.date_of_birth}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Marital Status</label>
                    <select
                      name="marital_status"
                      value={formData.marital_status}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {maritalStatuses.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">National ID</label>
                    <input
                      type="text"
                      name="national_id"
                      value={formData.national_id}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Employment Information */}
                  <div className="md:col-span-2 mt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Employment Information</h3>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Department</option>
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Designation/Role</label>
                    <input
                      type="text"
                      name="designation"
                      value={formData.designation}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role Category</label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Role</option>
                      {roles.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Employment Type</label>
                    <select
                      name="employment_type"
                      value={formData.employment_type}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {employmentTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contract End Date</label>
                    <input
                      type="date"
                      name="contract_end_date"
                      value={formData.contract_end_date}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Basic Salary</label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 border border-r-0 border-gray-300 rounded-l-lg bg-gray-50 text-gray-500">
                        KES
                      </span>
                      <input
                        type="number"
                        name="basic_salary"
                        value={formData.basic_salary}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-r-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Banking Information */}
                  <div className="md:col-span-2 mt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Banking & Qualifications</h3>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                    <select
                      name="bank_name"
                      value={formData.bank_name}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Bank</option>
                      {banks.map(bank => (
                        <option key={bank} value={bank}>{bank}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                    <input
                      type="text"
                      name="account_number"
                      value={formData.account_number}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">KRA PIN</label>
                    <input
                      type="text"
                      name="kra_pin"
                      value={formData.kra_pin}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">NSSF Number</label>
                    <input
                      type="text"
                      name="nssf_no"
                      value={formData.nssf_no}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">NHIF Number</label>
                    <input
                      type="text"
                      name="nhif_no"
                      value={formData.nhif_no}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Highest Qualification</label>
                    <input
                      type="text"
                      name="highest_qualification"
                      value={formData.highest_qualification}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Account Information */}
                  {formMode === 'create' && (
                    <>
                      <div className="md:col-span-2 mt-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                        <input
                          type="text"
                          name="username"
                          value={formData.username}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Auto-generated if empty"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Temporary Password</label>
                        <input
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Leave empty for default password"
                        />
                      </div>
                    </>
                  )}

                  {/* Address Information */}
                  <div className="md:col-span-2 mt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Address & Emergency Contact</h3>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Permanent Address</label>
                    <textarea
                      name="permanent_address"
                      value={formData.permanent_address}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact</label>
                    <input
                      type="text"
                      name="emergency_contact"
                      value={formData.emergency_contact}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact Name</label>
                    <input
                      type="text"
                      name="emergency_contact_name"
                      value={formData.emergency_contact_name}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {error && (
                  <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {formMode === 'create' ? 'Create Staff Member' : 'Update Staff Member'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Bulk Upload Modal */}
        {uploadModal && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Bulk Staff Upload</h3>
                <button
                  onClick={() => setUploadModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm text-gray-600 mb-4">
                    Upload an Excel file with staff data. Download the template for correct format.
                  </p>
                  
                  {/* Template Download Button - ADD THIS */}
                  <div className="mb-6">
                    <button
                      onClick={downloadTemplate}
                      className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors mb-2"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Template
                    </button>
                    <p className="text-xs text-gray-500">
                      Download the template, fill it with staff data, then upload it here.
                    </p>
                  </div>
                  
                  <div className="mt-4">
                    <input
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 cursor-pointer"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Choose File
                    </label>
                    {file && (
                      <p className="mt-2 text-sm text-gray-600">
                        Selected: {file.name}
                      </p>
                    )}
                  </div>
                  
                  <div className="mt-6 flex justify-center space-x-3">
                    <button
                      onClick={() => setUploadModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleBulkUpload}
                      disabled={!file}
                      className={`px-4 py-2 rounded-lg text-white ${!file ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                      Upload File
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Staff Details Modal */}
        {showDetails && selectedStaff && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Staff Details</h2>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="flex items-center mb-6">
                  <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-600">
                    {selectedStaff.first_name?.[0]}{selectedStaff.last_name?.[0]}
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-bold text-gray-900">
                      {selectedStaff.first_name} {selectedStaff.last_name}
                    </h3>
                    <p className="text-gray-600">{selectedStaff.designation}</p>
                    <p className="text-sm text-gray-500">{selectedStaff.staff_id}</p>
                  </div>
                  <span className={`ml-auto px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedStaff.status)}`}>
                    {selectedStaff.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">Personal Information</h4>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm text-gray-600">Date of Birth:</span>
                        <span className="ml-2 text-sm text-gray-900">{formatDate(selectedStaff.date_of_birth)}</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Gender:</span>
                        <span className="ml-2 text-sm text-gray-900">{selectedStaff.gender}</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">National ID:</span>
                        <span className="ml-2 text-sm text-gray-900">{selectedStaff.national_id || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">Employment Details</h4>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm text-gray-600">Department:</span>
                        <span className="ml-2 text-sm text-gray-900">{selectedStaff.department}</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Employment Type:</span>
                        <span className="ml-2 text-sm text-gray-900">{selectedStaff.employment_type}</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Employment Date:</span>
                        <span className="ml-2 text-sm text-gray-900">{formatDate(selectedStaff.employment_date)}</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Basic Salary:</span>
                        <span className="ml-2 text-sm text-gray-900 font-medium">
                          {formatCurrency(selectedStaff.basic_salary, selectedStaff.salary_currency)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">Contact Information</h4>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{selectedStaff.personal_phone || 'N/A'}</span>
                      </div>
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{selectedStaff.personal_email || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Address:</span>
                        <p className="text-sm text-gray-900 mt-1">{selectedStaff.permanent_address || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">Banking Information</h4>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm text-gray-600">Bank:</span>
                        <span className="ml-2 text-sm text-gray-900">{selectedStaff.bank_name || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Account Number:</span>
                        <span className="ml-2 text-sm text-gray-900">{selectedStaff.account_number || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">KRA PIN:</span>
                        <span className="ml-2 text-sm text-gray-900">{selectedStaff.kra_pin || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="md:col-span-2">
                    <h4 className="text-sm font-medium text-gray-500 mb-3">Emergency Contact</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">{selectedStaff.emergency_contact_name || 'N/A'}</span>
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {selectedStaff.emergency_contact || 'N/A'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="md:col-span-2">
                    <h4 className="text-sm font-medium text-gray-500 mb-3">Qualifications</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-900">{selectedStaff.highest_qualification || 'No qualifications listed'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setShowDetails(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      handleEditStaff(selectedStaff);
                      setShowDetails(false);
                    }}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default StaffManagement;