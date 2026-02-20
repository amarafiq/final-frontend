import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const DocumentDetail = () => {
  const { id } = useParams();
  const { user, hasPermission, hasRole } = useAuth();
  const navigate = useNavigate();

  const [document, setDocument] = useState(null);
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');


  useEffect(() => {
  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      console.log("Fetching ID:", id);
      
      const [documentRes, categoryRes, departmentRes] = await Promise.all([
        axios.get(`http://localhost:8000/api/v1/documents/${id}`, config),
        axios.get("http://localhost:8000/api/v1/categories", config),
        axios.get("http://localhost:8000/api/v1/departments", config)
      ]);

      const documentData = documentRes.data.data || documentRes.data;
      const categoriesData = categoryRes.data.data || categoryRes.data || [];
      const departmentsData = departmentRes.data.data || departmentRes.data || [];

      setDocument(documentData);
      setCategories(categoriesData);
      setDepartments(departmentsData);
      setLoading(false);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.response?.status === 403 
        ? 'You do not have permission to view this document.' 
        : 'Failed to load document details.');
      setLoading(false);
    }
  };

  fetchData();
}, [id]);

useEffect(() => {
  if (user) {
    console.log("User Roles:", user.roles);
  }
}, [user]);

  const getAccessLevelLabel = (level) => {
    switch (level) {
      case 'public': return 'Public';
      case 'department': return 'Department';
      case 'private': return 'Private';
      default: return '—';
    }
  };

  const getFileIcon = (type) => {
    if (!type) return '📄';
    const lower = type.toLowerCase();
    if (lower.includes('pdf')) return '📕';
    if (lower.includes('word') || lower.includes('docx')) return '📘';
    if (lower.includes('sheet') || lower.includes('xlsx')) return '📊';
    if (lower.includes('image')) return '🖼️';
    return '📄';
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownload = async () => {
  try {
    const token = localStorage.getItem("token");
 
    const response = await axios.get(`http://localhost:8000/api/v1/documents/${id}/download`, {
      headers: { 
        Authorization: `Bearer ${token}` 
      },
      responseType: 'blob', 
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = window.document.createElement('a'); 
    link.href = url;

    link.setAttribute('download', document.file_name || `document-${id}`); 
    
    window.document.body.appendChild(link); 
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Download error:", err);
    alert('Download failed. Please try again.');
  }
};
 
  const canEditDocument = () => {
  if (hasPermission("documents-update") && hasRole("admin")) {
    return true;
  }
  if (hasPermission("documents-update") && hasRole("manager")) {
    return user?.id && document?.uploader?.id && 
           String(user.id) === String(document.uploader.id);
  }
  
  return false;
};

  const handleEdit = () => {
    
    navigate(`/documents/${id}/edit`);
  };

  const canDeleteDocument = () => {
  if (hasPermission("documents-delete")) return true;
  if (user?.id && document?.uploader?.id) {
    return String(user.id) === String(document.uploader.id);
  }
  
  return false;
};

  const handleDelete = async () => {
  if (!window.confirm('Are you sure you want to delete this document? This action cannot be undone.')) return;

  try {
    const token = localStorage.getItem("token"); 
    await axios.delete(`http://localhost:8000/api/v1/documents/${id}`, {
      headers: { Authorization: `Bearer ${token}` } 
    });
    navigate('/documents', { replace: true });
  } catch (err) {
    alert('Failed to delete document. You may not have permission.');
  }
};

  if (loading || !document) {
    return (
      <div className="max-w-4xl mx-auto p-6 flex items-center justify-center h-64">
        <div className="text-gray-500">Loading document details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <p className="text-red-700">{error}</p>
          <button
            onClick={() => navigate('/documents')}
            className="mt-3 text-indigo-600 hover:text-indigo-800 font-medium"
          >
            ← Back to Documents
          </button>
        </div>
      </div>
    );
  }
  if (!document) return null;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      {/* Header */}
       {(hasPermission("documents-download") || canEditDocument() || canDeleteDocument()) && (
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 wrap-break-words">{document?.title}</h1>
          <p className="text-gray-600 mt-1">{document?.description || 'No description provided.'}</p>
        </div>
        <div className="flex gap-2">
         {hasPermission("documents-download") && (
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
          >
            📥 Download
          </button>
          )}
         {canEditDocument() && (
          <button onClick={handleEdit} 
           className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Edit
          </button>
          )}
         {canDeleteDocument() && (
          <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
            Delete
          </button>
          )}
        </div>
      </div>
      )}

      {/* Metadata Grid */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Document Information</h3>
        </div>
        <div className="border-t border-gray-200">
          <dl className="divide-y divide-gray-200">
            <div className="py-4 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">File</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 flex items-center gap-2">
                <span className="text-xl">{getFileIcon(document.file_type)}</span>
                <span>{document.file_name}</span>
              </dd>
            </div>
            <div className="py-4 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Category</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {document.category?.title || document.category_id?.title || 
                categories.find(c => String(c.id) === String(document.category_id))?.title || 
                '—'}
              </dd>
            </div>
            <div className="py-4 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Department</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {document.department?.name || document.department_id?.name || 
                departments.find(d => String(d.id) === String(document.department_id))?.name || 
                '—'}
              </dd>
            </div>
            <div className="py-4 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Access Level</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  document.access_level === 'public' ? 'bg-green-100 text-green-800' :
                  document.access_level === 'department' ? 'bg-blue-100 text-blue-800' :
                  'bg-purple-100 text-red-800'
                }`}>
                  {getAccessLevelLabel(document.access_level)}
                </span>
              </dd>
            </div>
            <div className="py-4 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Uploaded By</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {document.uploader?.name || '—'}
              </dd>
            </div>
            <div className="py-4 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Upload Date</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {new Date(document.created_at).toLocaleString()}
              </dd>
            </div>
            <div className="py-4 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">File Size</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {formatBytes(document.file_size)}
              </dd>
            </div>
            <div className="py-4 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Downloads</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {document.download_count || 0}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Back Button */}
      <div className="mt-6">
        <button
          onClick={() => navigate('/documents')}
          className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
        >
          ← Back to Documents
        </button>
      </div>
    </div>
  );
};

export default DocumentDetail;