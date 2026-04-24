import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) return <div>Loading…</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // Optional: role-based guard
  if (requiredRole && user?.role !== requiredRole)
    return <Navigate to="/unauthorized" replace />;

  return children;
};

export default ProtectedRoute;