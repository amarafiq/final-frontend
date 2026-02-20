import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navigation = () => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getRoleBadge = (roles) => {
  const role = Array.isArray(roles) ? roles[0] : roles;
  
  switch (role?.toLowerCase()) {
    case 'admin': 
      return 'bg-red-100 text-red-800 border border-red-200';
    case 'manager': 
      return 'bg-indigo-100 text-indigo-800 border border-indigo-200';
    case 'employee': 
      return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
    default: 
      return 'bg-gray-100 text-gray-800 border border-gray-200';
  }
};

  if (!user) return null;

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="shrink-0 flex items-center">
              <span className="text-xl font-bold text-indigo-600">JRZ.Co</span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link to="/dashboard" className="border-transparent text-gray-500 hover:border-indigo-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Dashboard
              </Link>
              <Link to="/documents" className="border-transparent text-gray-500 hover:border-indigo-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Documents
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <div className="relative ml-3">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex text-sm rounded-full focus:outline-none"
              >
                <span className="sr-only">Open user menu</span>
                <span className="px-3 py-1 bg-gray-100 rounded-md text-sm font-medium">
                  {user.name}
                </span>
                <span className={`ml-2 px-2.5 py-0.5 text-xs font-semibold rounded-full ${getRoleBadge(user.roles)}`}>
                   {Array.isArray(user.roles) ? user.roles[0] : user.roles}
                </span>
              </button>
              {dropdownOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;