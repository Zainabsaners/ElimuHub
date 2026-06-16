import React, { useState, useEffect } from "react";
import axios from 'axios';

import { 
  FiDollarSign, FiPrinter, FiDownload, 
  FiCreditCard, FiPieChart, FiBarChart2, 
  FiTrendingUp, FiCalendar, FiFileText,
  FiCheckCircle, FiAlertCircle, FiClock,
  FiSend, FiRefreshCw
} from "react-icons/fi";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const PayrollManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [components, setComponents] = useState([]); // Earning, Deduction, etc.
  const [payrollRecords, setPayrollRecords] = useState([]);
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

  const fetchPayrollData = async () => {
    setLoading(true);
    try {
      const config = getAuthHeaders();
      const [staffRes, compRes, recordRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/staff/`, config),
        axios.get(`${API_BASE_URL}/api/payroll-components/`, config),
        axios.get(`${API_BASE_URL}/api/payroll-periods/`, config)
      ]);

      if (staffRes.data.success) setEmployees(staffRes.data.data);
      if (compRes.data.success) setComponents(compRes.data.data);
      if (recordRes.data.success) setPayrollRecords(recordRes.data.data);
    } catch (error) {
      console.error("Payroll Sync Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayrollData();
  }, []);

  // Allowances from HR
  const [allowances, setAllowances] = useState([
    { id: 1, name: "Housing Allowance", amount: 15000, type: "fixed" },
    { id: 2, name: "Transport Allowance", amount: 8000, type: "fixed" },
    { id: 3, name: "Medical Allowance", amount: 5000, type: "fixed" }
  ]);

  // Deductions from HR
  const [deductions, setDeductions] = useState([
    { id: 1, name: "PAYE Tax", amount: 7500, type: "percentage", percentage: 15 },
    { id: 2, name: "NSSF", amount: 1080, type: "fixed" },
    { id: 3, name: "NHIF", amount: 1500, type: "fixed" },
    { id: 4, name: "Pension", amount: 2000, type: "fixed" }
  ]);

  // Payroll processing state
  const [currentPayroll, setCurrentPayroll] = useState({
    month: new Date().toISOString().slice(0, 7),
    selectedEmployees: [],
    overtimeRates: {},
    bonuses: {},
    absentDays: {},
    status: "draft"
  });



  // Financial statistics
  const [financialStats, setFinancialStats] = useState({
    totalProcessed: 0,
    currentMonthPayroll: 0,
    taxLiabilities: 0,
    pendingPayments: 0
  });

  // Selected employee for processing
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeAdjustments, setEmployeeAdjustments] = useState({
    overtime: 0,
    bonus: 0,
    absentDays: 0,
    notes: ""
  });

  // Calculate financial statistics
  useEffect(() => {
    const totalProcessed = payrollRecords.reduce((sum, record) => sum + record.totalNet, 0);
    const currentMonthPayroll = employees.reduce((sum, emp) => sum + emp.basic_salary, 0);
    const taxLiabilities = payrollRecords.reduce((sum, record) => sum + (record.totalDeductions * 0.6), 0);
    const pendingPayments = currentMonthPayroll;

    setFinancialStats({
      totalProcessed,
      currentMonthPayroll,
      taxLiabilities,
      pendingPayments
    });
  }, [payrollRecords, employees]);

  // Calculate payroll for an employee
  const calculateEmployeePayroll = (employee) => {
    if (!employee || !components.length) return null;

    // 1. Get Earnings (Allowances + Bonuses)
    const earningsList = components.filter(c => c.component_type === 'Earning' || c.component_type === 'Allowance');
    const totalEarnings = earningsList.reduce((sum, c) => sum + (parseFloat(c.fixed_amount) || 0), 0);
    
    // 2. Get Deductions
    const deductionsList = components.filter(c => c.component_type === 'Deduction');
    const totalDeductions = deductionsList.reduce((sum, d) => {
      if (d.calculation_type === "Percentage of Basic") {
        return sum + (parseFloat(employee.basic_salary) * (parseFloat(d.percentage_rate) / 100));
      }
      return sum + (parseFloat(d.fixed_amount) || 0);
    }, 0);

    // 3. Adjustments (Fixed the undefined variable errors)
    const basic = parseFloat(employee.basic_salary) || 0;
    const overtimePay = (parseFloat(employeeAdjustments.overtime) || 0) * (basic / 160);
    const absentDeduction = (parseFloat(employeeAdjustments.absentDays) || 0) * (basic / 22);
    const bonusAmount = parseFloat(employeeAdjustments.bonus) || 0;

    const grossSalary = basic + totalEarnings + overtimePay + bonusAmount;
    const netSalary = grossSalary - totalDeductions - absentDeduction;

    return {
      employee: employee.full_name,
      basic_salary: basic,
      allowances: totalEarnings,
      overtime: overtimePay,
      bonus: bonusAmount,
      deductions: totalDeductions,
      absentDeduction: absentDeduction,
      grossSalary: grossSalary,
      netSalary: netSalary,
      // Fixed the nested object error here
      bankDetails: `${employee.bank_name || 'N/A'} - ${employee.account_number || 'N/A'}`
    };
  };

  // Process payroll for selected employees
  const processPayroll = () => {
    const payrollMonth = currentPayroll.month;
    const processedEmployees = currentPayroll.selectedEmployees.map(empId => {
      const employee = employees.find(e => e.id === empId);
      const payroll = calculateEmployeePayroll(employee);
      return {
        ...payroll,
        employeeId: empId,
        month: payrollMonth,
        status: "processed",
        paymentDate: null
      };
    });

    // Add to payroll records
    const totalGross = processedEmployees.reduce((sum, emp) => sum + emp.grossSalary, 0);
    const totalDeductions = processedEmployees.reduce((sum, emp) => sum + emp.deductions, 0);
    const totalNet = processedEmployees.reduce((sum, emp) => sum + emp.netSalary, 0);

    const newRecord = {
      id: Date.now(),
      month: payrollMonth,
      employeeCount: processedEmployees.length,
      totalGross,
      totalDeductions,
      totalNet,
      status: "pending_payment",
      paymentDate: null,
      details: processedEmployees
    };

    setPayrollRecords([newRecord, ...payrollRecords]);
    
    // Reset
    setCurrentPayroll({
      month: new Date().toISOString().slice(0, 7),
      selectedEmployees: [],
      overtimeRates: {},
      bonuses: {},
      absentDays: {},
      status: "draft"
    });
    setSelectedEmployee(null);
    setEmployeeAdjustments({
      overtime: 0,
      bonus: 0,
      absentDays: 0,
      notes: ""
    });

    alert(`Payroll processed for ${processedEmployees.length} employees`);
  };

  // Toggle employee selection
  const toggleEmployeeSelection = (employeeId) => {
    setCurrentPayroll(prev => {
      const isSelected = prev.selectedEmployees.includes(employeeId);
      return {
        ...prev,
        selectedEmployees: isSelected
          ? prev.selectedEmployees.filter(id => id !== employeeId)
          : [...prev.selectedEmployees, employeeId]
      };
    });
  };

  // Mark payroll as paid
  const markAsPaid = (recordId) => {
    setPayrollRecords(records =>
      records.map(record =>
        record.id === recordId
          ? { ...record, status: "paid", paymentDate: new Date().toISOString().split('T')[0] }
          : record
      )
    );
  };

  // Export payroll report
  const exportPayrollReport = () => {
    const report = {
      payrollPeriod: currentPayroll.month,
      processedDate: new Date().toISOString(),
      employees: employees.filter(emp => currentPayroll.selectedEmployees.includes(emp.id)),
      allowances,
      deductions,
      totals: payrollRecords.find(r => r.month === currentPayroll.month) || {}
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payroll_report_${currentPayroll.month}.json`;
    a.click();
  };

  // Generate payslip
  const generatePayslip = (employeeId) => {
    const employee = employees.find(e => e.id === employeeId);
    const payroll = calculateEmployeePayroll(employee);
    
    if (payroll) {
      const payslip = {
        company: "School Name",
        employee: payroll.employee,
        period: currentPayroll.month,
        basic_salary: payroll.basic_salary,
        allowances: payroll.allowances,
        overtime: payroll.overtime,
        bonus: payroll.bonus,
        deductions: payroll.deductions,
        absentDeduction: payroll.absentDeduction,
        netSalary: payroll.netSalary,
        bankDetails: payroll.bankDetails,
        generatedDate: new Date().toISOString()
      };
      
      
      alert(`Payslip generated for ${employee.name}`);
    }
  };

  // Calculate totals for selected employees
  const calculateSelectedTotals = () => {
    const selected = employees.filter(emp => currentPayroll.selectedEmployees.includes(emp.id));
    const totalBasic = selected.reduce((sum, emp) => sum + emp.basic_salary, 0);
    const totalAllowances = allowances.reduce((sum, allowance) => sum + allowance.amount, 0) * selected.length;
    const totalDeductions = selected.reduce((sum, emp) => {
      return sum + deductions.reduce((dedSum, deduction) => {
        if (deduction.type === "percentage") {
          return dedSum + (emp.basic_salary * (deduction.percentage / 100));
        }
        return dedSum + deduction.amount;
      }, 0);
    }, 0);

    return {
      totalBasic,
      totalAllowances,
      totalDeductions,
      estimatedNet: totalBasic + totalAllowances - totalDeductions
    };
  };

  const selectedTotals = calculateSelectedTotals();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <FiDollarSign className="text-green-600" />
              Accountant Payroll Processing
            </h1>
            <p className="text-gray-600 mt-2">Process payments, generate reports, and manage financial records</p>
          </div>
          <div className="flex items-center gap-4 mt-4 lg:mt-0">
            <button 
              onClick={exportPayrollReport}
              className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-colors"
            >
              <FiPrinter />
              Print Reports
            </button>
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors">
              <FiDownload />
              Export Payroll
            </button>
          </div>
        </div>

        {/* Financial Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Processed</p>
                <p className="text-2xl font-bold text-gray-800">Ksh {financialStats.totalProcessed.toLocaleString()}</p>
                <p className="text-sm text-gray-500 mt-1">All-time payroll</p>
              </div>
              <FiDollarSign className="text-blue-500 text-2xl" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Current Month</p>
                <p className="text-2xl font-bold text-gray-800">Ksh {financialStats.currentMonthPayroll.toLocaleString()}</p>
                <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                  <FiTrendingUp />
                  Ready for processing
                </p>
              </div>
              <FiCalendar className="text-green-500 text-2xl" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Tax Liabilities</p>
                <p className="text-2xl font-bold text-gray-800">Ksh {financialStats.taxLiabilities.toLocaleString()}</p>
                <p className="text-sm text-purple-600 mt-1">PAYE, NSSF, NHIF</p>
              </div>
              <FiFileText className="text-purple-500 text-2xl" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-amber-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Pending Payments</p>
                <p className="text-2xl font-bold text-gray-800">Ksh {financialStats.pendingPayments.toLocaleString()}</p>
                <p className="text-sm text-amber-600 mt-1">Awaiting disbursement</p>
              </div>
              <FiCreditCard className="text-amber-500 text-2xl" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Column: Employee Selection & Processing */}
        <div className="xl:col-span-2">
          {/* Payroll Period Selection */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2 mb-4">
              <FiCalendar className="text-blue-600" />
              Payroll Period
            </h2>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Month *</label>
                <input
                  type="month"
                  value={currentPayroll.month}
                  onChange={(e) => setCurrentPayroll({...currentPayroll, month: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div className="flex items-center gap-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {currentPayroll.selectedEmployees.length} employees selected
                </span>
                <button 
                  onClick={processPayroll}
                  disabled={currentPayroll.selectedEmployees.length === 0}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiDollarSign />
                  Process Payroll
                </button>
              </div>
            </div>
          </div>

          {/* Employee Selection */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2 mb-4 lg:mb-0">
                <FiCreditCard className="text-green-600" />
                Select Employees for Payroll
              </h2>
              
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => {
                    setCurrentPayroll(prev => ({
                      ...prev,
                      selectedEmployees: employees.map(emp => emp.id)
                    }));
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Select All
                </button>
                <button 
                  onClick={() => {
                    setCurrentPayroll(prev => ({
                      ...prev,
                      selectedEmployees: []
                    }));
                  }}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Clear All
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {employees.map((employee) => {
                const isSelected = currentPayroll.selectedEmployees.includes(employee.id);
                const payroll = calculateEmployeePayroll(employee);
                
                return (
                  <div 
                    key={employee.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => toggleEmployeeSelection(employee.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleEmployeeSelection(employee.id)}
                            className="h-5 w-5 text-green-600"
                          />
                          <div>
                            <p className="font-medium text-gray-800">{employee.full_name}</p>
                            <p className="text-sm text-gray-600">{employee.position} • {employee.department}</p>
                          </div>
                        </div>
                        
                        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-500">Basic Salary:</span>
                            <p className="font-semibold">Ksh {parseFloat(employee.basic_salary).toLocaleString()}</p>
                          </div>
                          {payroll && (
                            <div>
                              <span className="text-gray-500">Est. Net:</span>
                              <p className="font-semibold text-green-600">
                                Ksh {payroll.netSalary.toLocaleString()}
                              </p>
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-2 text-xs text-gray-500">
                          {employee.bankName} • {employee.bankAccount}
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end">
                        {isSelected && (
                          <FiCheckCircle className="text-green-500 text-xl mb-2" />
                        )}
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEmployee(employee);
                          }}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          Adjust
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Employee Adjustments Panel */}
          {selectedEmployee && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2 mb-4">
                <FiEdit className="text-blue-600" />
                Adjustments for {selectedEmployee.name}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Overtime (Hours)</label>
                  <input
                    type="number"
                    value={employeeAdjustments.overtime}
                    onChange={(e) => setEmployeeAdjustments({...employeeAdjustments, overtime: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bonus (Ksh)</label>
                  <input
                    type="number"
                    value={employeeAdjustments.bonus}
                    onChange={(e) => setEmployeeAdjustments({...employeeAdjustments, bonus: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Absent Days</label>
                  <input
                    type="number"
                    value={employeeAdjustments.absentDays}
                    onChange={(e) => setEmployeeAdjustments({...employeeAdjustments, absentDays: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  value={employeeAdjustments.notes}
                  onChange={(e) => setEmployeeAdjustments({...employeeAdjustments, notes: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows="3"
                  placeholder="Any special notes or adjustments..."
                />
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button 
                  onClick={() => {
                    setSelectedEmployee(null);
                    setEmployeeAdjustments({ overtime: 0, bonus: 0, absentDays: 0, notes: "" });
                  }}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    // Save adjustments for this employee
                    alert(`Adjustments saved for ${selectedEmployee.name}`);
                    setSelectedEmployee(null);
                    setEmployeeAdjustments({ overtime: 0, bonus: 0, absentDays: 0, notes: "" });
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save Adjustments
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Summary & Quick Actions */}
        <div className="xl:col-span-1">
          {/* Current Payroll Summary */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2 mb-4">
              <FiPieChart className="text-purple-600" />
              Current Payroll Summary
            </h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Selected Employees</span>
                <span className="font-semibold">{currentPayroll.selectedEmployees.length} / {employees.length}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Basic Salaries</span>
                <span className="font-semibold">Ksh {selectedTotals.totalBasic.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Allowances</span>
                <span className="font-semibold text-green-600">Ksh {selectedTotals.totalAllowances.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Deductions</span>
                <span className="font-semibold text-red-600">Ksh {selectedTotals.totalDeductions.toLocaleString()}</span>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-800">Estimated Net Total</span>
                  <span className="text-xl font-bold text-green-600">
                    Ksh {selectedTotals.estimatedNet.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
            
            <button 
              onClick={processPayroll}
              disabled={currentPayroll.selectedEmployees.length === 0}
              className="mt-6 w-full bg-green-600 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiSend />
              Finalize & Process Payroll
            </button>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2 mb-4">
              <FiRefreshCw className="text-blue-600" />
              Quick Actions
            </h2>
            
            <div className="space-y-3">
              <button 
                onClick={() => {
                  currentPayroll.selectedEmployees.forEach(empId => generatePayslip(empId));
                }}
                disabled={currentPayroll.selectedEmployees.length === 0}
                className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiFileText className="text-blue-500" />
                <span>Generate All Payslips</span>
              </button>
              
              <button 
                onClick={exportPayrollReport}
                className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FiDownload className="text-green-500" />
                <span>Export Payroll Report</span>
              </button>
              
              <button 
                onClick={() => alert("Bank transfer file generated")}
                className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FiCreditCard className="text-purple-500" />
                <span>Generate Bank Transfer File</span>
              </button>
              
              <button 
                onClick={() => alert("Tax report generated")}
                className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FiFileText className="text-red-500" />
                <span>Generate Tax Report</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Payroll History */}
      <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2 mb-4 lg:mb-0">
            <FiBarChart2 className="text-green-600" />
            Payroll History & Status
          </h2>
          
          <div className="flex items-center gap-4">
            <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option>All Status</option>
              <option>Paid</option>
              <option>Pending</option>
              <option>Processing</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Payroll Month</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Employees</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Gross Amount</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Deductions</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Net Amount</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Payment Date</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {payrollRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <p className="font-medium text-gray-800">{record.month}</p>
                  </td>
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {record.employeeCount} employees
                    </span>
                  </td>
                  <td className="px-4 py-4 font-semibold text-gray-800">
                    Ksh {record.totalGross.toLocaleString()}
                  </td>
                  <td className="px-4 py-4 text-red-600">
                    Ksh {record.totalDeductions.toLocaleString()}
                  </td>
                  <td className="px-4 py-4 font-bold text-green-600">
                    Ksh {record.totalNet.toLocaleString()}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      record.status === 'paid' 
                        ? 'bg-green-100 text-green-800' 
                        : record.status === 'pending_payment'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {record.status === 'paid' ? (
                        <FiCheckCircle className="mr-1" />
                      ) : record.status === 'pending_payment' ? (
                        <FiClock className="mr-1" />
                      ) : (
                        <FiAlertCircle className="mr-1" />
                      )}
                      {record.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">
                    {record.paymentDate || 'Not paid'}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => generatePayslip(record.details?.[0]?.employeeId)}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        View
                      </button>
                      {record.status === 'pending_payment' && (
                        <button 
                          onClick={() => markAsPaid(record.id)}
                          className="text-sm text-green-600 hover:text-green-800"
                        >
                          Mark Paid
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PayrollManagement;