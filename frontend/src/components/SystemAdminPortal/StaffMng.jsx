import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, Filter, CheckCircle, XCircle, Eye, 
  Download, AlertCircle, Clock, Users, FileText,
  UserCheck, UserX, Calendar, DollarSign
} from 'lucide-react';
import { staff } from '../../api';

const StaffMngAdmin = () => {
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [approvedRequests, setApprovedRequests] = useState([]);
  const [rejectedRequests, setRejectedRequests] = useState([]);
  const [allRequests, setAllRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [stats, setStats] = useState({
    totalPending: 0,
    approvedThisMonth: 0,
    rejectedThisMonth: 0,
    totalBudgetImpact: 'KES 0'
  });

  // Format staff data for display
  const formatStaffData = (staffMember) => ({
    id: staffMember.id,
    position: staffMember.designation || staffMember.position || 'Staff',
    applicantName: `${staffMember.first_name || ''} ${staffMember.last_name || ''}`.trim() || staffMember.full_name || 'Unknown',
    department: staffMember.department || 'General',
    requestedBy: staffMember.created_by?.username || staffMember.requested_by || 'HR Manager',
    requestDate: staffMember.created_at ? new Date(staffMember.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    salaryProposed: staffMember.basic_salary ? `KES ${parseFloat(staffMember.basic_salary).toLocaleString()}` : 'KES 0',
    experience: staffMember.experience || staffMember.years_of_experience || 'N/A',
    qualification: staffMember.highest_qualification || staffMember.qualification || 'N/A',
    justification: staffMember.notes || staffMember.remarks || staffMember.justification || 'No justification provided',
    status: staffMember.status || 'Pending',
    approvedDate: staffMember.approved_date || staffMember.approvedDate || null,
    approvedBy: staffMember.approved_by?.username || staffMember.approvedBy || 'Admin Board',
    rejectedDate: staffMember.rejected_date || staffMember.rejectedDate || null,
    rejectedBy: staffMember.rejected_by?.username || staffMember.rejectedBy || 'Admin Board',
    reason: staffMember.rejection_reason || staffMember.reason || 'Administrative decision',
    createdAt: staffMember.created_at || staffMember.createdAt || null,
    updatedAt: staffMember.updated_at || staffMember.updatedAt || null
  });

  // Fetch staff data from API
  const fetchStaffData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch all staff
      const response = await staff.getAll();
      
      // Safely extract the data
      let staffData = [];
      
      if (response.data) {
        if (Array.isArray(response.data)) {
          staffData = response.data;
        } else if (response.data.results && Array.isArray(response.data.results)) {
          staffData = response.data.results;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          staffData = response.data.data;
        } else if (response.data.staff && Array.isArray(response.data.staff)) {
          staffData = response.data.staff;
        } else {
          const dataKeys = Object.keys(response.data);
          for (const key of dataKeys) {
            if (Array.isArray(response.data[key])) {
              staffData = response.data[key];
              break;
            }
          }
        }
      }
      
      if (!Array.isArray(staffData)) {
        console.warn('Staff data is not an array:', staffData);
        staffData = [];
      }
      
      
    
     
      
      // Separate staff by status
      const pending = staffData.filter(s => 
        s.status === 'Pending' || s.status === 'pending' || s.status === 'pending_approval'
      );
      
      const approved = staffData.filter(s => 
        s.status === 'Approved' || s.status === 'approved' || s.status === 'Active' || s.status === 'active'
      );
      
      const rejected = staffData.filter(s => 
        s.status === 'Rejected' || s.status === 'rejected'
      );

      // Format the data for display
      const formattedPending = pending.map(formatStaffData);
      const formattedApproved = approved.map(formatStaffData);
      const formattedRejected = rejected.map(formatStaffData);
      
      setPendingApprovals(formattedPending);
      setApprovedRequests(formattedApproved);
      setRejectedRequests(formattedRejected);
      setAllRequests([...formattedPending, ...formattedApproved, ...formattedRejected]);

      // Update stats - get current month/year
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      // IMPORTANT: Since we don't have approved_date, we use the status to determine
      // if a record is approved, and then check if it was updated recently
      // or we can use the created_at date if that's when the approval happened
      const approvedThisMonth = approved.filter(s => {
        // Try multiple date fields in order of priority
        // 1. approved_date - if it exists and is set
        // 2. updated_at - if the status was recently changed to Active
        // 3. created_at - fallback to creation date
        
        let dateString = s.approved_date || s.approvedDate;
        
        // If no approved_date, check if the status was updated recently
        if (!dateString && (s.updated_at || s.updatedAt)) {
          dateString = s.updated_at || s.updatedAt;
        }
        
        // If still no date, use created_at
        if (!dateString) {
          dateString = s.created_at || s.createdAt;
        }
        
        if (!dateString) return false;
        
        try {
          const date = new Date(dateString);
          const isThisMonth = date.getMonth() === currentMonth && date.getFullYear() === currentYear;
          return isThisMonth;
        } catch {
          console.warn('Invalid date for staff member:', s.id, dateString);
          return false;
        }
      }).length;

      // Count rejected this month - similar logic
      const rejectedThisMonth = rejected.filter(s => {
        let dateString = s.rejected_date || s.rejectedDate;
        
        if (!dateString && (s.updated_at || s.updatedAt)) {
          dateString = s.updated_at || s.updatedAt;
        }
        
        if (!dateString) {
          dateString = s.created_at || s.createdAt;
        }
        
        if (!dateString) return false;
        
        try {
          const date = new Date(dateString);
          return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        } catch {
          return false;
        }
      }).length;

      // Calculate total budget impact (sum of salaries for approved staff)
      const totalBudget = approved.reduce((sum, s) => {
        const salary = parseFloat(s.basic_salary || s.salary || 0);
        return sum + (isNaN(salary) ? 0 : salary);
      }, 0);

      setStats({
        totalPending: pending.length,
        approvedThisMonth,
        rejectedThisMonth,
        totalBudgetImpact: `KES ${totalBudget.toLocaleString()}`
      });

    } catch (err) {
      console.error('Error fetching staff data:', err);
      setError('Failed to load staff data. Please try again.');
      setPendingApprovals([]);
      setApprovedRequests([]);
      setRejectedRequests([]);
      setAllRequests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaffData();
  }, [fetchStaffData]);

  const handleApproval = async (id, action) => {
    try {
      const newStatus = action === 'approve' ? 'Active' : 'Rejected';
      const now = new Date().toISOString();
      
      // Update staff status via API
      const updateData = { 
        status: newStatus,
        updated_at: now  // Always update the timestamp
      };
      
      // Add specific approval/rejection fields
      if (action === 'approve') {
        updateData.approved_date = now;
        updateData.approved_by = 'current_user';
      } else {
        updateData.rejected_date = now;
        updateData.rejected_by = 'current_user';
      }
      
      await staff.update(id, updateData);

      await fetchStaffData();
      alert(`Request ${action === 'approve' ? 'approved' : 'rejected'} successfully!`);

    } catch (err) {
      console.error('Error updating staff:', err);
      alert('Failed to update staff status. Please try again.');
    }
  };

  // Get the current list based on active tab
  const getCurrentList = () => {
    switch(activeTab) {
      case 'pending':
        return pendingApprovals;
      case 'approved':
        return approvedRequests;
      case 'rejected':
        return rejectedRequests;
      case 'all':
        return allRequests;
      default:
        return pendingApprovals;
    }
  };

  const currentList = getCurrentList();

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading staff data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchStaffData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 overflow-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Admin - Staff Approvals</h1>
        <p className="text-gray-600 mt-2">Review and approve staff recruitment requests from HR</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-600 mb-2">Pending Approval</p>
              <p className="text-3xl font-bold text-amber-600">{stats.totalPending}</p>
            </div>
            <div className="p-3 bg-amber-100 text-amber-600 rounded-lg">
              <Clock className="h-6 w-6" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-4">Requires immediate attention</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-600 mb-2">Approved This Month</p>
              <p className="text-3xl font-bold text-green-600">{stats.approvedThisMonth}</p>
            </div>
            <div className="p-3 bg-green-100 text-green-600 rounded-lg">
              <CheckCircle className="h-6 w-6" />
            </div>
          </div>
          <p className="text-sm text-green-600 mt-4">On track with hiring plan</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-600 mb-2">Rejected This Month</p>
              <p className="text-3xl font-bold text-red-600">{stats.rejectedThisMonth}</p>
            </div>
            <div className="p-3 bg-red-100 text-red-600 rounded-lg">
              <XCircle className="h-6 w-6" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-4">Budget/Policy constraints</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-600 mb-2">Monthly Budget Impact</p>
              <p className="text-3xl font-bold text-blue-600">{stats.totalBudgetImpact}</p>
            </div>
            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
              <DollarSign className="h-6 w-6" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-4">Additional monthly salary cost</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-6 py-3 font-medium border-b-2 transition-colors ${
            activeTab === 'pending'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Pending Approvals ({pendingApprovals.length})
        </button>
        <button
          onClick={() => setActiveTab('approved')}
          className={`px-6 py-3 font-medium border-b-2 transition-colors ${
            activeTab === 'approved'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Approved ({approvedRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('rejected')}
          className={`px-6 py-3 font-medium border-b-2 transition-colors ${
            activeTab === 'rejected'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Rejected ({rejectedRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={`px-6 py-3 font-medium border-b-2 transition-colors ${
            activeTab === 'all'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          All Requests ({allRequests.length})
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">
            {activeTab === 'pending' && 'Pending Recruitment Requests'}
            {activeTab === 'approved' && 'Approved Recruitment Requests'}
            {activeTab === 'rejected' && 'Rejected Recruitment Requests'}
            {activeTab === 'all' && 'All Recruitment Requests'}
          </h3>
          <div className="flex gap-3">
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center">
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>
        {currentList.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium">No {activeTab} requests found</p>
            <p className="text-gray-400">
              {activeTab === 'pending' && 'All staff requests have been reviewed'}
              {activeTab === 'approved' && 'No approved staff requests yet'}
              {activeTab === 'rejected' && 'No rejected staff requests'}
              {activeTab === 'all' && 'No staff requests found'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested By</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salary Proposed</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentList.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="font-medium text-gray-800">{request.position}</p>
                        <p className="text-sm text-gray-500">Requested: {new Date(request.requestDate).toLocaleDateString()}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="font-medium text-gray-800">{request.applicantName}</p>
                      <p className="text-sm text-gray-500">{request.qualification}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {request.department}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-gray-700">{request.requestedBy}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="font-medium text-gray-800">{request.salaryProposed}</span>
                        <span className="ml-2 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                          {request.experience}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        request.status === 'Active' || request.status === 'Approved' 
                          ? 'bg-green-100 text-green-800' 
                          : request.status === 'Rejected' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedRequest(request)}
                          className="px-3 py-1 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 flex items-center"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Review
                        </button>
                        {request.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => handleApproval(request.id, 'approve')}
                              className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleApproval(request.id, 'reject')}
                              className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </button>
                          </>
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

      {/* Review Modal - keep as is */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Review Recruitment Request</h3>
                <button 
                  onClick={() => setSelectedRequest(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                    <p className="font-medium text-gray-800">{selectedRequest.position}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <span className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
                      {selectedRequest.department}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Applicant Name</label>
                    <p className="font-medium text-gray-800">{selectedRequest.applicantName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                    <p className="text-gray-800">{selectedRequest.experience}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
                    <p className="text-gray-800">{selectedRequest.qualification}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Proposed Salary</label>
                    <p className="text-2xl font-bold text-blue-600">{selectedRequest.salaryProposed}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Justification from HR</label>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-gray-800">{selectedRequest.justification}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Admin Decision</label>
                  <div className="flex gap-4 mt-2">
                    <label className="flex items-center">
                      <input type="radio" name="decision" value="approve" className="mr-2" defaultChecked />
                      <span className="text-green-600 font-medium">Approve</span>
                    </label>
                    <label className="flex items-center">
                      <input type="radio" name="decision" value="reject" className="mr-2" />
                      <span className="text-red-600 font-medium">Reject</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Comments (Optional)</label>
                  <textarea
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Add comments for HR..."
                  />
                </div>

                <div className="flex justify-end gap-3 pt-6">
                  <button
                    onClick={() => setSelectedRequest(null)}
                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      handleApproval(selectedRequest.id, 'approve');
                      setSelectedRequest(null);
                    }}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Approve Request
                  </button>
                  <button
                    onClick={() => {
                      handleApproval(selectedRequest.id, 'reject');
                      setSelectedRequest(null);
                    }}
                    className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Reject Request
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffMngAdmin;