import React, { useState, useEffect, useCallback } from 'react';
import { 
  FiHelpCircle, 
  FiPhone, 
  FiMail, 
  FiFileText, 
  FiVideo, 
  FiDownload,
  FiMessageCircle,
  FiClock,
  FiAlertTriangle,
  FiBookOpen,
  FiRefreshCw,
  FiChevronDown,
  FiChevronUp,
  FiCheckCircle,
  FiAlertCircle,
  FiX,
  FiUser,
  FiBriefcase,
  FiCalendar,
  FiArrowRight
} from 'react-icons/fi';
import {  users } from '../../api';

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
    success: 'bg-linear-to-r from-green-500 to-emerald-500',
    error: 'bg-linear-to-r from-red-500 to-rose-500',
    info: 'bg-linear-to-r from-indigo-500 to-indigo-500',
    warning: 'bg-linear-to-r from-yellow-500 to-amber-500'
  }[type] || 'bg-linear-to-r from-indigo-500 to-indigo-500';

  const icon = {
    success: <FiCheckCircle className="text-white" size={20} />,
    error: <FiAlertCircle className="text-white" size={20} />,
    info: <FiBell className="text-white" size={20} />,
    warning: <FiAlertCircle className="text-white" size={20} />
  }[type] || <FiBell className="text-white" size={20} />;

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className={`${bgColor} text-white rounded-xl shadow-lg p-4 min-w-[300px] flex items-center gap-3`}>
        <div className="shrink-0">{icon}</div>
        <div className="flex-grow"><p className="font-medium">{message}</p></div>
        <button onClick={onClose} className="shrink-0 text-white hover:text-gray-200">
          <FiX size={18} />
        </button>
      </div>
    </div>
  );
});

