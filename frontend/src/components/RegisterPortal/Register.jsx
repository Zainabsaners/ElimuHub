import React from "react";
import { Routes, Route } from "react-router-dom";
import Dashboard from "./Dashboard";
import Admission from "./Admission";
import Login from "../Authentication/Login";
import ClassManagement from "./ClassMngmnt";
import StudentManagement from "./StudentMngmnt";
import Academic from "./Academic";

const Register = () => {
    return (
        <div style={{ 
            display: "flex", 
            height: "100vh", 
            overflow: "hidden", 
            backgroundColor: "#f8fafc" // High-trust ElimuHub slate canvas background
        }}>
            {/* Note: The layout sidebar is injected globally by App.jsx 
               inside the shared <Layout /> wrapper, so we keep this container 
               focused strictly on handling sub-route viewport layouts cleanly.
            */}
            
            {/* Main Content Area */}
            <div style={{ 
                flex: 1, 
                overflowY: "auto",
                padding: "20px", // Added clean spacing for dashboard elements
                minHeight: "100vh"
            }}>
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/Login" element={<Login />} />
                    <Route path="/Dashboard" element={<Dashboard />} />
                    <Route path="/Admission" element={<Admission />} />
                    <Route path="/StudentManagement" element={<StudentManagement />} />
                    <Route path="/Class" element={<ClassManagement />} />
                    <Route path="/academic" element={<Academic />} />
                </Routes>
            </div>
        </div>
    );
};

export default Register;