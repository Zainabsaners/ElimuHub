import React from 'react';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import DescriptionIcon from '@mui/icons-material/Description';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpIcon from '@mui/icons-material/Help';
import LogoutIcon from '@mui/icons-material/Logout';
import PeopleIcon from '@mui/icons-material/People';

export const HrData = [
    {
        title: "Dashboard",
        icon: <DashboardIcon />,
        link: "/HrPortal/HrDashboard"
    },
    {
        title: "StaffReg",
        icon: <ReceiptIcon />,
        link: "/HrPortal/Staffreg"
    },
    {
        title: "StaffMngnt",
        icon: <PeopleIcon />,
        link: "/HrPortal/Staffmngnt"
    },
     
    {
        title: "Payroll",
        icon: <MonetizationOnIcon />,
        link: "/HrPortal/Payroll"
    },
    
    // {
    //     title: "Recruitemnt",
    //     icon: <AttachMoneyIcon />,
    //     link: "/HrPortal/Recruitment"
    // },
    // {
    //     title: "Reports",
    //     icon: <DescriptionIcon />,
    //     link: "/HrPortal/Report"
    // },
    // {
    //     title: "Settings",
    //     icon: <SettingsIcon />,
    //     link: "/HrPortal/Settings"
    // },
    // {
    //     title: "Help & Support",
    //     icon: <HelpIcon />,
    //     link: "/HrPortal/HelpSupport"
    // },
    // {
    //     title: "LogOut",
    //     icon: <LogoutIcon sx={{color:'white',fontSize:30}}/>,
    //     link: "/Login"
    // },
];
