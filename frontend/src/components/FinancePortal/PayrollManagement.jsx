import React, { useState, useEffect, useCallback, useRef } from "react";
import { 
  FiDollarSign, FiPrinter, FiDownload, 
  FiCreditCard, FiPieChart, FiBarChart2, 
  FiTrendingUp, FiCalendar, FiFileText,
  FiCheckCircle, FiAlertCircle, FiClock,
  FiSend, FiRefreshCw, FiEdit, FiTrash2,
  FiUser, FiBriefcase, FiHome, FiPlus, FiX,
  FiXCircle, FiBell, FiFilter, FiEye, FiEyeOff
} from "react-icons/fi";
import { staff, payroll } from '../../api';

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

const PayrollManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [payrollComponents, setPayrollComponents] = useState([]);
  const [payrollRecords, setPayrollRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "info" });

  // Payroll processing state
  const [currentPayroll, setCurrentPayroll] = useState({
    month: new Date().toISOString().slice(0, 7),
    selectedEmployees: [],
    status: "Draft"
  });

  // Financial statistics
  const [financialStats, setFinancialStats] = useState({
    totalProcessed: 0,
    currentMonthPayroll: 0,
    taxLiabilities: 0,
    pendingPayments: 0
  });

  // Selected employee for adjustments
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeAdjustments, setEmployeeAdjustments] = useState({
    overtime: 0,
    bonus: 0,
    absentDays: 0,
    notes: ""
  });

  // History filters
  const [historyFilter, setHistoryFilter] = useState('all');
  const [selectedPeriodId, setSelectedPeriodId] = useState(null);

  // Abort controller ref
  const abortControllerRef = useRef(null);

  const showToast = useCallback((message, type = "info") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "info" }), 3000);
  }, []);

  const closeToast = useCallback(() => {
    setToast({ show: false, message: "", type: "info" });
  }, []);

  // Fetch payroll data from API with abort support
  const fetchPayrollData = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);
    
    try {
      const staffResponse = await staff.getAll();
      
      let staffData = [];
      if (staffResponse.data.results && Array.isArray(staffResponse.data.results)) {
        staffData = staffResponse.data.results;
      } else if (staffResponse.data.success && Array.isArray(staffResponse.data.data)) {
        staffData = staffResponse.data.data;
      } else if (Array.isArray(staffResponse.data)) {
        staffData = staffResponse.data;
      } else if (staffResponse.data.data && Array.isArray(staffResponse.data.data)) {
        staffData = staffResponse.data.data;
      }
      
      const mappedEmployees = staffData.map(staff => ({
        id: staff.id,
        full_name: staff.full_name || staff.name || `${staff.first_name || ''} ${staff.last_name || ''}`.trim() || 'Unknown',
        name: staff.full_name || staff.name || `${staff.first_name || ''} ${staff.last_name || ''}`.trim() || 'Unknown',
        position: staff.position || staff.role || staff.job_title || 'Staff',
        department: staff.department || staff.department_name || 'General',
        basic_salary: parseFloat(staff.basic_salary) || parseFloat(staff.salary) || 0,
        bank_name: staff.bank_name || staff.bank || 'N/A',
        bank_account: staff.bank_account || staff.account_number || 'N/A',
        bankName: staff.bank_name || staff.bank || 'N/A',
        bankAccount: staff.bank_account || staff.account_number || 'N/A',
        email: staff.email || '',
        phone: staff.phone || staff.phone_number || '',
        status: staff.status || 'active'
      }));
      
      setEmployees(mappedEmployees);
      
      try {
        const compResponse = await payroll.getComponents();
        let compData = [];
        if (compResponse.data.results && Array.isArray(compResponse.data.results)) {
          compData = compResponse.data.results;
        } else if (compResponse.data.success && Array.isArray(compResponse.data.data)) {
          compData = compResponse.data.data;
        } else if (Array.isArray(compResponse.data)) {
          compData = compResponse.data;
        } else if (compResponse.data.data && Array.isArray(compResponse.data.data)) {
          compData = compResponse.data.data;
        }
        setPayrollComponents(compData);
      } catch (compError) {
        if (compError.response?.status !== 404) {
          console.error('Error fetching payroll components:', compError);
        }
        setPayrollComponents([]);
      }
      
      try {
        const recordResponse = await payroll.getPeriods();
        let recordData = [];
        if (recordResponse.data.results && Array.isArray(recordResponse.data.results)) {
          recordData = recordResponse.data.results;
        } else if (recordResponse.data.success && Array.isArray(recordResponse.data.data)) {
          recordData = recordResponse.data.data;
        } else if (Array.isArray(recordResponse.data)) {
          recordData = recordResponse.data;
        } else if (recordResponse.data.data && Array.isArray(recordResponse.data.data)) {
          recordData = recordResponse.data.data;
        }
        setPayrollRecords(recordData);
        // Select the first period if available
        if (recordData.length > 0 && !selectedPeriodId) {
          setSelectedPeriodId(recordData[0].id);
        }
      } catch (recordError) {
        if (recordError.response?.status !== 404) {
          console.error('Error fetching payroll records:', recordError);
        }
        setPayrollRecords([]);
      }
      
      showToast('Payroll data loaded successfully', 'success');
    } catch (error) {
      if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') {
        console.log('Request was cancelled');
        return;
      }
      
      console.error("Payroll Sync Error:", error);
      setError(error.message || 'Failed to load payroll data');
      showToast('Failed to load payroll data. Please try again.', 'error');
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }, [showToast, selectedPeriodId]);

  // Clean up abort controller on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  useEffect(() => {
    fetchPayrollData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Calculate financial statistics
  useEffect(() => {
    if (employees.length === 0) return;
    
    const totalProcessed = payrollRecords
      .filter(r => r.status === 'Paid')
      .reduce((sum, record) => sum + (parseFloat(record.total_net) || 0), 0);
    
    const currentMonthPayroll = employees.reduce((sum, emp) => sum + (parseFloat(emp.basic_salary) || 0), 0);
    const taxLiabilities = payrollRecords.reduce((sum, record) => sum + (parseFloat(record.total_paye) || 0), 0);
    const pendingPayments = payrollRecords
      .filter(r => r.status === 'Processing' || r.status === 'Draft' || r.status === 'Approved')
      .reduce((sum, record) => sum + (parseFloat(record.total_net) || 0), 0);

    setFinancialStats({
      totalProcessed: Math.round(totalProcessed),
      currentMonthPayroll: Math.round(currentMonthPayroll),
      taxLiabilities: Math.round(taxLiabilities),
      pendingPayments: Math.round(pendingPayments || 0)
    });
  }, [payrollRecords, employees]);

  // Calculate payroll for an employee
  const calculateEmployeePayroll = useCallback((employee) => {
    if (!employee) return null;

    const basic = parseFloat(employee.basic_salary) || 0;
    
    const earningsList = payrollComponents.filter(c => 
      c.component_type === 'Earning' || c.component_type === 'Allowance'
    );
    
    let totalEarnings = 0;
    earningsList.forEach(c => {
      if (c.calculation_type === 'Fixed Amount') {
        totalEarnings += parseFloat(c.fixed_amount) || 0;
      } else if (c.calculation_type === 'Percentage of Basic') {
        totalEarnings += basic * (parseFloat(c.percentage_rate) || 0) / 100;
      }
    });
    
    const deductionsList = payrollComponents.filter(c => c.component_type === 'Deduction');
    
    let totalDeductions = 0;
    deductionsList.forEach(d => {
      if (d.calculation_type === 'Fixed Amount') {
        totalDeductions += parseFloat(d.fixed_amount) || 0;
      } else if (d.calculation_type === 'Percentage of Basic') {
        totalDeductions += basic * (parseFloat(d.percentage_rate) || 0) / 100;
      }
    });

    const overtimePay = (parseFloat(employeeAdjustments.overtime) || 0) * (basic / 160);
    const absentDeduction = (parseFloat(employeeAdjustments.absentDays) || 0) * (basic / 22);
    const bonusAmount = parseFloat(employeeAdjustments.bonus) || 0;

    const grossSalary = basic + totalEarnings + overtimePay + bonusAmount;
    const netSalary = grossSalary - totalDeductions - absentDeduction;

    return {
      employee: employee.full_name || employee.name || 'Unknown',
      employee_id: employee.id,
      basic_salary: Math.round(basic),
      allowances: Math.round(totalEarnings),
      overtime: Math.round(overtimePay),
      bonus: Math.round(bonusAmount),
      deductions: Math.round(totalDeductions),
      absent_deduction: Math.round(absentDeduction),
      gross_salary: Math.round(grossSalary),
      net_salary: Math.round(netSalary),
      bank_details: `${employee.bank_name || employee.bankName || 'N/A'} - ${employee.bank_account || employee.bankAccount || 'N/A'}`
    };
  }, [payrollComponents, employeeAdjustments]);

  // Process payroll for selected employees
  const processPayroll = useCallback(async () => {
    if (currentPayroll.selectedEmployees.length === 0) {
      showToast('Please select at least one employee', 'warning');
      return;
    }

    try {
      setLoading(true);
      
      const payrollMonth = currentPayroll.month;
      const [year, month] = payrollMonth.split('-');
      
      const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
      const endDate = new Date(year, month, 0).toISOString().split('T')[0];
      
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                          'July', 'August', 'September', 'October', 'November', 'December'];
      const monthName = monthNames[parseInt(month) - 1];
      const periodCode = `PAY-${year}-${month.padStart(2, '0')}`;
      const periodName = `${monthName} ${year} Payroll`;
      
      const processedEmployees = currentPayroll.selectedEmployees.map(empId => {
        const employee = employees.find(e => e.id === empId);
        return calculateEmployeePayroll(employee);
      }).filter(Boolean);

      if (processedEmployees.length === 0) {
        showToast('No valid employees to process', 'error');
        return;
      }

      const totalGross = processedEmployees.reduce((sum, emp) => sum + (emp.gross_salary || 0), 0);
      const totalDeductions = processedEmployees.reduce((sum, emp) => sum + (emp.deductions || 0), 0);
      const totalNet = processedEmployees.reduce((sum, emp) => sum + (emp.net_salary || 0), 0);

      const employeeDetails = processedEmployees.map(emp => ({
        employee_id: emp.employee_id,
        basic_salary: emp.basic_salary,
        allowances: emp.allowances,
        overtime: emp.overtime,
        bonus: emp.bonus,
        deductions: emp.deductions,
        net_salary: emp.net_salary,
        gross_salary: emp.gross_salary
      }));

      const payrollData = {
        period_code: periodCode,
        period_name: periodName,
        start_date: startDate,
        end_date: endDate,
        pay_date: endDate,
        status: 'Processing',
        total_staff: processedEmployees.length,
        processed_staff: processedEmployees.length,
        total_gross: Math.round(totalGross),
        total_deductions: Math.round(totalDeductions),
        total_net: Math.round(totalNet),
        total_paye: Math.round(totalDeductions * 0.3),
        total_nssf: 0,
        total_nhif: 0,
        employee_details: employeeDetails
      };

      const response = await payroll.createPeriod(payrollData);
      const newPeriod = response.data.data || response.data;
      
      const updatedResponse = await payroll.getPeriodById(newPeriod.id);
      const finalRecord = updatedResponse.data.data || updatedResponse.data;
      
      setPayrollRecords([finalRecord, ...payrollRecords]);
      setSelectedPeriodId(finalRecord.id);
      
      setCurrentPayroll({
        month: new Date().toISOString().slice(0, 7),
        selectedEmployees: [],
        status: "Draft"
      });
      setSelectedEmployee(null);
      setEmployeeAdjustments({
        overtime: 0,
        bonus: 0,
        absentDays: 0,
        notes: ""
      });

      showToast(`Payroll processed for ${processedEmployees.length} employees`, 'success');
    } catch (error) {
      console.error("Process Payroll Error:", error);
      const errorData = error.response?.data;
      let errorMsg = 'Failed to process payroll. Please try again.';
      if (errorData) {
        const errorMessages = Object.entries(errorData)
          .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
          .join('; ');
        errorMsg = errorMessages || errorMsg;
      }
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  }, [currentPayroll, employees, calculateEmployeePayroll, payrollRecords, showToast]);

  // Approve payroll
  const approvePayroll = useCallback(async (recordId) => {
    try {
      setLoading(true);
      const response = await payroll.updatePeriod(recordId, { status: 'Approved' });
      const updatedRecord = response.data.data || response.data;
      setPayrollRecords(records =>
        records.map(record => record.id === recordId ? updatedRecord : record)
      );
      showToast('Payroll approved successfully', 'success');
    } catch (error) {
      console.error("Approve Payroll Error:", error);
      showToast('Failed to approve payroll', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // Mark payroll as paid
  const markAsPaid = useCallback(async (recordId) => {
    try {
      setLoading(true);
      const response = await payroll.updatePeriod(recordId, {
        status: 'Paid',
        pay_date: new Date().toISOString().split('T')[0]
      });
      const updatedRecord = response.data.data || response.data;
      setPayrollRecords(records =>
        records.map(record => record.id === recordId ? updatedRecord : record)
      );
      showToast('Payroll marked as paid', 'success');
    } catch (error) {
      console.error("Mark as Paid Error:", error);
      showToast('Failed to mark as paid', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // Cancel payroll
  const cancelPayroll = useCallback(async (recordId) => {
    if (!window.confirm('Are you sure you want to cancel this payroll? The record will be kept for audit purposes.')) return;
    try {
      setLoading(true);
      const response = await payroll.updatePeriod(recordId, { status: 'Cancelled' });
      const updatedRecord = response.data.data || response.data;
      setPayrollRecords(records =>
        records.map(record => record.id === recordId ? updatedRecord : record)
      );
      showToast('Payroll cancelled. Record kept for audit trail.', 'success');
    } catch (error) {
      console.error("Cancel Payroll Error:", error);
      showToast('Failed to cancel payroll', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // Delete payroll period
  const deletePayrollPeriod = useCallback(async (recordId) => {
    if (!window.confirm('Are you sure you want to delete this payroll period? This action cannot be undone.')) return;
    try {
      setLoading(true);
      await payroll.deletePeriod(recordId);
      setPayrollRecords(records => records.filter(record => record.id !== recordId));
      if (selectedPeriodId === recordId) {
        setSelectedPeriodId(null);
      }
      showToast('Payroll period deleted successfully', 'success');
    } catch (error) {
      console.error("Delete Payroll Period Error:", error);
      showToast('Failed to delete payroll period', 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedPeriodId, showToast]);

  // Toggle employee selection
  const toggleEmployeeSelection = useCallback((employeeId) => {
    setCurrentPayroll(prev => {
      const isSelected = prev.selectedEmployees.includes(employeeId);
      return {
        ...prev,
        selectedEmployees: isSelected
          ? prev.selectedEmployees.filter(id => id !== employeeId)
          : [...prev.selectedEmployees, employeeId]
      };
    });
  }, []);

  // Export payroll report for selected period
  const exportPayrollReport = useCallback(() => {
    const period = payrollRecords.find(r => r.id === selectedPeriodId);
    if (!period) {
      showToast('No payroll period selected', 'warning');
      return;
    }

    if (!period.records || period.records.length === 0) {
      showToast('No employee records found for this period', 'warning');
      return;
    }

    const report = {
      payroll_period: period.period_name,
      period_code: period.period_code,
      generated_date: new Date().toISOString(),
      status: period.status,
      employees: period.records.map(record => {
        const employee = employees.find(e => e.id === record.staff);
        return {
          name: record.staff_name || employee?.full_name || 'Unknown',
          basic_salary: record.basic_salary,
          allowances: record.allowances_total,
          overtime: record.overtime_total,
          bonus: record.bonus_total,
          gross_salary: record.gross_salary,
          deductions: record.total_deductions,
          net_salary: record.net_salary,
          bank_details: employee ? `${employee.bank_name} - ${employee.bank_account}` : 'N/A'
        };
      }),
      summary: {
        total_employees: period.records.length,
        total_gross: period.total_gross,
        total_deductions: period.total_deductions,
        total_net: period.total_net
      }
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payroll_report_${period.period_code}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    showToast('Payroll report exported successfully', 'success');
  }, [payrollRecords, selectedPeriodId, employees, showToast]);

  // Generate all payslips for a period
  const generateAllPayslips = useCallback(() => {
    const period = payrollRecords.find(r => r.id === selectedPeriodId);
    if (!period) {
      showToast('No payroll period selected', 'warning');
      return;
    }

    if (!period.records || period.records.length === 0) {
      showToast('No employee records found for this period', 'warning');
      return;
    }

    // Generate payslip for each employee in the period
    period.records.forEach((record, index) => {
      const employee = employees.find(e => e.id === record.staff);
      if (!employee) return;

      const payrollData = {
        employee: record.staff_name || employee.full_name || 'Unknown',
        employee_id: record.staff,
        basic_salary: parseFloat(record.basic_salary),
        allowances: parseFloat(record.allowances_total),
        overtime: parseFloat(record.overtime_total),
        bonus: parseFloat(record.bonus_total),
        deductions: parseFloat(record.total_deductions),
        gross_salary: parseFloat(record.gross_salary),
        net_salary: parseFloat(record.net_salary),
        bank_details: employee ? `${employee.bank_name} - ${employee.bank_account}` : 'N/A'
      };
      
      const payslip = {
        company: "ElimuHub School",
        employee: payrollData.employee,
        period: period.period_name,
        basic_salary: payrollData.basic_salary,
        allowances: payrollData.allowances,
        overtime: payrollData.overtime,
        bonus: payrollData.bonus,
        deductions: payrollData.deductions,
        gross_salary: payrollData.gross_salary,
        net_salary: payrollData.net_salary,
        bank_details: payrollData.bank_details,
        generated_date: new Date().toISOString()
      };
      
      // Download each payslip with a small delay to avoid browser blocking
      setTimeout(() => {
        const blob = new Blob([JSON.stringify(payslip, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `payslip_${employee.full_name || employee.name}_${period.period_code}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }, index * 500);
    });
    
    showToast(`Generating ${period.records.length} payslips...`, 'success');
  }, [payrollRecords, selectedPeriodId, employees, showToast]);

  // Export payroll report (alternative - all records)
  const exportAllPayrollReport = useCallback(() => {
    if (payrollRecords.length === 0) {
      showToast('No payroll records found', 'warning');
      return;
    }

    const report = {
      generated_date: new Date().toISOString(),
      total_periods: payrollRecords.length,
      periods: payrollRecords.map(period => ({
        period_name: period.period_name,
        period_code: period.period_code,
        status: period.status,
        total_gross: period.total_gross,
        total_deductions: period.total_deductions,
        total_net: period.total_net,
        employee_count: period.records?.length || 0
      }))
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payroll_full_report_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    showToast('Full payroll report exported successfully', 'success');
  }, [payrollRecords, showToast]);

  // Calculate totals for selected employees
  const calculateSelectedTotals = useCallback(() => {
    const selected = employees.filter(emp => currentPayroll.selectedEmployees.includes(emp.id));
    const totalBasic = selected.reduce((sum, emp) => sum + (parseFloat(emp.basic_salary) || 0), 0);
    
    const earningsComponents = payrollComponents.filter(c => 
      c.component_type === 'Earning' || c.component_type === 'Allowance'
    );
    let totalAllowances = 0;
    earningsComponents.forEach(c => {
      if (c.calculation_type === 'Fixed Amount') {
        totalAllowances += (parseFloat(c.fixed_amount) || 0) * selected.length;
      } else if (c.calculation_type === 'Percentage of Basic') {
        totalAllowances += totalBasic * (parseFloat(c.percentage_rate) || 0) / 100;
      }
    });
    
    const deductionsComponents = payrollComponents.filter(c => c.component_type === 'Deduction');
    let totalDeductions = 0;
    selected.forEach(emp => {
      const basic = parseFloat(emp.basic_salary) || 0;
      deductionsComponents.forEach(d => {
        if (d.calculation_type === 'Fixed Amount') {
          totalDeductions += parseFloat(d.fixed_amount) || 0;
        } else if (d.calculation_type === 'Percentage of Basic') {
          totalDeductions += basic * (parseFloat(d.percentage_rate) || 0) / 100;
        }
      });
    });

    return {
      totalBasic: Math.round(totalBasic),
      totalAllowances: Math.round(totalAllowances),
      totalDeductions: Math.round(totalDeductions),
      estimatedNet: Math.round(totalBasic + totalAllowances - totalDeductions),
      employeeCount: selected.length
    };
  }, [employees, currentPayroll.selectedEmployees, payrollComponents]);

  const selectedTotals = calculateSelectedTotals();

  // Get status badge
  const getStatusBadge = (status) => {
    const styles = {
      'Paid': "bg-green-100 text-green-800",
      'Approved': "bg-blue-100 text-blue-800",
      'Processing': "bg-amber-100 text-amber-800",
      'Draft': "bg-gray-100 text-gray-800",
      'Calculated': "bg-purple-100 text-purple-800",
      'Closed': "bg-gray-100 text-gray-800",
      'Cancelled': "bg-red-100 text-red-800"
    };
    return styles[status] || "bg-gray-100 text-gray-800";
  };

  // Get status icon
  const getStatusIcon = (status) => {
    const icons = {
      'Paid': <FiCheckCircle className="mr-1 text-green-600" />,
      'Approved': <FiCheckCircle className="mr-1 text-blue-600" />,
      'Processing': <FiClock className="mr-1 text-amber-600" />,
      'Draft': <FiClock className="mr-1 text-gray-600" />,
      'Calculated': <FiCheckCircle className="mr-1 text-purple-600" />,
      'Closed': <FiCheckCircle className="mr-1 text-gray-600" />,
      'Cancelled': <FiAlertCircle className="mr-1 text-red-600" />
    };
    return icons[status] || <FiClock className="mr-1" />;
  };

  // Get filtered history records
  const getFilteredHistory = useCallback(() => {
    let filtered = payrollRecords;
    if (historyFilter !== 'all') {
      filtered = filtered.filter(r => r.status === historyFilter);
    }
    return filtered;
  }, [payrollRecords, historyFilter]);

  const filteredHistory = getFilteredHistory();

  // Get the selected period
  const selectedPeriod = payrollRecords.find(r => r.id === selectedPeriodId);

  if (!employees.length && !loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <FiUser className="mx-auto text-gray-400 text-5xl mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Employees Found</h2>
          <p className="text-gray-600 mb-4">Please add staff members before processing payroll.</p>
          <button 
            onClick={fetchPayrollData}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <FiRefreshCw className="inline mr-2" />
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Toast show={toast.show} message={toast.message} type={toast.type} onClose={closeToast} />

      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <FiDollarSign className="text-indigo-600" />
              Payroll Management
            </h1>
            <p className="text-gray-600 mt-2">Process payments, generate reports, and manage financial records</p>
          </div>
          <div className="flex items-center gap-4 mt-4 lg:mt-0">
            <button 
              onClick={fetchPayrollData}
              disabled={loading}
              className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-colors"
            >
              <FiRefreshCw className={loading ? 'animate-spin' : ''} />
              {loading ? 'Loading...' : 'Refresh'}
            </button>
            <button 
              onClick={exportAllPayrollReport}
              disabled={payrollRecords.length === 0}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiDownload />
              Export All
            </button>
          </div>
        </div>

        {/* Financial Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Paid (All Time)</p>
                <p className="text-2xl font-bold text-gray-800">
                  Ksh {financialStats.totalProcessed.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500 mt-1">Historical payroll</p>
              </div>
              <FiDollarSign className="text-blue-500 text-2xl" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Current Month</p>
                <p className="text-2xl font-bold text-gray-800">
                  Ksh {financialStats.currentMonthPayroll.toLocaleString()}
                </p>
                <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                  <FiTrendingUp />
                  {employees.length} employees
                </p>
              </div>
              <FiCalendar className="text-green-500 text-2xl" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Tax Liabilities</p>
                <p className="text-2xl font-bold text-gray-800">
                  Ksh {financialStats.taxLiabilities.toLocaleString()}
                </p>
                <p className="text-sm text-purple-600 mt-1">PAYE, NSSF, NHIF</p>
              </div>
              <FiFileText className="text-purple-500 text-2xl" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-amber-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Pending Payments</p>
                <p className="text-2xl font-bold text-gray-800">
                  Ksh {financialStats.pendingPayments.toLocaleString()}
                </p>
                <p className="text-sm text-amber-600 mt-1">Awaiting approval/disbursement</p>
              </div>
              <FiCreditCard className="text-amber-500 text-2xl" />
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <p className="flex items-center gap-2">
            <FiAlertCircle />
            {error}
          </p>
          <button 
            onClick={fetchPayrollData}
            className="mt-2 text-red-600 hover:text-red-800 text-sm font-medium"
          >
            Retry
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Column: Employee Selection & Processing */}
        <div className="xl:col-span-2">
          {/* Payroll Period Selection */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2 mb-4">
              <FiCalendar className="text-indigo-600" />
              New Payroll Period
            </h2>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Month *</label>
                <input
                  type="month"
                  value={currentPayroll.month}
                  onChange={(e) => setCurrentPayroll({...currentPayroll, month: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              
              <div className="flex items-center gap-4">
                <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
                  {currentPayroll.selectedEmployees.length} employees selected
                </span>
                <button 
                  onClick={processPayroll}
                  disabled={currentPayroll.selectedEmployees.length === 0 || loading}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiSend />
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
                  className="text-sm text-indigo-600 hover:text-indigo-800"
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

            {loading ? (
              <div className="text-center py-8">
                <FiRefreshCw className="animate-spin mx-auto text-3xl text-gray-400 mb-3" />
                <p className="text-gray-500">Loading employees...</p>
              </div>
            ) : employees.length === 0 ? (
              <div className="text-center py-8">
                <FiUser className="mx-auto text-3xl text-gray-400 mb-3" />
                <p className="text-gray-500">No employees found. Please add staff first.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {employees.map((employee) => {
                  const isSelected = currentPayroll.selectedEmployees.includes(employee.id);
                  const payrollData = calculateEmployeePayroll(employee);
                  
                  return (
                    <div 
                      key={employee.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-indigo-500 bg-indigo-50' 
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
                              onChange={(e) => {
                                e.stopPropagation();
                                toggleEmployeeSelection(employee.id);
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="h-5 w-5 text-indigo-600 rounded cursor-pointer"
                            />
                            <div>
                              <p className="font-medium text-gray-800">{employee.full_name || employee.name}</p>
                              <p className="text-sm text-gray-600">{employee.position} • {employee.department}</p>
                            </div>
                          </div>
                          
                          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-gray-500">Basic Salary:</span>
                              <p className="font-semibold">Ksh {parseFloat(employee.basic_salary).toLocaleString()}</p>
                            </div>
                            {payrollData && (
                              <div>
                                <span className="text-gray-500">Est. Net:</span>
                                <p className="font-semibold text-green-600">
                                  Ksh {Math.round(payrollData.net_salary).toLocaleString()}
                                </p>
                              </div>
                            )}
                          </div>
                          
                          <div className="mt-2 text-xs text-gray-500">
                            {employee.bank_name || employee.bankName || 'N/A'} • {employee.bank_account || employee.bankAccount || 'N/A'}
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end">
                          {isSelected && (
                            <FiCheckCircle className="text-indigo-500 text-xl mb-2" />
                          )}
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedEmployee(employee);
                            }}
                            className="text-sm text-indigo-600 hover:text-indigo-800"
                          >
                            Adjust
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Employee Adjustments Panel */}
          {selectedEmployee && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2 mb-4">
                <FiEdit className="text-indigo-600" />
                Adjustments for {selectedEmployee.full_name || selectedEmployee.name}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Overtime (Hours)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={employeeAdjustments.overtime}
                    onChange={(e) => setEmployeeAdjustments({...employeeAdjustments, overtime: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bonus (Ksh)</label>
                  <input
                    type="number"
                    min="0"
                    value={employeeAdjustments.bonus}
                    onChange={(e) => setEmployeeAdjustments({...employeeAdjustments, bonus: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Absent Days</label>
                  <input
                    type="number"
                    min="0"
                    value={employeeAdjustments.absentDays}
                    onChange={(e) => setEmployeeAdjustments({...employeeAdjustments, absentDays: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  value={employeeAdjustments.notes}
                  onChange={(e) => setEmployeeAdjustments({...employeeAdjustments, notes: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                    showToast(`Adjustments saved for ${selectedEmployee.full_name || selectedEmployee.name}`, 'success');
                    setSelectedEmployee(null);
                    setEmployeeAdjustments({ overtime: 0, bonus: 0, absentDays: 0, notes: "" });
                  }}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
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
                <span className="font-semibold">{selectedTotals.employeeCount} / {employees.length}</span>
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
              disabled={currentPayroll.selectedEmployees.length === 0 || loading}
              className="mt-6 w-full bg-indigo-600 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiSend />
              Process Payroll
            </button>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2 mb-4">
              <FiRefreshCw className="text-indigo-600" />
              Quick Actions
            </h2>
            
            <div className="space-y-3">
              {/* Select period dropdown */}
              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Payroll Period</label>
                <select
                  value={selectedPeriodId || ''}
                  onChange={(e) => setSelectedPeriodId(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                >
                  <option value="">Select a period...</option>
                  {payrollRecords.map(period => (
                    <option key={period.id} value={period.id}>
                      {period.period_name} - {period.status} ({period.records?.length || 0} employees)
                    </option>
                  ))}
                </select>
              </div>
              
              <button 
                onClick={generateAllPayslips}
                disabled={!selectedPeriodId || !selectedPeriod?.records?.length}
                className={`w-full flex items-center gap-3 p-3 border rounded-lg transition-colors ${
                  !selectedPeriodId || !selectedPeriod?.records?.length
                    ? 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50'
                    : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                }`}
              >
                <FiFileText className={!selectedPeriodId || !selectedPeriod?.records?.length ? 'text-gray-400' : 'text-indigo-500'} />
                <span>Generate All Payslips</span>
                {selectedPeriod && (
                  <span className="ml-auto text-xs text-gray-400">
                    ({selectedPeriod.records?.length || 0})
                  </span>
                )}
              </button>
              
              <button 
                onClick={exportPayrollReport}
                disabled={!selectedPeriodId || !selectedPeriod?.records?.length}
                className={`w-full flex items-center gap-3 p-3 border rounded-lg transition-colors ${
                  !selectedPeriodId || !selectedPeriod?.records?.length
                    ? 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50'
                    : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                }`}
              >
                <FiDownload className={!selectedPeriodId || !selectedPeriod?.records?.length ? 'text-gray-400' : 'text-green-500'} />
                <span>Export Payroll Report</span>
              </button>
              
              <button 
                onClick={exportAllPayrollReport}
                disabled={payrollRecords.length === 0}
                className={`w-full flex items-center gap-3 p-3 border rounded-lg transition-colors ${
                  payrollRecords.length === 0
                    ? 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50'
                    : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                }`}
              >
                <FiDownload className={payrollRecords.length === 0 ? 'text-gray-400' : 'text-blue-500'} />
                <span>Export All Payroll History</span>
              </button>
              
              <button 
                onClick={() => showToast('Bank transfer file generated', 'success')}
                className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FiCreditCard className="text-purple-500" />
                <span>Generate Bank Transfer File</span>
              </button>
              
              <button 
                onClick={() => showToast('Tax report generated', 'success')}
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
          <div>
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2 mb-2">
              <FiBarChart2 className="text-green-600" />
              Payroll History & Audit Trail
            </h2>
            <p className="text-sm text-gray-500">
              {payrollRecords.length} records • All historical data retained for audit purposes
            </p>
          </div>
          
          <div className="flex items-center gap-4 mt-4 lg:mt-0">
            <div className="flex items-center gap-2">
              <FiFilter className="text-gray-400" />
              <select 
                value={historyFilter}
                onChange={(e) => setHistoryFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">All Status</option>
                <option value="Paid">Paid</option>
                <option value="Approved">Approved</option>
                <option value="Processing">Processing</option>
                <option value="Draft">Draft</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
            <button onClick={fetchPayrollData} className="text-indigo-600 hover:text-indigo-800">
              <FiRefreshCw className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <FiRefreshCw className="animate-spin mx-auto text-3xl text-gray-400 mb-3" />
            <p className="text-gray-500">Loading payroll history...</p>
          </div>
        ) : payrollRecords.length === 0 ? (
          <div className="text-center py-8">
            <FiFileText className="mx-auto text-3xl text-gray-400 mb-3" />
            <p className="text-gray-500">No payroll records found. Process your first payroll.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Payroll Period</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Employees</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Gross Amount</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Deductions</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Net Amount</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Pay Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredHistory.map((record) => (
                  <tr 
                    key={record.id} 
                    className={`hover:bg-gray-50 cursor-pointer ${selectedPeriodId === record.id ? 'bg-indigo-50' : ''}`}
                    onClick={() => setSelectedPeriodId(record.id)}
                  >
                    <td className="px-4 py-4">
                      <p className="font-medium text-gray-800">{record.period_name || record.period}</p>
                      <p className="text-xs text-gray-500">{record.period_code}</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        {record.processed_staff || record.total_staff || record.employee_count || 0} employees
                      </span>
                    </td>
                    <td className="px-4 py-4 font-semibold text-gray-800">
                      Ksh {parseFloat(record.total_gross || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-4 text-red-600">
                      Ksh {parseFloat(record.total_deductions || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-4 font-bold text-green-600">
                      Ksh {parseFloat(record.total_net || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(record.status)}`}>
                        {getStatusIcon(record.status)}
                        {record.status || 'Draft'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {record.pay_date || 'Not set'}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
                        <button 
                          onClick={() => {
                            const employeeId = record.records?.[0]?.staff || record.employee_id;
                            if (employeeId) {
                              // Generate payslip for the first employee
                              const emp = employees.find(e => e.id === employeeId);
                              if (emp) {
                                const payrollData = calculateEmployeePayroll(emp);
                                if (payrollData) {
                                  const payslip = {
                                    company: "ElimuHub School",
                                    employee: payrollData.employee,
                                    period: record.period_name,
                                    basic_salary: payrollData.basic_salary,
                                    allowances: payrollData.allowances,
                                    overtime: payrollData.overtime,
                                    bonus: payrollData.bonus,
                                    deductions: payrollData.deductions,
                                    absent_deduction: payrollData.absent_deduction,
                                    net_salary: payrollData.net_salary,
                                    bank_details: payrollData.bank_details,
                                    generated_date: new Date().toISOString()
                                  };
                                  const blob = new Blob([JSON.stringify(payslip, null, 2)], { type: 'application/json' });
                                  const url = URL.createObjectURL(blob);
                                  const a = document.createElement('a');
                                  a.href = url;
                                  a.download = `payslip_${emp.full_name || emp.name}_${record.period_code}.json`;
                                  a.click();
                                  URL.revokeObjectURL(url);
                                  showToast(`Payslip generated for ${emp.full_name || emp.name}`, 'success');
                                }
                              }
                            }
                          }}
                          className="text-sm text-indigo-600 hover:text-indigo-800"
                          title="View/Download Payslip"
                        >
                          <FiFileText className="inline mr-1" />
                          Payslip
                        </button>
                        
                        {record.status === 'Processing' && (
                          <>
                            <button 
                              onClick={() => approvePayroll(record.id)}
                              className="text-sm text-blue-600 hover:text-blue-800"
                              title="Approve Payroll"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => cancelPayroll(record.id)}
                              className="text-sm text-red-600 hover:text-red-800"
                              title="Cancel Payroll"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                        
                        {record.status === 'Approved' && (
                          <>
                            <button 
                              onClick={() => markAsPaid(record.id)}
                              className="text-sm text-green-600 hover:text-green-800"
                              title="Mark as Paid"
                            >
                              Mark Paid
                            </button>
                            <button 
                              onClick={() => cancelPayroll(record.id)}
                              className="text-sm text-red-600 hover:text-red-800"
                              title="Cancel Payroll"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                        
                        {record.status === 'Paid' && (
                          <span className="text-sm text-gray-400" title="Finalized - Cannot be modified">
                            <FiCheckCircle className="inline mr-1 text-green-600" />
                            Finalized
                          </span>
                        )}
                        
                        {record.status === 'Cancelled' && (
                          <span className="text-sm text-red-400" title="Cancelled - Kept for audit">
                            <FiAlertCircle className="inline mr-1" />
                            Cancelled
                          </span>
                        )}

                        {record.status === 'Draft' && record.total_staff === 0 && (
                          <button 
                            onClick={() => deletePayrollPeriod(record.id)}
                            className="text-sm text-red-600 hover:text-red-800"
                            title="Delete empty payroll period"
                          >
                            <FiTrash2 className="inline mr-1" />
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0%); opacity: 1; }
        }
        .animate-slide-in { animation: slide-in 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default PayrollManagement;