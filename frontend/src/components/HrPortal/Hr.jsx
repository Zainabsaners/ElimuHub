import React from "react";
import { Routes, Route } from "react-router-dom"
import HrSidebar from "../sidebars/HrSidebar";
import HrDashboard from "./Dashboard";

import Report from "./Report";
import HelpSupport from "./HelpSupport";
import Settings from "./Settings";
import Login from "../Authentication/Login";
import Payroll from "./PayrollMngmt";
import Recruitment from "./Recruitment";

import StaffRegistration from "./StaffReg";
import StaffMngAdmin from "./Admin";
import StaffManagement from "./StaffMngnt";

const Hr = () => {
    return(
        <div style={{ display: "flex", height: "100vh", overflow: "hidden",gap:"2px" }}>
            {/* Sidebar */}
            <div style={{ flexShrink: 0 }}>
                <HrSidebar/>
            </div>
            
            {/* Main Content Area */}
            <div style={{ 
                flex: 1, 
                overflowY: "auto",
                padding: "0px 0rem",
                backgroundColor: "#f8fafc",
                minHeight: "100vh"
            }}>
                <Routes>
                    <Route path="/" element={<HrDashboard/>}/>
                    <Route path="/Login" element={<Login/>}/>
                    <Route path="/HrDashboard" element={<HrDashboard/>}/>
                    <Route path="/Payroll" element={<Payroll/>}/>
                    <Route path="/Recruitment" element={<Recruitment/>}/>
                    <Route path="/Staffmngnt" element={<StaffManagement/>}/>
                    <Route path="/Staffreg" element={<StaffRegistration/>}/>
                    <Route path="/Report" element={<StaffMngAdmin/>}/>
                    <Route path="/HelpSupport" element={<HelpSupport/>}/>
                    <Route path="/Settings" element={<Settings/>}/>
                </Routes>
            </div>
        </div>
    );
};

export default Hr;