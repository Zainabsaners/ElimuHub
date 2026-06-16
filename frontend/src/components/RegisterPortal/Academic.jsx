import React, { useState, useEffect } from 'react';
import axios from 'axios';

// 1. Defined API_BASE_URL globally
const API_BASE_URL = import.meta.env.VITE_API_URL;

// Helper to define authentication
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken') || localStorage.getItem('token') || '';
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// 2. Component defined outside to prevent re-instantiation errors
const CurriculumTree = ({ area }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
      <div className="flex items-center">
        <h3 className="text-lg font-semibold text-gray-800">{area.area_name}</h3>
      </div>
    </div>
    <div className="p-6">
      {area.strands?.map(strand => (
        <div key={strand.id} className="mb-6 last:mb-0">
          <div className="flex items-center mb-3">
            <div className="w-2 h-2 rounded-full bg-indigo-500 mr-2"></div>
            <h4 className="font-semibold text-gray-700">{strand.strand_name}</h4>
          </div>
          {strand.substrands?.map(sub => (
            <div key={sub.id} className="ml-6 mb-4">
              <h5 className="text-sm font-medium text-gray-600 mb-2">{sub.substrand_name}</h5>
              {sub.competencies?.map(comp => (
                <div key={comp.id} className="ml-4 mb-2">
                  <p className="text-sm text-gray-500">• {comp.competency_statement}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  </div>
);

const Academic = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportFilters, setReportFilters] = useState({ class_id: '', term: '' });
  const [data, setData] = useState({ areas: [], terms: [], windows: [], reports: [], classes: [] });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const headers = getAuthHeaders();
    try {
      const [resAreas, resTerms, resWindows, resReports, resClasses] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/curriculum/`, { headers }),
        axios.get(`${API_BASE_URL}/api/terms/`, { headers }),
        axios.get(`${API_BASE_URL}/api/assessment-windows/`, { headers }),
        axios.get(`${API_BASE_URL}/api/cbe-report-cards/`, { headers }),
        axios.get(`${API_BASE_URL}/api/classes/`, { headers })
      ]);

      setData({
        areas: resAreas.data.data || [],
        terms: resTerms.data.results || [],
        windows: resWindows.data.results || [],
        reports: resReports.data.results || [],
        classes: resClasses.data.data || []
      });
    } catch (error) {
      console.error('Data loading error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    

    if (!reportFilters.class_id || !reportFilters.term) {
      alert("Please select both a class and a term.");
      return;
    }
    
    setLoading(true);
    try {
      const url = `${API_BASE_URL}/api/cbe-report-cards/batch_generate/`;
      

      const response = await axios.post(url, reportFilters, { 
        headers: getAuthHeaders() 
      });
      
      console.log("Backend Response:", response.data);
      
      alert("Batch generation triggered successfully!");
      setShowReportModal(false);
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      await fetchData(); 
    } catch (error) {
      console.error("Full Error Object:", error);
      if (error.response) {
        console.error("Server Error Data:", error.response.data);
      }
      alert("Failed to generate reports. Check the browser console (F12) for the specific error.");
    } finally {
      setLoading(false);
    }
  };

  // View report handler
  // View report handler - Fixed to handle undefined ratings
const handleViewReport = async (report) => {
  try {
    const url = `${API_BASE_URL}/api/cbe-report-cards/${report.id}/`;
    const headers = getAuthHeaders();
    
    const response = await axios.get(url, { headers });
    const data = response.data;
    
    // Parse attendance summary if it's a string
    let attendanceSummary = {};
    if (data.learner_attendance_summary) {
      try {
        attendanceSummary = typeof data.learner_attendance_summary === 'string' 
          ? JSON.parse(data.learner_attendance_summary) 
          : data.learner_attendance_summary;
      } catch (e) {
        console.error('Error parsing attendance:', e);
      }
    }
    
    const reportWindow = window.open('', '_blank');
    reportWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Report Card - ${data.student_name}</title>
        <meta charset="UTF-8">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #f0f2f5;
            padding: 40px;
            line-height: 1.6;
          }
          
          .report-container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
            overflow: hidden;
          }
          
          .report-header {
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
            color: white;
            padding: 40px;
            text-align: center;
          }
          
          .report-header h1 {
            font-size: 32px;
            margin-bottom: 10px;
            font-weight: 600;
          }
          
          .report-header p {
            font-size: 16px;
            opacity: 0.95;
          }
          
          .report-title {
            font-size: 18px;
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px solid rgba(255,255,255,0.3);
          }
          
          .student-info {
            background: #f8fafc;
            padding: 30px 40px;
            border-bottom: 1px solid #e2e8f0;
          }
          
          .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
          }
          
          .info-item {
            display: flex;
            flex-direction: column;
          }
          
          .info-label {
            font-size: 12px;
            text-transform: uppercase;
            color: #64748b;
            font-weight: 600;
            letter-spacing: 0.5px;
            margin-bottom: 5px;
          }
          
          .info-value {
            font-size: 16px;
            color: #1e293b;
            font-weight: 500;
          }
          
          .section {
            padding: 30px 40px;
            border-bottom: 1px solid #e2e8f0;
          }
          
          .section-title {
            font-size: 20px;
            color: #1e293b;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #4f46e5;
            display: inline-block;
          }
          
          .performance-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
          }
          
          .performance-table th {
            background: #f1f5f9;
            padding: 12px;
            text-align: left;
            font-weight: 600;
            color: #1e293b;
            border: 1px solid #e2e8f0;
          }
          
          .performance-table td {
            padding: 12px;
            border: 1px solid #e2e8f0;
            color: #475569;
          }
          
          .rating-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
          }
          
          .rating-ee { background: #dcfce7; color: #166534; }
          .rating-me { background: #dbeafe; color: #1e40af; }
          .rating-ae { background: #fef3c7; color: #92400e; }
          .rating-be { background: #fee2e2; color: #991b1b; }
          .rating-default { background: #f1f5f9; color: #475569; }
          
          .values-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-top: 15px;
          }
          
          .value-card {
            background: #f8fafc;
            padding: 15px;
            border-radius: 8px;
            border-left: 3px solid #4f46e5;
          }
          
          .value-name {
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 5px;
          }
          
          .value-rating {
            font-size: 14px;
            color: #64748b;
          }
          
          .competency-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
            margin-top: 15px;
          }
          
          .competency-card {
            background: #f8fafc;
            padding: 15px;
            border-radius: 8px;
          }
          
          .competency-name {
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 8px;
          }
          
          .remarks-box {
            background: #fefce8;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #eab308;
            margin-bottom: 20px;
          }
          
          .remarks-text {
            color: #422006;
            line-height: 1.6;
          }
          
          .report-footer {
            background: #f8fafc;
            padding: 20px 40px;
            text-align: center;
            color: #94a3b8;
            font-size: 12px;
          }
          
          @media print {
            body {
              background: white;
              padding: 0;
            }
            .report-container {
              box-shadow: none;
            }
            button {
              display: none;
            }
          }
          
          .button-container {
            text-align: center;
            padding: 20px;
            background: #f8fafc;
          }
          
          button {
            background-color: #4f46e5;
            color: white;
            border: none;
            padding: 10px 24px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            margin: 0 10px;
          }
          
          button:hover {
            background-color: #4338ca;
          }
        </style>
      </head>
      <body>
        <div class="report-container">
          <div class="report-header">
            <h1>${data.report_type || 'Learner Progress Report'}</h1>
            <p>Competency-Based Education (CBE) Report Card</p>
            <div class="report-title">
              Academic Year: ${data.academic_year || 'N/A'} | Term: ${data.term || 'N/A'}
            </div>
          </div>
          
          <div class="student-info">
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Student Name</span>
                <span class="info-value">${data.student_name || 'N/A'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Report ID</span>
                <span class="info-value">${data.report_id || 'N/A'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Reporting Date</span>
                <span class="info-value">${data.reporting_date ? new Date(data.reporting_date).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Status</span>
                <span class="info-value">${data.is_published ? 'Published' : 'Draft'}</span>
              </div>
            </div>
          </div>
          
          <div class="section">
            <h3 class="section-title">Learning Areas Performance</h3>
            <table class="performance-table">
              <thead>
                <tr>
                  <th>Learning Area</th>
                  <th>Score (%)</th>
                  <th>Rating</th>
                </tr>
              </thead>
              <tbody>
                ${data.learning_area_performance && data.learning_area_performance.length > 0 ? 
                  data.learning_area_performance.map(area => {
                    // Safely check rating and determine class
                    let ratingClass = 'rating-default';
                    const rating = area.rating || '';
                    
                    if (rating.includes('Exceeding')) ratingClass = 'rating-ee';
                    else if (rating.includes('Meeting')) ratingClass = 'rating-me';
                    else if (rating.includes('Approaching')) ratingClass = 'rating-ae';
                    else if (rating.includes('Below')) ratingClass = 'rating-be';
                    
                    return `
                      <tr>
                        <td><strong>${area.learning_area || 'N/A'}</strong></td>
                        <td>${area.score_percentage !== undefined ? area.score_percentage + '%' : 'N/A'}</td>
                        <td><span class="rating-badge ${ratingClass}">${rating || 'Not Rated'}</span></td>
                      </tr>
                    `;
                  }).join('') : 
                  '<tr><td colspan="3">No learning area data available</td><td></td><td></td></tr>'
                }
              </tbody>
            </table>
          </div>
          
          <div class="section">
            <h3 class="section-title">Core Competencies</h3>
            <div class="competency-grid">
              ${data.core_competencies && data.core_competencies.length > 0 ?
                data.core_competencies.map(comp => {
                  let ratingClass = 'rating-default';
                  const rating = comp.rating || '';
                  
                  if (rating.includes('Exceeding')) ratingClass = 'rating-ee';
                  else if (rating.includes('Meeting')) ratingClass = 'rating-me';
                  else if (rating.includes('Approaching')) ratingClass = 'rating-ae';
                  else if (rating.includes('Below')) ratingClass = 'rating-be';
                  
                  return `
                    <div class="competency-card">
                      <div class="competency-name">${comp.competency || 'N/A'}</div>
                      <span class="rating-badge ${ratingClass}">${rating || 'Not Rated'}</span>
                    </div>
                  `;
                }).join('') :
                '<p>No competency data available</p>'
              }
            </div>
          </div>
          
          <div class="section">
            <h3 class="section-title">Values Assessment</h3>
            <div class="values-grid">
              ${data.values_assessment && data.values_assessment.length > 0 ?
                data.values_assessment.map(value => `
                  <div class="value-card">
                    <div class="value-name">${value.value || 'N/A'}</div>
                    <div class="value-rating">${value.rating || 'Not Rated'}</div>
                  </div>
                `).join('') :
                '<p>No values assessment data available</p>'
              }
            </div>
          </div>
          
          ${attendanceSummary.total_school_days ? `
            <div class="section">
              <h3 class="section-title">Attendance Summary</h3>
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">Total School Days</span>
                  <span class="info-value">${attendanceSummary.total_school_days || 0}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Days Present</span>
                  <span class="info-value">${attendanceSummary.days_present || 0}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Days Absent</span>
                  <span class="info-value">${attendanceSummary.days_absent || 0}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Attendance Percentage</span>
                  <span class="info-value">${attendanceSummary.attendance_percentage || 0}%</span>
                </div>
              </div>
            </div>
          ` : ''}
          
          ${data.competency_summary ? `
            <div class="section">
              <h3 class="section-title">Overall Competency Summary</h3>
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">Exceeding Expectations</span>
                  <span class="info-value" style="color: #166534; font-size: 24px; font-weight: bold;">${data.competency_summary['Exceeding Expectations'] || 0}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Meeting Expectations</span>
                  <span class="info-value" style="color: #1e40af; font-size: 24px; font-weight: bold;">${data.competency_summary['Meeting Expectations'] || 0}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Approaching Expectations</span>
                  <span class="info-value" style="color: #92400e; font-size: 24px; font-weight: bold;">${data.competency_summary['Approaching Expectations'] || 0}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Below Expectations</span>
                  <span class="info-value" style="color: #991b1b; font-size: 24px; font-weight: bold;">${data.competency_summary['Below Expectations'] || 0}</span>
                </div>
              </div>
            </div>
          ` : ''}
          
          ${data.teacher_remarks ? `
            <div class="section">
              <h3 class="section-title">Teacher's Remarks</h3>
              <div class="remarks-box">
                <div class="remarks-text">${data.teacher_remarks}</div>
              </div>
            </div>
          ` : ''}
          
          ${data.head_teacher_remarks ? `
            <div class="section">
              <h3 class="section-title">Head Teacher's Remarks</h3>
              <div class="remarks-box">
                <div class="remarks-text">${data.head_teacher_remarks}</div>
              </div>
            </div>
          ` : ''}
          
          <div class="report-footer">
            <p>Generated on: ${data.generated_date ? new Date(data.generated_date).toLocaleString() : 'N/A'}</p>
            <p style="margin-top: 10px;">This is an official CBE report card. Please keep for your records.</p>
          </div>
          
          <div class="button-container">
            <button onclick="window.print()">Print Report</button>
            <button onclick="window.close()">Close</button>
          </div>
        </div>
      </body>
      </html>
    `);
    reportWindow.document.close();
  } catch (error) {
    console.error('Error viewing report:', error);
    alert('Failed to load report details. Please try again.');
  }
};

  // Download report handler
  const handleDownloadReport = async (report) => {
    try {
      const url = `${API_BASE_URL}/api/cbe-report-cards/${report.id}/download/`;
      const headers = getAuthHeaders();
      
      const response = await axios.get(url, { 
        headers,
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `report_card_${report.report_id || report.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      alert('Report downloaded successfully!');
    } catch (error) {
      console.error('Error downloading report:', error);
      
      if (error.response?.status === 404) {
        const confirmPrint = confirm('Download endpoint not available. Would you like to view and print the report instead?');
        if (confirmPrint) {
          handleViewReport(report);
        }
      } else {
        alert('Failed to download report. Please try again.');
      }
    }
  };

  // Publish report handler
  const handlePublishReport = async (report) => {
    if (!confirm(`Are you sure you want to publish the report for ${report.student_name}?`)) {
      return;
    }
    
    try {
      const url = `${API_BASE_URL}/api/cbe-report-cards/${report.id}/publish/`;
      const headers = getAuthHeaders();
      
      await axios.post(url, {}, { headers });
      
      alert('Report published successfully!');
      await fetchData();
    } catch (error) {
      console.error('Error publishing report:', error);
      alert('Failed to publish report. Please try again.');
    }
  };

  // Bulk download handler
  const handleBulkDownload = async () => {
    if (data.reports.length === 0) {
      alert('No reports available to download.');
      return;
    }
    
    try {
      const url = `${API_BASE_URL}/api/cbe-report-cards/batch_download/`;
      const headers = getAuthHeaders();
      
      const response = await axios.post(url, { 
        report_ids: data.reports.map(r => r.id) 
      }, { 
        headers,
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'application/zip' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `reports_batch_${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      alert('Batch download started!');
    } catch (error) {
      console.error('Error bulk downloading:', error);
      alert('Failed to download reports in batch. Please try individual downloads.');
    }
  };
  const handleDeleteReport = async (report) => {
  // Confirm deletion
    if (!confirm(`Are you sure you want to delete the report for ${report.student_name}?\n\nReport ID: ${report.report_id}\n\nThis action cannot be undone!`)) {
      return;
    }
    
    try {
      const url = `${API_BASE_URL}/api/cbe-report-cards/${report.id}/`;
      const headers = getAuthHeaders();
      
      await axios.delete(url, { headers });
      
      alert(`Report for ${report.student_name} deleted successfully!`);
      
      // Refresh the reports list
      await fetchData();
    } catch (error) {
      console.error('Error deleting report:', error);
      if (error.response?.status === 404) {
        alert('Report not found. It may have already been deleted.');
      } else if (error.response?.status === 403) {
        alert('You do not have permission to delete this report.');
      } else {
        alert('Failed to delete report. Please try again.');
      }
    }
  };

  // Tab configuration
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'curriculum', label: 'Curriculum' },
    { id: 'assessment', label: 'Assessment' },
    { id: 'reports', label: 'Reports' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans overflow-x-hidden">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-gray-200">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Academic Management</h1>
              <p className="text-gray-600">Curriculum, Assessments & Report Cards</p>
            </div>
          </div>
        </header>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex space-x-8">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  py-3 px-1 border-b-2 font-medium text-sm transition-colors
                  ${activeTab === tab.id 
                    ? 'border-indigo-500 text-indigo-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading academic data...</p>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                  title="Learning Areas" 
                  value={data.areas.length} 
                  color="border-indigo-500" 
                  trend={`${data.areas.length} total areas`} 
                  trendPositive 
                />
                <StatCard 
                  title="Classes" 
                  value={data.classes.length} 
                  color="border-green-500" 
                  trend="Active classes" 
                  trendPositive 
                />
                <StatCard 
                  title="Reports" 
                  value={data.reports.length} 
                  color="border-purple-500" 
                  trend="Generated reports" 
                  trendPositive 
                />
                <StatCard 
                  title="Assessment Windows" 
                  value={data.windows.length} 
                  color="border-amber-500" 
                  trend="Academic periods" 
                  trendPositive 
                />
              </div>
            )}
            
            {activeTab === 'curriculum' && (
              <div>
                {data.areas.map(a => <CurriculumTree key={a.id} area={a} />)}
              </div>
            )}
            
            {activeTab === 'assessment' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
                  <h3 className="text-lg font-semibold text-gray-800">Assessment Schedule</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assessment Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weight (%)</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {data.windows.map(w => (
                        <tr key={w.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="font-medium text-gray-900">{w.assessment_type}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${w.weight_percentage}%` }}></div>
                              </div>
                              <span className="text-sm text-gray-600">{w.weight_percentage}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(w.open_date).toLocaleDateString()} — {new Date(w.close_date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              w.is_active ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'
                            }`}>
                              {w.is_active ? 'OPEN' : 'CLOSED'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {activeTab === 'reports' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-800">CBE Report Cards</h3>
                  <div className="flex items-center space-x-3">
                    {data.reports && data.reports.length > 0 && (
                      <button
                        onClick={handleBulkDownload}
                        className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Export All
                      </button>
                    )}
                    <button 
                      type="button"
                      onClick={() => setShowReportModal(true)} 
                      className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      Generate Report
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Report ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Term</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Generated</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {data.reports && data.reports.length > 0 ? (
                        data.reports.map((r) => (
                          <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="font-mono text-sm text-indigo-600">{r.report_id || 'N/A'}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm font-medium text-gray-900">{r.student_name || 'Unknown'}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {r.term || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                r.is_published 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {r.is_published ? 'PUBLISHED' : 'DRAFT'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {r.generated_date ? new Date(r.generated_date).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleViewReport(r)}
                                  className="px-3 py-1.5 text-xs font-medium rounded text-indigo-700 bg-indigo-50 hover:bg-indigo-100"
                                >
                                  View
                                </button>
                                <button
                                  onClick={() => handleDownloadReport(r)}
                                  className="px-3 py-1.5 text-xs font-medium rounded text-green-700 bg-green-50 hover:bg-green-100"
                                >
                                  Download
                                </button>
                                {!r.is_published && (
                                  <button
                                    onClick={() => handlePublishReport(r)}
                                    className="px-3 py-1.5 text-xs font-medium rounded text-blue-700 bg-blue-50 hover:bg-blue-100"
                                  >
                                    Publish
                                  </button>
                                )}
                                  <button
                                    onClick={() => handleDeleteReport(r)}
                                    className="px-3 py-1.5 text-xs font-medium rounded text-red-700 bg-red-50 hover:bg-red-100"
                                  >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="px-6 py-12 text-center">
                            <p className="text-gray-500">No report cards found. Please generate a new batch.</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Modal */}
            {showReportModal && (
              <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex items-center justify-center min-h-screen px-4">
                  <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowReportModal(false)}></div>
                  
                  <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900">Generate CBE Report</h3>
                    </div>
                    
                    <div className="px-6 py-4">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Select Class</label>
                          <select 
                            className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            onChange={(e) => setReportFilters({...reportFilters, class_id: e.target.value})}
                          >
                            <option value="">Choose a class...</option>
                            {data.classes.map(c => <option key={c.id} value={c.id}>{c.class_name}</option>)}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Select Term</label>
                          <select 
                            className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            onChange={(e) => setReportFilters({...reportFilters, term: e.target.value})}
                          >
                            <option value="">Choose a term...</option>
                            {data.terms.map(t => <option key={t.id} value={t.id}>{t.term}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex justify-end space-x-3">
                      <button 
                        onClick={() => setShowReportModal(false)} 
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleGenerateReport} 
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                      >
                        Generate Reports
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Stat Card Component
function StatCard({ title, value, color, trend, trendPositive }) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-5 border-t-4 ${color}`}>
      <div>
        <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
      {trend && (
        <div className="mt-3 flex items-center text-xs">
          <span className={trendPositive ? 'text-green-600' : 'text-red-600'}>{trend}</span>
        </div>
      )}
    </div>
  );
}

export default Academic;