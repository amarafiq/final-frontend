import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ 
    total: 0, 
    department: 0, 
    downloads: 0 
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Retrieve the token from localStorage
        const token = localStorage.getItem("token");

        const response = await axios.get("http://localhost:8000/api/v1/documents", {
          headers: {
            // Include the Authorization header to fix the 401 error
            Authorization: `Bearer ${token}`,
          },
        });
        
        const documents = response.data.data || [];
        
        const total = documents.length;

        // Ensure you match the correct ID property (e.g., user.department_id)
        const userDepartmentId = user?.department_id;
        const departmentDocuments = documents.filter(d => d.department_id === userDepartmentId).length;

        const totalDownloads = documents.reduce((sum, document) => sum + (document.download_count || 0), 0);

        setStats({ 
          total, 
          department: departmentDocuments, 
          downloads: totalDownloads 
        });
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    };

    if (user) fetchStats();
  }, [user]);

  const departmentNames = {
  1: "Human Resource (HR)",
  2: "Finance",
  3: "Information Technology (IT)",
  4: "Marketing",
  5: "Operations"
};

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800">Welcome back!</h1>
      <p className="mt-1 text-gray-600">Here’s what’s happening today in {departmentNames[user?.department_id] || "this page"}.</p>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-100">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Accessible Documents</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.total}</dd>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-100">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">
              {/* Fallback to 'Department' if the name isn't nested in the user object */}
              {(user?.department?.name || user?.department_name || "Department")} Documents
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.department}</dd>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-100">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Document Downloads</dt>
            <dd className="mt-1 text-3xl font-semibold text-blue-600">{stats.downloads}</dd>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;