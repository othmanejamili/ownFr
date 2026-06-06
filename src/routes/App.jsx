import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register           from '../pages/auth/RegisterPage';
import Login              from '../pages/auth/LoginPage';
import HomePage           from '../pages/Home/HomePage';
import AdminDashboard     from '../pages/Dashboard/Admin/AdminDashboard';
import OwnerDashboard     from '../pages/Dashboard/Owner/OwnerDashboard';
import LogoutButton       from '../pages/auth/Logout';
import ProtectedRoute     from '../components/ProtectedRoute';
import ForgotPassword from '../pages/auth/ForgotPassword';
import Pricing from '../pages/Home/Pricing';
import SchoolsPage from '../pages/Home/SchoolsPage';
import Blog from '../pages/Home/Blogs';
import Docs from '../pages/Home/Docs';
import  MembersPage from  '../pages/Dashboard/Owner/AddMembres/Memberspage';
import Studentspage from '../pages/Dashboard/Owner/AddMembres/Studentpage';
import Instructorpage from '../pages/Dashboard/Owner/AddMembres/Instructorspage';
import LessonsPage from '../pages/Dashboard/Owner/LessonCrud/Lessonspage';
import AttendancePage from '../pages/Dashboard/Owner/Attendance/Attendancepage';
import VehiclePage from '../pages/Dashboard/Owner/Vehicle/Vehiclepage';
import SchedulePage from '../pages/Dashboard/Owner/Schedule/Schedulepage';
import Analyticspage from '../pages/Dashboard/Owner/Analytics/Analyticspage';
import Automatedmessagepage from '../pages/Dashboard/Owner/Message/Automatedmessagepage';
import CommunicationTemplatepage from '../pages/Dashboard/Owner/Template/Communicationtemplatepage';
import ReportsPage from '../pages/Dashboard/Owner/Raports/Reportspage';
import SettingsPage from '../pages/Dashboard/Owner/Settingspage';
import FeedbackPage from '../pages/Dashboard/Owner/Feedback/Feedbackpage';
import InstructorDashboard from '../pages/Dashboard/Instructor/Dashboard/InstuctorDashboard';
import LessonsPageInstructor from '../pages/Dashboard/Instructor/Lesson/LessonsPage';
import InstructorAttendancePage from '../pages/Dashboard/Instructor/Attendance/Attendancepage';
import InstructorVehiclePage from '../pages/Dashboard/Instructor/Vehicle/VehiclePage';
import InstructorSchedulePage from '../pages/Dashboard/Instructor/Schedule/Schedulepage';
import InstructoreStudentsPage from '../pages/Dashboard/Instructor/Students/Studentspage';
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
        />

        <Route
        path='/dashboard/owner/membres'
        element={
          <ProtectedRoute requiredRole="A" requireStaff={false}>
            <MembersPage />
          </ProtectedRoute>
        }
        />
        <Route
        path='/dashboard/owner/students'
        element={
          <ProtectedRoute requiredRole="A" requireStaff={false}>
            <Studentspage />
          </ProtectedRoute>
        }
        />
        <Route
        path='/dashboard/owner/instructors'
        element={
          <ProtectedRoute requiredRole="A" requireStaff={false}>
            <Instructorpage />
          </ProtectedRoute>
        }
        />

        <Route
        path='/dashboard/owner/lessons'
        element={
          <ProtectedRoute requiredRole="A" requireStaff={false}>
            <LessonsPage />
          </ProtectedRoute>
        }
        />



      <Route
        path='/dashboard/owner/attendance'
        element={
          <ProtectedRoute requiredRole="A" requireStaff={false}>
            <AttendancePage />
          </ProtectedRoute>
        }
        />

      <Route
        path='/dashboard/owner/vehicle'
        element={
          <ProtectedRoute requiredRole="A" requireStaff={false}>
            <VehiclePage />
          </ProtectedRoute>
        }
      />

      <Route
        path='/dashboard/owner/schedule'
        element={
          <ProtectedRoute requiredRole="A" requireStaff={false}>
            <SchedulePage />
          </ProtectedRoute>
        }
        />
        <Route
        path='/dashboard/owner/analytics'
        element={
          <ProtectedRoute requiredRole="A" requireStaff={false}>
            <Analyticspage />
          </ProtectedRoute>
        }
        />

      <Route
        path='/dashboard/owner/template'
        element={
          <ProtectedRoute requiredRole="A" requireStaff={false}>
            <CommunicationTemplatepage />
          </ProtectedRoute>
        }
        />

      <Route
        path='/dashboard/owner/automated-message'
        element={
          <ProtectedRoute requiredRole="A" requireStaff={false}>
            <Automatedmessagepage />
          </ProtectedRoute>
        }
        />

      <Route
        path='/dashboard/owner/raposrts'
        element={
          <ProtectedRoute requiredRole="A" requireStaff={false}>
            <ReportsPage />
          </ProtectedRoute>
        }
        />

      <Route
        path='/dashboard/owner/feedback'
        element={
          <ProtectedRoute requiredRole="A" requireStaff={false}>
            <FeedbackPage />
          </ProtectedRoute>
        }
        />

      <Route
        path='/dashboard/owner/settings'
        element={
          <ProtectedRoute requiredRole="A" requireStaff={false}>
            <SettingsPage />
          </ProtectedRoute>
        }
        />


      <Route
        path='/dashboard/instructor'
        element={
          <ProtectedRoute requiredRole="I">
            <InstructorDashboard />
          </ProtectedRoute>
        }
        /> 

      <Route
        path='/dashboard/instructor/lesson'
        element={
          <ProtectedRoute requiredRole="I">
            <LessonsPageInstructor />
          </ProtectedRoute>
        }
        /> 

      <Route
        path='/dashboard/instructor/attendance'
        element={
          <ProtectedRoute requiredRole="I">
            <InstructorAttendancePage />
          </ProtectedRoute>
        }
        /> 

      <Route
        path='/dashboard/instructor/vehicle'
        element={
          <ProtectedRoute requiredRole="I">
            <InstructorVehiclePage />
          </ProtectedRoute>
        }
        /> 

      <Route
        path='/dashboard/instructor/schedule'
        element={
          <ProtectedRoute requiredRole="I">
            <InstructorSchedulePage />
          </ProtectedRoute>
        }
        /> 

      <Route
        path='/dashboard/instructor/students'
        element={
          <ProtectedRoute requiredRole="I">
            <InstructoreStudentsPage />
          </ProtectedRoute>
        }
        /> 




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