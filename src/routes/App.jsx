import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register           from '../pages/auth/RegisterPage';
import Login              from '../pages/auth/LoginPage';
import HomePage           from '../pages/Home/HomePage';
import AdminDashboard     from '../pages/Dashboard/Admin/AdminDashboard';
import LogoutButton       from '../pages/auth/Logout';
import ProtectedRoute     from '../components/ProtectedRoute';
import ForgotPassword from '../pages/auth/ForgotPassword';
import Pricing from '../pages/Home/Pricing';
import SchoolsPage from '../pages/Home/SchoolsPage';
import OwnerDashboard from '../pages/Dashboard/Owner/OwnerDashboard';
function App() {
  return (
    <Router>
      <Routes>

        {/* Public routes */}
        <Route path="/"         element={<HomePage />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path='/schools'  element={<SchoolsPage />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/logout"   element={<LogoutButton />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        {/* Protected routes */}
        <Route
          path="/dashboard/admin"
          element={
            <ProtectedRoute requiredRole="A" requireStaff={true}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
        path="/dashboard/owner"
        element={
          <ProtectedRoute requiredRole="A" requireStaff={false}>
            <OwnerDashboard />
          </ProtectedRoute>
        }
        ></Route>

        <Route
          path="/unauthorized"
          element={
            <div className="min-h-screen bg-[#060B18] flex items-center justify-center px-6">
              <div className="text-center max-w-sm">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-red-500/10
                  border border-red-500/20 flex items-center justify-center">
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                    <path d="M14 3L25 22H3L14 3Z" stroke="#EF4444" strokeWidth="1.5" />
                    <path d="M14 11v5M14 18.5v1" stroke="#EF4444" strokeWidth="1.5"
                      strokeLinecap="round" />
                  </svg>
                </div>
                <h1 className="font-sora text-[24px] font-black text-white mb-3">
                  Access denied
                </h1>
                <p className="text-[14px] text-white/40 leading-relaxed mb-8 font-dm">
                  You don't have permission to view this page. Make sure you're logged
                  in with the correct account.
                </p>
                <a href="/login"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600
                    hover:bg-blue-500 text-white text-[14px] font-semibold rounded-xl
                    transition-colors font-dm">
                  Back to login
                </a>
              </div>
            </div>
          }
        />
 
 
      </Routes>  
    </Router>
  );
}

export default App;