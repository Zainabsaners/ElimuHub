import React, { useState, useEffect } from 'react';
import { FiMail, FiPhone } from 'react-icons/fi';
import { useAuth } from '../Authentication/AuthContext';

const TeacherClassStudents = ({ classId }) => {
  const { authenticatedFetch } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

  useEffect(() => {
    const fetchData = async () => {
      const res = await authenticatedFetch(`${API_BASE}/api/teacher/classes/${classId}/students/`);
      if (res && res.ok) {
        const data = await res.json();
        setStudents(data.data || []);
      }
      setLoading(false);
    };
    fetchData();
  }, [classId, authenticatedFetch, API_BASE]);

  if (loading) return <div>Loading students...</div>;

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Students</h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700/30">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase">Admission</th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase">Name</th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase">Gender</th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase">Attendance</th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase">Grade</th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase">Contact</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {students.map(s => (
              <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                <td className="px-4 py-2 text-sm">{s.admission_no}</td>
                <td className="px-4 py-2 text-sm font-medium">{s.full_name}</td>
                <td className="px-4 py-2 text-sm">{s.gender}</td>
                <td className="px-4 py-2 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    s.latest_attendance === 'Present' ? 'bg-green-100 text-green-700' :
                    s.latest_attendance === 'Absent' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>{s.latest_attendance || 'N/A'}</span>
                </td>
                <td className="px-4 py-2 text-sm font-semibold">{s.latest_grade || 'N/A'}</td>
                <td className="px-4 py-2 text-sm">
                  <div className="flex gap-2">
                    <a href={`mailto:${s.email}`} className="text-indigo-600 hover:text-indigo-800"><FiMail /></a>
                    <a href={`tel:${s.phone}`} className="text-indigo-600 hover:text-indigo-800"><FiPhone /></a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TeacherClassStudents;
