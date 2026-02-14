import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    department_id: '',
    role: '',

  });

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
     const fetchDepartments = async () => {
  try {
    const response = await axios.get("http://localhost:8000/api/v1/departments");
    setDepartments(response.data.data || []);
  } catch (error) {
    console.error("Error fetching departments:", error);
  }
};
fetchDepartments();
}, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Name is required');
      return false;
    }
    if (!formData.email) {
      setError('Email is required');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Email is invalid');
      return false;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }
    if (formData.password !== formData.password_confirmation) {
      setError('Passwords do not match');
      return false;
    }
    if (!formData.department_id) {
      setError('Department is required');
      return false;
    }
    if (!formData.role) {
      setError('Role is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
  e.preventDefault(); // ← Don't forget this!

  if (!validateForm()) return;

  setLoading(true);
  setError('');
  setSuccess('');

  try {
    const response = await axios.post("http://localhost:8000/api/v1/register", formData);
    
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));

    setSuccess('Account created successfully! Redirecting...');
    setTimeout(() => navigate('/dashboard'), 2000);
  } catch (err) {
    console.error("Registration error:", err);
    const message = err.response?.data?.message || 'Failed to create account. Please try again.';
    setError(message);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div>
          <h2 className="mt-6 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Join JRZ.Co's Crew now
          </p>
        </div>
        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-120">
        <div className="bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12">
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          </div>
        )}

        {success && (
          <div className="rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="text-sm text-green-700">{success}</div>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          
            {/* Name */}
            <div>
                <label htmlFor="department_id" className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
              <input
                name="name"
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Full name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            {/* Email */}
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
              <input
                name="email"
                type="email"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            {/* Password */}
            <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password *
            </label>
              <input
                name="password"
                type="password"
                required
                minLength="8"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Password (min 8 characters)"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            {/* Confirm Password */}
            <div>
                <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-1">
              Password Confimation *
            </label>
              <input
                name="password_confirmation"
                type="password"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Confirm password"
                value={formData.password_confirmation}
                onChange={handleChange}
              />
            </div>

          {/* Department */}
          <div>
            <label htmlFor="department_id" className="block text-sm font-medium text-gray-700 mb-1">
              Department *
            </label>
            <select
              id="department_id"
              name="department_id"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={formData.department_id}
              onChange={handleChange}
            >
              <option value="">Select your department</option>
              {departments.map(department => (
                <option key={department.id} value={department.id}>{department.name}</option>
              ))}
            </select>
          </div>

          {/* Role Selection */}
          <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                     Role *
             </label>
                <select
                   id="role"
                   name="role"
                   required
                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                   value={formData.role}
                   onChange={handleChange}
                   >
                  <option value="">Select your role</option>
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                </select>
         </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                loading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </span>
              ) : 'Sign up'}
            </button>
          </div>

          <div className="text-sm text-center text-gray-600">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Sign in
            </button>
          </div>
        </form>
        </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;