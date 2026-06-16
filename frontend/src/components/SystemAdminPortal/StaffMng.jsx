import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, CheckCircle, XCircle, Eye, 
  Download, AlertCircle, Clock, Users, FileText,
  UserCheck, UserX, Calendar, DollarSign
} from 'lucide-react';

const StaffMngAdmin = () => {
  const [pendingApprovals, setPendingApprovals] = useState([
    { 
      id: 1, 
      position: 'Mathematics Teacher', 
      applicantName: 'Michael Njoroge',
      department: 'Academic',
      requestedBy: 'HR Manager',
      requestDate: '2024-03-25',
      salaryProposed: 'KES 65,000',
      experience: '5 years',
      qualification: 'MSc Mathematics',
      justification: 'Current math teacher retiring next month. Need replacement with similar qualifications.'
    },
    { 
      id: 2, 
      position: 'IT Technician', 
      applicantName: 'Susan Muthoni',
      department: 'IT Support',
      requestedBy: 'HR Manager',
      requestDate: '2024-03-20',
      salaryProposed: 'KES 45,000',
      experience: '4 years',
      qualification: 'Diploma IT',
      justification: 'Current IT staff overloaded with work. Need additional support for maintenance.'
    },
    { 
      id: 3, 
      position: 'Accountant', 
      applicantName: 'Paul Ochieng',
      department: 'Finance',
      requestedBy: 'HR Manager',
      requestDate: '2024-03-18',
      salaryProposed: 'KES 80,000',
      experience: '7 years',
      qualification: 'CPA K',
      justification: 'New position to handle growing financial operations.'
    }
  ]);

  const [approvedRequests, setApprovedRequests] = useState([
    { id: 4, position: 'Science Teacher', applicantName: 'Grace Wanjiru', approvedDate: '2024-03-22', approvedBy: 'Admin Board', status: 'Processing' },
    { id: 5, position: 'Sports Coach', applicantName: 'Brian Kibet', approvedDate: '2024-03-15', approvedBy: 'Admin Board', status: 'Registered' }
  ]);

  const [rejectedRequests, setRejectedRequests] = useState([
    { id: 6, position: 'Librarian', applicantName: 'Jane Wambui', rejectedDate: '2024-03-10', rejectedBy: 'Admin Board', reason: 'Budget constraints for this quarter' }
  ]);

  const [stats, setStats] = useState({
    totalPending: 3,
    approvedThisMonth: 8,
    rejectedThisMonth: 2,
    totalBudgetImpact: 'KES 1,450,000'
  });

  const handleApproval = (id, action) => {
    const request = pendingApprovals.find(r => r.id === id);
    if (action === 'approve') {
      setApprovedRequests(prev => [...prev, {
        ...request,
        approvedDate: new Date().toISOString().split('T')[0],
        approvedBy: 'You',
        status: 'Approved'
      }]);
    } else {
      setRejectedRequests(prev => [...prev, {
        ...request,
        rejectedDate: new Date().toISOString().split('T')[0],
        rejectedBy: 'You',
        reason: 'Administrative decision'
      }]);
    }
    setPendingApprovals(prev => prev.filter(r => r.id !== id));
  };

  const [selectedRequest, setSelectedRequest] = useState(null);

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
        <button className="px-6 py-3 font-medium border-b-2 border-blue-600 text-blue-600">
          Pending Approvals ({pendingApprovals.length})
        </button>
        <button className="px-6 py-3 font-medium text-gray-500 hover:text-gray-700">
          Approved
        </button>
        <button className="px-6 py-3 font-medium text-gray-500 hover:text-gray-700">
          Rejected
        </button>
        <button className="px-6 py-3 font-medium text-gray-500 hover:text-gray-700">
          All Requests
        </button>
      </div>

      {/* Pending Approvals Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">Pending Recruitment Requests</h3>
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
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salary Proposed</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {pendingApprovals.map((request) => (
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
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedRequest(request)}
                        className="px-3 py-1 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 flex items-center"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Review
                      </button>
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
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Decisions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recently Approved */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              Recently Approved
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {approvedRequests.slice(0, 3).map((request) => (
                <div key={request.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">{request.position}</p>
                    <p className="text-sm text-gray-500">{request.applicantName}</p>
                  </div>
                  <div className="text-right">
                    <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                      Approved
                    </span>
                    <p className="text-xs text-gray-500 mt-1">{request.approvedDate}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recently Rejected */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <XCircle className="h-5 w-5 text-red-600 mr-2" />
              Recently Rejected
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {rejectedRequests.slice(0, 3).map((request) => (
                <div key={request.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">{request.position}</p>
                    <p className="text-sm text-gray-500">{request.applicantName}</p>
                  </div>
                  <div className="text-right">
                    <span className="px-3 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                      Rejected
                    </span>
                    <p className="text-xs text-gray-500 mt-1">{request.rejectedDate}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal */}
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
                      <input type="radio" name="decision" value="approve" className="mr-2" />
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