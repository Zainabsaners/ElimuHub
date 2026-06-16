import React, { useState } from 'react';
import { 
  Shield, Users, Key, Lock, Unlock, 
  Eye, Edit, Trash2, Plus, Search,
  Filter, Download, Upload, CheckCircle,
  XCircle, Settings, Database, FileText,
  BarChart, Calendar, DollarSign, Mail
} from 'lucide-react';

const PermissionManagement = () => {
  const [roles, setRoles] = useState([
    {
      id: 1,
      name: 'Administrator',
      description: 'Full system access with all permissions',
      permissions: [
        'user.*', 'staff.*', 'student.*', 'finance.*', 
        'academic.*', 'system.*', 'settings.*', 'reports.*'
      ],
      userCount: 1,
      isDefault: false
    },
    {
      id: 2,
      name: 'HR Manager',
      description: 'Human resources management and staff administration',
      permissions: [
        'staff.view', 'staff.edit', 'staff.create', 'leave.*',
        'reports.hr', 'dashboard.view'
      ],
      userCount: 2,
      isDefault: false
    },
    {
      id: 3,
      name: 'Finance Officer',
      description: 'Financial operations and fee management',
      permissions: [
        'finance.*', 'reports.finance', 'dashboard.view',
        'student.fees', 'invoices.*'
      ],
      userCount: 3,
      isDefault: false
    },
    {
      id: 4,
      name: 'Teacher',
      description: 'Academic staff with teaching responsibilities',
      permissions: [
        'student.view', 'academic.*', 'attendance.*',
        'exams.*', 'timetable.view', 'dashboard.view'
      ],
      userCount: 45,
      isDefault: true
    },
    {
      id: 5,
      name: 'Parent',
      description: 'Parent/guardian access to student information',
      permissions: [
        'student.view.own', 'fees.view', 'attendance.view',
        'exams.view', 'notifications.*'
      ],
      userCount: 1245,
      isDefault: true
    }
  ]);

  const [permissionsList, setPermissionsList] = useState([
    // User Management
    { id: 'user.view', name: 'View Users', category: 'User Management', description: 'View user accounts and profiles' },
    { id: 'user.create', name: 'Create Users', category: 'User Management', description: 'Create new user accounts' },
    { id: 'user.edit', name: 'Edit Users', category: 'User Management', description: 'Modify existing user accounts' },
    { id: 'user.delete', name: 'Delete Users', category: 'User Management', description: 'Remove user accounts' },
    { id: 'user.*', name: 'All User Operations', category: 'User Management', description: 'Full control over user management' },
    
    // Staff Management
    { id: 'staff.view', name: 'View Staff', category: 'Staff Management', description: 'View staff records and information' },
    { id: 'staff.create', name: 'Create Staff', category: 'Staff Management', description: 'Add new staff members' },
    { id: 'staff.edit', name: 'Edit Staff', category: 'Staff Management', description: 'Modify staff records' },
    { id: 'staff.delete', name: 'Delete Staff', category: 'Staff Management', description: 'Remove staff records' },
    { id: 'staff.*', name: 'All Staff Operations', category: 'Staff Management', description: 'Full control over staff management' },
    
    // Student Management
    { id: 'student.view', name: 'View Students', category: 'Student Management', description: 'View student records and information' },
    { id: 'student.create', name: 'Create Students', category: 'Student Management', description: 'Add new students' },
    { id: 'student.edit', name: 'Edit Students', category: 'Student Management', description: 'Modify student records' },
    { id: 'student.delete', name: 'Delete Students', category: 'Student Management', description: 'Remove student records' },
    { id: 'student.*', name: 'All Student Operations', category: 'Student Management', description: 'Full control over student management' },
    
    // Academic Management
    { id: 'academic.view', name: 'View Academic', category: 'Academic Management', description: 'View academic records and information' },
    { id: 'academic.edit', name: 'Edit Academic', category: 'Academic Management', description: 'Modify academic records' },
    { id: 'academic.*', name: 'All Academic Operations', category: 'Academic Management', description: 'Full control over academic management' },
    
    // Finance Management
    { id: 'finance.view', name: 'View Finance', category: 'Finance Management', description: 'View financial records and transactions' },
    { id: 'finance.create', name: 'Create Transactions', category: 'Finance Management', description: 'Create financial transactions' },
    { id: 'finance.edit', name: 'Edit Finance', category: 'Finance Management', description: 'Modify financial records' },
    { id: 'finance.delete', name: 'Delete Transactions', category: 'Finance Management', description: 'Remove financial transactions' },
    { id: 'finance.*', name: 'All Finance Operations', category: 'Finance Management', description: 'Full control over financial management' },
    
    // System Management
    { id: 'system.view', name: 'View System', category: 'System Management', description: 'View system information and logs' },
    { id: 'system.edit', name: 'Edit System', category: 'System Management', description: 'Modify system settings' },
    { id: 'system.*', name: 'All System Operations', category: 'System Management', description: 'Full control over system management' },
    
    // Reports
    { id: 'reports.view', name: 'View Reports', category: 'Reports', description: 'View and generate reports' },
    { id: 'reports.*', name: 'All Report Operations', category: 'Reports', description: 'Full control over reporting' },
    
    // Dashboard
    { id: 'dashboard.view', name: 'View Dashboard', category: 'Dashboard', description: 'Access to system dashboard' }
  ]);

  const [selectedRole, setSelectedRole] = useState(null);
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleRolePermissionToggle = (roleId, permission) => {
    setRoles(prev => prev.map(role => {
      if (role.id === roleId) {
        const hasPermission = role.permissions.includes(permission);
        return {
          ...role,
          permissions: hasPermission
            ? role.permissions.filter(p => p !== permission)
            : [...role.permissions, permission]
        };
      }
      return role;
    }));
  };

  const handleDeleteRole = (id) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      setRoles(roles.filter(role => role.id !== id));
    }
  };

  const handleCreateRole = (roleData) => {
    const newRole = {
      id: roles.length + 1,
      ...roleData,
      userCount: 0,
      isDefault: false
    };
    setRoles([...roles, newRole]);
    setShowRoleForm(false);
  };

  const getPermissionCategory = (permissionId) => {
    return permissionsList.find(p => p.id === permissionId)?.category || 'General';
  };

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6 overflow-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Permission Management</h1>
        <p className="text-gray-600 mt-2">Manage user roles and permissions across the system</p>
      </div>

      {/* Action Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search roles by name or description..."
                className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center">
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
            <button
              onClick={() => setShowRoleForm(true)}
              className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Role
            </button>
          </div>
        </div>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {filteredRoles.map((role) => (
          <div key={role.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center">
                    <Shield className={`h-5 w-5 mr-2 ${
                      role.name === 'Administrator' ? 'text-purple-600' :
                      role.name === 'HR Manager' ? 'text-blue-600' :
                      role.name === 'Finance Officer' ? 'text-green-600' :
                      role.name === 'Teacher' ? 'text-amber-600' :
                      'text-gray-600'
                    }`} />
                    <h3 className="text-lg font-semibold text-gray-800">{role.name}</h3>
                    {role.isDefault && (
                      <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{role.description}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedRole(role)}
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                    title="Edit Permissions"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  {!role.isDefault && role.userCount === 0 && (
                    <button
                      onClick={() => handleDeleteRole(role.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                      title="Delete Role"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Users with this role:</span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm font-medium rounded-full">
                    {role.userCount} users
                  </span>
                </div>

                <div>
                  <span className="text-sm text-gray-600">Permissions:</span>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {role.permissions.slice(0, 3).map((perm, index) => (
                      <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                        {perm}
                      </span>
                    ))}
                    {role.permissions.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                        +{role.permissions.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => setSelectedRole(role)}
                  className="w-full py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
                >
                  Manage Permissions
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Permissions Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">All Permissions</h3>
        
        <div className="space-y-6">
          {Array.from(new Set(permissionsList.map(p => p.category))).map(category => (
            <div key={category}>
              <h4 className="font-medium text-gray-700 mb-3">{category}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {permissionsList
                  .filter(p => p.category === category)
                  .map(permission => (
                    <div key={permission.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium text-gray-800">{permission.name}</p>
                          <p className="text-xs text-gray-500 font-mono mt-1">{permission.id}</p>
                        </div>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          {roles.filter(r => r.permissions.includes(permission.id)).length} roles
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{permission.description}</p>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Role Permissions Modal */}
      {selectedRole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">
                  {selectedRole.name} - Permissions
                </h3>
                <button 
                  onClick={() => setSelectedRole(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="mb-6">
                <p className="text-gray-600">{selectedRole.description}</p>
                <div className="flex items-center mt-2">
                  <Users className="h-4 w-4 text-gray-400 mr-1" />
                  <span className="text-sm text-gray-600">
                    {selectedRole.userCount} users assigned this role
                  </span>
                </div>
              </div>

              {/* Permissions Grid */}
              <div className="space-y-6">
                {Array.from(new Set(permissionsList.map(p => p.category))).map(category => (
                  <div key={category}>
                    <h4 className="font-medium text-gray-700 mb-3">{category}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {permissionsList
                        .filter(p => p.category === category)
                        .map(permission => {
                          const hasPermission = selectedRole.permissions.includes(permission.id);
                          return (
                            <div key={permission.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                              <div>
                                <p className="font-medium text-gray-800">{permission.name}</p>
                                <p className="text-xs text-gray-500">{permission.description}</p>
                              </div>
                              <button
                                onClick={() => handleRolePermissionToggle(selectedRole.id, permission.id)}
                                className={`w-12 h-6 rounded-full relative transition-colors ${
                                  hasPermission ? 'bg-green-500' : 'bg-gray-300'
                                }`}
                              >
                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                                  hasPermission ? 'left-7' : 'left-1'
                                }`} />
                              </button>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                <div>
                  <p className="text-sm text-gray-600">
                    {selectedRole.permissions.length} permissions enabled
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedRole(null)}
                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      // Save permissions
                      alert('Permissions updated successfully');
                      setSelectedRole(null);
                    }}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Role Form Modal */}
      {showRoleForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Create New Role</h3>
                <button 
                  onClick={() => setShowRoleForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role Name *</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="e.g., Department Head"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Describe the purpose and responsibilities of this role..."
                  />
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-gray-700">Base Permissions</h4>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-sm text-gray-700">View Dashboard</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-sm text-gray-700">View Reports</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-sm text-gray-700">Receive Notifications</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-gray-700">Advanced Settings</h4>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm text-gray-700">Set as default role for new users</span>
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-6">
                  <button
                    onClick={() => setShowRoleForm(false)}
                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleCreateRole({
                      name: 'New Role',
                      description: 'Role description',
                      permissions: ['dashboard.view']
                    })}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Create Role
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PermissionManagement;