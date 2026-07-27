import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

// Wraps any page that requires a logged-in user.
// While auth state is rehydrating from localStorage, render nothing to avoid a login-page flash.
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return children;
};

export default ProtectedRoute;
