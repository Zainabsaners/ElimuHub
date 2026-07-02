import React, { useState, useEffect } from 'react';
import { useParams, Link, Outlet, useSearchParams } from 'react-router-dom';
import { FiUsers, FiCalendar, FiBookOpen, FiBarChart2, FiArrowLeft } from 'react-icons/fi';
import { useAuth } from '../Authentication/AuthContext';
import { useTheme } from "@/hooks/useTheme";
import TeacherClassStudents from './TeacherClassStudents';
import MarkAttendance from './MarkAttendance';
import GradeEntry from './GradeEntry';

const TeacherClassDetail = () => {
  const { classId } = useParams();
  const { authenticatedFetch } = useAuth();
  const { theme } = useTheme();
 // const navigate = useNavigate();
  const [_classInfo, setClassInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('students');
  const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

  const tabs = [
    { id: 'students', label: 'Students', icon: <FiUsers /> },
    { id: 'attendance', label: 'Attendance', icon: <FiCalendar /> },
    { id: 'grades', label: 'Grades', icon: <FiBookOpen /> },


  
  ];
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');

  useEffect(() => {
    if (tabParam && ['students', 'attendance', 'grades'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  useEffect(() => {
    const fetchClassInfo = async () => {
      try {
        const res = await authenticatedFetch(`${API_BASE}/api/teacher/classes/${classId}/students/`);
        if (!res) throw new Error('No response');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        // We'll use this to get class name, but we can also fetch from /teacher/classes/
        setClassInfo({ id: classId, studentCount: data.data?.length || 0 });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchClassInfo();
  }, [classId, authenticatedFetch, API_BASE]);

  if (loading) return <div className="p-10 text-center">Loading class details...</div>;
  if (error) return <div className="p-10 text-center text-red-500">{error}</div>;

  return (
    <div className={`p-4 md:p-6 min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <Link to="/teacher/classes" className="text-indigo-600 hover:underline flex items-center gap-1">
            <FiArrowLeft /> Back
          </Link>
          <h1 className="text-2xl font-bold">Class {classId} — Details</h1>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium flex items-center gap-2 transition ${
                activeTab === tab.id
                  ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          {activeTab === 'students' && <TeacherClassStudents classId={classId} />}
          {activeTab === 'attendance' && <MarkAttendance classId={classId} />}
          {activeTab === 'grades' && <GradeEntry classId={classId} />}
        </div>
      </div>
    </div>
  );
};

export default TeacherClassDetail;
