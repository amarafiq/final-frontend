import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from "axios";

const DocumentEdit = () => {
  const { id } = useParams();
  const { user, hasPermission } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    access_level: 'public',
    department_id: null,
    uploaded_by: null,
  });

  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notAllowed, setNotAllowed] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const config = {
          headers: { Authorization: `Bearer ${token}` }
        };

        const [documentRes, categoryRes, departmentRes] = await Promise.all([
          axios.get(`http://localhost:8000/api/v1/documents/${id}`, config),
          axios.get("http://localhost:8000/api/v1/categories", config),
          axios.get("http://localhost:8000/api/v1/departments", config)
        ]);

        const documentData = documentRes.data.data || documentRes.data;
        
        const isOwner = documentData.uploaded_by === user.id || documentData.uploader_id === user.id;
        const canUpdateAny = hasPermission("documents-update");
        
        if (!canUpdateAny && !isOwner) {
          setNotAllowed(true);
          return;
        }

        setFormData({
          title: documentData.title || '',
          description: documentData.description || '',
          category_id: documentData.category_id?.id ||documentData.category_id?._id || documentData.category_id || '', 
          access_level: documentData.access_level || 'public'
        });

        setCategories(categoryRes.data.data || []);
        setDepartments(departmentRes.data.data || []);
        setLoading(false);
      } catch (err) {
        console.error("Fetch Error:", err);
        setError('Failed to load document');
        setLoading(false);
      }
    };

    fetchData();
  }, [id, user, hasPermission]);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');

  if (!formData.title.trim()) {
    setError('Title is required');
    return;
  }
  if (!formData.category_id) {
    setError('Category is required');
    return;
  }

  setSaving(true);
  try {
    const token = localStorage.getItem("token");
    const config = {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json' 
      }
    };

    await axios.put(
      `http://localhost:8000/api/v1/documents/${id}`, 
      {
        title: formData.title,
        description: formData.description,
        category_id: formData.category_id,
        department_id: formData.department_id,
        access_level: formData.access_level,
      }, 
      config 
    );
    navigate(`/documents/${id}`, { replace: true });
    
  } catch (err) {
    console.error("Update error:", err);
    const msg = err.response?.data?.message || 'Failed to update document';
    setError(msg);
  } finally {
    setSaving(false);
  }
};
  
  const getCategoryName = (categoryId) => {
  return categories.find(cat => 
    cat.id === categoryId || cat.id === Number(categoryId) || cat._id === categoryId
  )?.title || '—';
};

  const getDepartmentName = (departmentId) => {
    return departments.find(dept => dept.id === departmentId)?.name || '—';
  };

  if (notAllowed) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <p className="text-red-700">You do not have permission to edit this document.</p>
          <button
            onClick={() => navigate('/documents')}
            className="mt-3 text-indigo-600 hover:text-indigo-800"
          >
            ← Back to Documents
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-6 flex items-center justify-center h-64">
        <div className="text-gray-500">Loading document...</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Edit Document</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <input
            type="text"
            name="title"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
            value={formData.title}
            onChange={handleInputChange}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
            value={formData.description}
            onChange={handleInputChange}
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category *
          </label>
          <select
            name="category_id"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
            value={String(formData.category_id || '')}
            onChange={handleInputChange}
          >
            <option value="">Select a category</option>
            {categories.map(category => (
              <option key={category.id} value={String(category.id)}>{category.title}</option>
            ))}
          </select>
        </div>

        {/* Department (Read-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Department (Read-only)
          </label>
          <input
            type="text"
            readOnly
            value={getDepartmentName(formData.department_id)}
            className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md cursor-not-allowed"
          />
          <p className="mt-1 text-sm text-gray-500">Department cannot be changed after upload.</p>
        </div>

        {/* Access Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Access Level *
          </label>
          <div className="space-y-2">
            {[
              { value: 'public', label: 'Public – Visible to all employees' },
              { value: 'department', label: 'Department – Visible only to department members' },
              { value: 'private', label: 'Private – Visible only to admin and uploader' }
            ].map(option => (
              <label key={option.value} className="flex items-start">
                <input
                  type="radio"
                  name="access_level"
                  value={option.value}
                  checked={formData.access_level === option.value}
                  onChange={handleInputChange}
                  className="mt-1"
                />
                <span className="ml-2 text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={saving}
            className={`px-4 py-2 rounded-md text-white font-medium ${
              saving ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {saving ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/documents/${id}`)}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default DocumentEdit;