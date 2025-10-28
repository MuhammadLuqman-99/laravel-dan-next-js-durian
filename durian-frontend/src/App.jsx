import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import PWAUpdatePrompt from './components/PWAUpdatePrompt';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PokokDurian from './pages/PokokDurian';
import FarmMapPage from './pages/FarmMapPage';
import Baja from './pages/Baja';
import Hasil from './pages/Hasil';
import Inspeksi from './pages/Inspeksi';
import Spray from './pages/Spray';
import ActivityLogs from './pages/ActivityLogs';
import Expenses from './pages/Expenses';
import Sales from './pages/Sales';
import Settings from './pages/Settings';
import Users from './pages/Users';
import Reports from './pages/Reports';
import Security from './pages/Security';
import Profile from './pages/Profile';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Navigate to="/dashboard" replace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/pokok"
            element={
              <ProtectedRoute>
                <Layout>
                  <PokokDurian />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/peta"
            element={
              <ProtectedRoute>
                <Layout>
                  <FarmMapPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/baja"
            element={
              <ProtectedRoute>
                <Layout>
                  <Baja />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/hasil"
            element={
              <ProtectedRoute>
                <Layout>
                  <Hasil />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/inspeksi"
            element={
              <ProtectedRoute>
                <Layout>
                  <Inspeksi />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/spray"
            element={
              <ProtectedRoute>
                <Layout>
                  <Spray />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/activity-logs"
            element={
              <ProtectedRoute>
                <Layout>
                  <ActivityLogs />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/expenses"
            element={
              <ProtectedRoute>
                <Layout>
                  <Expenses />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales"
            element={
              <ProtectedRoute>
                <Layout>
                  <Sales />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Layout>
                  <Settings />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <Layout>
                  <Users />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <Layout>
                  <Reports />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/security"
            element={
              <ProtectedRoute>
                <Layout>
                  <Security />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Layout>
                  <Profile />
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
        <PWAInstallPrompt />
        <PWAUpdatePrompt />
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
