
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiFileText, FiRefreshCw, FiCheckCircle, FiClock } from 'react-icons/fi';
import { useAuth } from '../Authentication/AuthContext';

const Submissions = () => {
  const { authenticatedFetch } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
 // const [selectedAssignment, setSelectedAssignment] = useState(null);
  const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

  useEffect(() => {
    
    const fetchData = async () => {
      const res = await authenticatedFetch(`${API_BASE}/api/teacher/submissions/`);
      if (res && res.ok) {
        const data = await res.json();
        setSubmissions(data.data || []);
      }
      setLoading(false);
    };
    fetchData();
  }, [API_BASE, authenticatedFetch]);

  if (loading) return <div className="p-10 text-center">Loading submissions...</div>;

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-6">Submissions</h1>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700/30">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase">Assignment</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase">Student</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase">Submitted</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase">Grade</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {submissions.map(s => (
              <tr key={s.submission_id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                <td className="px-4 py-3 text-sm">{s.assignment_title}</td>
                <td className="px-4 py-3 text-sm">{s.student}</td>
                <td className="px-4 py-3 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    s.status === 'Graded' ? 'bg-green-100 text-green-700' :
                    s.status === 'Submitted' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>{s.status}</span>
                </td>
                <td className="px-4 py-3 text-sm">{s.submitted_at ? new Date(s.submitted_at).toLocaleDateString() : '-'}</td>
                <td className="px-4 py-3 text-sm font-semibold">{s.grade || '-'}</td>
                <td className="px-4 py-3 text-sm">
                  <Link to={`/teacher/submissions/${s.submission_id}/grade`} className="text-indigo-600 hover:underline">Grade</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Submissions;
