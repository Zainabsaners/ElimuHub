import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../Authentication/AuthContext';
//import { useTheme } from "@/hooks/useTheme";
import { FiBell, FiRefreshCw, FiCheckCircle, FiClock, FiAlertCircle, FiInfo } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Notifications = () => {
  const { authenticatedFetch } = useAuth();
  //const { theme } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

  const fetchNotifications = useCallback(async (showToast = false) => {
    try {
      setError(null);
      if (!showToast) setLoading(true);
      const response = await authenticatedFetch(`${API_BASE}/api/students/notifications/`);
      if (!response) throw new Error('No response');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result = await response.json();
      setNotifications(result.data || []);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [authenticatedFetch, API_BASE]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchNotifications(true);
  };

  const markAsRead = async (id) => {
    try {
      const response = await authenticatedFetch(`${API_BASE}/students/notifications/${id}/read/`, {
        method: 'POST',
      });
      if (response && response.ok) {
        setNotifications(notifications.map(n => n.id === id ? { ...n, status: 'Read', read_at: new Date().toISOString() } : n));
        toast.success('Marked as read');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getPriorityColor = (priority) => {
    if (priority === 'Urgent') return 'text-red-500 border-red-500';
    if (priority === 'High') return 'text-orange-500 border-orange-500';
    return 'text-blue-500 border-blue-500';
  };

  if (loading) return <div className="p-10 text-center">Loading notifications...</div>;
  if (error) return <div className="p-10 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="p-4 md:p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <FiBell /> Notifications
        </h1>
        <button onClick={handleRefresh} disabled={refreshing} className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 disabled:opacity-50">
          <FiRefreshCw className={refreshing ? 'animate-spin' : ''} />
        </button>
      </div>
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 p-8">No notifications</div>
        ) : (
          notifications.map((notif) => (
            <div key={notif.id} className={`flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border-l-4 ${getPriorityColor(notif.priority)} ${notif.status === 'Read' ? 'opacity-70' : ''}`}>
              <div className="mt-1">
                {notif.priority === 'Urgent' ? <FiAlertCircle className="text-red-500" /> : <FiInfo className="text-blue-500" />}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <p className="text-sm font-medium text-gray-800 dark:text-white">{notif.title}</p>
                  <span className="text-xs text-gray-400">{new Date(notif.sent_at).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{notif.message}</p>
                <div className="flex items-center gap-3 mt-2">
                  {notif.status === 'Unread' && (
                    <button onClick={() => markAsRead(notif.id)} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
                      <FiCheckCircle /> Mark as read
                    </button>
                  )}
                  {notif.status === 'Read' && (
                    <span className="text-xs text-gray-400 flex items-center gap-1"><FiCheckCircle className="text-green-500" /> Read</span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;