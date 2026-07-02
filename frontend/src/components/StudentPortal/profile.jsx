
import React, { useState, useEffect, useCallback } from 'react';
import { 
  FiUser, FiRefreshCw, FiMail, FiPhone, FiMapPin, 
  FiCalendar, FiBookOpen, FiAward, FiDollarSign,
  FiEdit2, FiSave, FiX, FiUsers, FiClock, FiFileText,
  FiHome, FiBriefcase, FiHeart, FiAlertCircle
} from 'react-icons/fi';
import { FaGraduationCap, FaUserGraduate } from 'react-icons/fa';
import { useAuth } from '../Authentication/AuthContext';
import { useTheme } from "@/hooks/useTheme";
import toast from 'react-hot-toast';

const Profile = () => {
  const { authenticatedFetch } = useAuth();
  const { theme } = useTheme();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});

  const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

  const fetchProfile = useCallback(async (showToast = false) => {
    try {
      setError(null);
      if (!showToast) setLoading(true);
      
      const url = `${API_BASE}/api/students/profile/`;
      console.log('Fetching profile from:', url);
      
      const response = await authenticatedFetch(url);
      
      if (!response) {
        throw new Error('No response from server');
      }
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('Profile data:', result);
      
      setProfile(result.data);
      setFormData(result.data);
      
      if (showToast) {
        toast.success('Profile updated!');
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
      setError(error.message || 'Failed to load profile');
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [authenticatedFetch, API_BASE]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleRefresh = useCallback(async () => {
    if (refreshing) return;
    setRefreshing(true);
    await fetchProfile(true);
  }, [fetchProfile, refreshing]);

  const handleEdit = () => {
    setEditing(true);
    setFormData(profile);
  };

  const handleCancel = () => {
    setEditing(false);
    setFormData(profile);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      const url = `${API_BASE}/students/profile/update/`;
      const response = await authenticatedFetch(url, {
        method: 'PUT',
        body: JSON.stringify(formData),
      });
      
      if (!response) {
        throw new Error('No response from server');
      }
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      setProfile(result.data);
      setEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile');
    }
  };

  const ProfileField = ({ label, value, icon, editable }) => (
    <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition">
      <div className="text-gray-400 dark:text-gray-500 mt-0.5">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
        {editable ? (
          <input
            type="text"
            name={label.toLowerCase().replace(/\s+/g, '_')}
            value={formData?.[label.toLowerCase().replace(/\s+/g, '_')] || ''}
            onChange={handleChange}
            className="w-full bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-indigo-500 dark:focus:border-indigo-400 outline-none text-gray-800 dark:text-white text-sm py-1"
          />
        ) : (
          <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
            {value || 'Not provided'}
          </p>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className={`p-4 md:p-6 min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4"></div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-20 mb-1"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-32"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 md:p-6 min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-8 text-center">
            <FiUser className="text-red-500 text-5xl mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-red-700 dark:text-red-300 mb-2">Unable to Load Profile</h3>
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
            >
              <FiRefreshCw className={refreshing ? 'animate-spin' : ''} />
              {refreshing ? 'Retrying...' : 'Try Again'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className={`p-4 md:p-6 min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-4xl mx-auto text-center">
          <FiUser className="text-5xl mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">No Profile Data</h3>
          <p className="text-gray-500 dark:text-gray-400">Unable to find profile information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 md:p-6 min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <FaUserGraduate className="text-indigo-500" />
              My Profile
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              View and manage your personal information
            </p>
          </div>
          <div className="mt-3 md:mt-0 flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg shadow-md hover:shadow-lg transition text-sm border border-gray-200 dark:border-gray-700 disabled:opacity-50"
            >
              <FiRefreshCw className={refreshing ? 'animate-spin' : ''} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            {!editing ? (
              <button
                onClick={handleEdit}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition text-sm"
              >
                <FiEdit2 /> Edit Profile
              </button>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition text-sm"
                >
                  <FiSave /> Save
                </button>
                <button
                  onClick={handleCancel}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg shadow-md hover:bg-gray-700 transition text-sm"
                >
                  <FiX /> Cancel
                </button>
              </>
            )}
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          {/* Header with Avatar */}
          <div className="bg-linear-to-r from-indigo-600 to-purple-600 px-6 py-8">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-white text-3xl font-bold border-2 border-white/50">
                {profile.first_name?.charAt(0)}{profile.last_name?.charAt(0)}
              </div>
              <div className="text-white">
                <h2 className="text-2xl font-bold">{profile.full_name}</h2>
                <p className="text-indigo-100">{profile.admission_no}</p>
                <p className="text-indigo-200 text-sm mt-1">
                  {profile.current_class?.name || 'No Class Assigned'} • {profile.status}
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{profile.enrollment_count || 0}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Active Courses</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{profile.roll_number || 'N/A'}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Roll Number</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-800 dark:text-white">KSh {profile.current_balance?.toLocaleString() || '0'}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Balance</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{profile.admission_type || 'Regular'}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Admission Type</p>
            </div>
          </div>

          {/* Profile Details */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Personal Information */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-3">
                  <FiUser /> Personal Information
                </h3>
                <ProfileField label="First Name" value={profile.first_name} icon={<FiUser />} editable={editing} />
                <ProfileField label="Last Name" value={profile.last_name} icon={<FiUser />} editable={editing} />
                <ProfileField label="Date of Birth" value={profile.date_of_birth} icon={<FiCalendar />} editable={false} />
                <ProfileField label="Gender" value={profile.gender} icon={<FiUser />} editable={false} />
                <ProfileField label="Nationality" value={profile.nationality} icon={<FiMapPin />} editable={false} />
                <ProfileField label="Religion" value={profile.religion} icon={<FiHeart />} editable={false} />
                <ProfileField label="Blood Group" value={profile.blood_group} icon={<FiAlertCircle />} editable={false} />
              </div>

              {/* Contact Information */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-3">
                  <FiMail /> Contact Information
                </h3>
                <ProfileField label="Email" value={profile.email} icon={<FiMail />} editable={editing} />
                <ProfileField label="Phone" value={profile.phone} icon={<FiPhone />} editable={editing} />
                <ProfileField label="Address" value={profile.address} icon={<FiHome />} editable={editing} />
                <ProfileField label="City" value={profile.city} icon={<FiMapPin />} editable={editing} />
                <ProfileField label="Country" value={profile.country} icon={<FiMapPin />} editable={editing} />
              </div>
            </div>

            {/* Guardian Information */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-3">
                <FiUsers /> Guardian Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ProfileField label="Guardian Name" value={profile.guardian?.name} icon={<FiUser />} editable={false} />
                <ProfileField label="Relation" value={profile.guardian?.relation} icon={<FiUsers />} editable={false} />
                <ProfileField label="Guardian Phone" value={profile.guardian?.phone} icon={<FiPhone />} editable={false} />
                <ProfileField label="Guardian Email" value={profile.guardian?.email} icon={<FiMail />} editable={false} />
              </div>
            </div>

            {/* Medical Information */}
            {(profile.medical?.conditions || profile.medical?.allergies || profile.medical?.medication) && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-3">
                  <FiHeart /> Medical Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.medical?.conditions && (
                    <ProfileField label="Medical Conditions" value={profile.medical.conditions} icon={<FiAlertCircle />} editable={false} />
                  )}
                  {profile.medical?.allergies && (
                    <ProfileField label="Allergies" value={profile.medical.allergies} icon={<FiAlertCircle />} editable={false} />
                  )}
                  {profile.medical?.medication && (
                    <ProfileField label="Medication" value={profile.medical.medication} icon={<FiAlertCircle />} editable={false} />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
