import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navigation from './components/Navigation';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import DocumentList from './pages/DocumentList';
import DocumentDetail from './pages/DocumentDetail';
import DocumentForm from './pages/DocumentForm';
import DocumentEdit from './pages/DocumentEdit';

const App = () => {
 
  return (
    <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          {/* Navbar appears on all protected routes */}
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
            
            
              path="/*"
              element={
                <>
                  <Navigation/>
                  <main>
                    <Routes>
                      <Route
                        path="/dashboard"
                        element={
                          <ProtectedRoute>
                            <Dashboard />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/documents"
                        element={
                          <ProtectedRoute>
                            <DocumentList />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/documents/:id/edit"
                        element={
                          <ProtectedRoute>
                            <DocumentEdit />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/documents/upload"
                        element={
                          <ProtectedRoute>
                            <DocumentForm />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/documents/:id"
                        element={
                          <ProtectedRoute>
                            <DocumentDetail />
                          </ProtectedRoute>
                        }
                      />
                      {/* Redirect root to dashboard */}
                      <Route
                        path="/"
                        element={
                          <ProtectedRoute>
                            <Dashboard />
                          </ProtectedRoute>
                        }
                      />
                      {/* Catch-all: redirect to documents if unknown route */}
                      <Route
                        path="*"
                        element={
                          <ProtectedRoute>
                            <DocumentList />
                          </ProtectedRoute>
                        }
                      />
                    </Routes>
                  </main>
                </>
              }
            />
          </Routes>
        </div>
    </AuthProvider>
  );
};

export default App;