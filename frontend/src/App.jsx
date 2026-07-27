import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Projects from './pages/Projects.jsx';
import ProjectWorkspace from './pages/ProjectWorkspace.jsx';
import Team from './pages/Team.jsx';
import Settings from './pages/Settings.jsx';
import NotFound from './pages/NotFound.jsx';
import ProtectedRoute from './components/layout/ProtectedRoute.jsx';

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects"
        element={
          <ProtectedRoute>
            <Projects />
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects/:projectId"
        element={
          <ProtectedRoute>
            <ProjectWorkspace />
          </ProtectedRoute>
        }
      />
      <Route
        path="/team"
        element={
          <ProtectedRoute>
            <Team />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />

      {/* Default + fallback */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
