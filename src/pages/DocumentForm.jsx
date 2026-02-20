import axios from "axios";
import { useRef, useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from 'react-router-dom';

function DocumentForm({ onDocumentCreated }) {
  const { user, hasPermission } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState([]);
  const [departmentId, setDepartmentId] = useState("");
  const [departments, setDepartments] = useState([]);
  const [accessLevel, setAccessLevel] = useState("");
  const [file, setFile] = useState(null);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const documentFile = useRef(null);

  
  useEffect(() => {
    const fetchCategories = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get(
          "http://localhost:8000/api/v1/categories",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setCategories(response.data.data || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();

    const fetchDepartments = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get(
          "http://localhost:8000/api/v1/departments",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setDepartments(response.data.data || []);
      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    };
    fetchDepartments();
  }, []);

  if (!hasPermission("documents-create")) {
    return null;
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.size <= 10 * 1024 * 1024) {
      setFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); 
    setSuccess("");
    setLoading(true);
  
    const token = localStorage.getItem("token");
    const documentData = new FormData();
    documentData.append("title", title);
    documentData.append("description", description || null);
    documentData.append("access_level", accessLevel);
    
    if (categoryId) {
      documentData.append("category_id", categoryId);
    }

    if (departmentId) {
      documentData.append("department_id", departmentId);
    }

    if (file) {
      documentData.append("file", file);
    }

    try {
      await axios.post("http://localhost:8000/api/v1/documents", documentData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      setTitle("");
      setDescription("");
      setCategoryId("");
      setDepartmentId("");
      setAccessLevel("");
      setFile(null);
  
      if (documentFile.current) {
        documentFile.current.value = "";
      }

      if (onDocumentCreated) {
        onDocumentCreated();
      }
    
      setSuccess('Document created successfully! Redirecting...');
      setTimeout(() => navigate('/documents'), 2000);
    
    } catch (err) {
      if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        const errorMessages = Object.values(errors).flat().join(", ");
        setError(errorMessages);
      } else {
        setError(err.response?.data?.message || "Failed to create document");
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Upload New Document</h1>
      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-120">
          <div className="bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12">
            
            {error && (
              <div className="rounded-md bg-red-50 p-4 mb-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            {success && (
              <div className="rounded-md bg-green-50 p-4 mb-4">
                <div className="text-sm text-green-700">{success}</div>
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required

          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description (Optional)
          </label>
          <textarea
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
            value={description}
            onChange={(e) => setDescription(e.target.value)}

          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category *
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required

          >
            <option value="">Select a category</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>{category.title}</option>
            ))}
          </select>
        </div>

        {/* Department */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Department *
          </label>
          <select
            disabled={user.roles === 'manager'}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
              user.role === 'manager' ? 'bg-gray-100 cursor-not-allowed' : ''
            }`}
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            required

          >
            <option value="">Select a department</option>
            {departments.map(department => (
              <option key={department.id} value={department.id}>{department.name}</option>
            ))}
          </select>
          {user.roles === 'manager' && (
            <p className="mt-1 text-sm text-gray-500">As a manager, you can only upload to your department.</p>
          )}
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
                  checked={accessLevel === option.value}
                  onChange={(e) => setAccessLevel(e.target.value)}
            required

                  className="mt-1"
                />
                <span className="ml-2 text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

      
        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            File (PDF, DOCX, XLSX, JPG, PNG • Max 10MB) *
          </label>
          <input
            type="file"
            name="file"
            accept=".pdf,.docx,.xlsx,.jpg,.jpeg,.png"
            required
            onChange={handleFileUpload}
            className="w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-indigo-50 file:text-indigo-700
              hover:file:bg-indigo-100"
          />
          {file && (
            <p className="mt-1 text-sm text-gray-600">
              Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 rounded-md text-white font-medium ${
              loading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading...
              </span>
            ) : 'Upload Document'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/documents')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
     </div>
    </div>
    </div>
  );
};

export default DocumentForm;