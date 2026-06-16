import React, { useState } from 'react';

const HelpSupport = () => {
  const [activeTab, setActiveTab] = useState('faq');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(null);

  // FAQ Data
  const faqCategories = [
    {
      id: 'payments',
      title: 'Payments & Fees',
      icon: '💰',
      questions: [
        {
          id: 1,
          question: 'How do I process a student fee payment?',
          answer: 'Navigate to the Payments section, enter the student admission number, verify their details, select payment method, enter amount, and confirm the transaction. The system will automatically generate a receipt.'
        },
        {
          id: 2,
          question: 'What payment methods are accepted?',
          answer: 'We accept MPESA, cash, bank transfers, and cheques. MPESA is the preferred method for faster processing.'
        },
        {
          id: 3,
          question: 'How can I view payment history for a student?',
          answer: 'Go to Payment Records and use the search functionality with the student admission number to view their complete payment history.'
        }
      ]
    },
    {
      id: 'reports',
      title: 'Reports & Analytics',
      icon: '📊',
      questions: [
        {
          id: 4,
          question: 'How do I generate financial reports?',
          answer: 'Access the Reports section, select the report type (financial summary, collection report, etc.), set the date range, and click Generate Report. You can export in PDF or Excel format.'
        },
        {
          id: 5,
          question: 'Can I customize report parameters?',
          answer: 'Yes, all reports allow customization by date range, grade level, payment method, and other filters to meet your specific needs.'
        }
      ]
    },
    {
      id: 'technical',
      title: 'Technical Support',
      icon: '🔧',
      questions: [
        {
          id: 6,
          question: 'What should I do if the system is running slow?',
          answer: 'Clear your browser cache, ensure stable internet connection, and try again. If issues persist, contact IT support immediately.'
        },
        {
          id: 7,
          question: 'How do I reset my password?',
          answer: 'Go to Settings > Password section to change your password. Ensure it meets the security requirements.'
        }
      ]
    }
  ];

  // Contact Information
  const contactInfo = [
    {
      department: 'IT Support',
      phone: '+254 700 123 456',
      email: 'itsupport@school.edu',
      hours: 'Mon-Fri 8:00 AM - 5:00 PM',
      icon: '💻'
    },
    {
      department: 'Bursar Office',
      phone: '+254 700 123 457',
      email: 'bursar@school.edu',
      hours: 'Mon-Fri 8:00 AM - 4:00 PM',
      icon: '🏫'
    },
    {
      department: 'System Administrator',
      phone: '+254 700 123 458',
      email: 'admin@school.edu',
      hours: '24/7 Emergency',
      icon: '🔐'
    }
  ];

  // Quick Guides
  const quickGuides = [
    {
      title: 'Processing Payments',
      steps: ['Navigate to Payments', 'Enter admission number', 'Verify student details', 'Enter payment amount', 'Select payment method', 'Confirm transaction'],
      icon: '💰'
    },
    {
      title: 'Generating Reports',
      steps: ['Go to Reports section', 'Select report type', 'Set date range', 'Apply filters', 'Generate report', 'Export if needed'],
      icon: '📊'
    },
    {
      title: 'Managing Fee Structure',
      steps: ['Access Fee Structure', 'Select academic term', 'View/Edit grades', 'Update amounts', 'Save changes', 'Verify totals'],
      icon: '📝'
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 w-full p-4 md:p-6">
      <div className="w-full max-w-full mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Help & Support Center
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Get assistance with the Bursar Management System. Find answers to common questions, contact support, and access helpful guides.
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for help topics, questions, or issues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-4 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                <span className="text-gray-400 text-xl">🔍</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl shadow-lg mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex flex-wrap -mb-px">
              {[
                { id: 'faq', label: 'FAQ & Knowledge Base', icon: '❓' },
                { id: 'contact', label: 'Contact Support', icon: '📞' },
                { id: 'guides', label: 'Quick Guides', icon: '📚' },
                { id: 'resources', label: 'Resources', icon: '📁' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-6 border-b-2 font-medium text-sm md:text-base transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
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
                    <div key={category.id} className="bg-gray-50 rounded-xl p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <span className="text-2xl">{category.icon}</span>
                        <h3 className="text-xl font-semibold text-gray-800">{category.title}</h3>
                      </div>
                      <div className="space-y-4">
                        {category.questions.map((faq) => (
                          <div key={faq.id} className="bg-white rounded-lg border border-gray-200">
                            <button
                              onClick={() => toggleFaq(faq.id)}
                              className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 rounded-lg transition-colors"
                            >
                              <span className="font-medium text-gray-800 pr-4">{faq.question}</span>
                              <span className={`transform transition-transform ${expandedFaq === faq.id ? 'rotate-180' : ''}`}>
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </span>
                            </button>
                            {expandedFaq === faq.id && (
                              <div className="px-4 pb-4">
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
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">No results found</h3>
                    <p className="text-gray-600">Try adjusting your search terms or browse the categories above.</p>
                  </div>
                )}
              </div>
            )}

            {/* Contact Support Tab */}
            {activeTab === 'contact' && (
              <div className="space-y-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Contact Support Team</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {contactInfo.map((contact, index) => (
                    <div key={index} className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
                      <div className="text-3xl mb-4">{contact.icon}</div>
                      <h3 className="text-xl font-semibold mb-3">{contact.department}</h3>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <span>📞</span>
                          <span className="font-medium">{contact.phone}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span>✉️</span>
                          <span className="font-medium">{contact.email}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span>🕒</span>
                          <span className="text-blue-100">{contact.hours}</span>
                        </div>
                      </div>
                      <button className="w-full mt-4 bg-white text-blue-600 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                        Contact Now
                      </button>
                    </div>
                  ))}
                </div>

                {/* Emergency Support */}
                <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <span className="text-2xl">🚨</span>
                    <h3 className="text-xl font-semibold text-red-800">Emergency System Issues</h3>
                  </div>
                  <p className="text-red-700 mb-4">
                    For critical system failures, payment processing issues, or security concerns, contact the System Administrator immediately.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center space-x-2">
                      <span>🚨</span>
                      <span>Emergency Hotline</span>
                    </button>
                    <button className="border border-red-600 text-red-600 px-6 py-3 rounded-lg font-semibold hover:bg-red-50 transition-colors">
                      Submit Urgent Ticket
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Guides Tab */}
            {activeTab === 'guides' && (
              <div className="space-y-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Start Guides</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {quickGuides.map((guide, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-center space-x-3 mb-4">
                        <span className="text-2xl">{guide.icon}</span>
                        <h3 className="text-xl font-semibold text-gray-800">{guide.title}</h3>
                      </div>
                      <ol className="space-y-2">
                        {guide.steps.map((step, stepIndex) => (
                          <li key={stepIndex} className="flex items-start space-x-3">
                            <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-sm flex items-center justify-center font-semibold mt-0.5">
                              {stepIndex + 1}
                            </span>
                            <span className="text-gray-600 flex-1">{step}</span>
                          </li>
                        ))}
                      </ol>
                      <button className="w-full mt-4 bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 transition-colors">
                        View Detailed Guide
                      </button>
                    </div>
                  ))}
                </div>

                {/* Video Tutorials */}
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white">
                  <div className="flex flex-col md:flex-row items-center justify-between">
                    <div className="mb-4 md:mb-0">
                      <h3 className="text-2xl font-bold mb-2">Video Tutorials</h3>
                      <p className="text-purple-100">Watch step-by-step video guides for all system features</p>
                    </div>
                    <button className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors flex items-center space-x-2">
                      <span>🎬</span>
                      <span>Browse Videos</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Resources Tab */}
            {activeTab === 'resources' && (
              <div className="space-y-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Helpful Resources</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Documentation */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <span className="text-2xl">📄</span>
                      <h3 className="text-xl font-semibold text-gray-800">System Documentation</h3>
                    </div>
                    <p className="text-gray-600 mb-4">
                      Complete user manuals and technical documentation for the Bursar Management System.
                    </p>
                    <div className="space-y-2">
                      <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        User Manual PDF
                      </button>
                      <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        Technical Specifications
                      </button>
                      <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        API Documentation
                      </button>
                    </div>
                  </div>

                  {/* Training Materials */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <span className="text-2xl">🎓</span>
                      <h3 className="text-xl font-semibold text-gray-800">Training Materials</h3>
                    </div>
                    <p className="text-gray-600 mb-4">
                      Access training slides, workshops, and certification materials.
                    </p>
                    <div className="space-y-2">
                      <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        Bursar Training Slides
                      </button>
                      <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        Workshop Recordings
                      </button>
                      <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        Certification Program
                      </button>
                    </div>
                  </div>

                  {/* System Updates */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6 md:col-span-2">
                    <div className="flex items-center space-x-3 mb-4">
                      <span className="text-2xl">🔄</span>
                      <h3 className="text-xl font-semibold text-gray-800">System Updates & News</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                        <div>
                          <h4 className="font-semibold text-green-800">Version 2.1.0 Released</h4>
                          <p className="text-green-600">New reporting features and performance improvements</p>
                        </div>
                        <span className="text-green-400">Latest</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                        <div>
                          <h4 className="font-semibold text-blue-800">Maintenance Scheduled</h4>
                          <p className="text-blue-600">System maintenance on Saturday, 8:00 PM - 10:00 PM</p>
                        </div>
                        <span className="text-blue-400">Upcoming</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-lg p-8 text-white text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Still Need Help?</h2>
          <p className="text-blue-100 text-lg mb-6 max-w-2xl mx-auto">
            Our support team is ready to assist you with any questions or issues you may encounter.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center justify-center space-x-2">
              <span>💬</span>
              <span>Live Chat Support</span>
            </button>
            <button className="border border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
              Submit Support Ticket
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpSupport;