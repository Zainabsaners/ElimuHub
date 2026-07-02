
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiCalendar, FiRefreshCw } from 'react-icons/fi';
import { useAuth } from '../Authentication/AuthContext';
import { useTheme } from "@/hooks/useTheme";

const TeacherAttendance = () => {
  const { authenticatedFetch } = useAuth();
  const { theme } = useTheme();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

  useEffect(() => {
    const fetchClasses = async () => {
      const res = await authenticatedFetch(`${API_BASE}/api/teacher/classes/`);
      if (res && res.ok) {
        const data = await res.json();
        setClasses(data.data || []);
      }
      setLoading(false);
    };
    fetchClasses();
  }, [authenticatedFetch, API_BASE]);

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className={`p-4 md:p-6 min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <h1 className="text-2xl font-bold mb-6">Attendance</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {classes.map(cls => (
          <div key={cls.id} className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold">{cls.name}</h3>
            <p className="text-sm text-gray-500">Students: {cls.student_count}</p>
            <Link
              to={`/teacher/classes/${cls.id}?tab=attendance`}
              className="mt-3 inline-block bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm"
            >
              <FiCalendar className="inline mr-1" /> Mark Attendance
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeacherAttendance;
