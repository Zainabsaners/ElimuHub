import React, { useState, useEffect } from "react";
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
  FiArrowUp
} from "react-icons/fi";

const Reports = () => {
  // State for reports data
  const [reports, setReports] = useState([
    {
      id: 1,
      title: "Monthly Financial Summary",
      type: "financial",
      period: "January 2024",
      generatedDate: "2024-01-31",
      size: "2.4 MB",
      records: 150,
      status: "completed",
      description: "Comprehensive financial report including income, expenses, and profit analysis"
    },
    {
      id: 2,
      title: "Fee Collection Report",
      type: "fees",
      period: "Term 1 2024",
      generatedDate: "2024-01-25",
      size: "1.8 MB",
      records: 450,
      status: "completed",
      description: "Detailed fee collection analysis with pending payments and collection rates"
    },
    {
      id: 3,
      title: "Expense Analysis",
      type: "expenses",
      period: "Q4 2023",
      generatedDate: "2024-01-15",
      size: "3.1 MB",
      records: 289,
      status: "completed",
      description: "Quarterly expense breakdown by category and department"
    },
    {
      id: 4,
      title: "Payroll Summary",
      type: "payroll",
      period: "December 2023",
      generatedDate: "2023-12-31",
      size: "1.5 MB",
      records: 85,
      status: "completed",
      description: "Monthly payroll report with deductions, allowances, and net salaries"
    },
    {
      id: 5,
      title: "Budget vs Actual",
      type: "financial",
      period: "2023 Annual",
      generatedDate: "2024-01-05",
      size: "4.2 MB",
      records: 1200,
      status: "completed",
      description: "Annual budget performance analysis with variance reports"
    },
    {
      id: 6,
      title: "Student Fee Arrears",
      type: "fees",
      period: "Current",
      generatedDate: "2024-01-28",
      size: "0.9 MB",
      records: 67,
      status: "completed",
      description: "List of students with outstanding fee balances and payment plans"
    },
    {
      id: 7,
      title: "Tax Compliance Report",
      type: "compliance",
      period: "Q4 2023",
      generatedDate: "2024-01-10",
      size: "2.1 MB",
      records: 45,
      status: "completed",
      description: "Tax deductions, filings, and compliance status report"
    },
    {
      id: 8,
      title: "Staff Salary Analysis",
      type: "payroll",
      period: "2023 Summary",
      generatedDate: "2024-01-08",
      size: "2.8 MB",
      records: 1020,
      status: "completed",
      description: "Annual staff salary trends, increments, and department-wise analysis"
    }
  ]);

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

  // Report types for filter
  const reportTypes = [
    { value: "financial", label: "Financial Reports", color: "blue", icon: FiDollarSign },
    { value: "fees", label: "Fee Reports", color: "green", icon: FiFileText },
    { value: "expenses", label: "Expense Reports", color: "red", icon: FiBarChart2 },
    { value: "payroll", label: "Payroll Reports", color: "purple", icon: FiUsers },
    { value: "compliance", label: "Compliance Reports", color: "orange", icon: FiPieChart }
  ];

  // Period options
  const periodOptions = [
    "all", "January 2024", "December 2023", "Q4 2023", "2023 Annual", "Current"
  ];

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
    // Simulate download
    console.log(`Downloading ${report.title} as ${format}`);
    // In real implementation, this would trigger actual file download
    alert(`Downloading ${report.title} as ${format.toUpperCase()}`);
  };

  // Print report
  const printReport = (report) => {
    // Simulate print
    console.log(`Printing ${report.title}`);
    // In real implementation, this would open print dialog
    alert(`Printing ${report.title}`);
  };

  // Preview report
  const previewReport = (report) => {
    setSelectedReport(report);
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
  const quickGenerateReport = (type) => {
    const newReport = {
      id: Date.now(),
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Report - ${new Date().toLocaleDateString()}`,
      type: type,
      period: "Current",
      generatedDate: new Date().toISOString().split('T')[0],
      size: "1.2 MB",
      records: Math.floor(Math.random() * 200) + 50,
      status: "completed",
      description: `Automatically generated ${type} report`
    };
    setReports([newReport, ...reports]);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
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
            <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-colors">
              <FiPrinter />
              Bulk Print
            </button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors">
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
                  className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 px-4 py-3 rounded-lg flex items-center justify-between transition-colors border border-gray-200"
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

            {/* Reports Grid */}
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

            {filteredReports.length === 0 && (
              <div className="text-center py-12">
                <FiFileText className="mx-auto text-gray-400 text-4xl mb-3" />
                <p className="text-gray-500 text-lg">No reports found</p>
                <p className="text-gray-400 text-sm">Try adjusting your filters or search terms</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Report Preview Modal */}
      {showPreview && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
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

              {/* Preview Content - Simulated */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="text-center text-gray-500">
                  <FiFileText className="mx-auto text-4xl mb-3" />
                  <p>Report preview would be displayed here</p>
                  <p className="text-sm">In a real implementation, this would show the actual report content</p>
                </div>
              </div>
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
    </div>
  );
};

export default Reports;