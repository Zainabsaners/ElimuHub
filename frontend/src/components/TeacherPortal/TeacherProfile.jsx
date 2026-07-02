// In TeacherProfile.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../Authentication/AuthContext';
import { useTheme } from "@/hooks/useTheme";
import { FiUser, FiMail, FiPhone, FiBriefcase, FiCalendar } from 'react-icons/fi';

const TeacherProfile = () => {
  const { authenticatedFetch } = useAuth();
  const { theme } = useTheme();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await authenticatedFetch(`${API_BASE}/api/teacher/profile/`);
        if (!res) throw new Error('No response');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setProfile(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [API_BASE, authenticatedFetch]);

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (error) return <div className="p-10 text-center text-red-500">Error: {error}</div>;
  if (!profile) return <div className="p-10 text-center text-gray-500">No profile data</div>;

  return (
    <div className={`p-4 md:p-6 min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">My Profile</h1>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center text-3xl font-bold text-indigo-600">
              {profile.first_name?.[0]}{profile.last_name?.[0]}
            </div>
            <div>
              <h2 className="text-xl font-semibold">{profile.first_name} {profile.last_name}</h2>
              <p className="text-gray-500">{profile.email}</p>
              {profile.designation && <p className="text-sm text-gray-400">{profile.designation}</p>}
            </div>
          </div>
          <div className="border-t pt-4 space-y-2">
            <div className="flex items-center gap-2"><FiMail /> {profile.email}</div>
            <div className="flex items-center gap-2"><FiPhone /> {profile.phone || 'Not set'}</div>
            <div className="flex items-center gap-2"><FiUser /> Staff ID: {profile.staff_id || 'N/A'}</div>
            <div className="flex items-center gap-2"><FiBriefcase /> {profile.department || 'N/A'}</div>
            <div className="flex items-center gap-2"><FiCalendar /> Joined: {new Date(profile.date_joined).toLocaleDateString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherProfile;