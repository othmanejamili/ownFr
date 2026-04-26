import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register           from '../pages/auth/RegisterPage';
import Login              from '../pages/auth/LoginPage';
import HomePage           from '../pages/Home/HomePage';
import AdminDashboard     from '../pages/Dashboard/AdminDashboard';
import InstructorDashboard from '../pages/Dashboard/InstructorNumbers';
import LogoutButton       from '../pages/auth/Logout';
import ProtectedRoute     from '../components/ProtectedRoute';
import ForgotPassword from '../pages/auth/ForgotPassword';

function App() {
  return (
    <Router>
      <Routes>

        {/* Public routes */}
        <Route path="/"         element={<HomePage />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/logout"   element={<LogoutButton />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        {/* Protected routes */}
        <Route
          path="/dashboard/admin"
          element={
            <ProtectedRoute requiredRole="A">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/instructor"
          element={
            <ProtectedRoute requiredRole="I">
              <InstructorDashboard />
            </ProtectedRoute>
          }
        />

      </Routes>  
    </Router>
  );
}

export default App;