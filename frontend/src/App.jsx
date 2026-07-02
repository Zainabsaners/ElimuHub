import React from "react";
import { HashRouter as Router, Routes, Route, Outlet, Navigate } from "react-router-dom";
import Finance from "./components/FinancePortal/Finance";
import Bursar from "./components/BursarPortal/Bursar";
import Login from "./components/Authentication/Login";
import ForgotPassword from "./components/Authentication/ForgotPassword";
import ForcePasswordChange from "./components/Authentication/ForcePasswordChange";
import Register from "./components/RegisterPortal/Register";
import SysAdmin from "./components/SystemAdminPortal/SystemAdmin";
import StudentDashboard from "./components/StudentPortal/Dashboard";
import { AuthProvider, useAuth } from "./components/Authentication/AuthContext";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import ProtectedRoute from "./components/Authentication/ProtectedRoute";
import Logout from "./components/Authentication/Logout";
import FinanceSidebar from "./components/sidebars/FinanceSidebar";
import BursarSidebar from "./components/sidebars/BursarSidebar";
import RegisterSidebar from "./components/sidebars/RegisterSidebar";
import SysAdminSidebar from "./components/sidebars/SysAdminSidebar";
import HrSidebar from "./components/sidebars/HrSidebar";
import StudentSidebar from "./components/sidebars/StudentSidebar";
import Assignments from './components/StudentPortal/Academics/Assignments';
import AssignmentDetail from './components/StudentPortal/Academics/AssignmentDetail';
import LearningMaterials from './components/StudentPortal/Academics/LearningMaterials';
import Courses from './components/StudentPortal/Academics/Courses';
import Results from './components/StudentPortal/Academics/Results';
import ReportCard from './components/StudentPortal/Academics/ReportCard';
import FeeStatement from './components/StudentPortal/Finance/FeeStatement';
import Attendance from "./components/StudentPortal/Attendance";
import Timetable from './components/StudentPortal/Timetable';
import Profile from "./components/StudentPortal/profile";
import Settings from "./components/FinancePortal/Settings";
import Activities from "./components/StudentPortal/Activities/Activities";
import Notifications from "./components/StudentPortal/Communication/notification";
import TeacherSidebar from "./components/sidebars/TeacherSidebar";
import TeacherDashboard from "./components/TeacherPortal/TeacherDashboard";
import TeacherClasses from "./components/TeacherPortal/TeacherClasses";
import TeacherClassStudents from "./components/TeacherPortal/TeacherClassStudents";
import MarkAttendance from "./components/TeacherPortal/MarkAttendance";
import GradeEntry from "./components/TeacherPortal/GradeEntry";
import TeacherAssignments from "./components/TeacherPortal/TeacherAssignments";
import CreateAssignment from "./components/TeacherPortal/CreateAssignments";
import Submissions from "./components/TeacherPortal/Submission";
import TeacherTimetable from "./components/TeacherPortal/TeacherTimetable";
import TeacherProfile from "./components/TeacherPortal/TeacherProfile";
import TeacherSettings from "./components/TeacherPortal/TeacherSettings";
import TeacherClassDetail from './components/TeacherPortal/TeacherClassDetail';
import TeacherAttendance from "./components/TeacherPortal/TeacherAttendance";
import TeacherGrades from "./components/TeacherPortal/TeacherGrades";
const Layout = () => {
    const { user, loading } = useAuth();
    const { theme } = useTheme();
    
    if (loading) {
        return (
            <div className={`flex items-center justify-center h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <div className="text-center">
                    <img src="/logo.jpeg" alt="ElimuHub" className="w-20 mx-auto mb-4" />
                    <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Loading...</p>
                </div>
            </div>
        );
    }
    
    if (!user) {
        return <Navigate to="/Login" replace />;
    }
    
    const role = user?.role;

    const renderSidebar = () => {
        switch (role) {
            case 'accountant': return <FinanceSidebar />;
            case 'bursar': return <BursarSidebar />;
            case 'registrar': return <RegisterSidebar />;
            case 'system_admin': return <SysAdminSidebar />;
            case 'hr_manager': return <HrSidebar />;
            case 'student': return <StudentSidebar />; 
            case 'teacher': return <TeacherSidebar/>;
            default: return <div className="p-4 text-red-500">Access Denied: No portal assigned</div>;
        }
    };

    return (
        <div className={`flex min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
            {renderSidebar()}
            <main className="flex-1 p-4 lg:p-8 pb-24 lg:pb-8 overflow-x-hidden">
                <Outlet />
            </main>
        </div>
    );
};

// ✅ Wrap AuthProvider INSIDE Router
function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Login />} />
            <Route path="/Login" element={<Login />} />
            <Route path="/Logout" element={<Logout />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Protected Routes */}
            <Route element={<Layout />}>
              <Route path="/RegisterPortal/*" element={
                <ProtectedRoute allowedRoles={['registrar']}>
                  <Register />
                </ProtectedRoute>
              } />
              <Route path="/FinancePortal/*" element={
                <ProtectedRoute allowedRoles={['accountant']}>
                  <Finance />
                </ProtectedRoute>
              } />
              <Route path="/BursarPortal/*" element={
                <ProtectedRoute allowedRoles={['bursar']}>
                  <Bursar />
                </ProtectedRoute>
              } />
              <Route path="/SystemAdminPortal/*" element={
                <ProtectedRoute allowedRoles={['system_admin']}>
                  <SysAdmin />
                </ProtectedRoute>
              } />
              <Route path="/student" element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentDashboard />
                </ProtectedRoute>
              } />
              <Route path="/student/dashboard" element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentDashboard />
                </ProtectedRoute>
              } />
              <Route path="/student/finance" element={
                <ProtectedRoute allowedRoles={['student']}>
                  <FeeStatement />
                </ProtectedRoute>
              } />
              <Route path="/student/academics/courses" element={
                <ProtectedRoute allowedRoles={['student']}>
                  <Courses />
                </ProtectedRoute>
              } />
              <Route path="/student/academics/results" element={
                <ProtectedRoute allowedRoles={['student']}>
                  <Results />
                </ProtectedRoute>
              } />
              <Route path="/student/academics/report-cards" element={
                <ProtectedRoute allowedRoles={['student']}>
                  <ReportCard />
                </ProtectedRoute>
              } />
              <Route path="/student/academics/assignments" element={
                <ProtectedRoute allowedRoles={['student']}>
                  <Assignments />
                </ProtectedRoute>
              } />
              <Route path="/student/academics/assignments/:id" element={
                <ProtectedRoute allowedRoles={['student']}>
                  <AssignmentDetail />
                </ProtectedRoute>
              } />
              <Route path="/student/academics/learning" element={
                <ProtectedRoute allowedRoles={['student']}>
                  <LearningMaterials />
                </ProtectedRoute>
              } />
              <Route path="/student/attendance" element={
                <ProtectedRoute allowedRoles={['student']}>
                  <Attendance />
                </ProtectedRoute>
              } />
              <Route path="/student/timetable" element={
                <ProtectedRoute allowedRoles={['student']}>
                  <Timetable />
                </ProtectedRoute>
              } />
              <Route path="/student/profile" element={
                <ProtectedRoute allowedRoles={['student']}>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/student/settings" element={
                <ProtectedRoute allowedRoles={['student']}>
                  <Settings />
                </ProtectedRoute>
              } />
              <Route path="/force-password-change" element={
                <ProtectedRoute allowedRoles={['student', 'teacher']}>
                  <ForcePasswordChange />
                </ProtectedRoute>
              } />
              <Route path="/student/activities" element={
                <ProtectedRoute allowedRoles={['student']}>
                  <Activities />
                </ProtectedRoute>
              } />
              <Route path="/student/communication/notifications" element={
                <ProtectedRoute allowedRoles={['student']}>
                  <Notifications />
                </ProtectedRoute>
              } />
               <Route path="/teacher" element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <TeacherDashboard />
                  </ProtectedRoute>
              } />
                <Route path="/teacher/classes" element={
                  <ProtectedRoute allowedRoles={['teacher']}>
                    <TeacherClasses />
                    </ProtectedRoute>
              } />
              <Route path="/teacher/classes/:classId/students" element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <TeacherClassStudents />
                  </ProtectedRoute>
              } />
              <Route path="/teacher/classes/:classId/attendance" element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <MarkAttendance />
                  </ProtectedRoute>
              } />
              <Route path="/teacher/classes/:classId/grades" element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <GradeEntry />
                  </ProtectedRoute>
              } />
              <Route path="/teacher/assignments" element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <TeacherAssignments />
                  </ProtectedRoute>
              } />
              <Route path="/teacher/assignments/create" element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <CreateAssignment />
                  </ProtectedRoute>
              } />
              <Route path="/teacher/submissions" element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <Submissions />
                  </ProtectedRoute>
              } />
              <Route path="/teacher/timetable" element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <TeacherTimetable />
                </ProtectedRoute>
              } />
              <Route path="/teacher/profile" element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <TeacherProfile />
                </ProtectedRoute>
              } />
              <Route path="/teacher/settings" element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <TeacherSettings />
                </ProtectedRoute>
              } />
              <Route path="/teacher/classes/:classId" element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <TeacherClassDetail />
                </ProtectedRoute>
              } />
              <Route path="/teacher/attendance" element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <TeacherAttendance />
                </ProtectedRoute>
              } />
              <Route path="/teacher/grades" element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <TeacherGrades />
                </ProtectedRoute>
              } />

              </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;