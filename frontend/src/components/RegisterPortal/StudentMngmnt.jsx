import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';

const API_BASE_URL = import.meta.env.VITE_API_URL;

function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState({
    students: true,
    classes: true
  });
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [viewMode, setViewMode] = useState('list');
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [exportLoading, setExportLoading] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferData, setTransferData] = useState({
    targetClassId: '',
  });
  const [selectedTransferStudents, setSelectedTransferStudents] = useState([]);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedStatusStudents, setSelectedStatusStudents] = useState([]);
  const [bulkStatus, setBulkStatus] = useState('');
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);

  const token = localStorage.getItem('token');
  const config = {
    headers: {
      'Authorization': token?.startsWith('Bearer ') ? token : `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  };

  // Filter students
  const filterStudents = useCallback(() => {
    let filtered = [...students];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(student =>
        student.first_name?.toLowerCase().includes(term) ||
        student.last_name?.toLowerCase().includes(term) ||
        student.admission_no?.toLowerCase().includes(term) ||
        student.guardian_phone?.includes(term) ||
        student.phone?.includes(term)
      );
    }

    if (selectedClass !== 'all') {
      filtered = filtered.filter(student => student.current_class == selectedClass);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(student => student.status?.toLowerCase() === selectedStatus.toLowerCase());
    }

    setFilteredStudents(filtered);
  }, [students, searchTerm, selectedClass, selectedStatus]);

  // Apply filters when dependencies change
  useEffect(() => {
    filterStudents();
  }, [filterStudents]);

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading({ students: true, classes: true });
      setError(null);

      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': token?.startsWith('Bearer ') ? token : `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      };

      const studentsRes = await axios.get(`${API_BASE_URL}/api/students/`, config);
      const studentList = studentsRes.data?.results?.data || 
                          studentsRes.data?.data || 
                          (Array.isArray(studentsRes.data) ? studentsRes.data : []);
      setStudents(studentList);
      setFilteredStudents(studentList);
      
      const classesRes = await axios.get(`${API_BASE_URL}/api/classes/`, config);
      const classList = classesRes.data?.results?.data || 
                        classesRes.data?.data || 
                        (Array.isArray(classesRes.data) ? classesRes.data : []);
      setClasses(classList);

    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to connect to backend server. Please ensure the server is running.');
    } finally {
      setLoading({ students: false, classes: false });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handlers
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const viewStudentDetails = (student) => {
    setSelectedStudent(student);
    setShowStudentModal(true);
  };

  const printIDCard = (studentId) => {
    window.open(`${API_BASE_URL}/api/students/${studentId}/id-card/`, '_blank');
  };

  const viewAuditHistory = async (studentId) => {
    setAuditLoading(true);
    setShowAuditModal(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/audit-logs/?student_id=${studentId}`, config);
      const logs = response.data.results || response.data || [];
      setAuditLogs(logs);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      setAuditLogs([]);
    } finally {
      setAuditLoading(false);
    }
  };

  const handleEditStudent = (student) => {
    setSelectedStudent(student);
    setEditFormData({
      first_name: student.first_name,
      last_name: student.last_name,
      gender: student.gender,
      date_of_birth: student.date_of_birth,
      phone: student.phone,
      email: student.email,
      address: student.address,
      current_class: student.current_class,
      stream: student.stream,
      roll_number: student.roll_number,
      status: student.status,
      guardian_name: student.guardian_name,
      guardian_phone: student.guardian_phone,
      guardian_relation: student.guardian_relation,
      emergency_contact: student.emergency_contact,
      emergency_contact_name: student.emergency_contact_name
    });
    setShowEditModal(true);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/students/${selectedStudent.id}/`, editFormData, config);
      
      if (response.status === 200 || response.data.success) {
        setSuccessMessage(`Student updated successfully!`);
        await fetchData();
        setShowEditModal(false);
        setTimeout(() => setSuccessMessage(''), 5000);
      }
    } catch (error) {
      console.error('Error updating student:', error);
      alert('Failed to update student. Please try again.');
    }
  };

  const handleStatusChange = async (studentId, newStatus) => {
    if (!window.confirm(`Are you sure you want to change status to ${newStatus}?`)) {
      return;
    }

    try {
      const response = await axios.patch(
        `${API_BASE_URL}/api/students/${studentId}/`,
        { status: newStatus },
        config
      );
      
      if (response.status === 200 || response.data.success) {
        setSuccessMessage('Status updated successfully!');
        await fetchData();
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status.');
    }
  };

  const handleBulkStatusUpdate = async () => {
    if (selectedStatusStudents.length === 0) {
      alert('Please select at least one student.');
      return;
    }
    
    if (!bulkStatus) {
      alert('Please select a status.');
      return;
    }

    if (!window.confirm(`Are you sure you want to change status of ${selectedStatusStudents.length} student(s) to "${bulkStatus}"?`)) {
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/students/bulk-status-update/`,
        {
          student_ids: selectedStatusStudents,
          status: bulkStatus
        },
        config
      );

      if (response.data.success) {
        alert(`Successfully updated ${response.data.updated_count} student(s)!`);
        setShowStatusModal(false);
        setSelectedStatusStudents([]);
        setBulkStatus('');
        await fetchData();
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status. Please try again.');
    }
  };

  const toggleStudentForStatus = (studentId) => {
    if (selectedStatusStudents.includes(studentId)) {
      setSelectedStatusStudents(prev => prev.filter(id => id !== studentId));
    } else {
      setSelectedStatusStudents(prev => [...prev, studentId]);
    }
  };

  const handleArchiveStudent = async (studentId) => {
    if (!window.confirm('Are you sure you want to archive this student? This action can be reversed.')) {
      return;
    }

    try {
      const response = await axios.delete(`${API_BASE_URL}/api/students/${studentId}/`, config);
      
      if (response.data.success) {
        alert('Student archived successfully!');
        await fetchData();
      }
    } catch (error) {
      console.error('Error archiving student:', error);
      alert('Failed to archive student.');
    }
  };

  const exportToExcel = () => {
    setExportLoading(true);
    
    try {
      const exportData = filteredStudents.map(student => ({
        'Admission No': student.admission_no,
        'Full Name': `${student.first_name} ${student.middle_name || ''} ${student.last_name}`.trim(),
        'Gender': student.gender,
        'Date of Birth': student.date_of_birth,
        'Class': classes.find(c => c.id == student.current_class)?.class_name || 'Not assigned',
        'Stream': student.stream || 'N/A',
        'Roll Number': student.roll_number || 'N/A',
        'Phone': student.phone || 'N/A',
        'Email': student.email || 'N/A',
        'Guardian Name': student.guardian_name,
        'Guardian Phone': student.guardian_phone,
        'Guardian Relation': student.guardian_relation,
        'Emergency Contact': student.emergency_contact,
        'Status': student.status,
        'Admission Date': student.admission_date,
        'Address': student.address,
        'City': student.city,
        'Medical Conditions': student.medical_conditions || 'None',
        'Allergies': student.allergies || 'None'
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
      
      const maxWidth = exportData.reduce((w, r) => Math.max(w, r['Full Name']?.length || 0), 10);
      const wscols = [
        {wch: 15}, {wch: Math.min(maxWidth, 30)}, {wch: 10}, {wch: 12},
        {wch: 20}, {wch: 10}, {wch: 12}, {wch: 15}, {wch: 25},
        {wch: 20}, {wch: 15}, {wch: 15}, {wch: 15}, {wch: 10},
        {wch: 12}, {wch: 30}, {wch: 15}, {wch: 20}, {wch: 15}
      ];
      worksheet['!cols'] = wscols;
      
      XLSX.writeFile(workbook, `students_export_${new Date().toISOString().split('T')[0]}.xlsx`);
      setSuccessMessage(`Exported ${exportData.length} students to Excel`);
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setExportLoading(false);
    }
  };

  const toggleStudentForTransfer = (studentId) => {
    if (selectedTransferStudents.includes(studentId)) {
      setSelectedTransferStudents(prev => prev.filter(id => id !== studentId));
    } else {
      setSelectedTransferStudents(prev => [...prev, studentId]);
    }
  };

  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedTransferStudents.length === 0) {
      alert('Please select at least one student to transfer.');
      return;
    }

    if (!transferData.targetClassId) {
      alert('Please select a target class.');
      return;
    }

    if (!window.confirm(`Transfer ${selectedTransferStudents.length} student(s) to the selected class?`)) {
      return;
    }

    try {
      const updatePromises = selectedTransferStudents.map(studentId =>
        axios.put(`${API_BASE_URL}/api/students/${studentId}/`, {
          current_class: transferData.targetClassId,
        }, config)
      );

      await Promise.all(updatePromises);
      
      alert(`Successfully transferred ${selectedTransferStudents.length} student(s)!`);
      setShowTransferModal(false);
      setSelectedTransferStudents([]);
      setTransferData({
        targetClassId: '',
      });
      await fetchData();
    } catch (error) {
      console.error('Error transferring students:', error);
      alert('Failed to transfer students. Please try again.');
    }
  };

  const getStatistics = () => {
    const totalStudents = students.length;
    const activeStudents = students.filter(s => s.status?.toLowerCase() === 'active').length;
    const maleStudents = students.filter(s => s.gender?.toLowerCase() === 'male').length;
    const femaleStudents = students.filter(s => s.gender?.toLowerCase() === 'female').length;
    const archivedStudents = students.filter(s => s.archived === true || s.status?.toLowerCase() === 'archived').length;

    const studentsByClass = {};
    students.forEach(student => {
      const classId = student.current_class;
      if (classId) {
        if (!studentsByClass[classId]) {
          studentsByClass[classId] = {
            count: 0,
            className: classes.find(c => c.id == classId)?.class_name || 'Unknown'
          };
        }
        studentsByClass[classId].count++;
      }
    });

    return {
      totalStudents,
      activeStudents,
      maleStudents,
      femaleStudents,
      archivedStudents,
      studentsByClass
    };
  };

  const stats = getStatistics();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Student Management</h1>
              <p className="text-gray-600 mt-1">Manage student records, classes, and transfers</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={exportToExcel}
                disabled={exportLoading}
                className={`px-4 py-2 ${exportLoading ? 'bg-green-500' : 'bg-green-600'} text-white rounded-lg hover:bg-green-700 flex items-center`}
              >
                {exportLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Exporting...
                  </>
                ) : (
                  <>
                    <i className="fas fa-file-excel mr-2"></i>
                    Export to Excel
                  </>
                )}
              </button>
              <button
                onClick={() => setShowTransferModal(true)}
                disabled={students.length === 0}
                className={`px-4 py-2 ${students.length === 0 ? 'bg-gray-400' : 'bg-purple-600'} text-white rounded-lg hover:bg-purple-700 flex items-center`}
              >
                <i className="fas fa-exchange-alt mr-2"></i>
                Transfer Students
              </button>
              <button
                onClick={() => setShowStatusModal(true)}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 flex items-center"
              >
                <i className="fas fa-tasks mr-2"></i> Bulk Status
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <i className="fas fa-exclamation-triangle text-red-500 mr-3"></i>
                <div>
                  <p className="text-red-700 font-medium">Backend Connection Error</p>
                  <p className="text-red-600 text-sm mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <i className="fas fa-check-circle text-green-500 mr-3"></i>
                <div>
                  <p className="text-green-700 font-medium">Success!</p>
                  <p className="text-green-600 text-sm mt-1 whitespace-pre-line">{successMessage}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Students</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">
                  {loading.students ? '...' : stats.totalStudents}
                </p>
              </div>
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                <i className="fas fa-users text-blue-600 text-2xl"></i>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Active Students</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">
                  {loading.students ? '...' : stats.activeStudents}
                </p>
              </div>
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
                <i className="fas fa-user-check text-green-600 text-2xl"></i>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Male Students</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">
                  {loading.students ? '...' : stats.maleStudents}
                </p>
              </div>
              <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center">
                <i className="fas fa-male text-amber-600 text-2xl"></i>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Female Students</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">
                  {loading.students ? '...' : stats.femaleStudents}
                </p>
              </div>
              <div className="w-14 h-14 bg-pink-100 rounded-xl flex items-center justify-center">
                <i className="fas fa-female text-pink-600 text-2xl"></i>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Archived</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">
                  {loading.students ? '...' : stats.archivedStudents}
                </p>
              </div>
              <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center">
                <i className="fas fa-archive text-gray-600 text-2xl"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="mb-8 bg-white rounded-xl shadow border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Students</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearch}
                  placeholder="Search by name, admission no, or phone..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Class</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Classes</option>
                {classes.map(cls => (
                  <option key={cls.id} value={cls.id}>
                    {cls.class_name} ({cls.class_code})
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="graduated">Graduated</option>
                <option value="transferred">Transferred</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">View Mode</label>
              <div className="flex space-x-2">
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex-1 px-4 py-2.5 rounded-lg border ${viewMode === 'list' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'}`}
                >
                  <i className="fas fa-list mr-2"></i>
                  List View
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex-1 px-4 py-2.5 rounded-lg border ${viewMode === 'grid' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'}`}
                >
                  <i className="fas fa-th-large mr-2"></i>
                  Grid View
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Student Count Summary */}
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">
              {filteredStudents.length} Student{filteredStudents.length !== 1 ? 's' : ''} Found
            </h3>
            <div className="text-sm text-gray-600">
              Showing {filteredStudents.length} of {students.length} total students
            </div>
          </div>
        </div>

        {/* Student List/Grid */}
        {loading.students ? (
          <div className="bg-white rounded-xl shadow border border-gray-200 p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading students...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="bg-white rounded-xl shadow border border-gray-200 p-12 text-center">
            <i className="fas fa-users text-gray-300 text-5xl mb-4"></i>
            <h3 className="text-lg font-medium text-gray-700">No students found</h3>
            <p className="text-gray-500 mt-1">Try adjusting your search or filters</p>
          </div>
        ) : viewMode === 'list' ? (
          <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Details</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class & Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guardian</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStudents.map(student => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                            <i className={`fas fa-${student.gender === 'male' ? 'male' : 'female'} text-blue-600`}></i>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{student.first_name} {student.last_name}</h4>
                            <div className="text-sm text-gray-600 space-y-1">
                              <div>Adm: {student.admission_no}</div>
                              <div>DOB: {student.date_of_birth}</div>
                              <div>Admitted: {new Date(student.admission_date).toLocaleDateString()}</div>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <div><span className="text-sm text-gray-600">Class:</span> <span className="font-medium">{classes.find(c => c.id == student.current_class)?.class_name || 'Not assigned'}</span></div>
                          <div><span className="text-sm text-gray-600">Stream:</span> <span>{student.stream || 'N/A'}</span></div>
                          <div><span className="text-sm text-gray-600">Roll:</span> <span>{student.roll_number || 'N/A'}</span></div>
                          <div><span className="text-sm text-gray-600">Phone:</span> <span>{student.phone || 'N/A'}</span></div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <div><span className="text-sm text-gray-600">Guardian:</span> <span className="font-medium">{student.guardian_name}</span></div>
                          <div><span className="text-sm text-gray-600">Phone:</span> <span>{student.guardian_phone}</span></div>
                          <div><span className="text-sm text-gray-600">Relation:</span> <span>{student.guardian_relation}</span></div>
                          <div><span className="text-sm text-gray-600">Emergency:</span> <span>{student.emergency_contact}</span></div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={student.status}
                          onChange={(e) => handleStatusChange(student.id, e.target.value)}
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${
                            student.status === 'active' ? 'bg-green-100 text-green-800 border-green-200' :
                            student.status === 'inactive' ? 'bg-red-100 text-red-800 border-red-200' :
                            student.status === 'graduated' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                            'bg-gray-100 text-gray-800 border-gray-200'
                          }`}
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="graduated">Graduated</option>
                          <option value="transferred">Transferred</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          <button onClick={() => viewStudentDetails(student)} className="px-2.5 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-100">
                            <i className="fas fa-eye mr-1"></i>View
                          </button>
                          <button onClick={() => handleEditStudent(student)} className="px-2.5 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-xs font-medium hover:bg-amber-100">
                            <i className="fas fa-edit mr-1"></i>Edit
                          </button>
                          <button onClick={() => printIDCard(student.id)} className="px-2.5 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-medium hover:bg-indigo-100">
                            <i className="fas fa-id-card mr-1"></i>ID Card
                          </button>
                          <button onClick={() => handleArchiveStudent(student.id)} className="px-2.5 py-1.5 bg-red-50 text-red-700 rounded-lg text-xs font-medium hover:bg-red-100">
                            <i className="fas fa-archive mr-1"></i>Archive
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStudents.map(student => (
              <div key={student.id} className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                        <i className={`fas fa-${student.gender === 'male' ? 'male' : 'female'} text-blue-600 text-2xl`}></i>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{student.first_name} {student.last_name}</h4>
                        <p className="text-sm text-gray-600">{student.admission_no}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      student.status === 'active' ? 'bg-green-100 text-green-800' :
                      student.status === 'inactive' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {student.status}
                    </span>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between"><span className="text-sm text-gray-600">Class:</span><span className="font-medium">{classes.find(c => c.id == student.current_class)?.class_name || 'Not assigned'}</span></div>
                    <div className="flex justify-between"><span className="text-sm text-gray-600">Date of Birth:</span><span>{student.date_of_birth}</span></div>
                    <div className="flex justify-between"><span className="text-sm text-gray-600">Guardian:</span><span className="font-medium">{student.guardian_name}</span></div>
                    <div className="flex justify-between"><span className="text-sm text-gray-600">Guardian Phone:</span><span>{student.guardian_phone}</span></div>
                    <div className="flex justify-between"><span className="text-sm text-gray-600">Admission Date:</span><span>{new Date(student.admission_date).toLocaleDateString()}</span></div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button onClick={() => viewStudentDetails(student)} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
                      <i className="fas fa-eye mr-2"></i>View
                    </button>
                    <button onClick={() => printIDCard(student.id)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium" title="Print ID Card">
                      <i className="fas fa-id-card"></i>
                    </button>
                    <button onClick={() => handleEditStudent(student)} className="px-4 py-2 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 text-sm font-medium">
                      <i className="fas fa-edit"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Student Details Modal */}
      {showStudentModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">Student Details</h3>
                <button onClick={() => setShowStudentModal(false)} className="text-gray-400 hover:text-gray-600">
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-auto max-h-[70vh]">
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-5">
                  <div className="flex items-center mb-4">
                    <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                      <i className={`fas fa-${selectedStudent.gender === 'male' ? 'male' : 'female'} text-blue-600 text-3xl`}></i>
                    </div>
                    <div>
                      <h4 className="text-2xl font-bold text-gray-800">{selectedStudent.first_name} {selectedStudent.middle_name} {selectedStudent.last_name}</h4>
                      <p className="text-gray-600">{selectedStudent.admission_no}</p>
                      <div className="flex items-center mt-2 space-x-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          selectedStudent.status === 'active' ? 'bg-green-100 text-green-800' :
                          selectedStudent.status === 'inactive' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {selectedStudent.status}
                        </span>
                        <span className="text-sm text-gray-600"><i className="fas fa-calendar-alt mr-1"></i>Admitted: {new Date(selectedStudent.admission_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => printIDCard(selectedStudent.id)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center">
                    <i className="fas fa-id-card mr-2"></i> Print ID Card
                  </button>
                  <button onClick={() => viewAuditHistory(selectedStudent.id)} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center">
                    <i className="fas fa-history mr-2"></i> View History
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg p-5 border border-gray-200">
                    <h5 className="font-semibold text-gray-700 mb-3">Personal Information</h5>
                    <div className="space-y-2">
                      <div className="flex justify-between"><span className="text-sm text-gray-600">Date of Birth:</span><span>{selectedStudent.date_of_birth}</span></div>
                      <div className="flex justify-between"><span className="text-sm text-gray-600">Gender:</span><span className="capitalize">{selectedStudent.gender}</span></div>
                      <div className="flex justify-between"><span className="text-sm text-gray-600">Nationality:</span><span>{selectedStudent.nationality}</span></div>
                      <div className="flex justify-between"><span className="text-sm text-gray-600">Religion:</span><span>{selectedStudent.religion || 'Not specified'}</span></div>
                      <div className="flex justify-between"><span className="text-sm text-gray-600">Blood Group:</span><span>{selectedStudent.blood_group || 'Not specified'}</span></div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-5 border border-gray-200">
                    <h5 className="font-semibold text-gray-700 mb-3">Academic Information</h5>
                    <div className="space-y-2">
                      <div className="flex justify-between"><span className="text-sm text-gray-600">Current Class:</span><span className="font-medium">{classes.find(c => c.id == selectedStudent.current_class)?.class_name || 'Not assigned'}</span></div>
                      <div className="flex justify-between"><span className="text-sm text-gray-600">Stream:</span><span>{selectedStudent.stream || 'N/A'}</span></div>
                      <div className="flex justify-between"><span className="text-sm text-gray-600">Roll Number:</span><span>{selectedStudent.roll_number || 'N/A'}</span></div>
                      <div className="flex justify-between"><span className="text-sm text-gray-600">Admission Type:</span><span className="capitalize">{selectedStudent.admission_type}</span></div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-5 border border-gray-200">
                    <h5 className="font-semibold text-gray-700 mb-3">Contact Information</h5>
                    <div className="space-y-2">
                      <div className="flex justify-between"><span className="text-sm text-gray-600">Address:</span><span className="text-right">{selectedStudent.address}</span></div>
                      <div className="flex justify-between"><span className="text-sm text-gray-600">City:</span><span>{selectedStudent.city}</span></div>
                      <div className="flex justify-between"><span className="text-sm text-gray-600">Country:</span><span>{selectedStudent.country}</span></div>
                      <div className="flex justify-between"><span className="text-sm text-gray-600">Phone:</span><span>{selectedStudent.phone || 'N/A'}</span></div>
                      <div className="flex justify-between"><span className="text-sm text-gray-600">Email:</span><span>{selectedStudent.email || 'N/A'}</span></div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-5 border border-gray-200">
                    <h5 className="font-semibold text-gray-700 mb-3">Guardian Information</h5>
                    <div className="space-y-2">
                      <div className="flex justify-between"><span className="text-sm text-gray-600">Guardian Name:</span><span className="font-medium">{selectedStudent.guardian_name}</span></div>
                      <div className="flex justify-between"><span className="text-sm text-gray-600">Relationship:</span><span>{selectedStudent.guardian_relation}</span></div>
                      <div className="flex justify-between"><span className="text-sm text-gray-600">Guardian Phone:</span><span>{selectedStudent.guardian_phone}</span></div>
                      <div className="flex justify-between"><span className="text-sm text-gray-600">Guardian Email:</span><span>{selectedStudent.guardian_email || 'N/A'}</span></div>
                      <div className="flex justify-between"><span className="text-sm text-gray-600">Emergency Contact:</span><span>{selectedStudent.emergency_contact_name} ({selectedStudent.emergency_contact})</span></div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg p-5 border border-gray-200">
                    <h5 className="font-semibold text-gray-700 mb-3">Medical Information</h5>
                    <div className="space-y-2">
                      <div><span className="text-sm text-gray-600 block mb-1">Medical Conditions:</span><p className="text-gray-800">{selectedStudent.medical_conditions || 'None'}</p></div>
                      <div><span className="text-sm text-gray-600 block mb-1">Allergies:</span><p className="text-gray-800">{selectedStudent.allergies || 'None'}</p></div>
                      <div><span className="text-sm text-gray-600 block mb-1">Medication:</span><p className="text-gray-800">{selectedStudent.medication || 'None'}</p></div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-5 border border-gray-200">
                    <h5 className="font-semibold text-gray-700 mb-3">Previous School Information</h5>
                    <div className="space-y-2">
                      <div className="flex justify-between"><span className="text-sm text-gray-600">Previous School:</span><span>{selectedStudent.previous_school || 'N/A'}</span></div>
                      <div className="flex justify-between"><span className="text-sm text-gray-600">Previous Class:</span><span>{selectedStudent.previous_class || 'N/A'}</span></div>
                      <div className="flex justify-between"><span className="text-sm text-gray-600">Transfer Certificate No:</span><span>{selectedStudent.transfer_certificate_no || 'N/A'}</span></div>
                      <div className="flex justify-between"><span className="text-sm text-gray-600">Expected Graduation:</span><span>{selectedStudent.expected_graduation_date || 'N/A'}</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
              <button onClick={() => { setShowStudentModal(false); handleEditStudent(selectedStudent); }} className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-medium">
                <i className="fas fa-edit mr-2"></i>Edit Student
              </button>
              <button onClick={() => setShowStudentModal(false)} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Audit History Modal */}
      {showAuditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-3xl w-full max-h-[80vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">
                  <i className="fas fa-history mr-2"></i>
                  Audit History - {selectedStudent?.first_name} {selectedStudent?.last_name}
                </h3>
                <button onClick={() => setShowAuditModal(false)} className="text-gray-400 hover:text-gray-600">
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-auto max-h-[60vh]">
              {auditLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading audit history...</p>
                </div>
              ) : auditLogs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <i className="fas fa-inbox text-4xl text-gray-300 mb-3"></i>
                  <p>No audit history found for this student.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                            log.action === 'CREATE' ? 'bg-green-100 text-green-600' :
                            log.action === 'UPDATE' ? 'bg-blue-100 text-blue-600' :
                            log.action === 'DELETE' ? 'bg-red-100 text-red-600' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            <i className={`fas fa-${
                              log.action === 'CREATE' ? 'plus' :
                              log.action === 'UPDATE' ? 'pencil-alt' :
                              log.action === 'DELETE' ? 'trash' :
                              'clock'
                            }`}></i>
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{log.action.replace('_', ' ').toUpperCase()}</p>
                            <p className="text-sm text-gray-600">{log.user?.username || 'System'} • {new Date(log.created_at).toLocaleString()}</p>
                          </div>
                        </div>
                        {log.changes && Object.keys(log.changes).length > 0 && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            {Object.keys(log.changes).length} field(s) changed
                          </span>
                        )}
                      </div>
                      {log.changes && Object.keys(log.changes).length > 0 && (
                        <div className="mt-2 bg-gray-50 rounded p-2">
                          {Object.entries(log.changes).map(([key, value]) => (
                            <div key={key} className="text-sm">
                              <span className="font-medium text-gray-700">{key}:</span>
                              <span className="text-gray-600 ml-2">{typeof value === 'object' ? JSON.stringify(value) : String(value)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end">
              <button onClick={() => setShowAuditModal(false)} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {showEditModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">Edit Student</h3>
                <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-auto max-h-[70vh]">
              <form onSubmit={handleEditSubmit}>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div><label className="block text-sm font-medium text-gray-700 mb-2">First Name <span className="text-red-500">*</span></label>
                      <input type="text" name="first_name" value={editFormData.first_name} onChange={handleEditInputChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required />
                    </div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-2">Last Name <span className="text-red-500">*</span></label>
                      <input type="text" name="last_name" value={editFormData.last_name} onChange={handleEditInputChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required />
                    </div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-2">Gender <span className="text-red-500">*</span></label>
                      <select name="gender" value={editFormData.gender} onChange={handleEditInputChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required>
                        <option value="male">Male</option><option value="female">Female</option>
                      </select>
                    </div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth <span className="text-red-500">*</span></label>
                      <input type="date" name="date_of_birth" value={editFormData.date_of_birth} onChange={handleEditInputChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required />
                    </div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <input type="tel" name="phone" value={editFormData.phone} onChange={handleEditInputChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                      <input type="email" name="email" value={editFormData.email} onChange={handleEditInputChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-2">Current Class</label>
                      <select name="current_class" value={editFormData.current_class} onChange={handleEditInputChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <option value="">Select Class</option>
                        {classes.map(cls => (<option key={cls.id} value={cls.id}>{cls.class_name} ({cls.class_code})</option>))}
                      </select>
                    </div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-2">Stream</label>
                      <input type="text" name="stream" value={editFormData.stream} onChange={handleEditInputChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g., winners, runners" />
                    </div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-2">Roll Number</label>
                      <input type="number" name="roll_number" value={editFormData.roll_number} onChange={handleEditInputChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                      <select name="status" value={editFormData.status} onChange={handleEditInputChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <option value="active">Active</option><option value="inactive">Inactive</option>
                        <option value="graduated">Graduated</option><option value="transferred">Transferred</option>
                      </select>
                    </div>
                    <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                      <textarea name="address" value={editFormData.address} onChange={handleEditInputChange} rows="2" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-2">Guardian Name</label>
                      <input type="text" name="guardian_name" value={editFormData.guardian_name} onChange={handleEditInputChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-2">Guardian Phone</label>
                      <input type="tel" name="guardian_phone" value={editFormData.guardian_phone} onChange={handleEditInputChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-2">Guardian Relation</label>
                      <select name="guardian_relation" value={editFormData.guardian_relation} onChange={handleEditInputChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <option value="">Select Relation</option>
                        <option value="Father">Father</option><option value="Mother">Mother</option>
                        <option value="Brother">Brother</option><option value="Sister">Sister</option>
                        <option value="Uncle">Uncle</option><option value="Aunt">Aunt</option>
                        <option value="Grandfather">Grandfather</option><option value="Grandmother">Grandmother</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact</label>
                      <input type="tel" name="emergency_contact" value={editFormData.emergency_contact} onChange={handleEditInputChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact Name</label>
                      <input type="text" name="emergency_contact_name" value={editFormData.emergency_contact_name} onChange={handleEditInputChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end space-x-3">
                  <button type="button" onClick={() => setShowEditModal(false)} className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50">Cancel</button>
                  <button type="submit" className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center">
                    <i className="fas fa-save mr-2"></i>Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Students Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">Transfer Students</h3>
                <button onClick={() => { setShowTransferModal(false); setSelectedTransferStudents([]); }} className="text-gray-400 hover:text-gray-600">
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-auto max-h-[70vh]">
              <form onSubmit={handleTransferSubmit}>
                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <i className="fas fa-info-circle text-blue-500 text-xl mr-3"></i>
                      <div>
                        <p className="text-blue-700 font-medium">Transfer Instructions</p>
                        <p className="text-blue-600 text-sm mt-1">Select students to transfer and choose their new class. This will update their current class assignment.</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Target Class <span className="text-red-500">*</span></label>
                      <select name="targetClassId" value={transferData.targetClassId} onChange={(e) => setTransferData({...transferData, targetClassId: e.target.value})} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required>
                        <option value="">Select Target Class</option>
                        {classes.map(cls => (<option key={cls.id} value={cls.id}>{cls.class_name} ({cls.class_code})</option>))}
                      </select>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-700">Select Students to Transfer ({selectedTransferStudents.length} selected)</h4>
                        <button type="button" onClick={() => {
                          if (selectedTransferStudents.length === filteredStudents.length) {
                            setSelectedTransferStudents([]);
                          } else {
                            setSelectedTransferStudents(filteredStudents.map(s => s.id));
                          }
                        }} className="text-sm text-blue-600 hover:text-blue-800">
                          {selectedTransferStudents.length === filteredStudents.length ? 'Deselect All' : 'Select All'}
                        </button>
                      </div>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {filteredStudents.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">No students found. Adjust your filters.</div>
                      ) : (
                        <div className="divide-y divide-gray-200">
                          {filteredStudents.map(student => (
                            <div key={student.id} className="flex items-center px-4 py-3 hover:bg-gray-50">
                              <input type="checkbox" checked={selectedTransferStudents.includes(student.id)} onChange={() => toggleStudentForTransfer(student.id)} className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500" />
                              <div className="ml-3 flex-1">
                                <p className="font-medium text-gray-900">{student.first_name} {student.last_name}</p>
                                <div className="flex items-center text-sm text-gray-600">
                                  <span className="mr-4">Adm: {student.admission_no}</span>
                                  <span>Current Class: {classes.find(c => c.id == student.current_class)?.class_name || 'Not assigned'}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end space-x-3">
                  <button type="button" onClick={() => { setShowTransferModal(false); setSelectedTransferStudents([]); }} className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50">Cancel</button>
                  <button type="submit" disabled={selectedTransferStudents.length === 0 || !transferData.targetClassId} className={`px-8 py-3 ${selectedTransferStudents.length === 0 || !transferData.targetClassId ? 'bg-purple-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'} text-white rounded-lg font-medium flex items-center`}>
                    <i className="fas fa-exchange-alt mr-2"></i>Transfer {selectedTransferStudents.length} Student{selectedTransferStudents.length !== 1 ? 's' : ''}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800"><i className="fas fa-tasks mr-2"></i>Bulk Status Update</h3>
                <button onClick={() => { setShowStatusModal(false); setSelectedStatusStudents([]); setBulkStatus(''); }} className="text-gray-400 hover:text-gray-600">
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-auto max-h-[60vh]">
              <div className="space-y-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <i className="fas fa-info-circle text-yellow-500 text-xl mr-3"></i>
                    <div>
                      <p className="text-yellow-700 font-medium">Bulk Status Update</p>
                      <p className="text-yellow-600 text-sm mt-1">Select multiple students and update their status at once.</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Status <span className="text-red-500">*</span></label>
                  <select value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required>
                    <option value="">Select New Status</option>
                    <option value="active">Active</option><option value="inactive">Inactive</option>
                    <option value="graduated">Graduated</option><option value="transferred">Transferred</option>
                  </select>
                </div>

                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-700">Select Students ({selectedStatusStudents.length} selected)</h4>
                      <button type="button" onClick={() => {
                        if (selectedStatusStudents.length === filteredStudents.length) {
                          setSelectedStatusStudents([]);
                        } else {
                          setSelectedStatusStudents(filteredStudents.map(s => s.id));
                        }
                      }} className="text-sm text-blue-600 hover:text-blue-800">
                        {selectedStatusStudents.length === filteredStudents.length ? 'Deselect All' : 'Select All'}
                      </button>
                    </div>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {filteredStudents.length === 0 ? (
                      <div className="p-8 text-center text-gray-500">No students found. Adjust your filters.</div>
                    ) : (
                      <div className="divide-y divide-gray-200">
                        {filteredStudents.map(student => (
                          <div key={student.id} className="flex items-center px-4 py-3 hover:bg-gray-50">
                            <input type="checkbox" checked={selectedStatusStudents.includes(student.id)} onChange={() => toggleStudentForStatus(student.id)} className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500" />
                            <div className="ml-3 flex-1">
                              <p className="font-medium text-gray-900">{student.first_name} {student.last_name}</p>
                              <div className="flex items-center text-sm text-gray-600">
                                <span className="mr-4">Adm: {student.admission_no}</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs ${student.status === 'active' ? 'bg-green-100 text-green-800' : student.status === 'inactive' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>{student.status}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
              <button onClick={() => { setShowStatusModal(false); setSelectedStatusStudents([]); setBulkStatus(''); }} className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50">Cancel</button>
              <button onClick={handleBulkStatusUpdate} disabled={selectedStatusStudents.length === 0 || !bulkStatus} className={`px-8 py-3 ${selectedStatusStudents.length === 0 || !bulkStatus ? 'bg-yellow-400 cursor-not-allowed' : 'bg-yellow-600 hover:bg-yellow-700'} text-white rounded-lg font-medium flex items-center`}>
                <i className="fas fa-check mr-2"></i>Update Status for {selectedStatusStudents.length} Student{selectedStatusStudents.length !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentManagement;