// frontend/src/api.js
import axios from 'axios';

// Use the environment variable or fallback to production URL
const API_BASE_URL = import.meta.env.VITE_API_URL || "https://elimuhub-1sfs.onrender.com";

// Create axios instance with base URL
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    timeout: 120000, // 30 seconds timeout
});

// Request interceptor - adds token to all requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            // Ensure token has Bearer prefix
            const tokenValue = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
            config.headers.Authorization = tokenValue;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - handles token expiration
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle 401 Unauthorized
        if (error.response?.status === 401) {
            // Clear all auth data
            localStorage.removeItem('token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
            localStorage.removeItem('session_id');
            
            // Redirect to login if not already there
            if (!window.location.pathname.includes('/Login')) {
                window.location.href = '/Login';
            }
        }
        
        // Handle 403 Forbidden
        if (error.response?.status === 403) {
            console.error('Permission denied:', error.response?.data?.error || 'You do not have permission for this action');
        }
        
        // Handle 500 Server Error
        if (error.response?.status >= 500) {
            console.error('Server error:', error.response?.data?.error || 'An internal server error occurred');
        }
        
        return Promise.reject(error);
    }
);

// Helper methods for common API calls
export const auth = {
    login: (email, password) => api.post('/api/auth/login/', { email, password }),
    logout: (refreshToken) => api.post('/api/auth/logout/', { refresh_token: refreshToken }),
    refreshToken: (refreshToken) => api.post('/api/auth/refresh-token/', { refresh_token: refreshToken }),
    validateToken: () => api.get('/api/auth/validate-token/'),
    changePassword: (oldPassword, newPassword) => api.post('/api/auth/change-password/', { old_password: oldPassword, new_password: newPassword }),
};

export const students = {
    getAll: (params) => api.get('/api/students/', { params }),
    getById: (id) => api.get(`/api/students/${id}/`),
    create: (data) => api.post('/api/students/', data),
    update: (id, data) => api.put(`/api/students/${id}/`, data),
    delete: (id) => api.delete(`/api/students/${id}/`),
    getStatistics: () => api.get('/api/students/statistics/'),
    generateIdCard: (id) => api.get(`/api/students/${id}/id-card/`, { responseType: 'blob' }),
    bulkStatusUpdate: (studentIds, status) => api.post('/api/students/bulk-status-update/', { student_ids: studentIds, status }),
    import: (formData) => api.post('/api/students/import/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    downloadTemplate: () => api.get('/api/students/download-template/', { responseType: 'blob' }),
    generateAdmissionNumber: () => api.get('/api/students/generate-admission-number/'),
};

export const classes = {
    getAll: () => api.get('/api/classes/'),
    create: (data) => api.post('/api/classes/create/', data),
    update: (id, data) => api.put(`/api/classes/update/${id}/`, data),
    delete: (id) => api.delete(`/api/classes/delete/${id}/`),
    getTeachers: () => api.get('/api/teachers/'),
    getStreams: () => api.get('/api/streams/'),
    
};

export const users = {
    getAll: (params) => api.get('/api/users/', { params }),
    getById: (id) => api.get(`/api/users/${id}/`),
    create: (data) => api.post('/api/users/', data),
    update: (id, data) => api.patch(`/api/users/${id}/`, data),
    delete: (id) => api.delete(`/api/users/${id}/`),
    getProfile: () => api.get('/api/users/profile/'),
    updateProfile: (data) => api.put('/api/users/update-profile/', data),
    deactivate: (id) => api.post(`/api/users/${id}/deactivate/`),
    activate: (id) => api.post(`/api/users/${id}/activate/`),
};

export const academic = {
    getLearningAreas: () => api.get('/api/curriculum/'),
    getTerms: () => api.get('/api/terms/'),
    getAcademicYears: () => api.get('/api/academic-years/'),
    getAssessmentWindows: () => api.get('/api/assessment-windows/'),
};

export const reports = {
    getAll: (params) => api.get('/api/cbe-report-cards/', { params }),
    getById: (id) => api.get(`/api/cbe-report-cards/${id}/`),
    generateBatch: (classId, termId) => api.post('/api/cbe-report-cards/batch_generate/', { class_id: classId, term: termId }),
    download: (id) => api.get(`/api/cbe-report-cards/${id}/download/`, { responseType: 'blob' }),
    publish: (id) => api.post(`/api/cbe-report-cards/${id}/publish/`),
    unpublish: (id) => api.post(`/api/cbe-report-cards/${id}/unpublish/`),
    delete: (id) => api.delete(`/api/cbe-report-cards/${id}/`),
    getBatchDownload: (reportIds) => api.post('/api/cbe-report-cards/batch_download/', { report_ids: reportIds }, { responseType: 'blob' }),
};

export const audit = {
    getAll: (params) => api.get('/api/audit-logs/', { params }),
    getByStudent: (studentId) => api.get('/api/audit-logs/', { params: { student_id: studentId } }),
};

export const fees = {
    getCategories: () => api.get('/api/fees/categories/'),
    getStructures: (params) => api.get('/api/fees/structures/', { params }),
    getTransactions: (params) => api.get('/api/fees/transactions/', { params }),
    getDashboard: () => api.get('/api/fees/dashboard/'),
    generateInvoices: (data) => api.post('/api/fees/generate-invoices/', data),
    getCurrentPeriod: () => api.get('/api/fees/current-period/'),
};

export const teachers = {
    getAll: () => api.get('/api/teachers/'),
};

export const staff = {
    getAll: (params) => api.get('/api/staff/', { params }),
    getById: (id) => api.get(`/api/staff/${id}/`),
    create: (data) => api.post('/api/staff/', data),
    update: (id, data) => api.patch(`/api/staff/${id}/`, data),
    delete: (id) => api.delete(`/api/staff/${id}/`),
    getStats: () => api.get('/api/staff/stats/'),
};

export default api;