import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/*
 * ProtectedRoute — Role-based access guard
 *
 * Backend user model:
 *   role     : "A" for both admin and owner
 *   is_staff : 1 (true)  → Platform Admin  → /dashboard/admin
 *   is_staff : 0 (false) → School Owner    → /dashboard/owner
 *
 * Usage:
 *   <ProtectedRoute requiredRole="A" requireStaff={true}>   → Admin only
 *   <ProtectedRoute requiredRole="A" requireStaff={false}>  → Owner only
 *   <ProtectedRoute requiredRole="A">                       → Any role "A" user
 */

const ProtectedRoute = ({ children, requiredRole, requireStaff }) => {
  const { isAuthenticated, loading, user } = useAuth();

  // 1. Still loading auth state — show nothing yet
  if (loading) {
    return (
      <div className="min-h-screen bg-[#060B18] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-600/30 border-t-blue-500
            rounded-full animate-spin" />
          <span className="text-[13px] text-white/30 font-dm">Checking access…</span>
        </div>
      </div>
    );
  }

  // 2. Not logged in → go to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 3. Role check — if requiredRole is provided, user.role must match
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  // 4. is_staff check — only applied when requireStaff is explicitly passed
  //    requireStaff={true}  → must be staff  (admin)
  //    requireStaff={false} → must NOT be staff (owner)
  if (requireStaff !== undefined) {
    const userIsStaff = Boolean(user?.is_staff); // normalise 0/1 or true/false
    if (userIsStaff !== requireStaff) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;