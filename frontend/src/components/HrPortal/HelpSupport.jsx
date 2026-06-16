import React, { useState } from 'react';
import { 
  HelpCircle, FileText, Phone, Mail, MessageSquare,
  ChevronRight, Search, Download, Clock, CheckCircle,
  AlertCircle, BookOpen, Users, Settings
} from 'lucide-react';

const HelpSupport = () => {
  const [activeSection, setActiveSection] = useState('faq');
  const [searchQuery, setSearchQuery] = useState('');

  const faqCategories = [
    {
      id: 'recruitment',
      title: 'Recruitment Process',
      icon: <Users className="h-5 w-5" />,
      questions: [
        { q: 'How do I submit a recruitment request?', a: 'Navigate to Recruitment > New Recruitment Request and fill the form. It will be sent to admin for approval.' },
        { q: 'What is the approval process?', a: 'HR submits request → Admin reviews → If approved, HR proceeds with recruitment → If rejected, request is archived.' },
        { q: 'What documents are required?', a: 'Job description, required qualifications, salary range, and department approval.' }
      ]
    },
    {
      id: 'staff',
      title: 'Staff Management',
      icon: <Users className="h-5 w-5" />,
      questions: [
        { q: 'How to add new staff?', a: 'After admin approval, go to Staff Management > Add Staff and fill all required fields including payroll details.' },
        { q: 'How to process leave requests?', a: 'Go to Staff Management > Leave Management tab to view and approve/reject leave requests.' }
      ]
    },
    {
      id: 'payroll',
      title: 'Payroll Management',
      icon: <Settings className="h-5 w-5" />,
      questions: [
        { q: 'When is payroll processed?', a: 'Payroll is processed on the 25th of every month. Ensure all changes are submitted by the 20th.' },
        { q: 'How to update staff salary?', a: 'Go to Staff Management > Edit Staff > Payroll section. Changes require admin approval.' }
      ]
    }
  ];

  const supportContacts = [
    { type: 'IT Support', contact: 'support@school.ac.ke', phone: '+254 700 123 456', hours: '8:00 AM - 5:00 PM' },
    { type: 'HR Department', contact: 'hr@school.ac.ke', phone: '+254 700 123 457', hours: '8:30 AM - 4:30 PM' },
    { type: 'Administration', contact: 'admin@school.ac.ke', phone: '+254 700 123 458', hours: '9:00 AM - 4:00 PM' }
  ];

  const documents = [
    { name: 'HR Policy Manual', size: '2.4 MB', type: 'PDF', updated: '2024-01-15' },
    { name: 'Recruitment Procedure', size: '1.8 MB', type: 'PDF', updated: '2024-02-20' },
    { name: 'Leave Policy', size: '1.2 MB', type: 'PDF', updated: '2024-03-01' },
    { name: 'Payroll Guide', size: '3.1 MB', type: 'PDF', updated: '2024-01-30' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6 overflow-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Help & Support</h1>
        <p className="text-gray-600 mt-2">Find answers, documents, and support contacts</p>
      </div>

      {/* Search */}
      <div className="relative max-w-2xl mb-8">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          type="text"
          placeholder="Search for help articles, documents, or FAQs..."
          className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Navigation */}
      <div className="flex flex-wrap gap-3 mb-8">
        <button
          onClick={() => setActiveSection('faq')}
          className={`px-4 py-2 rounded-lg flex items-center ${
            activeSection === 'faq' 
              ? 'bg-blue-600 text-white' 
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          <HelpCircle className="h-4 w-4 mr-2" />
          FAQs
        </button>
        <button
          onClick={() => setActiveSection('docs')}
          className={`px-4 py-2 rounded-lg flex items-center ${
            activeSection === 'docs' 
              ? 'bg-blue-600 text-white' 
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          <FileText className="h-4 w-4 mr-2" />
          Documents
        </button>
        <button
          onClick={() => setActiveSection('contact')}
          className={`px-4 py-2 rounded-lg flex items-center ${
            activeSection === 'contact' 
              ? 'bg-blue-600 text-white' 
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          <Phone className="h-4 w-4 mr-2" />
          Contact Support
        </button>
        <button
          onClick={() => setActiveSection('ticket')}
          className={`px-4 py-2 rounded-lg flex items-center ${
            activeSection === 'ticket' 
              ? 'bg-blue-600 text-white' 
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Submit Ticket
        </button>
      </div>

      {/* FAQ Section */}
      {activeSection === 'faq' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-800">Frequently Asked Questions</h2>
          {faqCategories.map((category) => (
            <div key={category.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg mr-3">
                  {category.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-800">{category.title}</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {category.questions.map((item, index) => (
                  <div key={index} className="px-6 py-4 hover:bg-gray-50">
                    <details className="group">
                      <summary className="flex justify-between items-center cursor-pointer list-none">
                        <span className="font-medium text-gray-800">{item.q}</span>
                        <ChevronRight className="h-5 w-5 text-gray-400 group-open:rotate-90 transition-transform" />
                      </summary>
                      <div className="mt-3 text-gray-600 bg-gray-50 p-4 rounded-lg">
                        {item.a}
                      </div>
                    </details>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Documents Section */}
      {activeSection === 'docs' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-800">HR Documents & Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((doc, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-red-100 text-red-600 rounded-lg">
                    <FileText className="h-6 w-6" />
                  </div>
                  <button className="text-blue-600 hover:text-blue-800">
                    <Download className="h-5 w-5" />
                  </button>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">{doc.name}</h3>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{doc.type} • {doc.size}</span>
                  <span>Updated: {new Date(doc.updated).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contact Section */}
      {activeSection === 'contact' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-800">Contact Support</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {supportContacts.map((contact, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg mr-3">
                    {index === 0 ? <Settings className="h-5 w-5" /> : 
                     index === 1 ? <Users className="h-5 w-5" /> : 
                     <AlertCircle className="h-5 w-5" />}
                  </div>
                  <h3 className="font-semibold text-gray-800">{contact.type}</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <Mail className="h-4 w-4 mr-2" />
                    <span>{contact.contact}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    <span>{contact.phone}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>{contact.hours}</span>
                  </div>
                </div>
                <button className="w-full mt-6 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                  Send Message
                </button>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Quick Support Form</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Brief description of your issue"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Detailed description of your issue..."
                />
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Submit Support Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ticket Section */}
      {activeSection === 'ticket' && (
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="text-center mb-8">
              <div className="inline-flex p-3 bg-blue-100 text-blue-600 rounded-full mb-4">
                <MessageSquare className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Submit Support Ticket</h2>
              <p className="text-gray-600">We'll respond to your ticket within 24 hours</p>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="your.email@school.ac.ke"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="">Select Department</option>
                  <option value="hr">Human Resources</option>
                  <option value="academic">Academic</option>
                  <option value="administration">Administration</option>
                  <option value="finance">Finance</option>
                  <option value="it">IT Support</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Issue Type *</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="">Select Issue Type</option>
                  <option value="technical">Technical Issue</option>
                  <option value="process">Process Question</option>
                  <option value="bug">Software Bug</option>
                  <option value="feature">Feature Request</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority *</label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input type="radio" name="priority" value="low" className="mr-2" />
                    <span className="text-green-600">Low</span>
                  </label>
                  <label className="flex items-center">
                    <input type="radio" name="priority" value="medium" className="mr-2" />
                    <span className="text-amber-600">Medium</span>
                  </label>
                  <label className="flex items-center">
                    <input type="radio" name="priority" value="high" className="mr-2" />
                    <span className="text-red-600">High</span>
                  </label>
                  <label className="flex items-center">
                    <input type="radio" name="priority" value="urgent" className="mr-2" />
                    <span className="text-red-800">Urgent</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  rows="6"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Please describe your issue in detail..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Attachments</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Drag & drop files here or click to browse</p>
                  <p className="text-sm text-gray-500">Maximum file size: 10MB. Supported: PDF, DOC, JPG, PNG</p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6">
                <button className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                  Save Draft
                </button>
                <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Submit Ticket
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HelpSupport;