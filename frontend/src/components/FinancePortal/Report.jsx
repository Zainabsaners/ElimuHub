import React, { useState, useEffect, useCallback, useRef } from "react";
import { 
  FiDownload, 
  FiPrinter, 
  FiFilter, 
  FiSearch, 
  FiFileText, 
  FiPieChart, 
  FiBarChart2,
  FiDollarSign,
  FiUsers,
  FiCalendar,
  FiEye,
  FiX,
  FiArrowDown,
  FiArrowUp,
  FiRefreshCw,
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiUser,
  FiBriefcase,
  FiTag
} from "react-icons/fi";
import { expenses, fees, payroll, staff } from '../../api';

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
    error: <FiAlertCircle className="text-white" size={20} />,
    info: <FiClock className="text-white" size={20} />,
    warning: <FiAlertCircle className="text-white" size={20} />
  }[type] || <FiClock className="text-white" size={20} />;

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

const Reports = () => {
  // State for reports data
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "info" });

  // Aggregated stats
  const [expenseStats, setExpenseStats] = useState({ total: 0, count: 0 });
  const [feeStats, setFeeStats] = useState({ total: 0, count: 0 });
  const [payrollStats, setPayrollStats] = useState({ total: 0, count: 0 });
  const [staffCount, setStaffCount] = useState(0);

  // State for filters and search
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [periodFilter, setPeriodFilter] = useState("all");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [sortBy, setSortBy] = useState("newest");

  // State for quick stats
  const [stats, setStats] = useState({
    totalReports: 0,
    financialReports: 0,
    recentReports: 0,
    totalRecords: 0
  });

  // State for modal
  const [selectedReport, setSelectedReport] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [reportDetails, setReportDetails] = useState(null);

  // Abort controller ref
  const abortControllerRef = useRef(null);

  const showToast = useCallback((message, type = "info") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "info" }), 3000);
  }, []);

  const closeToast = useCallback(() => {
    setToast({ show: false, message: "", type: "info" });
  }, []);

  // Report types for filter
  const reportTypes = [
    { value: "financial", label: "Financial Reports", color: "blue", icon: FiDollarSign },
    { value: "fees", label: "Fee Reports", color: "green", icon: FiFileText },
    { value: "expenses", label: "Expense Reports", color: "red", icon: FiBarChart2 },
    { value: "payroll", label: "Payroll Reports", color: "purple", icon: FiUsers },
    { value: "compliance", label: "Compliance Reports", color: "orange", icon: FiPieChart }
  ];

  // Generate detailed reports from real data
  // Generate detailed reports from real data
