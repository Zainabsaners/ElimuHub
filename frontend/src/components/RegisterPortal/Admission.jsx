/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

function Admission() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    admission_no: '', first_name: '', middle_name: '', last_name: '',
    date_of_birth: '', gender: '', nationality: 'Kenyan', religion: '',
    blood_group: '', address: '', city: '', country: 'Kenya',
    phone: '', email: '', current_class: '', 
    admission_date: new Date().toISOString().split('T')[0],
    admission_type: 'Regular', father_name: '', father_phone: '',
    mother_name: '', mother_phone: '', guardian_name: '',
    guardian_relation: '', guardian_phone: '', emergency_contact: '',
    emergency_contact_name: '', status: 'Active'
  });

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  };

  const fetchAdmissionNumber = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/students/generate-admission-number/`, {
        headers: getAuthHeaders()
      });
      return response.data.success ? response.data.admission_no : '';
    } catch (err) {
      console.error('Admission Number Fetch Error:', err);
      return '';
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resClasses, resStudents, nextAdm] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/classes/`, { headers: getAuthHeaders() }),
        axios.get(`${API_BASE_URL}/api/students/`, { headers: getAuthHeaders() }),
        fetchAdmissionNumber()
      ]);
      setClasses(resClasses.data.data || []);
      setStudents(resStudents.data.data || []);
      setFormData(prev => ({ ...prev, admission_no: nextAdm }));
    } catch (err) {
      console.error("Data sync error:", err);
      setError("Failed to load data. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = async () => {
    const nextAdm = await fetchAdmissionNumber();
    setFormData({
      admission_no: nextAdm, first_name: '', middle_name: '', last_name: '',
      date_of_birth: '', gender: '', nationality: 'Kenyan', religion: '',
      blood_group: '', address: '', city: '', country: 'Kenya',
      phone: '', email: '', current_class: '', 
      admission_date: new Date().toISOString().split('T')[0],
      admission_type: 'Regular', father_name: '', father_phone: '',
      mother_name: '', mother_phone: '', guardian_name: '',
      guardian_relation: '', guardian_phone: '', emergency_contact: '',
      emergency_contact_name: '', status: 'Active'
    });
  };

  // Validate phone number (Kenyan format)
  const validatePhone = (phone) => {
    if (!phone) return true; // Phone is optional
    // Kenyan phone numbers: 0712345678, 0722345678, 0732345678, 0742345678, 0752345678, 0762345678, 0772345678, 0782345678, 0792345678
    // Also with country code: 254712345678
    const phoneRegex = /^(?:(?:254|0)?[17][0-9]{8})$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const validateForm = () => {
    const errors = {};

    // Required fields
    if (!formData.first_name) errors.first_name = 'First name is required';
    if (!formData.last_name) errors.last_name = 'Last name is required';
    if (!formData.gender) errors.gender = 'Gender is required';
    if (!formData.date_of_birth) errors.date_of_birth = 'Date of birth is required';
    if (!formData.city) errors.city = 'City is required';

    // Phone validation
    if (formData.phone && !validatePhone(formData.phone)) {
      errors.phone = 'Please enter a valid phone number (e.g., 0712345678)';
    }

    if (Object.keys(errors).length > 0) {
      const errorMessages = Object.values(errors).join('\n');
      setError(errorMessages);
      setTimeout(() => setError(''), 5000);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setError('');

    // Format data for backend
    const dataToSubmit = {
      ...formData,
      // Capitalize gender for backend
      gender: formData.gender ? formData.gender.charAt(0).toUpperCase() + formData.gender.slice(1) : '',
      // Remove admission_no as backend will generate it
      admission_no: undefined
    };

    try {
      const response = await axios.post(`${API_BASE_URL}/api/students/`, dataToSubmit, { 
        headers: getAuthHeaders() 
      });

      if (response.data.success) {
        setSuccessMessage(`Successfully registered: ${formData.first_name} ${formData.last_name} (Admission No: ${response.data.data?.admission_no || formData.admission_no})`);
        
        const nextAdm = await fetchAdmissionNumber();
        setFormData(prev => ({
          ...prev,
          admission_no: nextAdm,
          first_name: '', middle_name: '', last_name: '',
          date_of_birth: '', gender: '',
          phone: '', email: '', address: '', city: '',
          current_class: '', stream: '',
          father_name: '', father_phone: '',
          mother_name: '', mother_phone: '',
          guardian_name: '', guardian_relation: '', guardian_phone: '',
          emergency_contact: '', emergency_contact_name: ''
        }));
        
        await fetchData();
        setTimeout(() => setSuccessMessage(''), 10000);
      } else {
        // Handle validation errors from backend
        let errorMsg = response.data.error || "Registration failed. Please try again.";
        if (response.data.details) {
          const details = response.data.details;
          const detailMessages = Object.entries(details).map(([field, messages]) => {
            if (Array.isArray(messages)) {
              return `${field}: ${messages.join(', ')}`;
            }
            return `${field}: ${messages}`;
          });
          errorMsg = `Validation failed:\n${detailMessages.join('\n')}`;
        }
        setError(errorMsg);
        setTimeout(() => setError(''), 5000);
      }
    } catch (err) {
      console.error("Registration error:", err);
      
      // Handle validation errors from backend
      if (err.response?.data?.details) {
        const details = err.response.data.details;
        const detailMessages = Object.entries(details).map(([field, messages]) => {
          if (Array.isArray(messages)) {
            return `${field}: ${messages.join(', ')}`;
          }
          return `${field}: ${messages}`;
        });
        setError(`Validation failed:\n${detailMessages.join('\n')}`);
      } else {
        setError(err.response?.data?.error || "Registration failed. Please check your connection and try again.");
      }
      setTimeout(() => setError(''), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <span className="bg-blue-600 text-white p-2 rounded-xl">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </span>
                Student Admission
              </h1>
              {successMessage && (
                <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg shadow-sm flex items-center gap-3 animate-fade-in">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-green-800 font-medium">{successMessage}</p>
                </div>
              )}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg shadow-sm flex items-center gap-3">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-800 font-medium">{error}</p>
                </div>
              )}
              <p className="text-gray-500 mt-1 ml-2">Register new students </p>
            </div>
            <button
              onClick={fetchData}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
            >
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Students</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">
                  {loading ? '...' : students.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Available Classes</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">
                  {loading ? '...' : classes.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Next Admission</p>
                <p className="text-2xl font-bold text-blue-600 mt-1 truncate" title={formData.admission_no}>
                  {formData.admission_no || '...'}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Today's Date</p>
                <p className="text-xl font-semibold text-gray-800 mt-1">
                  {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-700 whitespace-pre-line">{error}</span>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-green-700 whitespace-pre-line">{successMessage}</span>
            </div>
          </div>
        )}

        {/* Main Form */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Student Registration Form</h2>
              <span className="bg-white/20 text-white text-sm px-3 py-1 rounded-full">
                {loading ? 'Loading...' : 'Ready'}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Admission Number - Read Only */}
              <div className="lg:col-span-1">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Admission Number <span className="text-xs font-normal text-gray-400">(auto-generated)</span>
                </label>
                <div className="relative">
                  <input 
                    name="admission_no" 
                    value={formData.admission_no} 
                    readOnly 
                    className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-lg font-mono text-sm text-gray-700"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* First Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input 
                  name="first_name" 
                  value={formData.first_name} 
                  onChange={handleInputChange} 
                  required 
                  placeholder="Enter first name"
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                />
              </div>

              {/* Middle Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Middle Name
                </label>
                <input 
                  name="middle_name" 
                  value={formData.middle_name} 
                  onChange={handleInputChange} 
                  placeholder="Enter middle name"
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input 
                  name="last_name" 
                  value={formData.last_name} 
                  onChange={handleInputChange} 
                  required 
                  placeholder="Enter last name"
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                />
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <input 
                  type="date" 
                  name="date_of_birth" 
                  value={formData.date_of_birth} 
                  onChange={handleInputChange} 
                  required 
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select 
                  name="gender" 
                  value={formData.gender} 
                  onChange={handleInputChange} 
                  required 
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none bg-white"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
                
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Phone Number
                </label>
                <input 
                  type="tel" 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleInputChange} 
                  placeholder="0712345678"
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                />
                
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Email
                </label>
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleInputChange} 
                  placeholder="student@example.com"
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                />
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  City <span className="text-red-500">*</span>
                </label>
                <input 
                  name="city" 
                  value={formData.city} 
                  onChange={handleInputChange} 
                  required
                  placeholder="Enter city"
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                />
              </div>

              {/* Class Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Class
                </label>
                <select 
                  name="current_class" 
                  value={formData.current_class} 
                  onChange={handleInputChange} 
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none bg-white"
                >
                  <option value="">Select Class</option>
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.id}>
                      {cls.class_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Section */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Stream
                </label>
                <input 
                  name="stream" 
                  value={formData.stream} 
                  onChange={handleInputChange} 
                  placeholder="winners"
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                />
              </div>

              {/* Address - Full Width */}
              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Address
                </label>
                <textarea 
                  name="address" 
                  value={formData.address} 
                  onChange={handleInputChange} 
                  rows="2" 
                  placeholder="Enter full address"
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none resize-y"
                />
              </div>

              {/* Guardian Section - Full Width */}
              <div className="md:col-span-2 lg:col-span-3">
                <div className="border-t-2 border-gray-100 pt-5 mt-2">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Guardian Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Guardian Name
                      </label>
                      <input 
                        name="guardian_name" 
                        value={formData.guardian_name} 
                        onChange={handleInputChange} 
                        placeholder="Full name"
                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Guardian Phone
                      </label>
                      <input 
                        type="tel" 
                        name="guardian_phone" 
                        value={formData.guardian_phone} 
                        onChange={handleInputChange} 
                        placeholder="0712345678"
                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Relationship
                      </label>
                      <select 
                        name="guardian_relation" 
                        value={formData.guardian_relation} 
                        onChange={handleInputChange} 
                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none bg-white"
                      >
                        <option value="">Select Relationship</option>
                        <option value="Father">Father</option>
                        <option value="Mother">Mother</option>
                        <option value="Guardian">Guardian</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Emergency Contact - Full Width */}
              <div className="md:col-span-2 lg:col-span-3">
                <div className="border-t-2 border-gray-100 pt-5">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Emergency Contact
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Emergency Contact Name
                      </label>
                      <input 
                        name="emergency_contact_name" 
                        value={formData.emergency_contact_name} 
                        onChange={handleInputChange} 
                        placeholder="Full name"
                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Emergency Contact Phone
                      </label>
                      <input 
                        type="tel" 
                        name="emergency_contact" 
                        value={formData.emergency_contact} 
                        onChange={handleInputChange} 
                        placeholder="0712345678"
                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Buttons */}
            <div className="flex flex-wrap gap-3 mt-8 pt-6 border-t-2 border-gray-100">
              <button 
                type="submit" 
                disabled={isSubmitting} 
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Registering...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    Register Student
                  </>
                )}
              </button>
              
              <button 
                type="button" 
                onClick={resetForm} 
                className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset Form
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-400">
          <p>All fields with <span className="text-red-500">*</span> are required</p>
        </div>
      </div>
    </div>
  );
}

export default Admission;