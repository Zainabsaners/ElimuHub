import React from "react";
import { HashRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import Finance from "./components/FinancePortal/Finance";
import Bursar from "./components/BursarPortal/Bursar";
import Login from "./components/Authentication/Login";
import Register from "./components/RegisterPortal/Register";
import SysAdmin from "./components/SystemAdminPortal/SystemAdmin";
import { AuthProvider, useAuth } from "./components/Authentication/AuthContext";
import ProtectedRoute from "./components/Authentication/ProtectedRoute";
import Logout from "./components/Authentication/Logout";
import Sidebar from "./components/sidebars/Sidebar"; // This is your new unified sidebar
import FinanceSidebar from "./components/sidebars/FinanceSidebar";
import BursarSidebar from "./components/sidebars/BursarSidebar";
import RegisterSidebar from "./components/sidebars/RegisterSidebar";
import SysAdminSidebar from "./components/sidebars/SysAdminSidebar";
import HrSidebar from "./components/sidebars/HrSidebar";

// We define the Layout here so we don't need a separate file
const Layout = () => {
    // FIX: Use the actual user state from your context
    const { user, loading } = useAuth(); 
    
    // While checking auth, show nothing or a loader
    if (loading || !user) {
      return null;
    }

    
    
    const role = user?.role;

    const renderSidebar = () => {
        switch (role) {
            case 'accountant': return <FinanceSidebar />;
            case 'bursar': return <BursarSidebar />;
            case 'registrar': return <RegisterSidebar />;
            case 'system_admin': return <SysAdminSidebar />;
            case 'hr_manager': return <HrSidebar />;
            default: return null;
        }
    };

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
            {renderSidebar()}
            <main className="flex-1 p-4 lg:p-8 pb-24 lg:pb-8"> 
                <Outlet />
            </main>
        </div>
    );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes: No Sidebar here */}
          <Route path="/" element={<Login />} />
          <Route path="/Login" element={<Login />} />
          <Route path="/Logout" element={<Logout />} />

          {/* Protected Routes: All share the same Sidebar Layout */}
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
          </Route>

          {/* Catch-all: Redirect back to login */}
          <Route path="*" element={<Login />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;