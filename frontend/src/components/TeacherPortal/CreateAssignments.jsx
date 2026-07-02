
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiSave, FiArrowLeft } from 'react-icons/fi';
import { useAuth } from '../Authentication/AuthContext';
import toast from 'react-hot-toast';

const CreateAssignment = () => {
  const { authenticatedFetch } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({
    course_id: '',
    title: '',
    description: '',
    due_date: '',
    is_published: true,
  });
  const [loading, setLoading] = useState(false);
  const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

  useEffect(() => {
    // Fetch teacher's courses (we can reuse /teacher/classes/ and extract subjects)
    const fetchCourses = async () => {
      const res = await authenticatedFetch(`${API_BASE}/api/teacher/classes/`);
      if (res && res.ok) {
        const data = await res.json();
        const courseList = [];
        data.data?.forEach(cls => {
          cls.subjects?.forEach(sub => {
            courseList.push({
              id: sub.id,
              name: `${sub.code} - ${sub.name}`,
              class: cls.name
            });
          });
        });
        setCourses(courseList);
      }
    };

    fetchCourses();
  }, [API_BASE, authenticatedFetch]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authenticatedFetch(`${API_BASE}/api/teacher/assignments/create/`, {
        method: 'POST',
        body: JSON.stringify(form)
      });
      if (res && res.ok) {
        toast.success('Assignment created!');
        navigate('/teacher/assignments');
      } else {
        const err = await res.json();
        toast.error(err.error || 'Creation failed');
      }
    } catch  {
      toast.error('Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <Link to="/teacher/assignments" className="text-indigo-600 hover:underline flex items-center gap-1 mb-4"><FiArrowLeft /> Back</Link>
      <h1 className="text-2xl font-bold mb-6">Create New Assignment</h1>
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Course</label>
          <select name="course_id" value={form.course_id} onChange={handleChange} className="w-full p-2 border rounded-lg dark:bg-gray-700" required>
            <option value="">Select a course</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input name="title" value={form.title} onChange={handleChange} className="w-full p-2 border rounded-lg dark:bg-gray-700" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows="4" className="w-full p-2 border rounded-lg dark:bg-gray-700" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Due Date</label>
          <input name="due_date" type="date" value={form.due_date} onChange={handleChange} className="w-full p-2 border rounded-lg dark:bg-gray-700" />
        </div>
        <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2">
          <FiSave /> {loading ? 'Creating...' : 'Create Assignment'}
        </button>
      </form>
    </div>
  );
};

export default CreateAssignment;
