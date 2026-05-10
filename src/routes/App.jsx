import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register           from '../pages/auth/RegisterPage';
import Login              from '../pages/auth/LoginPage';
import HomePage           from '../pages/Home/HomePage';
import AdminDashboard     from '../pages/Dashboard/AdminDashboard';
import LogoutButton       from '../pages/auth/Logout';
import ProtectedRoute     from '../components/ProtectedRoute';
import ForgotPassword from '../pages/auth/ForgotPassword';
import Pricing from '../pages/Home/Pricing';
import SchoolsPage from '../pages/Home/SchoolsPage';
import Blog from '../pages/Home/Blogs';
import Docs from '../pages/Home/Docs';
function App() {
  return (
    <Router>
      <Routes>

        {/* Public routes */}
        <Route path="/"         element={<HomePage />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path='/schools'  element={<SchoolsPage />} />
        <Route path='/blog' element={<Blog />} />
        <Route path='/docs' element={<Docs />} />
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

      </Routes>  
    </Router>
  );
}

export default App;