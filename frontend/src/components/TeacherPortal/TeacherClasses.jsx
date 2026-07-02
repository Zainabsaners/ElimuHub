import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiUsers, FiBookOpen, FiRefreshCw } from 'react-icons/fi';
import { useAuth } from '../Authentication/AuthContext';
import { useTheme } from "@/hooks/useTheme";

const TeacherClasses = () => {
  const { authenticatedFetch } = useAuth();
  const { theme } = useTheme();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

  useEffect(() => {
    const fetchData = async () => {
      const res = await authenticatedFetch(`${API_BASE}/api/teacher/classes/`);
      if (res && res.ok) {
        const data = await res.json();
        setClasses(data.data || []);
      }
      setLoading(false);
    };
    fetchData();
  }, [API_BASE,authenticatedFetch]);

  if (loading) return <div className="p-10 text-center">Loading classes...</div>;

  return (
    <div className={`p-4 md:p-6 min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <h1 className="text-2xl font-bold mb-6">My Classes</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {classes.map(cls => (
          <Link key={cls.id} to={`/teacher/classes/${cls.id}`} className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition group">
            <h3 className="text-lg font-semibold">{cls.name}</h3>
            <p className="text-sm text-gray-500">Code: {cls.code} | Level {cls.level}</p>
            <div className="flex items-center gap-4 mt-2 text-sm">
              <span><FiUsers className="inline mr-1" /> {cls.student_count}</span>
              <span><FiBookOpen className="inline mr-1" /> {cls.subjects?.length || 0} subjects</span>
            </div>
            <div className="mt-3 text-indigo-600 group-hover:underline">View Details →</div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default TeacherClasses;
