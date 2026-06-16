import React from "react";
import { Routes, Route } from "react-router-dom"
//import BursarSidebar from "../sidebars/BursarSidebar";
import BursarDashboard from "./Dashboard";
import PaymentRecords from "./PaymentRecords";
import FeeStructure from "./FeeStructure";
import Payment from "./PaymentManagement";
import Report from "./Report";
import HelpSupport from "./HelpSupport";
import Settings from "./Settings";
import Login from "../Authentication/Login";
import Logout from "../Authentication/Logout";

const Bursar = () => {
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
                    <Route path="/" element={<BursarDashboard/>}/>
                    <Route path="/Login" element={<Login/>}/>
                    <Route path="/BursarDashboard" element={<BursarDashboard/>}/>
                    <Route path="/PaymentRecords" element={<PaymentRecords/>}/>
                    <Route path="/FeeStructure" element={<FeeStructure/>}/>
                    <Route path="/Payment" element={<Payment/>}/>
                    <Route path="/Report" element={<Report/>}/>
                    <Route path="/HelpSupport" element={<HelpSupport/>}/>
                    <Route path="/Settings" element={<Settings/>}/>
                    <Route path="/Logout" element={<Logout/>}/>
                    <Route path="*" element={<Logout/>}/> 
                </Routes>
            </div>
        </div>
    );
};

export default Bursar;