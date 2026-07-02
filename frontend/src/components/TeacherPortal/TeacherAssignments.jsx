
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiFileText, FiRefreshCw, FiPlus, FiEye, FiClock } from 'react-icons/fi';
import { useAuth } from '../Authentication/AuthContext';

const TeacherAssignments = () => {
  const { authenticatedFetch } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

  useEffect(() => {
    const fetchData = async () => {
      const res = await authenticatedFetch(`${API_BASE}/api/teacher/assignments/`);
      if (res && res.ok) {
        const data = await res.json();
        setAssignments(data.data || []);
      }
      setLoading(false);
    };
    fetchData();
  }, [API_BASE, authenticatedFetch]);

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Assignments</h1>
        <Link to="/teacher/assignments/create" className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700">
          <FiPlus /> Create New
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {assignments.map(a => (
          <div key={a.id} className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{a.title}</h3>
                <p className="text-sm text-gray-500">{a.course_code} - {a.course}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${a.is_published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {a.is_published ? 'Published' : 'Draft'}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">{a.description}</p>
            <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
              <span><FiClock className="inline mr-1" /> {new Date(a.publish_date).toLocaleDateString()}</span>
              <span>{a.submissions_count || 0} submissions</span>
            </div>
            <div className="mt-3 flex gap-2">
              <Link to={`/teacher/assignments/${a.id}/submissions`} className="text-sm bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg hover:bg-indigo-200">View Submissions</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeacherAssignments;
