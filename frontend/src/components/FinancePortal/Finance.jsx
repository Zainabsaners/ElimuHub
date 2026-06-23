import React from "react";
import { Routes, Route } from "react-router-dom"
//import FinanceSidebar from "../sidebars/FinanceSidebar";
import Dashboard from "./Dashboard";
import FeeManagement from "./FeeManagement";
import PayrollManagement from "./PayrollManagement";
import ExpenseManagement from "./ExpenseManagement";
import Report from "./Report";
import HelpSupport from "./HelpSupport";
import Settings from "./Settings";
import Login from "../Authentication/Login";


const Finance = () => {
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
                    <Route path="/" element={<Dashboard/>}/>
                    <Route path="/Login" element={<Login/>}/>
                    <Route path="/Dashboard" element={<Dashboard/>}/>
                    <Route path="/FeeManagement" element={<FeeManagement/>}/>
                    <Route path="/PayrollManagement" element={<PayrollManagement/>}/>
                    <Route path="/ExpenseManagement" element={<ExpenseManagement/>}/>
                    <Route path="/Reports" element={<Report/>}/>
                    <Route path="/HelpSupport" element={<HelpSupport/>}/>
                    <Route path="/Settings" element={<Settings/>}/>
                </Routes>
            </div>
                
        </div>
    );
};

export default Finance;