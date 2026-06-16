import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, UserPlus, Edit, Trash2, 
  Eye, Lock, Unlock, Shield, Mail, Phone,
  Calendar, CheckCircle, XCircle, Copy,
  Download, Key, RefreshCw, Loader
} from 'lucide-react';

// API configuration 
const API_BASE_URL = import.meta.env.VITE_API_URL || "https://*.onrender.com";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserForm, setShowUserForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ isValid: true, message: '' });

  // New states for password reset
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetPasswordUser, setResetPasswordUser] = useState(null);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // New user form state
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: '',
    department: '',
    password: '',
    isStaff: false,
    isSuperuser: false,
    isActive: true,
    mfaEnabled: false
  });

  // Available roles and departments
  const roles = [
    { value: 'hr', label: 'HR Officer' },
    { value: 'sys', label: 'System Administrator' },
    { value: 'bursar', label: 'Bursar' },
    { value: 'accountant', label: 'Accountant' },
    { value: 'registrar', label: 'Registrar' },
    { value: 'admin', label: 'Administrator' }
  ];

  const departments = [
    'IT', 'Human Resources', 'Finance', 'Academic', 
    'Administration', 'Library', 'Sports', 'Student Affairs'
  ];

  // Fetch users from API - FIXED VERSION
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      
      
      const response = await fetch(`${API_BASE_URL}/users`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Handle different response formats
      let usersArray = [];
      
      if (Array.isArray(result)) {
        // Direct array: [user1, user2, ...]
        usersArray = result;
      } else if (result.users && Array.isArray(result.users)) {
        // Object with users property: {users: [user1, user2, ...]}
        usersArray = result.users;
      } else if (result.data && Array.isArray(result.data)) {
        // Object with data property: {data: [user1, user2, ...]}
        usersArray = result.data;
      } else {
        console.error('Unexpected response format:', result);
        throw new Error('Server returned invalid data format');
      }
      
      // Check if we got any users
      if (usersArray.length === 0) {
        setUsers([]);
        setLoading(false);
        return;
      }
      
      // Transform data to match frontend format
      const transformedUsers = usersArray.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.first_name || user.firstName,
        lastName: user.last_name || user.lastName,
        role: user.role,
        department: user.department,
        phone: user.phone,
        lastLogin: user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never',
        isActive: user.is_active || user.isActive,
        isStaff: user.is_staff || user.isStaff,
        isSuperuser: user.is_superuser || user.isSuperuser,
        dateJoined: user.date_joined ? new Date(user.date_joined).toLocaleDateString() : 'Unknown',
        mfaEnabled: user.mfa_enabled || user.mfaEnabled,
        lockedUntil: user.locked_until,
        failedAttempts: user.failed_attempts || 0
      }));
      
      
      setUsers(transformedUsers);
      
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(`Failed to load users: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Generate secure password
  const generateSecurePassword = () => {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    
    // Ensure at least one of each required character type
    password += charset.charAt(Math.floor(Math.random() * 26)); // lowercase
    password += charset.charAt(26 + Math.floor(Math.random() * 26)); // uppercase
    password += charset.charAt(52 + Math.floor(Math.random() * 10)); // number
    password += charset.charAt(62 + Math.floor(Math.random() * 10)); // special
    
    // Fill the rest
    for (let i = 4; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    // Shuffle the password
    password = password.split('').sort(() => Math.random() - 0.5).join('');
    
    return password;
  };

  // Handle reset password
  const handleResetPassword = async (id, username) => {
    // Set the user for reset
    const user = users.find(u => u.id === id);
    setResetPasswordUser({ id, username, email: user?.email || '' });
    
    // Generate new password
    const newPassword = generateSecurePassword();
    setGeneratedPassword(newPassword);
    setShowResetPassword(true);
  };

  // Confirm password reset
  const confirmPasswordReset = async () => {
    if (!resetPasswordUser || !generatedPassword) return;

    try {
      setFormSubmitting(true);
      
      // Call backend API to update password
      const response = await fetch(`${API_BASE_URL}/users/${resetPasswordUser.id}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          newPassword: generatedPassword,
          userId: resetPasswordUser.id 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reset password');
      }

      setSuccessMessage(`Password reset for "${resetPasswordUser.username}" successful!`);
      setShowResetPassword(false);
      setResetPasswordUser(null);
      setGeneratedPassword('');

      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);

    } catch (err) {
      setError(`Failed to reset password: ${err.message}`);
    } finally {
      setFormSubmitting(false);
    }
  };

  // Copy password to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPassword).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  // Check password strength
  const checkPasswordStrength = (password) => {
    if (!password) return { isValid: true, message: '' };
    
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
      return { 
        isValid: false, 
        message: `Password must be at least ${minLength} characters` 
      };
    }

    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
      return { 
        isValid: false, 
        message: 'Password must include uppercase, lowercase, numbers, and special characters' 
      };
    }

    return { isValid: true, message: 'Strong password' };
  };

  // Handle create user
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    setError('');
    setSuccessMessage('');

    // Validate password
    if (newUser.password) {
      const strength = checkPasswordStrength(newUser.password);
      if (!strength.isValid) {
        setError(strength.message);
        setFormSubmitting(false);
        return;
      }
    }

    try {
      // Prepare data for backend
      const userData = {
        username: newUser.username.trim(),
        email: newUser.email.trim(),
        firstName: newUser.firstName.trim(),
        lastName: newUser.lastName.trim(),
        phone: newUser.phone.trim() || null,
        role: newUser.role,
        department: newUser.department || null,
        password: newUser.password || undefined, // Let backend generate if empty
        isStaff: newUser.isStaff,
        isSuperuser: newUser.isSuperuser,
        isActive: newUser.isActive,
        mfaEnabled: newUser.mfaEnabled
      };

      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.details || 'Failed to create user');
      }

      setSuccessMessage(`User created successfully!`);
      setShowUserForm(false);
      resetForm();
      fetchUsers(); // Refresh user list

      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);

    } catch (err) {
      setError(err.message || 'An error occurred while creating user');
      console.error('Error creating user:', err);
    } finally {
      setFormSubmitting(false);
    }
  };

  // Generate random password for form
  const generatePassword = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/generate-password`);
      if (!response.ok) throw new Error('Failed to generate password');
      const data = await response.json();
      setNewUser({ ...newUser, password: data.password });
      
      // Check strength of generated password
      setPasswordStrength(checkPasswordStrength(data.password));
    } catch (err) {
      console.error('Error generating password:', err);
      // Fallback: generate client-side
      const newPassword = generateSecurePassword();
      setNewUser({ ...newUser, password: newPassword });
      setPasswordStrength(checkPasswordStrength(newPassword));
    }
  };

  // Handle password input change
  const handlePasswordChange = (password) => {
    setNewUser({ ...newUser, password });
    setPasswordStrength(checkPasswordStrength(password));
  };

  const resetForm = () => {
    setNewUser({
      username: '',
      email: '',
      firstName: '',
      lastName: '',
      phone: '',
      role: '',
      department: '',
      password: '',
      isStaff: false,
      isSuperuser: false,
      isActive: true,
      mfaEnabled: false
    });
    setPasswordStrength({ isValid: true, message: '' });
  };

  // API functions for user operations
  const handleDeleteUser = async (id, username) => {
    if (window.confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
      try {
        // TODO: Implement delete API endpoint when ready
        // const response = await fetch(`${API_BASE_URL}/users/${id}`, { method: 'DELETE' });
        // if (response.ok) {
          setUsers(users.filter(user => user.id !== id));
          setSuccessMessage(`User "${username}" deleted successfully`);
        // }
      } catch (err) {
        setError('Failed to delete user');
      }
    }
  };

  const handleToggleStatus = async (id, username, currentStatus) => {
    const newStatus = !currentStatus;
    const action = newStatus ? 'activate' : 'deactivate';
    
    if (window.confirm(`Are you sure you want to ${action} user "${username}"?`)) {
      try {
        // TODO: Implement status toggle API endpoint
        // const response = await fetch(`${API_BASE_URL}/users/${id}/status`, {
        //   method: 'PATCH',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ isActive: newStatus })
        // });
        
        // if (response.ok) {
          setUsers(users.map(user => 
            user.id === id ? { ...user, isActive: newStatus } : user
          ));
          setSuccessMessage(`User "${username}" ${action}d successfully`);
        // }
      } catch (err) {
        setError(`Failed to ${action} user`);
      }
    }
  };

  const handleUnlockAccount = async (id, username) => {
    try {
      // TODO: Implement unlock account API endpoint
      // const response = await fetch(`${API_BASE_URL}/users/${id}/unlock`, { method: 'POST' });
      // if (response.ok) {
        setUsers(users.map(user => 
          user.id === id ? { ...user, lockedUntil: null, failedAttempts: 0 } : user
        ));
        setSuccessMessage(`Account unlocked for user "${username}"`);
      // }
    } catch (err) {
      setError('Failed to unlock account');
    }
  };

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = 
      filterStatus === 'all' || 
      (filterStatus === 'active' && user.isActive) ||
      (filterStatus === 'inactive' && !user.isActive) ||
      (filterStatus === 'locked' && user.lockedUntil);

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Format role for display
  const formatRoleDisplay = (roleValue) => {
    const role = roles.find(r => r.value === roleValue);
    return role ? role.label : roleValue;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 overflow-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
        <p className="text-gray-600 mt-2">Manage system users, permissions, and access controls</p>
      </div>

      {/* Success and Error Messages */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            {successMessage}
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          <div className="flex items-center">
            <XCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        </div>
      )}

      {/* Action Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search users by name, username, or email..."
                className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={fetchUsers}
              disabled={loading}
              className="px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button 
              onClick={() => setShowUserForm(true)}
              disabled={loading}
              className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center disabled:opacity-50"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mt-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select 
              className="px-3 py-2 border border-gray-300 rounded-lg"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="all">All Roles</option>
              {roles.map(role => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select 
              className="px-3 py-2 border border-gray-300 rounded-lg"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="locked">Locked</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">
            Users ({filteredUsers.length})
          </h3>
          <div className="flex items-center text-sm text-gray-600">
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded mr-2">
              {users.filter(u => u.isActive).length} Active
            </span>
            <span className="bg-red-100 text-red-800 px-2 py-1 rounded">
              {users.filter(u => u.lockedUntil).length} Locked
            </span>
          </div>
        </div>
        
        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Loader className="h-12 w-12 animate-spin text-blue-600 mb-4" />
            <p className="text-gray-600">Loading users...</p>
            <p className="text-sm text-gray-400 mt-2">
              Fetching from {API_BASE_URL}/users
            </p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64 p-6">
            <XCircle className="h-12 w-12 text-red-500 mb-4" />
            <p className="text-red-600 text-lg font-medium mb-2">Failed to load users</p>
            <p className="text-gray-600 text-center mb-4">{error}</p>
            <button
              onClick={fetchUsers}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MFA</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <UserPlus className="h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-gray-500 text-lg font-medium mb-2">
                          {searchTerm || filterRole !== 'all' || filterStatus !== 'all' 
                            ? 'No users match your search criteria' 
                            : 'No users found'}
                        </p>
                        <p className="text-gray-400 mb-4">
                          {searchTerm || filterRole !== 'all' || filterStatus !== 'all' 
                            ? 'Try adjusting your filters' 
                            : 'Add your first user to get started'}
                        </p>
                        {!searchTerm && filterRole === 'all' && filterStatus === 'all' && (
                          <button
                            onClick={() => setShowUserForm(true)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                          >
                            <UserPlus className="inline h-4 w-4 mr-2" />
                            Add First User
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="font-medium text-gray-800">{user.username}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                          <p className="text-xs text-gray-400">{user.firstName} {user.lastName}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                          user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                          user.role === 'sys' ? 'bg-blue-100 text-blue-800' :
                          user.role === 'hr' ? 'bg-green-100 text-green-800' :
                          user.role === 'bursar' ? 'bg-yellow-100 text-yellow-800' :
                          user.role === 'accountant' ? 'bg-indigo-100 text-indigo-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {formatRoleDisplay(user.role)}
                          {user.isSuperuser && <Shield className="inline h-3 w-3 ml-1" />}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-gray-700">{user.department || '-'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`h-2 w-2 rounded-full mr-2 ${
                            !user.isActive ? 'bg-red-500' :
                            user.lockedUntil ? 'bg-amber-500' :
                            'bg-green-500'
                          }`} />
                          <span className={`text-sm font-medium ${
                            !user.isActive ? 'text-red-600' :
                            user.lockedUntil ? 'text-amber-600' :
                            'text-green-600'
                          }`}>
                            {!user.isActive ? 'Inactive' :
                             user.lockedUntil ? 'Locked' : 'Active'}
                          </span>
                          {user.failedAttempts > 0 && (
                            <span className="ml-2 text-xs text-gray-500">
                              ({user.failedAttempts} attempts)
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-gray-700">{user.lastLogin}</p>
                          <p className="text-xs text-gray-500">Joined: {user.dateJoined}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.mfaEnabled ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-gray-400" />
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleResetPassword(user.id, user.username)}
                            className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg"
                            title="Reset Password"
                          >
                            <Key className="h-4 w-4" />
                          </button>
                          {user.lockedUntil && (
                            <button
                              onClick={() => handleUnlockAccount(user.id, user.username)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                              title="Unlock Account"
                            >
                              <Unlock className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleToggleStatus(user.id, user.username, user.isActive)}
                            className={`p-2 rounded-lg ${
                              user.isActive 
                                ? 'text-red-600 hover:bg-red-50' 
                                : 'text-green-600 hover:bg-green-50'
                            }`}
                            title={user.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {user.isActive ? (
                              <Lock className="h-4 w-4" />
                            ) : (
                              <Unlock className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id, user.username)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            title="Delete User"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">User Details</h3>
                <button 
                  onClick={() => setSelectedUser(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                    <p className="font-medium text-gray-800">{selectedUser.username}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <p className="text-gray-800">{selectedUser.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <p className="text-gray-800">{selectedUser.firstName} {selectedUser.lastName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <p className="text-gray-800">{selectedUser.phone || '-'}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                      selectedUser.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                      selectedUser.role === 'sys' ? 'bg-blue-100 text-blue-800' :
                      selectedUser.role === 'hr' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {formatRoleDisplay(selectedUser.role)}
                      {selectedUser.isSuperuser && <Shield className="inline h-3 w-3 ml-1" />}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <p className="text-gray-800">{selectedUser.department || 'Not assigned'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <div className="flex items-center">
                      <div className={`h-2 w-2 rounded-full mr-2 ${
                        !selectedUser.isActive ? 'bg-red-500' :
                        selectedUser.lockedUntil ? 'bg-amber-500' :
                        'bg-green-500'
                      }`} />
                      <span className={`font-medium ${
                        !selectedUser.isActive ? 'text-red-600' :
                        selectedUser.lockedUntil ? 'text-amber-600' :
                        'text-green-600'
                      }`}>
                        {!selectedUser.isActive ? 'Inactive' :
                         selectedUser.lockedUntil ? 'Locked' : 'Active'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date Joined</label>
                    <p className="text-gray-800">{selectedUser.dateJoined}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-4">Permissions & Security</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedUser.isStaff}
                      readOnly
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Staff Member</span>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedUser.isSuperuser}
                      readOnly
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Superuser</span>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedUser.mfaEnabled}
                      readOnly
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">MFA Enabled</span>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={!!selectedUser.lockedUntil}
                      readOnly
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Account Locked</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add User Form Modal */}
      {showUserForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Add New User</h3>
                <button 
                  onClick={() => {
                    setShowUserForm(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                  disabled={formSubmitting}
                >
                  ×
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                  {error}
                </div>
              )}

              <form onSubmit={handleCreateUser}>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter username"
                        value={newUser.username}
                        onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                        required
                        disabled={formSubmitting}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                      <input
                        type="email"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="user@school.ac.ke"
                        value={newUser.email}
                        onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                        required
                        disabled={formSubmitting}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="First name"
                        value={newUser.firstName}
                        onChange={(e) => setNewUser({...newUser, firstName: e.target.value})}
                        required
                        disabled={formSubmitting}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Last name"
                        value={newUser.lastName}
                        onChange={(e) => setNewUser({...newUser, lastName: e.target.value})}
                        required
                        disabled={formSubmitting}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="+254700000000"
                      value={newUser.phone}
                      onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                      disabled={formSubmitting}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                      <select 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={newUser.role}
                        onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                        required
                        disabled={formSubmitting}
                      >
                        <option value="">Select Role</option>
                        {roles.map(role => (
                          <option key={role.value} value={role.value}>
                            {role.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                      <select 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={newUser.department}
                        onChange={(e) => setNewUser({...newUser, department: e.target.value})}
                        disabled={formSubmitting}
                      >
                        <option value="">Select Department</option>
                        {departments.map(dept => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-sm font-medium text-gray-700">Password</label>
                      <button
                        type="button"
                        onClick={generatePassword}
                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center disabled:opacity-50"
                        disabled={formSubmitting}
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Generate Secure Password
                      </button>
                    </div>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                      placeholder="Leave blank for auto-generated password"
                      value={newUser.password}
                      onChange={(e) => handlePasswordChange(e.target.value)}
                      disabled={formSubmitting}
                    />
                    {newUser.password && (
                      <p className={`text-sm mt-1 ${
                        passwordStrength.isValid ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {passwordStrength.message}
                      </p>
                    )}
                    <p className="text-sm text-gray-500 mt-1">
                      If left blank, a random password will be generated and shown here.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-700">Permissions</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <label className="flex items-center">
                        <input 
                          type="checkbox" 
                          className="mr-2"
                          checked={newUser.isStaff}
                          onChange={(e) => setNewUser({...newUser, isStaff: e.target.checked})}
                          disabled={formSubmitting}
                        />
                        <span className="text-sm text-gray-700">Staff Member</span>
                      </label>
                      <label className="flex items-center">
                        <input 
                          type="checkbox" 
                          className="mr-2"
                          checked={newUser.isSuperuser}
                          onChange={(e) => setNewUser({...newUser, isSuperuser: e.target.checked})}
                          disabled={formSubmitting}
                        />
                        <span className="text-sm text-gray-700">Superuser</span>
                      </label>
                      <label className="flex items-center">
                        <input 
                          type="checkbox" 
                          className="mr-2"
                          checked={newUser.isActive}
                          onChange={(e) => setNewUser({...newUser, isActive: e.target.checked})}
                          disabled={formSubmitting}
                        />
                        <span className="text-sm text-gray-700">Active Account</span>
                      </label>
                      <label className="flex items-center">
                        <input 
                          type="checkbox" 
                          className="mr-2"
                          checked={newUser.mfaEnabled}
                          onChange={(e) => setNewUser({...newUser, mfaEnabled: e.target.checked})}
                          disabled={formSubmitting}
                        />
                        <span className="text-sm text-gray-700">Require MFA Setup</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-6">
                    <button
                      type="button"
                      onClick={() => {
                        setShowUserForm(false);
                        resetForm();
                      }}
                      className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                      disabled={formSubmitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
                      disabled={formSubmitting || !passwordStrength.isValid}
                    >
                      {formSubmitting ? (
                        <>
                          <Loader className="h-4 w-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        'Create User'
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {showResetPassword && resetPasswordUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Reset Password</h3>
                <button 
                  onClick={() => {
                    setShowResetPassword(false);
                    setResetPasswordUser(null);
                    setGeneratedPassword('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                  disabled={formSubmitting}
                >
                  ×
                </button>
              </div>

              <div className="mb-6">
                <p className="text-gray-600 mb-2">
                  New password for <span className="font-semibold">{resetPasswordUser.username}</span>:
                </p>
                
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={generatedPassword}
                    readOnly
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg font-mono text-lg bg-gray-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <Lock className="h-5 w-5" />
                    ) : (
                      <Unlock className="h-5 w-5" />
                    )}
                  </button>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={copyToClipboard}
                      className="flex items-center text-blue-600 hover:text-blue-800"
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      {copySuccess ? 'Copied!' : 'Copy to Clipboard'}
                    </button>
                  </div>
                  <div className="text-sm text-gray-500">
                    {checkPasswordStrength(generatedPassword).message}
                  </div>
                </div>

                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex">
                    <Key className="h-5 w-5 text-yellow-600 mr-2 flex-shrink-0" />
                    <div>
                      <p className="text-yellow-800 font-medium mb-1">Important Notice</p>
                      <p className="text-yellow-700 text-sm">
                        Copy this password now! It will be hashed in the database and cannot be retrieved later.
                        Provide this password to the user securely.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowResetPassword(false);
                    setResetPasswordUser(null);
                    setGeneratedPassword('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  disabled={formSubmitting}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmPasswordReset}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
                  disabled={formSubmitting}
                >
                  {formSubmitting ? (
                    <>
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Confirm Reset'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;