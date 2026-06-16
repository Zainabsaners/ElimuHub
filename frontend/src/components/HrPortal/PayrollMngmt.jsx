import React, { useState, useEffect } from "react";
import { 
  FiPlus, FiTrash2, FiEdit, FiUsers, 
  FiSearch, FiFilter, FiUser, FiMail, 
  FiPhone, FiCalendar, FiTrendingUp,
  FiEye, FiDownload
} from "react-icons/fi";

const Payroll = () => {
  // State for staff members
  const [staffMembers, setStaffMembers] = useState([
    {
      id: 1,
      name: "John Mwangi",
      email: "john.mwangi@school.edu",
      phone: "+254712345678",
      position: "Teacher",
      department: "Academic",
      contractType: "Full-Time",
      basicSalary: 45000,
      joinDate: "2023-01-15",
      bankAccount: "1234567890",
      bankName: "KCB Bank"
    },
    {
      id: 2,
      name: "Mary Wanjiku",
      email: "mary.wanjiku@school.edu",
      phone: "+254723456789",
      position: "Administrator",
      department: "Administration",
      contractType: "Full-Time",
      basicSalary: 38000,
      joinDate: "2023-03-20",
      bankAccount: "2345678901",
      bankName: "Equity Bank"
    },
    {
      id: 3,
      name: "Peter Kamau",
      email: "peter.kamau@school.edu",
      phone: "+254734567890",
      position: "Support Staff",
      department: "Maintenance",
      contractType: "Part-Time",
      basicSalary: 25000,
      joinDate: "2023-06-10",
      bankAccount: "3456789012",
      bankName: "Cooperative Bank"
    }
  ]);

  // State for payroll components
  const [allowances, setAllowances] = useState([
    { id: 1, name: "Housing Allowance", amount: 15000, type: "fixed" },
    { id: 2, name: "Transport Allowance", amount: 8000, type: "fixed" },
    { id: 3, name: "Medical Allowance", amount: 5000, type: "fixed" }
  ]);

  const [deductions, setDeductions] = useState([
    { id: 1, name: "PAYE Tax", amount: 7500, type: "percentage", percentage: 15 },
    { id: 2, name: "NSSF", amount: 1080, type: "fixed" },
    { id: 3, name: "NHIF", amount: 1500, type: "fixed" },
    { id: 4, name: "Pension", amount: 2000, type: "fixed" }
  ]);

  // State for forms
  const [newStaff, setNewStaff] = useState({
    name: "",
    email: "",
    phone: "",
    position: "",
    department: "",
    contractType: "",
    basicSalary: "",
    joinDate: new Date().toISOString().split('T')[0],
    bankAccount: "",
    bankName: ""
  });

  const [newAllowance, setNewAllowance] = useState({ name: "", amount: "", type: "fixed" });
  const [newDeduction, setNewDeduction] = useState({ name: "", amount: "", type: "fixed", percentage: "" });

  // State for search and filters
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");

  // Statistics
  const [stats, setStats] = useState({
    totalStaff: 0,
    totalPayroll: 0,
    averageSalary: 0,
    activeDepartments: 0
  });

  // Calculate statistics
  useEffect(() => {
    const totalStaff = staffMembers.length;
    const totalPayroll = staffMembers.reduce((sum, staff) => sum + staff.basicSalary, 0);
    const averageSalary = totalStaff > 0 ? totalPayroll / totalStaff : 0;
    const activeDepartments = [...new Set(staffMembers.map(staff => staff.department))].length;

    setStats({
      totalStaff,
      totalPayroll,
      averageSalary,
      activeDepartments
    });
  }, [staffMembers]);

  // Add new staff member
  const addStaffMember = (e) => {
    e.preventDefault();
    const staff = {
      id: Date.now(),
      ...newStaff,
      basicSalary: parseFloat(newStaff.basicSalary)
    };
    setStaffMembers([...staffMembers, staff]);
    setNewStaff({
      name: "",
      email: "",
      phone: "",
      position: "",
      department: "",
      contractType: "",
      basicSalary: "",
      joinDate: new Date().toISOString().split('T')[0],
      bankAccount: "",
      bankName: ""
    });
  };

  // Add allowance
  const addAllowance = (e) => {
    e.preventDefault();
    const allowance = {
      id: Date.now(),
      ...newAllowance,
      amount: parseFloat(newAllowance.amount)
    };
    setAllowances([...allowances, allowance]);
    setNewAllowance({ name: "", amount: "", type: "fixed" });
  };

  // Add deduction
  const addDeduction = (e) => {
    e.preventDefault();
    const deduction = {
      id: Date.now(),
      ...newDeduction,
      amount: parseFloat(newDeduction.amount),
      percentage: newDeduction.percentage ? parseFloat(newDeduction.percentage) : null
    };
    setDeductions([...deductions, deduction]);
    setNewDeduction({ name: "", amount: "", type: "fixed", percentage: "" });
  };

  // Delete functions
  const deleteStaff = (id) => {
    setStaffMembers(staffMembers.filter(staff => staff.id !== id));
  };

  const deleteAllowance = (id) => {
    setAllowances(allowances.filter(allowance => allowance.id !== id));
  };

  const deleteDeduction = (id) => {
    setDeductions(deductions.filter(deduction => deduction.id !== id));
  };

  // Filter staff members
  const filteredStaff = staffMembers.filter(staff => {
    const matchesSearch = staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         staff.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === "all" || staff.department === departmentFilter;
    return matchesSearch && matchesDepartment;
  });

  // Get unique departments
  const departments = [...new Set(staffMembers.map(staff => staff.department))];

  // Export employee data
  const exportEmployeeData = () => {
    const data = {
      staffMembers,
      allowances,
      deductions,
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `employee_data_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <FiUsers className="text-blue-600" />
              HR Payroll Management
            </h1>
            <p className="text-gray-600 mt-2">Manage employee data, allowances, and deductions</p>
          </div>
          <div className="flex items-center gap-4 mt-4 lg:mt-0">
            <button 
              onClick={exportEmployeeData}
              className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-colors"
            >
              <FiDownload />
              Export Employee Data
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Employees</p>
                <p className="text-2xl font-bold text-gray-800">{stats.totalStaff}</p>
                <p className="text-sm text-gray-500 mt-1">Active staff members</p>
              </div>
              <FiUsers className="text-blue-500 text-2xl" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Monthly Salary Budget</p>
                <p className="text-2xl font-bold text-gray-800">Ksh {stats.totalPayroll.toLocaleString()}</p>
                <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                  <FiTrendingUp />
                  Total basic salaries
                </p>
              </div>
              <FiTrendingUp className="text-green-500 text-2xl" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Average Salary</p>
                <p className="text-2xl font-bold text-gray-800">Ksh {stats.averageSalary.toLocaleString()}</p>
                <p className="text-sm text-purple-600 mt-1">Per employee</p>
              </div>
              <FiUser className="text-purple-500 text-2xl" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-amber-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Active Departments</p>
                <p className="text-2xl font-bold text-gray-800">{stats.activeDepartments}</p>
                <p className="text-sm text-amber-600 mt-1">Departments with staff</p>
              </div>
              <FiFilter className="text-amber-500 text-2xl" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Staff Management */}
        <div className="xl:col-span-2">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2 mb-4 lg:mb-0">
                <FiUsers className="text-blue-600" />
                Employee Management
              </h2>
              
              <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search employees..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64"
                  />
                </div>
                
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Add Staff Form */}
            <form onSubmit={addStaffMember} className="mb-6 bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    value={newStaff.name}
                    onChange={(e) => setNewStaff({...newStaff, name: e.target.value})}
                    placeholder="Employee full name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Position *</label>
                  <input
                    type="text"
                    value={newStaff.position}
                    onChange={(e) => setNewStaff({...newStaff, position: e.target.value})}
                    placeholder="Job position"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Department *</label>
                  <select
                    value={newStaff.department}
                    onChange={(e) => setNewStaff({...newStaff, department: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select Department</option>
                    <option value="Academic">Academic</option>
                    <option value="Administration">Administration</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Support">Support</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Basic Salary (Ksh) *</label>
                  <input
                    type="number"
                    value={newStaff.basicSalary}
                    onChange={(e) => setNewStaff({...newStaff, basicSalary: e.target.value})}
                    placeholder="0.00"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contract Type *</label>
                  <select
                    value={newStaff.contractType}
                    onChange={(e) => setNewStaff({...newStaff, contractType: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="Full-Time">Full-Time</option>
                    <option value="Part-Time">Part-Time</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Join Date</label>
                  <input
                    type="date"
                    value={newStaff.joinDate}
                    onChange={(e) => setNewStaff({...newStaff, joinDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={newStaff.email}
                    onChange={(e) => setNewStaff({...newStaff, email: e.target.value})}
                    placeholder="employee@school.edu"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={newStaff.phone}
                    onChange={(e) => setNewStaff({...newStaff, phone: e.target.value})}
                    placeholder="+254712345678"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
                  <input
                    type="text"
                    value={newStaff.bankName}
                    onChange={(e) => setNewStaff({...newStaff, bankName: e.target.value})}
                    placeholder="Bank name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bank Account</label>
                  <input
                    type="text"
                    value={newStaff.bankAccount}
                    onChange={(e) => setNewStaff({...newStaff, bankAccount: e.target.value})}
                    placeholder="Account number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
              >
                <FiPlus />
                Add Employee
              </button>
            </form>

            {/* Staff List */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Employee Details</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Position/Department</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Salary Details</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Bank Details</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredStaff.map((staff) => (
                    <tr key={staff.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-medium text-gray-800">{staff.name}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <FiMail /> {staff.email}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <FiPhone /> {staff.phone}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <FiCalendar /> Joined: {staff.joinDate}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {staff.position}
                          </span>
                          <p className="text-sm text-gray-600 mt-1">{staff.department}</p>
                          <p className="text-xs text-gray-500">{staff.contractType}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-semibold text-gray-800">Ksh {staff.basicSalary.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">Basic Salary</p>
                        <button className="text-xs text-blue-600 hover:text-blue-800 mt-1">
                          View Payroll History
                        </button>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-gray-800">{staff.bankName}</p>
                        <p className="text-xs text-gray-600">{staff.bankAccount}</p>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          <button 
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <FiEdit />
                          </button>
                          <button 
                            onClick={() => deleteStaff(staff.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <FiTrash2 />
                          </button>
                          <button 
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <FiEye />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Allowances & Deductions Sidebar */}
        <div className="xl:col-span-1">
          {/* Allowances */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2 mb-4">
              <FiTrendingUp className="text-green-600" />
              Allowance Policies
            </h2>

            <form onSubmit={addAllowance} className="mb-4">
              <div className="space-y-3">
                <input
                  type="text"
                  value={newAllowance.name}
                  onChange={(e) => setNewAllowance({...newAllowance, name: e.target.value})}
                  placeholder="Allowance name (e.g., Housing Allowance)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <input
                  type="number"
                  value={newAllowance.amount}
                  onChange={(e) => setNewAllowance({...newAllowance, amount: e.target.value})}
                  placeholder="Amount (Ksh)"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <select
                  value={newAllowance.type}
                  onChange={(e) => setNewAllowance({...newAllowance, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="fixed">Fixed Amount</option>
                  <option value="percentage">Percentage of Basic</option>
                </select>
              </div>
              <button 
                type="submit" 
                className="mt-3 w-full bg-green-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-green-700 transition-colors"
              >
                <FiPlus />
                Add Allowance Policy
              </button>
            </form>

            <div className="max-h-60 overflow-y-auto">
              {allowances.map((allowance) => (
                <div key={allowance.id} className="flex items-center justify-between p-3 border-b border-gray-200 hover:bg-gray-50">
                  <div>
                    <p className="font-medium text-gray-800">{allowance.name}</p>
                    <p className="text-sm text-gray-500 capitalize">{allowance.type}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-green-600">Ksh {allowance.amount.toLocaleString()}</span>
                    <button 
                      onClick={() => deleteAllowance(allowance.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Deductions */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2 mb-4">
              Deduction Policies
            </h2>

            <form onSubmit={addDeduction} className="mb-4">
              <div className="space-y-3">
                <input
                  type="text"
                  value={newDeduction.name}
                  onChange={(e) => setNewDeduction({...newDeduction, name: e.target.value})}
                  placeholder="Deduction name (e.g., PAYE Tax)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                {newDeduction.type === "fixed" ? (
                  <input
                    type="number"
                    value={newDeduction.amount}
                    onChange={(e) => setNewDeduction({...newDeduction, amount: e.target.value})}
                    placeholder="Fixed Amount (Ksh)"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                ) : (
                  <input
                    type="number"
                    value={newDeduction.percentage}
                    onChange={(e) => setNewDeduction({...newDeduction, percentage: e.target.value})}
                    placeholder="Percentage %"
                    step="0.01"
                    max="100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                )}
                <select
                  value={newDeduction.type}
                  onChange={(e) => setNewDeduction({...newDeduction, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="fixed">Fixed Amount</option>
                  <option value="percentage">Percentage</option>
                </select>
              </div>
              <button 
                type="submit" 
                className="mt-3 w-full bg-red-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-red-700 transition-colors"
              >
                <FiPlus />
                Add Deduction Policy
              </button>
            </form>

            <div className="max-h-60 overflow-y-auto">
              {deductions.map((deduction) => (
                <div key={deduction.id} className="flex items-center justify-between p-3 border-b border-gray-200 hover:bg-gray-50">
                  <div>
                    <p className="font-medium text-gray-800">{deduction.name}</p>
                    <p className="text-sm text-gray-500 capitalize">{deduction.type}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-red-600">
                      {deduction.type === "percentage" ? 
                        `${deduction.percentage}%` : 
                        `Ksh ${deduction.amount.toLocaleString()}`
                      }
                    </span>
                    <button 
                      onClick={() => deleteDeduction(deduction.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Summary Section */}
      <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2 mb-6">
          Payroll Summary
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-700 mb-2">Total Allowances</h3>
            <p className="text-2xl font-bold text-green-600">
              Ksh {allowances.reduce((sum, allowance) => sum + allowance.amount, 0).toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">{allowances.length} allowance policies</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-700 mb-2">Total Deductions</h3>
            <p className="text-2xl font-bold text-red-600">
              Ksh {deductions
                .filter(d => d.type === "fixed")
                .reduce((sum, deduction) => sum + deduction.amount, 0)
                .toLocaleString()
              }
            </p>
            <p className="text-sm text-gray-500">{deductions.length} deduction policies</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-700 mb-2">Data Status</h3>
            <p className="text-2xl font-bold text-blue-600">Ready</p>
            <p className="text-sm text-gray-500">Data prepared for payroll processing</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payroll;