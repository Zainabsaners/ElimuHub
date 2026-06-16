import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
  Search, 
  User, 
  DollarSign,
  CreditCard, 
  Printer, 
  Loader2,
  X,
  ChevronRight,
  Receipt,
  BookOpen,
  AlertCircle,
  Check,
  FileText,
  Calculator
} from 'lucide-react';

// Configure axios base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || "https://*.onrender.com";
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'Authorization': token?.startsWith('Bearer ') ? token : `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
};

const PaymentManagement = () => {
  // State management
  const [searchMode, setSearchMode] = useState('admission');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [classes, setClasses] = useState([]);
  const [currentClass, setCurrentClass] = useState('');
  
  // Student data
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentBalance, setStudentBalance] = useState(0);
  const [creditBalance, setCreditBalance] = useState(0);
  const [invoices, setInvoices] = useState([]);
  
  // Payment data
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [paymentReference, setPaymentReference] = useState('');
  const [mobileMoneyNo, setMobileMoneyNo] = useState('');
  const [bankName, setBankName] = useState('');
  const [chequeNo, setChequeNo] = useState('');
  
  // Recent transactions
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  
  // UI states
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState(null);
  const [showClassStudents, setShowClassStudents] = useState(false);
  const [classStudents, setClassStudents] = useState([]);


  const netCredit = creditBalance - paymentAmount;
  // Initialize
  useEffect(() => {
    fetchClasses();
    fetchRecentTransactions();
  }, []);

  // Notification handler
  const showNotification = (type, message, duration = 5000) => {
    setNotification({ show: true, type, message });
    setTimeout(() => setNotification({ show: false, type: '', message: '' }), duration);
  };

  // Fetch classes from backend
  const fetchClasses = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/classes/`, getAuthHeaders());
      if (response.data.success) {
        setClasses(response.data.data || []);
      } else {
        showNotification('error', 'Failed to load classes');
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
      showNotification('error', 'Failed to load classes');
    }
  };

  const fetchRecentTransactions = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/fees/transactions/?limit=5`, getAuthHeaders());
      // Django standard unwrap
      const data = response.data.results || response.data.data || response.data;
      setRecentTransactions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching recent transactions:', error);
    }
  };

  // 2. Fix Search Students (Standardize to Django list query)
  const searchStudents = useCallback(async () => {
    // 1. Validation
    if (!searchQuery.trim() && searchMode !== 'class') {
      showNotification('error', `Please enter search term`);
      return;
    }

    if (searchMode === 'class' && !selectedClass) {
      showNotification('error', `Please select a class`);
      return;
    }

    setLoadingStudents(true);
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { 
          'Authorization': token?.startsWith('Bearer ') ? token : `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        params: {}
      };

      // 2. Mapping parameters to backend
      if (searchMode === 'class') {
        config.params.class_id = selectedClass;
      } else {
        config.params.search = searchQuery.trim();
      }

      // 3. Execution
      const response = await axios.get(`${API_BASE_URL}/api/students/`, config);
      const rawData = response.data;

      // 4. Robust Unwrapping based on your ViewSet list() method
      let foundStudents = [];
      
      if (rawData.success && Array.isArray(rawData.data)) {
        // Matches your custom: return Response({"success": True, "data": serializer.data})
        foundStudents = rawData.data;
      } else if (rawData.results) {
        // Fallback for standard Django Rest Framework pagination
        foundStudents = Array.isArray(rawData.results) ? rawData.results : (rawData.results.data || []);
      } else {
        // Last resort fallback
        foundStudents = Array.isArray(rawData) ? rawData : [];
      }

      // 5. Update UI States
      if (foundStudents.length === 0) {
        showNotification('info', 'No students found matching your criteria');
      }

      setStudents(foundStudents);

      if (searchMode === 'class') {
        setClassStudents(foundStudents);
        setShowClassStudents(true);
      }
      
    } catch (error) {
      console.error('Search Error:', error);
      if (error.response?.status === 400) {
        showNotification('error', "Invalid admission number");
      } else if (error.response?.status === 404) {
        showNotification('error', "Search endpoint not found.");
      } else {
        showNotification('error', "Failed to search students");
      }
    } finally {
      setLoadingStudents(false);
    }
  }, [searchMode, searchQuery, selectedClass, API_BASE_URL]);
  
  const selectStudent = async (student) => {
    setSelectedStudent(student);
    setStudents([]);
    setLoading(true);
    
    try {
      const headers = getAuthHeaders();
      
      // 1. Refresh invoices for the correct year and term
     /* await axios.post(`${API_BASE_URL}/api/fees/generate-invoices/`, {
          student_id: student.id,
          academic_year: "2026/2027 Academic Year", 
          term: "Term 1"
      }, headers);*/

      // 2. Fetch fresh student data
      const response = await axios.get(`${API_BASE_URL}/api/students/${student.id}/`, headers);

      // 3. CORRECT UNWRAP: Based on your network tab, data is in response.data.data
      if (response.data && response.data.success) {
        const studentInfo = response.data.data;
        
        // Update states using the specific keys from your JSON
        setStudentBalance(parseFloat(studentInfo.current_balance || 0)); 
        setInvoices(studentInfo.invoices || []);
        setCurrentClass(studentInfo.current_class_name || "N/A");
        
        showNotification('success', 'Balance loaded successfully');
      }
    } catch (error) {
      console.error('Account Load Error:', error);
      showNotification('error', 'Failed to load balance');
    } finally {
      setLoading(false);
    }
  };

