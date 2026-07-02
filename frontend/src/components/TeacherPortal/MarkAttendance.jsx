import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../Authentication/AuthContext';
import toast from 'react-hot-toast';

const MarkAttendance = ({ classId }) => {
  const { authenticatedFetch } = useAuth();
  const [students, setStudents] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [attendanceData, setAttendanceData] = useState({});
  const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

  const formatTime = (time) => {
    if (!time) return 'N/A';
    return time.slice(0, 5);
  };

  const fetchSessions = useCallback(async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const res = await authenticatedFetch(`${API_BASE}/api/teacher/attendance/sessions/${classId}/?date=${today}`);
      if (res && res.ok) {
        const data = await res.json();
        setSessions(data.data || []);
        if (data.data && data.data.length > 0) {
          setSelectedSession(data.data[0].id);
          // Fetch students for this class
          const studentRes = await authenticatedFetch(`${API_BASE}/api/teacher/classes/${classId}/students/`);
          if (studentRes && studentRes.ok) {
            const studentData = await studentRes.json();
            setStudents(studentData.data || []);
          }
        } else {
          setStudents([]);
        }
      } else {
        toast.error('Failed to fetch sessions');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error loading data');
    } finally {
      setLoading(false);
    }
  }, [classId, authenticatedFetch, API_BASE]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleStatusChange = (studentId, status) => {
    setAttendanceData(prev => ({ ...prev, [studentId]: status }));
  };

  const saveAttendance = async () => {
    if (!selectedSession) {
      toast.error('No session selected');
      return;
    }
    setSaving(true);
    try {
      const records = students.map(s => ({
        student_id: s.id,
        status: attendanceData[s.id] || 'Present'
      }));
      const res = await authenticatedFetch(`${API_BASE}/api/teacher/attendance/mark/`, {
        method: 'POST',
        body: JSON.stringify({ session_id: selectedSession, records })
      });
      if (res && res.ok) {
        toast.success('Attendance saved!');
      } else {
        toast.error('Failed to save attendance');
      }
    } catch  {
      toast.error('Error saving');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  if (sessions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">No attendance session found for today.</p>
        <p className="text-sm text-gray-400 mt-2">Please create a session first or select a different date.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Mark Attendance</h2>
        <div>
          <label className="mr-2 text-sm">Session:</label>
          <select
            value={selectedSession || ''}
            onChange={(e) => setSelectedSession(Number(e.target.value))}
            className="p-1 border rounded"
          >
            {sessions.map(s => (
              <option key={s.id} value={s.id}>
                {s.subject} - {s.session_type} ({formatTime(s.start_time)}-{formatTime(s.end_time)})
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700/30">
            <tr><th>Name</th><th>Status</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {students.map(s => (
              <tr key={s.id}>
                <td className="px-4 py-2 text-sm">{s.full_name}</td>
                <td className="px-4 py-2">
                  <select
                    value={attendanceData[s.id] || 'Present'}
                    onChange={e => handleStatusChange(s.id, e.target.value)}
                    className="p-1 border rounded"
                  >
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                    <option value="Late">Late</option>
                    <option value="Excused">Excused</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button
        onClick={saveAttendance}
        disabled={saving}
        className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Save Attendance'}
      </button>
    </div>
  );
};

export default MarkAttendance;