const HelpSupport = () => {
  const [activeTab, setActiveTab] = useState('faq');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [_loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "info" });
  const [userProfile, setUserProfile] = useState(null);

  const showToast = useCallback((message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "info" }), 3000);
  }, []);

  const closeToast = useCallback(() => {
    setToast({ show: false, message: "", type: "info" });
  }, []);

  // Load user profile
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        setLoading(true);
        const response = await users.getProfile();
        const userData = response.data.data || response.data;
        setUserProfile(userData);
      } catch (error) {
        console.error('Error loading user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, []);

  // FAQ Data - Dynamic based on user role
  const getFaqCategories = () => {
    const baseFaqs = [
      {
        id: 'financial',
        title: 'Financial Management',
        icon: <FiFileText className="text-indigo-500" />,
        questions: [
          {
            id: 1,
            question: 'How do I generate financial statements?',
            answer: 'Navigate to the Reports section, select "Financial Statements", choose the date range, and click Generate. You can export as PDF or Excel for further analysis.'
          },
          {
            id: 2,
            question: 'What is the process for budget approval?',
            answer: 'Submit budget proposals through the Budget Management module. The system will route them for approval, and you can track status in real-time.'
          },
          {
            id: 3,
            question: 'How do I handle audit trail queries?',
            answer: 'Access the Audit Logs section to view complete transaction history. Use filters to narrow down by date, user, or transaction type.'
          }
        ]
      },
      {
        id: 'payroll',
        title: 'Payroll Processing',
        icon: <FiDownload className="text-green-500" />,
        questions: [
          {
            id: 4,
            question: 'How do I process staff salaries?',
            answer: 'Go to Payroll Management, verify staff attendance, apply deductions and allowances, review calculations, and process payments. The system automatically generates payslips.'
          },
          {
            id: 5,
            question: 'What tax calculations are automated?',
            answer: 'PAYE, NSSF, NHIF, and other statutory deductions are automatically calculated based on current rates and staff details.'
          },
          {
            id: 6,
            question: 'Can I generate payroll reports for management?',
            answer: 'Yes, comprehensive payroll reports including salary summaries, deduction breakdowns, and tax compliance reports are available in the Reports section.'
          }
        ]
      },
      {
        id: 'expenses',
        title: 'Expense Management',
        icon: <FiFileText className="text-red-500" />,
        questions: [
          {
            id: 7,
            question: 'How do I approve expense requests?',
            answer: 'Access the Expense Management module, review pending requests, check supporting documents, and approve or reject with comments. Approved expenses are automatically recorded.'
          },
          {
            id: 8,
            question: 'What expense categories are available?',
            answer: 'The system includes categories for utilities, maintenance, supplies, salaries, training, and more. You can also create custom categories as needed.'
          }
        ]
      },
      {
        id: 'technical',
        title: 'Technical Support',
        icon: <FiHelpCircle className="text-purple-500" />,
        questions: [
          {
            id: 9,
            question: 'How do I reset my password?',
            answer: 'Click on your profile picture → Settings → Change Password. Ensure your new password meets security requirements.'
          },
          {
            id: 10,
            question: 'What should I do if I encounter system errors?',
            answer: 'Note the error code and message, then contact IT support immediately. For urgent issues, use the emergency hotline.'
          }
        ]
      }
    ];

    // If user is an accountant, add accounting-specific FAQs
    if (userProfile?.role === 'accountant') {
      baseFaqs.push({
        id: 'accounting',
        title: 'Advanced Accounting',
        icon: <FiBookOpen className="text-amber-500" />,
        questions: [
          {
            id: 11,
            question: 'How do I handle accruals and prepayments?',
            answer: 'Use the journal entries module to record accruals and prepayments. The system will automatically reverse them in the next period if configured.'
          },
          {
            id: 12,
            question: 'What is the process for year-end closing?',
            answer: 'Year-end closing involves reviewing all accounts, making adjusting entries, generating final financial statements, and locking the fiscal year.'
          }
        ]
      });
    }

    return baseFaqs;
  };

  const faqCategories = getFaqCategories();

  // Contact Information
  const contactInfo = [
    {
      department: 'IT Support Team',
      phone: '+254 700 123 456',
      email: 'it-support@elimuhub.edu',
      hours: 'Mon-Fri 8:00 AM - 5:00 PM',
      icon: <FiHelpCircle className="text-indigo-500" />,
      description: 'Technical issues, system errors, password reset'
    },
    {
      department: 'Finance Director',
      phone: '+254 700 123 459',
      email: 'finance-director@elimuhub.edu',
      hours: 'Mon-Fri 8:30 AM - 4:30 PM',
      icon: <FiFileText className="text-green-500" />,
      description: 'Budget approvals, financial policies, audit queries'
    },
    {
      department: 'System Administrator',
      phone: '+254 700 123 458',
      email: 'system-admin@elimuhub.edu',
      hours: '24/7 Emergency',
      icon: <FiAlertTriangle className="text-red-500" />,
      description: 'Critical system failures, security concerns'
    }
  ];

  // Quick Guides
  const quickGuides = [
    {
      title: 'Monthly Financial Closing',
      steps: [
        'Review all transactions for the month',
        'Reconcile bank statements',
        'Generate trial balance',
        'Process depreciation if applicable',
        'Review and post adjusting entries',
        'Generate financial statements',
        'Prepare management reports'
      ],
      icon: <FiFileText className="text-indigo-500" />,
      duration: '45-60 mins'
    },
    {
      title: 'Payroll Processing',
      steps: [
        'Verify staff attendance records',
        'Review overtime and bonuses',
        'Process statutory deductions',
        'Calculate net salaries',
        'Generate payroll report',
        'Submit for approval',
        'Process payments'
      ],
      icon: <FiDownload className="text-green-500" />,
      duration: '30-45 mins'
    },
    {
      title: 'Budget vs Actual Analysis',
      steps: [
        'Access budget management module',
        'Select reporting period',
        'Generate variance report',
        'Analyze significant variances',
        'Prepare explanation notes',
        'Submit to management',
        'Update forecasts if needed'
      ],
      icon: <FiBookOpen className="text-purple-500" />,
      duration: '25-35 mins'
    }
  ];

  // Resources
  const resources = [
    {
      title: 'Financial Reporting Manual',
      type: 'PDF',
      size: '2.4 MB',
      icon: <FiFileText className="text-indigo-500" />,
      category: 'Documentation'
    },
    {
      title: 'Tax Compliance Guide',
      type: 'PDF',
      size: '1.8 MB',
      icon: <FiFileText className="text-red-500" />,
      category: 'Compliance'
    },
    {
      title: 'Payroll Processing Video',
      type: 'MP4',
      size: '45 MB',
      icon: <FiVideo className="text-purple-500" />,
      category: 'Training'
    },
    {
      title: 'Audit Preparation Checklist',
      type: 'PDF',
      size: '1.2 MB',
      icon: <FiFileText className="text-green-500" />,
      category: 'Checklists'
    }
  ];

  const toggleFaq = (faqId) => {
    setExpandedFaq(expandedFaq === faqId ? null : faqId);
  };

  const filteredFaqs = faqCategories.map(category => ({
    ...category,
    questions: category.questions.filter(q => 
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  // Handle resource download
  const handleDownload = (resource) => {
    showToast(`Downloading ${resource.title}...`, 'info');
    // In a real implementation, this would trigger actual download
    setTimeout(() => {
      showToast(`${resource.title} downloaded successfully!`, 'success');
    }, 1500);
  };

  // Handle contact support
  const handleContactSupport = (contact) => {
    showToast(`Connecting to ${contact.department}...`, 'info');
    // In a real implementation, this would open a chat or email
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <Toast show={toast.show} message={toast.message} type={toast.type} onClose={closeToast} />
      
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-3">
            <FiHelpCircle className="text-indigo-600" />
            Help & Support
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Comprehensive support for financial management, payroll processing, and accounting operations
          </p>
          {userProfile && (
            <div className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-lg">
              <FiUser className="text-indigo-600" />
              <span className="text-sm text-gray-700">Welcome, {userProfile.first_name || userProfile.username}</span>
              <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-1 rounded-full">
                {userProfile.role || 'Accountant'}
              </span>
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <FiHelpCircle className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
              <input
                type="text"
                placeholder="Search for accounting procedures, financial queries, or technical issues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-12 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg bg-gray-50"
              />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex flex-wrap -mb-px">
              {[
                { id: 'faq', label: 'FAQ & Knowledge Base', icon: <FiHelpCircle /> },
                { id: 'contact', label: 'Contact Support', icon: <FiPhone /> },
                { id: 'guides', label: 'Guides', icon: <FiBookOpen /> },
                { id: 'resources', label: 'Resources', icon: <FiDownload /> }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-6 border-b-2 font-medium text-sm md:text-base transition-colors ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600 bg-indigo-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6 md:p-8">
            {/* FAQ Tab */}
            {activeTab === 'faq' && (
              <div className="space-y-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Frequently Asked Questions</h2>
                {filteredFaqs.length > 0 ? (
                  filteredFaqs.map((category) => (
                    <div key={category.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <div className="flex items-center space-x-3 mb-4">
                        {category.icon}
                        <h3 className="text-xl font-semibold text-gray-800">{category.title}</h3>
                      </div>
                      <div className="space-y-4">
                        {category.questions.map((faq) => (
                          <div key={faq.id} className="bg-white rounded-lg border border-gray-200 hover:border-indigo-200 transition-colors">
                            <button
                              onClick={() => toggleFaq(faq.id)}
                              className="w-full flex items-center justify-between p-4 text-left hover:bg-indigo-50 rounded-lg transition-colors"
                            >
                              <span className="font-medium text-gray-800 pr-4 text-left">{faq.question}</span>
                              {expandedFaq === faq.id ? <FiChevronUp className="text-gray-400" /> : <FiChevronDown className="text-gray-400" />}
                            </button>
                            {expandedFaq === faq.id && (
                              <div className="px-4 pb-4 border-t border-gray-100 pt-4">
                                <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <FiHelpCircle className="mx-auto text-gray-400 text-4xl mb-3" />
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">No results found</h3>
                    <p className="text-gray-600">Try adjusting your search terms or browse different categories.</p>
                  </div>
                )}
              </div>
            )}

            {/* Contact Support Tab */}
            {activeTab === 'contact' && (
              <div className="space-y-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Support Contacts</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {contactInfo.map((contact, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-center space-x-3 mb-4">
                        {contact.icon}
                        <h3 className="text-xl font-semibold text-gray-800">{contact.department}</h3>
                      </div>
                      <p className="text-gray-600 text-sm mb-4">{contact.description}</p>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <FiPhone className="text-gray-400" />
                          <span className="font-medium text-gray-800">{contact.phone}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <FiMail className="text-gray-400" />
                          <span className="font-medium text-gray-800">{contact.email}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <FiClock className="text-gray-400" />
                          <span className="text-gray-600 text-sm">{contact.hours}</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleContactSupport(contact)}
                        className="w-full mt-4 bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-2"
                      >
                        <FiMessageCircle />
                        <span>Contact Now</span>
                      </button>
                    </div>
                  ))}
                </div>

                {/* Emergency Support */}
                <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <FiAlertTriangle className="text-red-500 text-xl" />
                    <h3 className="text-xl font-semibold text-red-800">Critical Issues</h3>
                  </div>
                  <p className="text-red-700 mb-4">
                    For urgent financial discrepancies, system failures during month-end closing, or security breaches.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center space-x-2">
                      <FiPhone />
                      <span>Emergency Hotline</span>
                    </button>
                    <button className="border border-red-600 text-red-600 px-6 py-3 rounded-lg font-semibold hover:bg-red-50 transition-colors">
                      Submit Urgent Ticket
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Guides Tab */}
            {activeTab === 'guides' && (
              <div className="space-y-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Accounting Guides</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {quickGuides.map((guide, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          {guide.icon}
                          <h3 className="text-xl font-semibold text-gray-800">{guide.title}</h3>
                        </div>
                        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">{guide.duration}</span>
                      </div>
                      <ol className="space-y-3">
                        {guide.steps.map((step, stepIndex) => (
                          <li key={stepIndex} className="flex items-start space-x-3">
                            <span className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full text-sm flex items-center justify-center font-semibold mt-0.5 shrink-0">
                              {stepIndex + 1}
                            </span>
                            <span className="text-gray-600 flex-1">{step}</span>
                          </li>
                        ))}
                      </ol>
                      <button className="w-full mt-4 bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-2">
                        <FiBookOpen />
                        <span>View Full Guide</span>
                      </button>
                    </div>
                  ))}
                </div>

                {/* Video Tutorials */}
                <div className="bg-linear-to-r from-indigo-600 to-indigo-700 rounded-xl p-6 text-white">
                  <div className="flex flex-col md:flex-row items-center justify-between">
                    <div className="mb-4 md:mb-0">
                      <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
                        <FiVideo />
                        Video Tutorials
                      </h3>
                      <p className="text-indigo-100">Watch video guides for complex accounting procedures</p>
                    </div>
                    <button className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-colors flex items-center space-x-2">
                      <FiVideo />
                      <span>Browse Library</span>
                      <FiArrowRight />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Resources Tab */}
            {activeTab === 'resources' && (
              <div className="space-y-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Resources & Documents</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Documentation */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <FiFileText className="text-indigo-500" />
                      <h3 className="text-xl font-semibold text-gray-800">Documentation</h3>
                    </div>
                    <p className="text-gray-600 mb-4">
                      Complete accounting procedures, policies, and compliance guidelines.
                    </p>
                    <div className="space-y-3">
                      {resources.filter(r => r.category === 'Documentation' || r.category === 'Compliance').map((resource, idx) => (
                        <button 
                          key={idx}
                          onClick={() => handleDownload(resource)}
                          className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-indigo-50 transition-colors flex items-center justify-between"
                        >
                          <div className="flex items-center space-x-3">
                            {resource.icon}
                            <span className="font-medium text-gray-800">{resource.title}</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className="text-xs text-gray-500">{resource.type} • {resource.size}</span>
                            <FiDownload className="text-gray-400" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Training Materials */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <FiBookOpen className="text-green-500" />
                      <h3 className="text-xl font-semibold text-gray-800">Training Resources</h3>
                    </div>
                    <p className="text-gray-600 mb-4">
                      Training materials, workshops, and certification programs.
                    </p>
                    <div className="space-y-3">
                      {resources.filter(r => r.category === 'Training' || r.category === 'Checklists').map((resource, idx) => (
                        <button 
                          key={idx}
                          onClick={() => handleDownload(resource)}
                          className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-green-50 transition-colors flex items-center justify-between"
                        >
                          <div className="flex items-center space-x-3">
                            {resource.icon}
                            <span className="font-medium text-gray-800">{resource.title}</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className="text-xs text-gray-500">{resource.type} • {resource.size}</span>
                            <FiDownload className="text-gray-400" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* System Updates */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6 md:col-span-2">
                    <div className="flex items-center space-x-3 mb-4">
                      <FiRefreshCw className="text-purple-500" />
                      <h3 className="text-xl font-semibold text-gray-800">System Updates</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                        <div>
                          <h4 className="font-semibold text-green-800">New Financial Reports Available</h4>
                          <p className="text-green-600">Enhanced cash flow statements and budget variance reports</p>
                        </div>
                        <span className="text-green-500 text-sm bg-green-100 px-2 py-1 rounded">New</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                        <div>
                          <h4 className="font-semibold text-indigo-800">Tax Rate Updates</h4>
                          <p className="text-indigo-600">Latest tax tables and compliance requirements implemented</p>
                        </div>
                        <span className="text-indigo-500 text-sm bg-indigo-100 px-2 py-1 rounded">Updated</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="bg-linear-to-r from-indigo-600 to-indigo-700 rounded-xl shadow-lg p-8 text-white text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Need Assistance?</h2>
          <p className="text-indigo-100 text-lg mb-6 max-w-2xl mx-auto">
            Our specialized support team is available to help with financial queries, system issues, and procedural guidance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-colors flex items-center justify-center space-x-2">
              <FiMessageCircle />
              <span>Live Chat</span>
            </button>
            <button className="border border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-indigo-600 transition-colors">
              Schedule Training
            </button>
          </div>
        </div>
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

export default HelpSupport;