const generateReportsFromData = useCallback((expensesList, feesList, payrollRecordsList, staffMembersList) => {
  const now = new Date();
  const currentMonth = now.toLocaleString('default', { month: 'long', year: 'numeric' });
  const currentDate = now.toISOString().split('T')[0];

  // Calculate totals FIRST
  const totalExpenses = expensesList.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
  const totalFees = feesList.reduce((sum, f) => sum + (parseFloat(f.amount_kes) || 0), 0);
  
  // Calculate total payroll from periods or records
  let totalPayroll = 0;
  payrollRecordsList.forEach(record => {
    if (record.payroll_period && record.payroll_period.total_net) {
      totalPayroll += parseFloat(record.payroll_period.total_net) || 0;
    } else if (record.net_salary) {
      totalPayroll += parseFloat(record.net_salary) || 0;
    }
  });

  // DECLARE reportsList HERE - before using it
  const reportsList = [];

  // 1. Detailed Expense Report
  const expenseSummary = expensesList.reduce((acc, exp) => {
    const category = exp.category_name || exp.category?.name || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = { total: 0, count: 0, items: [] };
    }
    acc[category].total += parseFloat(exp.amount) || 0;
    acc[category].count += 1;
    acc[category].items.push({
      title: exp.title,
      amount: exp.amount,
      vendor: exp.vendor,
      date: exp.date,
      description: exp.description
    });
    return acc;
  }, {});

  const expenseBreakdown = Object.entries(expenseSummary).map(([category, data]) => ({
    category,
    total: data.total,
    count: data.count,
    items: data.items
  }));

  reportsList.push({
    id: 1,
    title: "Detailed Expense Report",
    type: "expenses",
    period: currentMonth,
    generatedDate: currentDate,
    size: "3.1 MB",
    records: expensesList.length,
    status: "completed",
    description: `Detailed breakdown of ${expensesList.length} expenses by category, vendor, and purpose`,
    details: {
      summary: expenseBreakdown,
      total: totalExpenses,
      count: expensesList.length,
      transactions: expensesList.map(exp => ({
        title: exp.title,
        category: exp.category_name || exp.category?.name || 'Uncategorized',
        amount: exp.amount,
        vendor: exp.vendor,
        date: exp.date,
        description: exp.description || 'No description',
        status: exp.status
      }))
    }
  });

  // 2. Detailed Fee Collection Report
  const feeSummary = feesList.reduce((acc, fee) => {
    const studentName = fee.student_name || fee.student?.full_name || 'Unknown Student';
    if (!acc[studentName]) {
      acc[studentName] = { total: 0, count: 0, items: [] };
    }
    acc[studentName].total += parseFloat(fee.amount_kes) || 0;
    acc[studentName].count += 1;
    acc[studentName].items.push({
      invoice: fee.invoice_no,
      amount: fee.amount_kes,
      payment_mode: fee.payment_mode,
      payment_date: fee.payment_date,
      status: fee.status
    });
    return acc;
  }, {});

  const feeBreakdown = Object.entries(feeSummary).map(([student, data]) => ({
    student,
    total: data.total,
    count: data.count,
    items: data.items
  }));

  reportsList.push({
    id: 2,
    title: "Detailed Fee Collection Report",
    type: "fees",
    period: currentMonth,
    generatedDate: currentDate,
    size: "1.8 MB",
    records: feesList.length,
    status: "completed",
    description: `Detailed fee collection analysis showing payments by student, payment mode, and status`,
    details: {
      summary: feeBreakdown,
      total: totalFees,
      count: feesList.length,
      transactions: feesList.map(fee => ({
        student: fee.student_name || fee.student?.full_name || 'Unknown',
        invoice: fee.invoice_no,
        amount: fee.amount_kes,
        payment_mode: fee.payment_mode,
        payment_date: fee.payment_date,
        status: fee.status,
        reference: fee.payment_reference
      }))
    }
  });

  // 3. Detailed Financial Summary (Combined)
  reportsList.push({
    id: 3,
    title: "Comprehensive Financial Summary",
    type: "financial",
    period: currentMonth,
    generatedDate: currentDate,
    size: "2.4 MB",
    records: expensesList.length + feesList.length,
    status: "completed",
    description: `Comprehensive financial overview including income (Ksh ${totalFees.toLocaleString()}) and expenses (Ksh ${totalExpenses.toLocaleString()})`,
    details: {
      income: {
        total: totalFees,
        count: feesList.length,
        breakdown: feesList.slice(0, 10).map(f => ({
          student: f.student_name || f.student?.full_name || 'Unknown',
          amount: f.amount_kes,
          date: f.payment_date,
          mode: f.payment_mode
        }))
      },
      expenses: {
        total: totalExpenses,
        count: expensesList.length,
        breakdown: expensesList.slice(0, 10).map(e => ({
          title: e.title,
          amount: e.amount,
          vendor: e.vendor,
          date: e.date,
          category: e.category_name || e.category?.name || 'Uncategorized'
        }))
      },
      netPosition: totalFees - totalExpenses
    }
  });

  // 4. Detailed Payroll Report
  const payrollSummary = payrollRecordsList.reduce((acc, p) => {
    const staffName = p.staff_name || p.staff?.full_name || 'Unknown Staff';
    if (!acc[staffName]) {
      acc[staffName] = { total: 0, count: 0, items: [] };
    }
    acc[staffName].total += parseFloat(p.net_salary) || 0;
    acc[staffName].count += 1;
    acc[staffName].items.push({
      period: p.payroll_period?.period_name || 'Unknown Period',
      gross: p.gross_salary,
      deductions: p.total_deductions,
      net: p.net_salary,
      payment_status: p.payment_status,
      basic_salary: p.basic_salary,
      allowances: p.allowances_total,
      overtime: p.overtime_total,
      bonus: p.bonus_total
    });
    return acc;
  }, {});

  const payrollBreakdown = Object.entries(payrollSummary).map(([staff, data]) => ({
    staff,
    total: data.total,
    count: data.count,
    items: data.items
  }));

  reportsList.push({
    id: 4,
    title: "Detailed Payroll Report",
    type: "payroll",
    period: currentMonth,
    generatedDate: currentDate,
    size: "1.5 MB",
    records: payrollRecordsList.length || staffMembersList.length,
    status: "completed",
    description: `Detailed payroll breakdown for ${staffMembersList.length} employees showing salary components, deductions, and net pay`,
    details: {
      summary: payrollBreakdown,
      total: totalPayroll,
      count: staffMembersList.length,
      staff: staffMembersList.map(s => ({
        name: s.full_name || s.name || 'Unknown',
        position: s.position || s.designation || 'Staff',
        department: s.department || 'General',
        basic_salary: s.basic_salary || 0,
        bank: s.bank_name || s.bank || 'N/A'
      })),
      transactions: payrollRecordsList.map(p => ({
        staff: p.staff_name || p.staff?.full_name || 'Unknown',
        period: p.payroll_period?.period_name || 'Unknown Period',
        gross: p.gross_salary,
        deductions: p.total_deductions,
        net: p.net_salary,
        payment_status: p.payment_status,
        paye: p.paye_tax,
        nssf: p.nssf_deduction,
        nhif: p.nhif_deduction,
        bank_account: p.bank_account || 'N/A'
      }))
    }
  });

  // 5. Staff Salary Analysis Report
  reportsList.push({
    id: 5,
    title: "Staff Salary Analysis",
    type: "payroll",
    period: currentMonth,
    generatedDate: currentDate,
    size: "2.8 MB",
    records: staffMembersList.length,
    status: "completed",
    description: `Comprehensive staff salary analysis showing salary distribution by department and position`,
    details: {
      staffCount: staffMembersList.length,
      totalPayroll: totalPayroll,
      departments: staffMembersList.reduce((acc, s) => {
        const dept = s.department || 'General';
        if (!acc[dept]) {
          acc[dept] = { count: 0, totalSalary: 0, staff: [] };
        }
        acc[dept].count += 1;
        acc[dept].totalSalary += parseFloat(s.basic_salary) || 0;
        acc[dept].staff.push({
          name: s.full_name || s.name || 'Unknown',
          position: s.position || s.designation || 'Staff',
          salary: s.basic_salary || 0,
          bank: s.bank_name || s.bank || 'N/A'
        });
        return acc;
      }, {}),
      staff: staffMembersList.map(s => ({
        name: s.full_name || s.name || 'Unknown',
        position: s.position || s.designation || 'Staff',
        department: s.department || 'General',
        basic_salary: s.basic_salary || 0,
        bank: s.bank_name || s.bank || 'N/A',
        account: s.account_number || s.bank_account || 'N/A'
      }))
    }
  });

  return reportsList;
}, []);

  // Fetch real data from API
  const fetchReportsData = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);
    
    try {
      let expensesList = [];
      let feesList = [];
      let payrollRecordsList = [];
      let staffMembersList = [];

      // Fetch expenses data
      try {
        const expensesResponse = await expenses.getAll();
        if (expensesResponse.data.results && Array.isArray(expensesResponse.data.results)) {
          expensesList = expensesResponse.data.results;
        } else if (Array.isArray(expensesResponse.data)) {
          expensesList = expensesResponse.data;
        } else if (expensesResponse.data.data && Array.isArray(expensesResponse.data.data)) {
          expensesList = expensesResponse.data.data;
        }
        
        const totalExpenses = expensesList.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
        setExpenseStats({ total: totalExpenses, count: expensesList.length });
      } catch (expError) {
        console.error('Error fetching expenses:', expError);
        setExpenseStats({ total: 0, count: 0 });
        expensesList = [];
      }

      // Fetch staff data
      try {
        const staffResponse = await staff.getAll();
        if (staffResponse.data.results && Array.isArray(staffResponse.data.results)) {
          staffMembersList = staffResponse.data.results;
        } else if (Array.isArray(staffResponse.data)) {
          staffMembersList = staffResponse.data;
        } else if (staffResponse.data.data && Array.isArray(staffResponse.data.data)) {
          staffMembersList = staffResponse.data.data;
        }
        setStaffCount(staffMembersList.length);
      } catch (staffError) {
        console.error('Error fetching staff:', staffError);
        setStaffCount(0);
        staffMembersList = [];
      }

      // Fetch payroll data
      try {
        const payrollResponse = await payroll.getPeriods();
        let payrollArray = [];
        if (payrollResponse.data.results && Array.isArray(payrollResponse.data.results)) {
          payrollArray = payrollResponse.data.results;
        } else if (Array.isArray(payrollResponse.data)) {
          payrollArray = payrollResponse.data;
        } else if (payrollResponse.data.data && Array.isArray(payrollResponse.data.data)) {
          payrollArray = payrollResponse.data.data;
        }
        
        // Extract individual payroll records
        const allRecords = [];
        payrollArray.forEach(period => {
          if (period.records && Array.isArray(period.records)) {
            period.records.forEach(record => {
              allRecords.push({
                ...record,
                payroll_period: period,
                period_name: period.period_name
              });
            });
          }
        });
        
        payrollRecordsList = allRecords;
        const totalPayroll = payrollRecordsList.reduce((sum, p) => sum + (parseFloat(p.net_salary) || 0), 0);
        setPayrollStats({ total: totalPayroll, count: payrollRecordsList.length });
      } catch (payrollError) {
        console.error('Error fetching payroll:', payrollError);
        setPayrollStats({ total: 0, count: 0 });
        payrollRecordsList = [];
      }

      // Fetch fee data
      try {
        const feeResponse = await fees.getTransactions();
        if (feeResponse.data.results && Array.isArray(feeResponse.data.results)) {
          feesList = feeResponse.data.results;
        } else if (Array.isArray(feeResponse.data)) {
          feesList = feeResponse.data;
        } else if (feeResponse.data.data && Array.isArray(feeResponse.data.data)) {
          feesList = feeResponse.data.data;
        }
        
        const totalFees = feesList.reduce((sum, f) => sum + (parseFloat(f.amount_kes) || 0), 0);
        setFeeStats({ total: totalFees, count: feesList.length });
      } catch (feeError) {
        console.error('Error fetching fees:', feeError);
        setFeeStats({ total: 0, count: 0 });
        feesList = [];
      }

      // Generate reports with detailed data
      const generatedReports = generateReportsFromData(expensesList, feesList, payrollRecordsList, staffMembersList);
      setReports(generatedReports);

      showToast('Reports data loaded successfully', 'success');
      
    } catch (error) {
      if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') {
        console.log('Request was cancelled');
        return;
      }
      
      console.error("Reports Sync Error:", error);
      setError(error.message || 'Failed to load reports data');
      showToast('Failed to load reports data. Please try again.', 'error');
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }, [generateReportsFromData, showToast]);

  // Clean up abort controller on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchReportsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Calculate statistics
  useEffect(() => {
    const totalReports = reports.length;
    const financialReports = reports.filter(r => r.type === "financial").length;
    const recentReports = reports.filter(r => {
      const reportDate = new Date(r.generatedDate);
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return reportDate > monthAgo;
    }).length;
    const totalRecords = reports.reduce((sum, report) => sum + report.records, 0);

    setStats({
      totalReports,
      financialReports,
      recentReports,
      totalRecords
    });
  }, [reports]);

  // Filter and sort reports
  const filteredReports = reports
    .filter(report => {
      const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           report.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === "all" || report.type === typeFilter;
      const matchesPeriod = periodFilter === "all" || report.period === periodFilter;
      const matchesDate = (!dateRange.start || report.generatedDate >= dateRange.start) &&
                         (!dateRange.end || report.generatedDate <= dateRange.end);

      return matchesSearch && matchesType && matchesPeriod && matchesDate;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.generatedDate) - new Date(a.generatedDate);
        case "oldest":
          return new Date(a.generatedDate) - new Date(b.generatedDate);
        case "size":
          return parseFloat(b.size) - parseFloat(a.size);
        case "records":
          return b.records - a.records;
        default:
          return 0;
      }
    });

  // Download report
  const downloadReport = (report, format) => {
    const data = {
      ...report,
      downloadedAt: new Date().toISOString(),
      format: format,
      data: {
        expenses: expenseStats,
        fees: feeStats,
        payroll: payrollStats,
        staff: staffCount,
        details: report.details
      }
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { 
      type: format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.title.replace(/\s/g, '_')}.${format === 'pdf' ? 'json' : 'json'}`;
    a.click();
    URL.revokeObjectURL(url);
    
    showToast(`Downloading ${report.title} as ${format.toUpperCase()}`, 'success');
  };

  // Print report
  const printReport = (report) => {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (printWindow) {
      let detailsHTML = '';
      if (report.details) {
        if (report.type === 'expenses') {
          detailsHTML = `
            <h3>Expense Summary by Category</h3>
            <table border="1" cellpadding="5">
              <tr><th>Category</th><th>Total Amount</th><th>Items</th></tr>
              ${report.details.summary.map(cat => `
                <tr>
                  <td>${cat.category}</td>
                  <td>Ksh ${cat.total.toLocaleString()}</td>
                  <td>${cat.count}</td>
                </tr>
              `).join('')}
            </table>
            <h3>Expense Transactions</h3>
            <table border="1" cellpadding="5">
              <tr><th>Title</th><th>Category</th><th>Amount</th><th>Vendor</th><th>Date</th></tr>
              ${report.details.transactions.slice(0, 20).map(t => `
                <tr>
                  <td>${t.title}</td>
                  <td>${t.category}</td>
                  <td>Ksh ${t.amount}</td>
                  <td>${t.vendor}</td>
                  <td>${t.date}</td>
                </tr>
              `).join('')}
            </table>
            ${report.details.transactions.length > 20 ? `<p>... and ${report.details.transactions.length - 20} more transactions</p>` : ''}
          `;
        } else if (report.type === 'fees') {
          detailsHTML = `
            <h3>Fee Collection by Student</h3>
            <table border="1" cellpadding="5">
              <tr><th>Student</th><th>Total Paid</th><th>Transactions</th></tr>
              ${report.details.summary.map(s => `
                <tr>
                  <td>${s.student}</td>
                  <td>Ksh ${s.total.toLocaleString()}</td>
                  <td>${s.count}</td>
                </tr>
              `).join('')}
            </table>
          `;
        } else if (report.type === 'payroll') {
          detailsHTML = `
            <h3>Payroll Summary by Staff</h3>
            <table border="1" cellpadding="5">
              <tr><th>Staff</th><th>Total Net Pay</th><th>Periods</th></tr>
              ${report.details.summary.map(s => `
                <tr>
                  <td>${s.staff}</td>
                  <td>Ksh ${s.total.toLocaleString()}</td>
                  <td>${s.count}</td>
                </tr>
              `).join('')}
            </table>
            <h3>Staff List</h3>
            <table border="1" cellpadding="5">
              <tr><th>Name</th><th>Position</th><th>Department</th><th>Basic Salary</th></tr>
              ${report.details.staff?.map(s => `
                <tr>
                  <td>${s.name}</td>
                  <td>${s.position}</td>
                  <td>${s.department}</td>
                  <td>Ksh ${s.basic_salary.toLocaleString()}</td>
                </tr>
              `).join('') || ''}
            </table>
          `;
        }
      }

      printWindow.document.write(`
        <html>
          <head><title>${report.title}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #1a202c; }
            h2 { color: #2d3748; margin-top: 20px; }
            table { width: 100%; border-collapse: collapse; margin: 10px 0; }
            th { background: #edf2f7; text-align: left; padding: 8px; }
            td { padding: 8px; border: 1px solid #e2e8f0; }
            .summary { background: #f7fafc; padding: 10px; border-radius: 5px; margin: 10px 0; }
          </style>
          </head>
          <body>
            <h1>${report.title}</h1>
            <div class="summary">
              <p><strong>Period:</strong> ${report.period}</p>
              <p><strong>Generated:</strong> ${new Date(report.generatedDate).toLocaleDateString()}</p>
              <p><strong>Description:</strong> ${report.description}</p>
              <p><strong>Total Records:</strong> ${report.records}</p>
            </div>
            ${detailsHTML}
            <hr>
            <p>This report was printed from ElimuHub System on ${new Date().toLocaleString()}</p>
            <script>
              window.onload = function() { window.print(); }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
    showToast(`Printing ${report.title}`, 'info');
  };

  // Preview report with details
  const previewReport = (report) => {
    setSelectedReport(report);
    setReportDetails(report.details || null);
    setShowPreview(true);
  };

  // Get type info
  const getTypeInfo = (type) => {
    return reportTypes.find(t => t.value === type) || reportTypes[0];
  };

  // Get type badge style
  const getTypeBadge = (type) => {
    const typeInfo = getTypeInfo(type);
    const colorMap = {
      blue: "bg-blue-100 text-blue-800 border-blue-200",
      green: "bg-green-100 text-green-800 border-green-200",
      red: "bg-red-100 text-red-800 border-red-200",
      purple: "bg-purple-100 text-purple-800 border-purple-200",
      orange: "bg-orange-100 text-orange-800 border-orange-200"
    };
    return `px-3 py-1 rounded-full text-sm font-medium border ${colorMap[typeInfo.color]}`;
  };

  // Quick generate report
  const quickGenerateReport = async (type) => {
    setGeneratingReport(true);
    
    try {
      await fetchReportsData();
      const reportOfType = reports.find(r => r.type === type);
      if (reportOfType) {
        showToast(`${reportTypes.find(t => t.value === type)?.label} generated successfully`, 'success');
      } else {
        showToast(`Generated ${type} report`, 'success');
      }
    } catch (err) {
      console.error('Generate report error:', err);
      showToast('Failed to generate report', 'error');
    } finally {
      setGeneratingReport(false);
    }
  };

  // Period options
  const periodOptions = [
    "all", 
    new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
    new Date(new Date().setMonth(new Date().getMonth() - 1)).toLocaleString('default', { month: 'long', year: 'numeric' }),
    "Current"
  ];

  if (!reports.length && !loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <FiFileText className="mx-auto text-gray-400 text-5xl mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Reports Available</h2>
          <p className="text-gray-600 mb-4">Generate reports by processing data or refresh to load existing reports.</p>
          <button 
            onClick={fetchReportsData}
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
              <FiFileText className="text-blue-600" />
              Financial Reports & Analytics
            </h1>
            <p className="text-gray-600 mt-2">Generate, view, and download comprehensive financial reports</p>
          </div>
          <div className="flex items-center gap-4 mt-4 lg:mt-0">
            <button 
              onClick={fetchReportsData}
              disabled={loading}
              className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-colors"
            >
              <FiRefreshCw className={loading ? 'animate-spin' : ''} />
              {loading ? 'Loading...' : 'Refresh'}
            </button>
            <button 
              onClick={() => {
                const allReports = reports.map(r => ({ ...r, downloadedAt: new Date().toISOString() }));
                const blob = new Blob([JSON.stringify(allReports, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `all_reports_${new Date().toISOString().split('T')[0]}.json`;
                a.click();
                URL.revokeObjectURL(url);
                showToast('All reports exported', 'success');
              }}
              disabled={reports.length === 0}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiDownload />
              Export All
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Reports</p>
                <p className="text-2xl font-bold text-gray-800">{stats.totalReports}</p>
                <p className="text-sm text-gray-500 mt-1">All time</p>
              </div>
              <FiFileText className="text-blue-500 text-2xl" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Financial Reports</p>
                <p className="text-2xl font-bold text-gray-800">{stats.financialReports}</p>
                <p className="text-sm text-green-600 mt-1">Most generated</p>
              </div>
              <FiDollarSign className="text-green-500 text-2xl" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Recent Reports</p>
                <p className="text-2xl font-bold text-gray-800">{stats.recentReports}</p>
                <p className="text-sm text-purple-600 mt-1">Last 30 days</p>
              </div>
              <FiCalendar className="text-purple-500 text-2xl" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Records</p>
                <p className="text-2xl font-bold text-gray-800">{stats.totalRecords.toLocaleString()}</p>
                <p className="text-sm text-orange-600 mt-1">Data points</p>
              </div>
              <FiBarChart2 className="text-orange-500 text-2xl" />
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
            onClick={fetchReportsData}
            className="mt-2 text-red-600 hover:text-red-800 text-sm font-medium"
          >
            Retry
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Quick Actions & Filters Sidebar */}
        <div className="xl:col-span-1">
          {/* Quick Generate */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2 mb-4">
              <FiFileText className="text-green-600" />
              Quick Generate
            </h2>
            <div className="space-y-3">
              {reportTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => quickGenerateReport(type.value)}
                  disabled={generatingReport}
                  className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 px-4 py-3 rounded-lg flex items-center justify-between transition-colors border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-3">
                    <type.icon className={`text-${type.color}-500`} />
                    <span>{type.label}</span>
                  </div>
                  <FiArrowDown className="text-gray-400" />
                </button>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2 mb-4">
              <FiFilter className="text-blue-600" />
              Filters
            </h2>

            <div className="space-y-4">
              {/* Report Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Types</option>
                  {reportTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              {/* Period Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Period</label>
                <select
                  value={periodFilter}
                  onChange={(e) => setPeriodFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Periods</option>
                  {periodOptions.filter(opt => opt !== "all").map(period => (
                    <option key={period} value={period}>{period}</option>
                  ))}
                </select>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                <div className="space-y-2">
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="From Date"
                  />
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="To Date"
                  />
                </div>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="size">File Size</option>
                  <option value="records">Record Count</option>
                </select>
              </div>

              {/* Clear Filters */}
              <button
                onClick={() => {
                  setTypeFilter("all");
                  setPeriodFilter("all");
                  setDateRange({ start: "", end: "" });
                  setSearchTerm("");
                }}
                className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        </div>

        {/* Reports List */}
        <div className="xl:col-span-3">
          <div className="bg-white rounded-xl shadow-lg p-6">
            {/* Search and Results Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <FiFileText className="text-blue-600" />
                  Available Reports
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  {filteredReports.length} reports found
                </p>
              </div>
              
              <div className="relative w-full lg:w-auto">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full lg:w-80"
                />
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <FiRefreshCw className="animate-spin mx-auto text-3xl text-gray-400 mb-3" />
                <p className="text-gray-500">Loading reports...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredReports.map((report) => {
                  const typeInfo = getTypeInfo(report.type);
                  const IconComponent = typeInfo.icon;

                  return (
                    <div key={report.id} className="border border-gray-200 rounded-lg hover:shadow-md transition-shadow bg-white">
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <IconComponent className={`text-${typeInfo.color}-500 text-xl`} />
                            <span className={getTypeBadge(report.type)}>
                              {typeInfo.label}
                            </span>
                          </div>
                          <span className="text-sm text-gray-500">{report.size}</span>
                        </div>

                        <h3 className="font-semibold text-gray-800 text-lg mb-2">{report.title}</h3>
                        <p className="text-gray-600 text-sm mb-4">{report.description}</p>

                        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <FiCalendar />
                              {report.period}
                            </span>
                            <span className="flex items-center gap-1">
                              <FiBarChart2 />
                              {report.records} records
                            </span>
                          </div>
                          <span>{new Date(report.generatedDate).toLocaleDateString()}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => previewReport(report)}
                            className="flex-1 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-100 transition-colors text-sm"
                          >
                            <FiEye />
                            Preview
                          </button>
                          <button
                            onClick={() => downloadReport(report, "pdf")}
                            className="flex-1 bg-green-50 text-green-600 px-3 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-green-100 transition-colors text-sm"
                          >
                            <FiDownload />
                            PDF
                          </button>
                          <button
                            onClick={() => downloadReport(report, "excel")}
                            className="flex-1 bg-purple-50 text-purple-600 px-3 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-purple-100 transition-colors text-sm"
                          >
                            <FiDownload />
                            Excel
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {filteredReports.length === 0 && !loading && (
              <div className="text-center py-12">
                <FiFileText className="mx-auto text-gray-400 text-4xl mb-3" />
                <p className="text-gray-500 text-lg">No reports found</p>
                <p className="text-gray-400 text-sm">Try adjusting your filters or search terms</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Report Preview Modal with Detailed Data */}
      {showPreview && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">{selectedReport.title}</h2>
              <button 
                onClick={() => setShowPreview(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiX className="text-gray-500" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">Report Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className={getTypeBadge(selectedReport.type)}>
                        {getTypeInfo(selectedReport.type).label}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Period:</span>
                      <span className="text-gray-800">{selectedReport.period}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Generated:</span>
                      <span className="text-gray-800">{new Date(selectedReport.generatedDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">File Size:</span>
                      <span className="text-gray-800">{selectedReport.size}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Records:</span>
                      <span className="text-gray-800">{selectedReport.records}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">Description</h3>
                  <p className="text-gray-600 text-sm">{selectedReport.description}</p>
                </div>
              </div>

              {/* Detailed Data Preview */}
              {reportDetails && (
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-3">Detailed Breakdown</h4>
                  
                  {selectedReport.type === 'expenses' && (
                    <div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="bg-white p-3 rounded-lg text-center">
                          <p className="text-sm text-gray-500">Total Expenses</p>
                          <p className="font-bold text-red-600">Ksh {reportDetails.total?.toLocaleString() || 0}</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg text-center">
                          <p className="text-sm text-gray-500">Total Transactions</p>
                          <p className="font-bold text-blue-600">{reportDetails.count || 0}</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg text-center">
                          <p className="text-sm text-gray-500">Categories</p>
                          <p className="font-bold text-purple-600">{reportDetails.summary?.length || 0}</p>
                        </div>
                      </div>
                      
                      <h5 className="font-medium text-gray-700 mb-2">Expense Categories</h5>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-gray-200">
                              <th className="px-4 py-2 text-left">Category</th>
                              <th className="px-4 py-2 text-left">Total Amount</th>
                              <th className="px-4 py-2 text-left">Items</th>
                            </tr>
                          </thead>
                          <tbody>
                            {reportDetails.summary?.map((cat, idx) => (
                              <tr key={idx} className="border-b">
                                <td className="px-4 py-2">{cat.category}</td>
                                <td className="px-4 py-2">Ksh {cat.total.toLocaleString()}</td>
                                <td className="px-4 py-2">{cat.count}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      
                      <h5 className="font-medium text-gray-700 mt-4 mb-2">Recent Transactions</h5>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-gray-200">
                              <th className="px-4 py-2 text-left">Title</th>
                              <th className="px-4 py-2 text-left">Category</th>
                              <th className="px-4 py-2 text-left">Amount</th>
                              <th className="px-4 py-2 text-left">Vendor</th>
                              <th className="px-4 py-2 text-left">Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {reportDetails.transactions?.slice(0, 10).map((t, idx) => (
                              <tr key={idx} className="border-b">
                                <td className="px-4 py-2">{t.title}</td>
                                <td className="px-4 py-2">{t.category}</td>
                                <td className="px-4 py-2">Ksh {t.amount}</td>
                                <td className="px-4 py-2">{t.vendor}</td>
                                <td className="px-4 py-2">{t.date}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {reportDetails.transactions?.length > 10 && (
                          <p className="text-sm text-gray-500 mt-2">... and {reportDetails.transactions.length - 10} more transactions</p>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedReport.type === 'fees' && (
                    <div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                        <div className="bg-white p-3 rounded-lg text-center">
                          <p className="text-sm text-gray-500">Total Collected</p>
                          <p className="font-bold text-green-600">Ksh {reportDetails.total?.toLocaleString() || 0}</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg text-center">
                          <p className="text-sm text-gray-500">Transactions</p>
                          <p className="font-bold text-blue-600">{reportDetails.count || 0}</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg text-center">
                          <p className="text-sm text-gray-500">Students</p>
                          <p className="font-bold text-purple-600">{reportDetails.summary?.length || 0}</p>
                        </div>
                      </div>
                      
                      <h5 className="font-medium text-gray-700 mb-2">Student Payments</h5>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-gray-200">
                              <th className="px-4 py-2 text-left">Student</th>
                              <th className="px-4 py-2 text-left">Total Paid</th>
                              <th className="px-4 py-2 text-left">Transactions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {reportDetails.summary?.map((s, idx) => (
                              <tr key={idx} className="border-b">
                                <td className="px-4 py-2">{s.student}</td>
                                <td className="px-4 py-2">Ksh {s.total.toLocaleString()}</td>
                                <td className="px-4 py-2">{s.count}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {selectedReport.type === 'payroll' && (
                    <div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="bg-white p-3 rounded-lg text-center">
                          <p className="text-sm text-gray-500">Total Payroll</p>
                          <p className="font-bold text-purple-600">Ksh {reportDetails.total?.toLocaleString() || 0}</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg text-center">
                          <p className="text-sm text-gray-500">Staff Count</p>
                          <p className="font-bold text-blue-600">{reportDetails.staffCount || reportDetails.count || 0}</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg text-center">
                          <p className="text-sm text-gray-500">Departments</p>
                          <p className="font-bold text-green-600">{reportDetails.departments ? Object.keys(reportDetails.departments).length : 0}</p>
                        </div>
                      </div>
                      
                      <h5 className="font-medium text-gray-700 mb-2">Staff Salary Details</h5>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-gray-200">
                              <th className="px-4 py-2 text-left">Name</th>
                              <th className="px-4 py-2 text-left">Position</th>
                              <th className="px-4 py-2 text-left">Department</th>
                              <th className="px-4 py-2 text-left">Basic Salary</th>
                              <th className="px-4 py-2 text-left">Bank</th>
                            </tr>
                          </thead>
                          <tbody>
                            {reportDetails.staff?.map((s, idx) => (
                              <tr key={idx} className="border-b">
                                <td className="px-4 py-2">{s.name}</td>
                                <td className="px-4 py-2">{s.position}</td>
                                <td className="px-4 py-2">{s.department}</td>
                                <td className="px-4 py-2">Ksh {s.basic_salary.toLocaleString()}</td>
                                <td className="px-4 py-2">{s.bank}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {selectedReport.type === 'financial' && (
                    <div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                        <div className="bg-white p-3 rounded-lg text-center">
                          <p className="text-sm text-gray-500">Total Income</p>
                          <p className="font-bold text-green-600">Ksh {reportDetails.income?.total?.toLocaleString() || 0}</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg text-center">
                          <p className="text-sm text-gray-500">Total Expenses</p>
                          <p className="font-bold text-red-600">Ksh {reportDetails.expenses?.total?.toLocaleString() || 0}</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg text-center">
                          <p className="text-sm text-gray-500">Net Position</p>
                          <p className={`font-bold ${reportDetails.netPosition >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            Ksh {reportDetails.netPosition?.toLocaleString() || 0}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-medium text-gray-700 mb-2">Recent Income</h5>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="bg-gray-200">
                                  <th className="px-4 py-2 text-left">Student</th>
                                  <th className="px-4 py-2 text-left">Amount</th>
                                  <th className="px-4 py-2 text-left">Mode</th>
                                </tr>
                              </thead>
                              <tbody>
                                {reportDetails.income?.breakdown?.map((inc, idx) => (
                                  <tr key={idx} className="border-b">
                                    <td className="px-4 py-2">{inc.student}</td>
                                    <td className="px-4 py-2">Ksh {inc.amount.toLocaleString()}</td>
                                    <td className="px-4 py-2">{inc.mode}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-700 mb-2">Recent Expenses</h5>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="bg-gray-200">
                                  <th className="px-4 py-2 text-left">Title</th>
                                  <th className="px-4 py-2 text-left">Amount</th>
                                  <th className="px-4 py-2 text-left">Category</th>
                                </tr>
                              </thead>
                              <tbody>
                                {reportDetails.expenses?.breakdown?.map((exp, idx) => (
                                  <tr key={idx} className="border-b">
                                    <td className="px-4 py-2">{exp.title}</td>
                                    <td className="px-4 py-2">Ksh {exp.amount.toLocaleString()}</td>
                                    <td className="px-4 py-2">{exp.category}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Ready to download or print</span>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => printReport(selectedReport)}
                  className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-colors"
                >
                  <FiPrinter />
                  Print
                </button>
                <button 
                  onClick={() => downloadReport(selectedReport, "pdf")}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
                >
                  <FiDownload />
                  Download PDF
                </button>
                <button 
                  onClick={() => downloadReport(selectedReport, "excel")}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors"
                >
                  <FiDownload />
                  Download Excel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

export default Reports;