import React, { useState, useEffect } from 'react';
import { useAuth } from '../Authentication/AuthContext';
import toast from 'react-hot-toast';

const GradeEntry = ({ classId }) => {
  const { authenticatedFetch } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

  useEffect(() => {
    const fetchData = async () => {
      const res = await authenticatedFetch(`${API_BASE}/api/teacher/grades/${classId}/`);
      if (res && res.ok) {
        const data = await res.json();
        setStudents(data.data || []);
      }
      setLoading(false);
    };
    fetchData();
  }, [classId, authenticatedFetch, API_BASE]);

  const handleGradeChange = (studentId, value) => {
    setStudents(prev => prev.map(s => s.student_id === studentId ? { ...s, grade: value } : s));
  };

  const saveGrades = async () => {
    setSaving(true);
    try {
      for (const s of students) {
        if (s.grade && s.grade !== s.rating) {
          await authenticatedFetch(`${API_BASE}/api/teacher/grades/enter/`, {
            method: 'POST',
            body: JSON.stringify({
              student_id: s.student_id,
              rating: s.grade,
              term_id: null
            })
          });
        }
      }
      toast.success('Grades saved!');
    } catch {
      toast.error('Error saving grades');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Enter Grades</h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700/30">
            <tr><th>Admission</th><th>Name</th><th>Grade</th><th>Current</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {students.map(s => (
              <tr key={s.student_id}>
                <td className="px-4 py-2 text-sm">{s.admission_no}</td>
                <td className="px-4 py-2 text-sm font-medium">{s.name}</td>
                <td className="px-4 py-2">
                  <select value={s.grade || s.rating || 'N/A'} onChange={e => handleGradeChange(s.student_id, e.target.value)} className="p-1 border rounded">
                    <option value="N/A">N/A</option>
                    <option value="BE">BE</option>
                    <option value="AE">AE</option>
                    <option value="ME">ME</option>
                    <option value="EE">EE</option>
                  </select>
                </td>
                <td className="px-4 py-2 text-sm">{s.rating || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button onClick={saveGrades} disabled={saving} className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
        {saving ? 'Saving...' : 'Save Grades'}
      </button>
    </div>
  );
};

export default GradeEntry;
