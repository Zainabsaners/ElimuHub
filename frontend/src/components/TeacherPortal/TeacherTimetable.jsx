// In TeacherTimetable.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../Authentication/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const TeacherTimetable = () => {
  const { authenticatedFetch } = useAuth();
  const { theme } = useTheme();
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await authenticatedFetch(`${API_BASE}/api/teacher/timetable/`);
        if (!res) throw new Error('No response');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setTimetable(data.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [API_BASE, authenticatedFetch]);

  if (loading) return <div className="p-10 text-center">Loading timetable...</div>;
  if (error) return <div className="p-10 text-center text-red-500">Error: {error}</div>;

  // Display timetable in a grid similar to student timetable
  // Use the same grid rendering as Student/Timetable but with teacher data
  // You can reuse the grid rendering code from Student Timetable component
  // For simplicity, we'll show a placeholder message if no data.
  if (!timetable.length || timetable.every(day => day.entries.length === 0)) {
    return (
      <div className={`p-4 md:p-6 min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <h1 className="text-2xl font-bold mb-6">My Timetable</h1>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">No timetable entries found for your classes.</p>
          <p className="text-sm text-gray-400 mt-2">Timetable will appear once it's configured by the admin.</p>
        </div>
      </div>
    );
  }

  // If data exists, render the grid
  // We can reuse the student timetable grid rendering code.
  // For brevity, I'll provide a simplified version, but you can copy the student timetable component's JSX and adjust the data source.
  return (
    <div className={`p-4 md:p-6 min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <h1 className="text-2xl font-bold mb-6">My Timetable</h1>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
        {/* Quick grid rendering */}
        <div className="grid grid-cols-7 gap-1">
          {timetable.map((day) => (
            <div key={day.day} className="border p-2">
              <div className="text-center font-bold text-sm">{day.day}</div>
              {day.entries.length > 0 ? (
                day.entries.map(entry => (
                  <div key={entry.id} className="text-xs mt-1 p-1 bg-gray-100 dark:bg-gray-700 rounded">
                    <div>P{entry.period}: {entry.subject}</div>
                    <div className="text-gray-500">{entry.room}</div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-gray-300 text-center py-2">—</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeacherTimetable;