import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchUserInfo();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserInfo = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setLoading(false);
    } else {
      localStorage.removeItem("token");
      setUser(null);
      setLoading(false);
    }
  };

  const login = (token, userData) => {
    localStorage.setItem("token", token);
    if (userData) {
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
    }
  };
   const register = async (registrationData) => {
    try {
      setLoading(true);
      
      const response = await axios.post(
        "http://localhost:8000/api/v1/register", 
        registrationData
      );

      const { token, user } = response.data;
      
      if (token) {
        login(token, user);
        return { success: true, data: response.data };
      }
      
      return { success: true, data: response.data };
      
    } catch (error) {
      console.error("Registration error:", error);
      
      return { 
        success: false, 
        error: error.response?.data?.message || "Registration failed" 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        await axios.post(
          "http://localhost:8000/api/v1/logout",
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } catch (error) {
        console.error("Logout error:", error);
      }
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const hasPermission = (permission) => {
    if (!user) return false;
    if (user.permissions && Array.isArray(user.permissions)) {
      return user.permissions.includes(permission);
    }
    
    if (user.roles && Array.isArray(user.roles)) {
      
      const rolePermissions = {
    admin: ['documents-view', 'documents-create', 'documents-update', 'documents-delete', 'documents-download', 'categories-view', 'departments-view'],
    manager: ['documents-view', 'documents-create', 'documents-update', 'documents-download', 'categories-view', 'departments-view'],
    employee: ['documents-view', 'documents-download', 'categories-view', 'departments-view'],
   };
      return user.roles.some(role => {
        const roleName = typeof role === 'string' ? role : role.name;
        return rolePermissions[roleName]?.includes(permission);
      });
    }
    
    return false;
  };
  const hasRole = (roleName) => {
    if (!user) return false;
    
    if (user.roles && Array.isArray(user.roles)) {
      return user.roles.some(role => {
        const roleNameToCheck = typeof role === 'string' ? role : role.name;
        return roleNameToCheck === roleName;
      });
    }
    
    return false;
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    hasPermission,
    hasRole,
    fetchUserInfo,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};