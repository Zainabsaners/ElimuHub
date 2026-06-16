import React from "react";
import { Routes, Route } from "react-router-dom"
//import SysAdminSidebar from "../sidebars/SysAdminSidebar";
import AdminDashboard from "./Dashboard";
import UserManagement from "./UserMngnt";
import DatabaseManagement from "./DatabseMngmt";
import SystemSettings from "./SystemSettings";
import AuditLogs from "./AuditLogs";
import PermissionManagement from "./PermissionMng";
import BackupRestore from "./BackupRestore";
// import ApiManagement from "./ApiMngment";
import StaffMngAdmin from "./StaffMng";


const SysAdmin = () => {
    return(
        <div style={{ display: "flex", height: "100vh", overflow: "hidden",gap:"2px" }}>
           
            
            {/* Main Content Area */}
            <div style={{ 
                flex: 1, 
                overflowY: "auto",
                padding: "0px 0rem",
                backgroundColor: "#f8fafc",
                minHeight: "100vh"
            }}>
                <Routes>
                    <Route path="/" element={<UserManagement />} />
                    <Route path="/SystemDashboard" element={<AdminDashboard />} />
                    <Route path="/users" element={<UserManagement />} />
                    <Route path="/database" element={<DatabaseManagement/>} />
                    <Route path="/settings" element={<SystemSettings />} />
                    <Route path="/audit" element={<AuditLogs />} />
                    <Route path="/permissions" element={<PermissionManagement />} />
                    <Route path="/backup" element={<BackupRestore />} />
                    {/* <Route path="/api" element={<ApiManagement />} /> */}
                    <Route path="/staff" element={<StaffMngAdmin />} />
                </Routes>
            </div>
        </div>
    );
};

export default SysAdmin;

{/* Default Route */}
                    {/* <Route path="/" element={<Navigate to="/admin" />} /> */}

