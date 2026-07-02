import React, { useState } from 'react';

const Report = () => {
  const [selectedReport, setSelectedReport] = useState('financial');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);

  // Sample report data
  const reportData = {
    financial: {
      title: 'Financial Summary Report',
      description: 'Comprehensive overview of all financial transactions and revenue',
      metrics: [
        { label: 'Total Revenue', value: 'KSh 4,250,000', change: '+12%' },
        { label: 'Fee Collection Rate', value: '76%', change: '+5%' },
        { label: 'Outstanding Fees', value: 'KSh 1,250,000', change: '-8%' },
        { label: 'Transactions Count', value: '1,847', change: '+15%' }
      ],
      charts: ['Revenue Trend', 'Payment Methods', 'Collection Rate']
    },
    collection: {
      title: 'Fee Collection Report',
      description: 'Detailed breakdown of fee collections by class and payment method',
      metrics: [
        { label: 'Total Collected', value: 'KSh 3,000,000', change: '+10%' },
        { label: 'MPESA Collections', value: 'KSh 1,950,000', change: '+15%' },
        { label: 'Cash Collections', value: 'KSh 600,000', change: '-5%' },
        { label: 'Bank Collections', value: 'KSh 450,000', change: '+8%' }
      ],
      charts: ['Collection Methods', 'Daily Collections', 'Class-wise Collection']
    },
    outstanding: {
      title: 'Outstanding Fees Report',
      description: 'Analysis of pending fees and defaulters',
      metrics: [
        { label: 'Total Outstanding', value: 'KSh 1,250,000', change: '-8%' },
        { label: 'Defaulting Students', value: '127', change: '-12%' },
        { label: 'Overdue > 30 days', value: 'KSh 450,000', change: '-15%' },
        { label: 'Collection Efficiency', value: '85%', change: '+7%' }
      ],
      charts: ['Outstanding Trends', 'Defaulters by Class', 'Aging Analysis']
    },
    student: {
      title: 'Student Payment Report',
      description: 'Individual student payment history and status',
      metrics: [
        { label: 'Total Students', value: '1,250', change: '+3%' },
        { label: 'Fully Paid', value: '950', change: '+8%' },
        { label: 'Partially Paid', value: '173', change: '-5%' },
        { label: 'Not Paid', value: '127', change: '-12%' }
      ],
      charts: ['Payment Status', 'Class-wise Payment', 'Payment Timeline']
    }
  };

  const reportTypes = [
    { id: 'financial', name: 'Financial Summary', icon: '💰' },
    { id: 'collection', name: 'Fee Collection', icon: '📊' },
    { id: 'outstanding', name: 'Outstanding Fees', icon: '⏰' },
    { id: 'student', name: 'Student Payments', icon: '👨‍🎓' }
  ];

  const handleGenerateReport = () => {
    setIsGenerating(true);
    // Simulate report generation
    setTimeout(() => {
      setIsGenerating(false);
      // In real app, this would download the report
      alert(`Report generated successfully!`);
    }, 2000);
  };

  const handleExport = (format) => {
    // Simulate export
    alert(`Exporting report as ${format.toUpperCase()}`);
  };

  const currentReport = reportData[selectedReport];

  return (
    <div className="min-h-screen bg-gray-50 w-full p-4 md:p-6">
      <div className="w-full max-w-full">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Financial Reports</h1>
          <p className="text-gray-600 mt-2">Generate and analyze financial reports for better decision making</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 w-full">
          {/* Sidebar - Report Types */}
          <div className="w-full lg:w-80 bg-white rounded-lg shadow-sm p-4 md:p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Report Types</h2>
            <nav className="space-y-2">
              {reportTypes.map((report) => (
                <button
                  key={report.id}
                  onClick={() => setSelectedReport(report.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    selectedReport === report.id
                      ? 'bg-blue-50 text-blue-600 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-xl">{report.icon}</span>
                  <div>
                    <p className="font-medium">{report.name}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {reportData[report.id].description}
                    </p>
                  </div>
                </button>
              ))}
            </nav>

            {/* Date Range Selector */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Date Range</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">From Date</label>
                  <input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">To Date</label>
                  <input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* Report Header */}
            <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-xl md:text-2xl font-semibold text-gray-800">
                    {currentReport.title}
                  </h2>
                  <p className="text-gray-600 mt-1">{currentReport.description}</p>
                </div>
                <div className="flex space-x-3 mt-4 md:mt-0">
                  <button
                    onClick={() => handleExport('pdf')}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                  >
                    <span>📄</span>
                    <span>PDF</span>
                  </button>
                  <button
                    onClick={() => handleExport('excel')}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                  >
                    <span>📊</span>
                    <span>Excel</span>
                  </button>
                  <button
                    onClick={handleGenerateReport}
                    disabled={isGenerating}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center space-x-2 disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <span>📈</span>
                        <span>Generate Report</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {currentReport.metrics.map((metric, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm p-4 md:p-6">
                  <p className="text-sm text-gray-600 mb-2">{metric.label}</p>
                  <div className="flex items-baseline justify-between">
                    <p className="text-xl md:text-2xl font-bold text-gray-800">
                      {metric.value}
                    </p>
                    <span className={`text-sm font-medium ${
                      metric.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {metric.change}
                    </span>
                  </div>
                  <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        metric.change.startsWith('+') ? 'bg-green-500' : 'bg-red-500'
                      }`}
                      style={{ width: '75%' }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts Section */}
            <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Visual Analytics</h3>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                {currentReport.charts.map((chart, index) => (
                  <div key={index} className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <div className="text-4xl mb-3">📊</div>
                    <p className="font-medium text-gray-800">{chart}</p>
                    <p className="text-sm text-gray-500 mt-1">Chart visualization</p>
                    <button className="mt-3 px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors">
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Transactions</h3>
              <div className="overflow-x-auto">
                <table className="w-full min-w-150">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Admission No
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Method
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {[
                      { name: 'John Doe', admission: 'STD2023001', amount: 15000, date: '2024-01-15', method: 'Mobile Money' },
                      { name: 'Jane Smith', admission: 'STD2023002', amount: 12000, date: '2024-01-14', method: 'Cash' },
                      { name: 'Michael Brown', admission: 'STD2023003', amount: 18000, date: '2024-01-13', method: 'Bank' },
                      { name: 'Sarah Johnson', admission: 'STD2023004', amount: 16000, date: '2024-01-12', method: 'Mobile Money' },
                      { name: 'David Wilson', admission: 'STD2023005', amount: 14000, date: '2024-01-11', method: 'Cash' },
                    ].map((transaction, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {transaction.name}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {transaction.admission}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-green-600 font-semibold text-right">
                          KSh {transaction.amount.toLocaleString()}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {transaction.date}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            transaction.method === 'Mobile Money' ? 'bg-green-100 text-green-800' :
                            transaction.method === 'Cash' ? 'bg-blue-100 text-blue-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {transaction.method}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Report;