// IMPROVED: Automatically account for credits in the displayed balance
const getCurrentBalance = () => {
  // Real Balance = Invoiced Debt - Unused Credits
  return studentBalance - creditBalance;
};

 
const getExcessPayment = () => {
  const currentBalance = getCurrentBalance();
  const payment = parseFloat(paymentAmount || 0);
  
  // Only show excess if student has debt (positive balance) AND payment is more than debt
  if (currentBalance > 0 && payment > currentBalance) {
    return payment - currentBalance;
  }
  return 0;
};

// Add function to check if payment is valid
const isValidPayment = () => {
  const amount = parseFloat(paymentAmount || 0);
  const currentBalance = getCurrentBalance();
  
  if (!amount || amount <= 0 || isNaN(amount)) {
    return { valid: false, message: 'Please enter a valid amount' };
  }
  
  // If student already has credit (negative balance), they can still pay
  // This will increase their credit
  if (currentBalance < 0) {
    return { valid: true, message: 'Student has credit. Payment will increase credit balance.' };
  }
  
  return { valid: true, message: '' };
};

  // FIXED: Calculate new balance properly
  const getNewBalance = () => {
    const calculateNewBalance = getCurrentBalance() - paymentAmount;
    return calculateNewBalance;
  };

  const processPayment = async () => {
    if (!selectedStudent) {
      showNotification('error', 'Please select a student first');
      return;
    }

    const validation = isValidPayment();
    if (!validation.valid) {
      showNotification('error', validation.message);
      return;
    }

    // Validate payment method specific fields
    if (paymentMethod === 'Mobile Money' && !mobileMoneyNo) {
      showNotification('error', 'Please enter M-PESA number');
      return;
    }

    if (paymentMethod === 'Bank Transfer' && !bankName) {
      showNotification('error', 'Please enter bank name');
      return;
    }

    if (paymentMethod === 'Cheque' && !chequeNo) {
      showNotification('error', 'Please enter cheque number');
      return;
    }

    // Show warning if paying more than outstanding balance
    const currentBalance = getCurrentBalance();
    const excess = getExcessPayment();
    if (excess > 0) {
      if (!window.confirm(`Student has outstanding balance of ${formatCurrency(currentBalance)}.\n\nYou are paying ${formatCurrency(paymentAmount)}, which is ${formatCurrency(excess)} more than the outstanding amount.\n\nThe excess will be recorded as credit.\n\nContinue?`)) {
        return;
      }
    }

    setShowConfirmation(true);
  };

  const confirmPayment = async () => {
  setLoading(true);
  try {
    // 1. Identify the invoice to pay against
    // If you have multiple invoices, you can pick the first unpaid one
    const targetInvoice = invoices.find(inv => inv.payment_status !== 'Fully Paid') || invoices[0];

    const transactionData = {
      student: selectedStudent.id,
      invoice: targetInvoice ? targetInvoice.id : null, // Link to the generated invoice
      amount: parseFloat(paymentAmount), // Matches 'amount' in your serializer
      payment_mode: paymentMethod, // Match models.py choices
      payment_reference: paymentReference || `PAY-${Date.now()}`,
      bank_name: bankName,
      cheque_no: chequeNo,
      mobile_money_no: mobileMoneyNo,
      status: 'Completed', // Standard status for Bursar collection
      payment_date: new Date().toISOString(),
      collected_by: 1 // Link to the active user ID
    };

    const response = await axios.post(`${API_BASE_URL}/api/fees/transactions/`, transactionData, getAuthHeaders());
    
    if (response.data.success || response.status === 201) {
      setCurrentTransaction(response.data.data);

      const paidAmount = parseFloat(paymentAmount);
      setStudentBalance(prev => prev - paidAmount);
      setShowConfirmation(false);
      setShowReceipt(true);

      setTimeout(() => {
        selectStudent(selectedStudent); 
        fetchRecentTransactions();
      }, 1000);
      
      // 2. Refresh the student profile to show the NEW REDUCED balance
      await selectStudent(selectedStudent); 
      fetchRecentTransactions();
      
      showNotification('success', 'Payment processed and invoice updated!');
    }
  } catch (error) {
    console.error('Payment Processing Error:', error.response?.data);
    showNotification('error', error.response?.data?.message || 'Transaction failed');
  } finally {
    setLoading(false);
   }
  };
  const resetForm = () => {
    setSelectedStudent(null);
    setStudentBalance(null);
    setPaymentAmount('');
    setPaymentReference('');
    setMobileMoneyNo('');
    setBankName('');
    setChequeNo('');
    setStudents([]);
    setInvoices([]);
    setShowClassStudents(false);
    setSearchQuery('');
    setSelectedClass('');
  };

  const formatCurrency = (amount) => {
    // Convert to number first
    const num = Number(amount);
    // Check if it's a valid number
    if (isNaN(num)) {
      return 'KSh 0.00';
    }
    
    // Handle negative numbers
    if (num < 0) {
      return `-KSh ${Math.abs(num).toLocaleString('en-KE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`;
    }
    
    // Handle positive numbers
    return `KSh ${num.toLocaleString('en-KE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  // FIXED: Professional print function
  const printReceipt =  async () => {
    if (!currentTransaction?.id) {
    showNotification('error', 'No active transaction to print');
    return;
    }
    try {
    // Notify the backend that the receipt is being printed
    await axios.patch(
      `${API_BASE_URL}/api/fees/transactions/${currentTransaction.id}/mark_as_printed/`, 
      {}, 
      getAuthHeaders()
    );
    fetchRecentTransactions();
  } catch (error) {
    console.error('Audit Log Error:', error);
  }
  // Get current date for academic year
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  
  // Get data from the first invoice (if available)
  const firstInvoice = invoices && invoices.length > 0 ? invoices[0] : null;
  
  // Use academic year from invoice, or fallback to current year
  const academicYear = firstInvoice?.academic_year || `${currentYear}`;
  
  // Use term from invoice, or fallback to current class
  const term = firstInvoice?.term || currentClass;
  // Format term for display (convert "TERM_3" to "Term 3")
  const formattedTerm = term.replace('TERM_', 'Term ');
  
  const printWindow = window.open('', '_blank', 'width=800,height=600');
  
  if (!printWindow) {
    showNotification('error', 'Please allow popups to print receipt');
    return;
  }
  
  const currentBalance = getCurrentBalance();
  const newBalance = getNewBalance();
  const amountPaid = parseFloat(paymentAmount || currentTransaction?.amount_kes || 0);
  
  // Get invoice balance (sum of all invoice balances)
  const invoiceTotalBalance = invoices && invoices.length > 0 
    ? invoices.reduce((sum, invoice) => sum + parseFloat(invoice.balance_amount || 0), 0)
    : currentBalance;
  
  // Use invoice balance as the previous balance
  const previousBalance = invoiceTotalBalance;
  
  // FIXED: Show proper balance description based on invoice balance
  const balanceDescription = previousBalance < 0 ? 'Credit Balance' : 'Outstanding Balance';
  const newBalanceDescription = newBalance < 0 ? 'Credit Balance' : 'Outstanding Balance';
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Payment Receipt - ${selectedStudent?.admission_no}</title>
      <meta charset="UTF-8">
      <style>
        @media print {
          @page {
            margin: 0;
            size: auto;
          }
          body {
            margin: 0;
            padding: 10px;
          }
        }
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Arial', sans-serif;
          font-size: 12px;
          line-height: 1.4;
          color: #000;
          padding: 10px;
          max-width: 800px;
          margin: 0 auto;
        }
        
        .receipt {
          border: 2px solid #b91c1c;
          padding: 15px;
          margin: 0 auto;
        }
        
        .header {
          text-align: center;
          margin-bottom: 15px;
          border-bottom: 2px solid #b91c1c;
          padding-bottom: 10px;
        }
        
        .logo-container {
          display: flex;
          justify-content: center;
          align-items: center;
          margin-bottom: 10px;
          height: 70px; /* Reduced height for better fit */
        }
        
        .school-logo {
          max-height: 60px;
          max-width: 200px;
          object-fit: contain;
        }
        
        .school-name {
          font-size: 22px;
          font-weight: bold;
          color: #b91c1c;
          margin-bottom: 5px;
        }
        
        .receipt-title {
          font-size: 18px;
          font-weight: bold;
          margin: 10px 0;
        }
        
        .receipt-no {
          font-size: 14px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        
        .academic-year {
          font-size: 14px;
          font-weight: bold;
          margin: 5px 0;
        }
        
        .section {
          margin: 10px 0;
        }
        
        .section-title {
          font-weight: bold;
          font-size: 14px;
          color: #1e40af;
          margin-bottom: 5px;
          padding-bottom: 3px;
          border-bottom: 1px solid #ccc;
        }
        
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin: 10px 0;
        }
        
        .info-row {
          margin: 5px 0;
        }
        
        .info-label {
          font-weight: bold;
          color: #555;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 10px 0;
        }
        
        th, td {
          border: 1px solid #000;
          padding: 8px;
          text-align: left;
        }
        
        th {
          background-color: #f3f4f6;
          font-weight: bold;
        }
        
        .total-row {
          font-weight: bold;
          background-color: #f0f9ff;
        }
        
        .balance-row {
          font-weight: bold;
        }
        
        .amount {
          text-align: right;
        }
        
        .negative {
          color: #059669; /* Green for credit */
        }
        
        .positive {
          color: #dc2626; /* Red for debt */
        }
        
        .signature-section {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #ccc;
          display: flex;
          justify-content: space-between;
        }
        
        .signature-box {
          text-align: center;
          width: 45%;
        }
        
        .signature-line {
          border-top: 1px solid #000;
          margin: 40px 0 5px 0;
          width: 100%;
        }
        
        .signature-label {
          font-weight: bold;
          margin-top: 5px;
        }
        
        .signature-title {
          font-size: 11px;
          color: #666;
        }
        
        .footer {
          text-align: center;
          margin-top: 20px;
          padding-top: 10px;
          border-top: 1px solid #ccc;
          font-size: 11px;
          color: #666;
        }
        
        .calculation-note {
          font-size: 10px;
          color: #666;
          margin-top: 5px;
          font-style: italic;
        }
        
        .invoice-status-paid {
          background-color: #d1fae5;
          color: #065f46;
          padding: 2px 6px;
          border-radius: 12px;
          font-size: 10px;
        }
        
        .invoice-status-partial {
          background-color: #fef3c7;
          color: #92400e;
          padding: 2px 6px;
          border-radius: 12px;
          font-size: 10px;
        }
        
        .invoice-status-pending {
          background-color: #fee2e2;
          color: #991b1b;
          padding: 2px 6px;
          border-radius: 12px;
          font-size: 10px;
        }
        
        @media print {
          body {
            padding: 0;
          }
          .receipt {
            border: none;
          }
          .logo-container {
            height: 60px !important;
          }
          .school-logo {
            max-height: 50px !important;
            max-width: 180px !important;
          }
        }
      </style>
    </head>
    <body>
      <div class="receipt">
        <div class="header">
          <div class="logo-container">
            <img 
              src="/logo.jpeg"
              alt="ElimuHub logo" 
              class="school-logo"
            />
          </div>
          <div class="school-name">ELIMUHUB</div>
          <div>In God We Trust</div>
          <div class="receipt-title">OFFICIAL FEE PAYMENT RECEIPT</div>
          <div class="receipt-no">Receipt No: ${currentTransaction?.transaction_no || 'TEMP-' + Date.now()}</div>
          <div class="academic-year">Academic Year: ${academicYear} | Term: ${formattedTerm}</div>
          <div>Date: ${new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })} | Time: ${new Date().toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}</div>
        </div>

        
        <div class="section">
          <div class="section-title">Student Information</div>
          <div class="info-grid">
            <div class="info-row">
              <span class="info-label">Student Name:</span>
              <span>${selectedStudent?.first_name} ${selectedStudent?.last_name}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Admission No:</span>
              <span>${selectedStudent?.admission_no}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Class:</span>
              <span>${currentClass}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Term:</span>
              <span>${formattedTerm}</span>
            </div>
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">Payment Details</div>
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Payment Method</th>
                <th>Reference</th>
                <th>Amount (KSh)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>School Fee Payment</td>
                <td>${currentTransaction?.payment_mode || paymentMethod}</td>
                <td>${currentTransaction?.payment_reference || paymentReference || 'N/A'}</td>
                <td class="amount">${amountPaid.toLocaleString('en-KE', {minimumFractionDigits: 2})}</td>
              </tr>
              <tr class="total-row">
                <td colspan="3"><strong>TOTAL AMOUNT PAID</strong></td>
                <td class="amount"><strong>${amountPaid.toLocaleString('en-KE', {minimumFractionDigits: 2})}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
        
        ${invoices && invoices.length > 0 ? `
        <div class="section">
          <div class="section-title">Invoice Details</div>
          <table>
            <thead>
              <tr>
                <th>Invoice No</th>
                <th>Date</th>
                <th>Due Date</th>
                <th>Total Amount</th>
                <th>Total Paid</th>
                <th>Outstanding Balance</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${invoices.map((invoice, index) => {
                const invoiceDate = invoice.invoice_date ? new Date(invoice.invoice_date).toLocaleDateString() : 'N/A';
                const dueDate = invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'N/A';
                const totalAmount = invoice.total_amount ? parseFloat(invoice.total_amount).toLocaleString('en-KE', {minimumFractionDigits: 2}) : '0.00';
                const amountPaidInvoice = invoice.amount_paid ? parseFloat(invoice.amount_paid).toLocaleString('en-KE', {minimumFractionDigits: 2}) : '0.00';
                const balanceAmount = invoice.balance_amount ? parseFloat(invoice.balance_amount) : 0;
                const balanceFormatted = balanceAmount.toLocaleString('en-KE', {minimumFractionDigits: 2});
                const balanceClass = balanceAmount < 0 ? 'negative' : balanceAmount > 0 ? 'positive' : '';
                const status = invoice.payment_status || invoice.status || 'PENDING';
                const statusClass = status === 'PAID' ? 'invoice-status-paid' : 
                                   status === 'PARTIAL' ? 'invoice-status-partial' : 
                                   'invoice-status-pending';
                
                return `
                  <tr>
                    <td>${invoice.invoice_no || 'N/A'}</td>
                    <td>${invoiceDate}</td>
                    <td>${dueDate}</td>
                    <td class="amount">KSh ${totalAmount}</td>
                    <td class="amount">KSh ${amountPaidInvoice}</td>
                    <td class="amount ${balanceClass}">${balanceAmount < 0 ? '-' : ''}KSh ${Math.abs(balanceAmount).toLocaleString('en-KE', {minimumFractionDigits: 2})}</td>
                    <td><span class="${statusClass}">${status}</span></td>
                  </tr>
                `;
              }).join('')}
              ${invoices.length > 1 ? `
              <tr class="total-row">
                <td colspan="5"><strong>TOTAL INVOICE BALANCE:</strong></td>
                <td class="amount ${previousBalance < 0 ? 'negative' : previousBalance > 0 ? 'positive' : ''}">
                  <strong>${previousBalance < 0 ? '-' : ''}KSh ${Math.abs(previousBalance).toLocaleString('en-KE', {minimumFractionDigits: 2})}</strong>
                </td>
                <td></td>
              </tr>
              ` : ''}
            </tbody>
          </table>
        </div>
        ` : ''}
        
        <div class="section">
          <div class="section-title">Balance Calculation</div>
          <table>
            <tbody>
              <tr>
                <td><strong>Previous ${balanceDescription}:</strong></td>
                <td class="amount ${previousBalance < 0 ? 'negative' : previousBalance > 0 ? 'positive' : ''}">
                  ${previousBalance < 0 ? '-' : ''}KSh ${Math.abs(previousBalance).toLocaleString('en-KE', {minimumFractionDigits: 2})}
                </td>
              </tr>
              <tr>
                <td><strong>Amount Paid:</strong></td>
                <td class="amount positive">
                   KSh ${amountPaid.toLocaleString('en-KE', {minimumFractionDigits: 2})}
                </td>
              </tr>
              <tr class="balance-row">
                <td><strong>NEW ${newBalanceDescription}:</strong></td>
                <td class="amount ${newBalance < 0 ? 'negative' : newBalance > 0 ? 'positive' : ''}">
                  <strong>${newBalance < 0 ? '-' : ''}KSh ${Math.abs(netCredit).toLocaleString('en-KE', {minimumFractionDigits: 2})}</strong>
                </td>
              </tr>
            </tbody>
          </table>
          
          ${newBalance < 0 ? `
          <div class="calculation-note" style="color: #059669; font-weight: bold;">
            Note: Negative balance indicates credit of ${formatCurrency(Math.abs(netCredit))}
          </div>
          ` : ''}
        </div>
        
        
        <div class="footer">
          <div>*** This is an official computer-generated receipt ***</div>
          <div>Thank you for your payment. Please keep this receipt for your records.</div>
          <div>For any queries, contact: Bursar Department</div>
          <div> © ${new Date().getFullYear()} ELIMUHUB </div>
        </div>
      </div>
      
      
      <script>
        // Auto-print after page loads
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 500);
        };
      </script>
    </body>
    </html>
  `);
  
  printWindow.document.close();
};


  // Render notification
  const renderNotification = () => (
    notification.show && (
      <div className={`fixed top-4 right-4 z-50 max-w-sm w-full ${
        notification.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
        notification.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
        'bg-blue-50 border-blue-200 text-blue-800'
      } border rounded-lg shadow-lg p-4`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {notification.type === 'error' ? <AlertCircle className="w-5 h-5" /> :
             notification.type === 'success' ? <Check className="w-5 h-5" /> :
             <div className="w-5 h-5">ℹ️</div>}
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium">
              {notification.message}
            </p>
          </div>
          <button
            onClick={() => setNotification({ show: false, type: '', message: '' })}
            className="ml-4 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
      </div>
    )
  );

  // Render class students modal
  const renderClassStudentsModal = () => (
    showClassStudents && classStudents.length > 0 && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg w-full max-w-6xl max-h-[80vh] overflow-hidden">
          <div className="bg-blue-600 text-white p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold">Select Student from Class</h3>
                <p className="text-blue-100">
                  {classStudents.length} students found in selected class
                </p>
              </div>
              <button
                onClick={() => setShowClassStudents(false)}
                className="p-2 hover:bg-blue-700 rounded"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
          
          <div className="p-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {classStudents.map((student) => (
                <div
                  key={student.id}
                  onClick={() => selectStudent(student)}
                  className="border border-gray-300 rounded-lg p-4 hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-gray-900">
                        {student.first_name} {student.last_name}
                      </div>
                      <div className="text-sm text-gray-600 mb-2">{student.admission_no}</div>
                      <div className="text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Class:</span>
                          <span className="font-medium">{student.class_name}</span>
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="text-gray-600">Balance:</span>
                          <span className={`font-bold ${
                            (student.outstanding_balance || 0) < 0 ? 'text-green-600' :
                            (student.outstanding_balance || 0) > 0 ? 'text-red-600' :
                            'text-gray-600'
                          }`}>
                            {formatCurrency(student.outstanding_balance)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 ml-2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="border-t border-gray-300 p-4">
            <button
              onClick={() => setShowClassStudents(false)}
              className="w-full py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
  );

  // Render confirmation modal - UPDATED
const renderConfirmationModal = () => (
  showConfirmation && selectedStudent && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Confirm Payment</h3>
            <p className="text-gray-600 mt-1">Please review payment details</p>
          </div>
          
          {/* Student Info */}
          <div className="mb-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="font-bold text-gray-900">
                  {selectedStudent.first_name} {selectedStudent.last_name}
                </div>
                <div className="text-sm text-gray-600">{selectedStudent.admission_no}</div>
              </div>
            </div>
          </div>
          
          {/* Payment Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Class:</span>
                <span className="font-medium">{selectedStudent.class_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method:</span>
                <span className="font-medium">{paymentMethod === 'Mobile Money' ? 'Mobile Money' : paymentMethod}</span>
              </div>
              {paymentReference && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Reference:</span>
                  <span className="font-medium">{paymentReference}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Balance Calculation - CORRECTED */}
          <div className="bg-white border border-gray-300 rounded-lg p-4 mb-6">
            <div className="text-center font-bold text-gray-900 mb-3">Balance Calculation</div>
            
            <div className="space-y-2">
              {/* Current Balance */}
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <div>
                  <div className="text-sm text-gray-600">Current Balance</div>
                  <div className={`text-sm ${
                    getCurrentBalance() < 0 ? 'text-green-600' :
                    getCurrentBalance() > 0 ? 'text-red-600' :
                    'text-gray-600'
                  }`}>
                    {getCurrentBalance() < 0 ? 'Credit' : 'Outstanding'}
                  </div>
                </div>
                <div className={`text-lg font-bold ${
                  getCurrentBalance() < 0 ? 'text-green-600' :
                  getCurrentBalance() > 0 ? 'text-red-600' :
                  'text-gray-600'
                }`}>
                  {formatCurrency(getCurrentBalance())}
                </div>
              </div>
              
              {/* Minus Payment */}
              <div className="flex justify-between items-center p-2">
                <div>
                  <div className="text-sm text-gray-600">Payment Amount</div>
                  <div className="text-sm text-blue-600">Minus</div>
                </div>
                <div className="text-lg font-bold text-blue-600">
                  - {formatCurrency(paymentAmount)}
                </div>
              </div>
              
              {/* Divider */}
              <div className="border-t border-gray-300 my-2"></div>
              
              {/* New Balance */}
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded border border-gray-300">
                <div>
                  <div className="font-bold text-gray-900">New Balance</div>
                  <div className={`text-sm ${
                    getNewBalance() < 0 ? 'text-green-600' :
                    getNewBalance() > 0 ? 'text-red-600' :
                    'text-gray-600'
                  }`}>
                    {getNewBalance() < 0 ? 'Credit Balance' :
                     getNewBalance() > 0 ? 'Outstanding Balance' : 'Paid in Full'}
                  </div>
                </div>
                <div className={`text-2xl font-bold ${
                  getNewBalance() < 0 ? 'text-green-600' :
                  getNewBalance() > 0 ? 'text-red-600' :
                  'text-gray-600'
                }`}>
                  {formatCurrency(getNewBalance())}
                </div>
              </div>
              
              {/* Calculation Formula */}
              {/* <div className="text-center text-sm text-gray-500 mt-3 p-2 bg-blue-50 rounded">
                <div className="font-medium">Calculation:</div>
                <div className="font-mono">
                  {formatCurrency(getCurrentBalance())} - {formatCurrency(paymentAmount)} = {formatCurrency(getNewBalance())}
                </div>
              </div> */}
              
              {/* Excess Payment Warning */}
              {getExcessPayment() > 0 && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg mt-3">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-yellow-800">Excess Payment</div>
                      <div className="text-sm text-yellow-700">
                        Student will receive {formatCurrency(getExcessPayment())} credit
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => setShowConfirmation(false)}
              className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={confirmPayment}
              disabled={loading}
              className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </span>
              ) : (
                'Confirm Payment'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
);

  // Render receipt modal
  const renderReceiptModal = () => (
    showReceipt && currentTransaction && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg w-full max-w-2xl">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Payment Receipt</h3>
                <p className="text-gray-600">Payment completed successfully</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={printReceipt}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Print Receipt
                </button>
                <button
                  onClick={() => setShowReceipt(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
            
            {/* Receipt Preview */}
            <div className="border border-gray-300 rounded p-6 bg-gray-50">
              <div className="text-center mb-6">
                <div className="font-bold text-lg text-blue-600">ELIMUHUB</div>
                <div className="text-sm text-gray-600">Official Fee Payment Receipt</div>
                <div className="text-sm mt-2 font-medium">Receipt No: {currentTransaction.receipt.receipt_no}</div>
              </div>
              
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <div className="text-sm font-medium text-gray-600">Student Name</div>
                  <div className="font-bold">{selectedStudent.first_name} {selectedStudent.last_name}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-600">Admission No</div>
                  <div className="font-bold">{selectedStudent.admission_no}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-600">Class</div>
                  <div className="font-bold">{currentClass}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-600">Date</div>
                  <div className="font-bold">{new Date().toLocaleDateString()}</div>
                </div>
              </div>
              
              <div className="border-t border-gray-300 pt-6">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-medium">Payment Method:</span>
                  <span>{currentTransaction.receipt.payment_details.payment_mode}</span>
                </div>
                <div className="flex justify-between items-center mb-3">
                  <span className="font-medium">Reference:</span>
                  <span>{currentTransaction.receipt.payment_details.payment_reference || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center mb-3">
                  <span className="font-medium">Amount Paid:</span>
                  <span className="font-bold text-green-600">{formatCurrency(currentTransaction.transaction.amount_kes)}</span>
                </div>
                
                {/* {studentBalance && (
                  <>
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-medium">Previous Balance:</span>
                      <span className={`${
                        getCurrentBalance() < 0 ? 'text-green-600' :
                        getCurrentBalance() > 0 ? 'text-red-600' :
                        'text-gray-600'
                      }`}>
                        {formatCurrency(getCurrentBalance())}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-gray-300">
                      <span className="font-bold">New Balance:</span>
                      <span className={`font-bold text-lg ${
                        getNewBalance() < 0 ? 'text-green-600' :
                        getNewBalance() > 0 ? 'text-red-600' :
                        'text-gray-600'
                      }`}>
                        {formatCurrency(getNewBalance())}
                      </span>
                    </div>
                  </>
                )} */}
              </div>
              
              <div className="text-center text-sm text-gray-600 mt-8 pt-6 border-t border-gray-300">
                <div>Thank you for your payment</div>
                <div>Keep this receipt for your records</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  );

  // Render invoices section
  const renderInvoicesSection = () => (
    invoices.length > 0 && (
      <div className="bg-white rounded-lg border border-gray-300 p-6 mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Active Invoices</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Invoice No</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Due Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Total Amount</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Amount Paid</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Balance</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300">
              {invoices.map((invoice, index) => (
                <tr key={index}>
                  <td className="px-4 py-3 text-sm text-gray-900">{invoice.invoice_no}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(invoice.invoice_date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(invoice.due_date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium">
                    {formatCurrency(invoice.total_amount)}
                  </td>
                  <td className="px-4 py-3 text-sm text-green-600">
                    {formatCurrency(invoice.amount_paid)}
                  </td>
                  <td className="px-4 py-3 text-sm font-bold ${
                    parseFloat(invoice.balance_amount || 0) < 0 ? 'text-green-600' :
                    parseFloat(invoice.balance_amount || 0) > 0 ? 'text-red-600' :
                    'text-gray-600'
                  }">
                    {formatCurrency(invoice.balance_amount)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      invoice.payment_status === 'PAID' ? 'bg-green-100 text-green-800' :
                      invoice.payment_status === 'PARTIAL' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {invoice.payment_status || invoice.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  );

  // Render search section
  const renderSearchSection = () => (
    <div className="bg-white rounded-lg border border-gray-300 p-6 mb-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Find Student</h3>
        <p className="text-gray-600">Search by admission number, name, or class</p>
      </div>
      
      {/* Search Tabs */}
      <div className="flex space-x-2 mb-6">
        {['admission', 'name', 'class'].map((mode) => (
          <button
            key={mode}
            onClick={() => {
              setSearchMode(mode);
              setStudents([]);
              setShowClassStudents(false);
              setSearchQuery('');
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              searchMode === mode
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {mode === 'admission' ? 'Admission No' :
             mode === 'name' ? 'Student Name' : 'Class'}
          </button>
        ))}
      </div>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(searchMode === 'admission' || searchMode === 'name') && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {searchMode === 'admission' ? 'Admission Number *' : 'Student Name *'}
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchStudents()}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={searchMode === 'admission' ? 'Enter admission number' : 'Enter student name'}
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {searchMode === 'class' ? 'Class *' : 'Class (Optional)'}
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Class</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.class_name} ({cls.class_code})
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={searchStudents}
            disabled={loadingStudents}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
          >
            {loadingStudents ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Search Student
              </>
            )}
          </button>
          
          <button
            onClick={resetForm}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Clear
          </button>
        </div>
      </div>
      
      {/* Search Results (for admission/name search) */}
      {students.length > 0 && searchMode !== 'class' && (
        <div className="mt-6 border border-gray-300 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-300">
            <div className="font-medium text-gray-900">
              Search Results ({students.length})
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto">
            {students.map((student) => (
              <div
                key={student.id}
                onClick={() => selectStudent(student)}
                className="px-4 py-3 border-b border-gray-300 hover:bg-blue-50 cursor-pointer last:border-b-0"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">
                      {student.first_name} {student.last_name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {student.admission_no} • {student.class_name}
                    </div>
                    <div className="text-xs text-blue-500 mt-1 font-bold ">
                      Click to select
                    </div>
                  </div>
                  {/* <div className="text-right">
                    <div className="font-bold text-red-600">
                      !!Notice ,if NEW REGISTRATION paying, kindly adjust the estimated invoice by paying 0.000001 at first then proceed to pay the actual student amount
                    </div>
                  </div> */}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Render payment form
  const renderPaymentForm = () => (
  selectedStudent && (
    <>
      <div className="bg-white rounded-lg border border-gray-300 p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Payment Details</h3>
            <p className="text-gray-600">Enter payment information for selected student</p>
          </div>
          <div className="flex items-center space-x-3">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {selectedStudent.admission_no}
            </span>
            <button
              onClick={resetForm}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Change Student
            </button>
          </div>
        </div>
        
        {/* Student Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <div className="text-sm text-gray-600 mb-1">Student Name</div>
              <div className="font-bold text-gray-900 text-lg">
                {selectedStudent.first_name} {selectedStudent.last_name}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Class</div>
              <div className="font-bold text-gray-900 text-lg">{currentClass}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Current Balance</div>
              <div className={`text-2xl font-bold ${
                getCurrentBalance() < 0 ? 'text-green-600' :
                getCurrentBalance() > 0 ? 'text-red-600' :
                'text-gray-600'
              }`}>
                {formatCurrency(getCurrentBalance())}
                {getCurrentBalance() < 0 && ' (Credit)'}
                {getCurrentBalance() > 0 && ' (Outstanding)'}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Status</div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                getCurrentBalance() < 0 ? 'bg-green-100 text-green-800' :
                getCurrentBalance() > 0 ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {getCurrentBalance() < 0 ? 'CREDIT' :
                 getCurrentBalance() > 0 ? 'OUTSTANDING' : 'PAID'}
              </div>
            </div>
          </div>
        </div>
        
        {/* Payment Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Amount Input with Calculations */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount (KSh) *
              </label>
              <input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                min="0.01"
                step="0.01"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
              />
              
              {/* Current Balance and Calculation Preview */}
              {selectedStudent && (
                <div className="mt-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Current Balance:</span>
                    <span className={`text-sm font-bold ${
                      getCurrentBalance() < 0 ? 'text-green-600' :
                      getCurrentBalance() > 0 ? 'text-red-600' :
                      'text-gray-600'
                    }`}>
                      {formatCurrency(getCurrentBalance())}
                      {getCurrentBalance() < 0 && ' (Credit)'}
                    </span>
                  </div>
                  
                  {/* Excess Payment Warning */}
                  {getExcessPayment() > 0 && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-start">
                        <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="text-sm font-medium text-yellow-800">
                            Excess Payment Detected
                          </div>
                          <div className="text-sm text-yellow-700 mt-1">
                            You are paying {formatCurrency(getExcessPayment())} more than the outstanding balance.
                            This will be recorded as credit.
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Calculation Preview */}
                  {paymentAmount && parseFloat(paymentAmount) > 0 && (
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="text-sm font-medium text-gray-700 mb-1">Calculation Preview:</div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex justify-between">
                          <span>Current Balance:</span>
                          <span>{formatCurrency(getCurrentBalance())}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Minus Payment:</span>
                          <span className="text-blue-600">- {formatCurrency(paymentAmount)}</span>
                        </div>
                        <div className="flex justify-between pt-1 border-t border-gray-300">
                          <span className="font-medium">New Balance:</span>
                          <span className={`font-bold ${
                            getNewBalance() < 0 ? 'text-green-600' :
                            getNewBalance() > 0 ? 'text-red-600' :
                            'text-gray-600'
                          }`}>
                            {formatCurrency(getNewBalance())}
                            {getNewBalance() < 0 && ' (Credit)'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method *
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Mobile Money">Mobile Money</option>
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>
            
            {/* Payment Method Specific Fields */}
            {paymentMethod === 'Mobile Money' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  M-PESA Number *
                </label>
                <input
                  type="text"
                  value={mobileMoneyNo}
                  onChange={(e) => setMobileMoneyNo(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="07XX XXX XXX"
                />
              </div>
            )}
            
            {paymentMethod === 'Bank Transfer' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bank Name *
                </label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Bank name"
                />
              </div>
            )}
            
            {paymentMethod === 'Cheque' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cheque Number *
                </label>
                <input
                  type="text"
                  value={chequeNo}
                  onChange={(e) => setChequeNo(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Cheque number"
                />
              </div>
            )}
            
            {/* Payment Reference */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Reference (Optional)
              </label>
              <input
                type="text"
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Payment reference"
              />
            </div>
          </div>
          
          {/* Payment Summary */}
          <div className="space-y-6">
            <div className="bg-gray-50 border border-gray-300 rounded-lg p-6">
              <h4 className="font-bold text-gray-900 mb-4">Payment Summary</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Student:</span>
                  <span className="font-medium text-right">
                    {selectedStudent.first_name}<br/>
                    {selectedStudent.last_name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Admission:</span>
                  <span className="font-medium">{selectedStudent.admission_no}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Class:</span>
                  <span className="font-medium">{currentClass}</span>
                </div>
                
                <div className="pt-3 border-t border-gray-300">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Current Balance:</span>
                    <span className={`font-bold ${
                      getCurrentBalance() < 0 ? 'text-green-600' :
                      getCurrentBalance() > 0 ? 'text-red-600' :
                      'text-gray-600'
                    }`}>
                      {formatCurrency(getCurrentBalance())}
                    </span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Payment Amount:</span>
                    <span className="font-bold text-blue-600">{formatCurrency(paymentAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="font-medium">{paymentMethod === 'Mobile Money' ? 'Mobile Money' : paymentMethod}</span>
                  </div>
                </div>
                
                <div className="pt-3 border-t border-gray-300">
                  <div className="flex justify-between">
                    <span className="font-bold text-gray-900">New Balance:</span>
                    <span className={`font-bold text-lg ${
                      getNewBalance() < 0 ? 'text-green-600' :
                      getNewBalance() > 0 ? 'text-red-600' :
                      'text-gray-600'
                    }`}>
                      {formatCurrency(getNewBalance())}
                    </span>
                  </div>
                  {getExcessPayment() > 0 && (
                    <div className="text-sm text-yellow-600 mt-2">
                      Excess: {formatCurrency(getExcessPayment())} credit
                    </div>
                  )}
                </div>
              </div>
              
              <button
                onClick={processPayment}
                disabled={!paymentAmount || parseFloat(paymentAmount) <= 0}
                className="w-full mt-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg flex items-center justify-center"
              >
                <Calculator className="w-5 h-5 mr-2" />
                Process Payment
              </button>
              
              {getExcessPayment() > 0 && (
                <div className="text-xs text-yellow-600 mt-3 text-center">
                  Note: Excess payment will be recorded as student credit
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Show invoices if available */}
      {renderInvoicesSection()}
    </>
  )
);

  // Render recent transactions
  const renderRecentTransactions = () => (
    <div className="bg-white rounded-lg border border-gray-300 p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-900">Recent Transactions</h3>
        <button
          onClick={fetchRecentTransactions}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Refresh
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Transaction</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Student</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Amount</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Method</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Date</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-300">
            {recentTransactions.map((transaction) => (
              <tr key={transaction.id}>
                <td className="px-4 py-3 text-sm text-gray-900">{transaction.transaction_no}</td>
                <td className="px-4 py-3">
                  <div className="text-sm font-medium text-gray-900">
                    {transaction.first_name} {transaction.last_name}
                  </div>
                  <div className="text-xs text-gray-600">{transaction.admission_no}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="font-bold text-green-600">
                    {formatCurrency(transaction.amount_kes)}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    transaction.payment_mode === 'Mobile Money' ? 'bg-green-100 text-green-800' :
                    transaction.payment_mode === 'Cash' ? 'bg-blue-100 text-blue-800' :
                    transaction.payment_mode === 'Bank Transfer' ? 'bg-purple-100 text-purple-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {transaction.payment_mode}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {new Date(transaction.payment_date).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    transaction.status === 'VERIFIED' ? 'bg-green-100 text-green-800' :
                    transaction.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {transaction.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {renderNotification()}
      {renderClassStudentsModal()}
      {renderConfirmationModal()}
      {renderReceiptModal()}
      
      <div className="max-w-full">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Fee Payment Management</h1>
          <p className="text-gray-600 mt-1">Process student fee payments and generate receipts</p>
        </div>
        
        <div className="space-y-6">
          {renderSearchSection()}
          {renderPaymentForm()}
          {renderRecentTransactions()}
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-300 text-center text-gray-600 text-sm">
          <p>ELIMUHUB Fee Management System • {new Date().getFullYear()}</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentManagement;