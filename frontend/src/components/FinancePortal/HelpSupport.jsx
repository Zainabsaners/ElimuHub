/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
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
  FiChevronUp
} from 'react-icons/fi';

const HelpSupport = () => {
  const [activeTab, setActiveTab] = useState('faq');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(null);

  // FAQ Data for Accountant
  const faqCategories = [
    {
      id: 'financial',
      title: 'Financial Management',
      icon: <FiFileText className="text-blue-500" />,
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

  // Contact Information for Accountant
  const contactInfo = [
    {
      department: 'IT Support Team',
      phone: '+254 700 123 456',
      email: 'it-support@school.edu',
      hours: 'Mon-Fri 8:00 AM - 5:00 PM',
      icon: <FiHelpCircle className="text-blue-500" />,
      description: 'Technical issues, system errors, password reset'
    },
    {
      department: 'Finance Director',
      phone: '+254 700 123 459',
      email: 'finance-director@school.edu',
      hours: 'Mon-Fri 8:30 AM - 4:30 PM',
      icon: <FiFileText className="text-green-500" />,
      description: 'Budget approvals, financial policies, audit queries'
    },
    {
      department: 'System Administrator',
      phone: '+254 700 123 458',
      email: 'system-admin@school.edu',
      hours: '24/7 Emergency',
      icon: <FiAlertTriangle className="text-red-500" />,
      description: 'Critical system failures, security concerns'
    }
  ];

  // Quick Guides for Accountant
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
      icon: <FiFileText className="text-blue-500" />,
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

  // Resources for Accountant
  const resources = [
    {
      title: 'Financial Reporting Manual',
      type: 'PDF',
      size: '2.4 MB',
      icon: <FiFileText className="text-blue-500" />,
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

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-3">
            <FiHelpCircle className="text-blue-600" />
            Accountant Help & Support
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Comprehensive support for financial management, payroll processing, and accounting operations
          </p>
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
                className="w-full px-12 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg bg-gray-50"
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
                { id: 'guides', label: 'Accounting Guides', icon: <FiBookOpen /> },
                { id: 'resources', label: 'Resources', icon: <FiDownload /> }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-6 border-b-2 font-medium text-sm md:text-base transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
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
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Accounting Frequently Asked Questions</h2>
                {filteredFaqs.length > 0 ? (
                  filteredFaqs.map((category) => (
                    <div key={category.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <div className="flex items-center space-x-3 mb-4">
                        {category.icon}
                        <h3 className="text-xl font-semibold text-gray-800">{category.title}</h3>
                      </div>
                      <div className="space-y-4">
                        {category.questions.map((faq) => (
                          <div key={faq.id} className="bg-white rounded-lg border border-gray-200 hover:border-blue-200 transition-colors">
                            <button
                              onClick={() => toggleFaq(faq.id)}
                              className="w-full flex items-center justify-between p-4 text-left hover:bg-blue-50 rounded-lg transition-colors"
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
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Accounting Support Contacts</h2>
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
                      <button className="w-full mt-4 bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2">
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
                    <h3 className="text-xl font-semibold text-red-800">Critical Accounting Issues</h3>
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

            {/* Accounting Guides Tab */}
            {activeTab === 'guides' && (
              <div className="space-y-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Accounting Procedures & Guides</h2>
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
                            <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-sm flex items-center justify-center font-semibold mt-0.5 flex-shrink-0">
                              {stepIndex + 1}
                            </span>
                            <span className="text-gray-600 flex-1">{step}</span>
                          </li>
                        ))}
                      </ol>
                      <button className="w-full mt-4 bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2">
                        <FiBookOpen />
                        <span>View Detailed Procedure</span>
                      </button>
                    </div>
                  ))}
                </div>

                {/* Video Tutorials */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                  <div className="flex flex-col md:flex-row items-center justify-between">
                    <div className="mb-4 md:mb-0">
                      <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
                        <FiVideo />
                        Accounting Tutorials
                      </h3>
                      <p className="text-blue-100">Watch video guides for complex accounting procedures and system features</p>
                    </div>
                    <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center space-x-2">
                      <FiVideo />
                      <span>Browse Video Library</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Resources Tab */}
            {activeTab === 'resources' && (
              <div className="space-y-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Accounting Resources & Documents</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Documentation */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <FiFileText className="text-blue-500" />
                      <h3 className="text-xl font-semibold text-gray-800">Accounting Manuals</h3>
                    </div>
                    <p className="text-gray-600 mb-4">
                      Complete accounting procedures, policies, and compliance guidelines.
                    </p>
                    <div className="space-y-3">
                      <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-between">
                        <span>Financial Reporting Manual</span>
                        <FiDownload className="text-gray-400" />
                      </button>
                      <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-between">
                        <span>Internal Controls Guide</span>
                        <FiDownload className="text-gray-400" />
                      </button>
                      <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-between">
                        <span>Audit Preparation Handbook</span>
                        <FiDownload className="text-gray-400" />
                      </button>
                    </div>
                  </div>

                  {/* Training Materials */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <FiBookOpen className="text-green-500" />
                      <h3 className="text-xl font-semibold text-gray-800">Training Resources</h3>
                    </div>
                    <p className="text-gray-600 mb-4">
                      Training materials, workshops, and certification programs for accounting staff.
                    </p>
                    <div className="space-y-3">
                      <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-green-50 transition-colors flex items-center justify-between">
                        <span>System Training Slides</span>
                        <FiDownload className="text-gray-400" />
                      </button>
                      <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-green-50 transition-colors flex items-center justify-between">
                        <span>Advanced Accounting Workshop</span>
                        <FiDownload className="text-gray-400" />
                      </button>
                      <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-green-50 transition-colors flex items-center justify-between">
                        <span>Professional Development</span>
                        <FiDownload className="text-gray-400" />
                      </button>
                    </div>
                  </div>

                  {/* System Updates */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6 md:col-span-2">
                    <div className="flex items-center space-x-3 mb-4">
                      <FiRefreshCw className="text-purple-500" />
                      <h3 className="text-xl font-semibold text-gray-800">System Updates & Accounting News</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                        <div>
                          <h4 className="font-semibold text-green-800">New Financial Reports Available</h4>
                          <p className="text-green-600">Enhanced cash flow statements and budget variance reports</p>
                        </div>
                        <span className="text-green-500 text-sm bg-green-100 px-2 py-1 rounded">New</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div>
                          <h4 className="font-semibold text-blue-800">Tax Rate Updates</h4>
                          <p className="text-blue-600">Latest tax tables and compliance requirements implemented</p>
                        </div>
                        <span className="text-blue-500 text-sm bg-blue-100 px-2 py-1 rounded">Updated</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg p-8 text-white text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Need Accounting Assistance?</h2>
          <p className="text-blue-100 text-lg mb-6 max-w-2xl mx-auto">
            Our specialized accounting support team is available to help with financial queries, system issues, and procedural guidance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center justify-center space-x-2">
              <FiMessageCircle />
              <span>Live Chat with Expert</span>
            </button>
            <button className="border border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
              Schedule Training Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpSupport;