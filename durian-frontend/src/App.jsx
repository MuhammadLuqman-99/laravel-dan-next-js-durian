import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PokokDurian from './pages/PokokDurian';
import Baja from './pages/Baja';
import Hasil from './pages/Hasil';
import Inspeksi from './pages/Inspeksi';
import Spray from './pages/Spray';
import ActivityLogs from './pages/ActivityLogs';
import Expenses from './pages/Expenses';

function App() {
  return (
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
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
