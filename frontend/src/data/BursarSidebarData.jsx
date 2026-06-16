import React from 'react';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import DescriptionIcon from '@mui/icons-material/Description';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpIcon from '@mui/icons-material/Help';
import LogoutIcon from '@mui/icons-material/Logout';

export const BursarData = [
    {
        title: "Dashboard",
        icon: <DashboardIcon />,
        link: "/BursarPortal/BursarDashboard"
    },
    
    {
        title: "Fee Payment",
        icon: <MonetizationOnIcon />,
        link: "/BursarPortal/Payment"
    },
    {
        title: "payment Records",
        icon: <ReceiptIcon />,
        link: "/BursarPortal/PaymentRecords"
    },
    {
        title: "Fee structure",
        icon: <AttachMoneyIcon />,
        link: "/BursarPortal/FeeStructure"
    },
    {
        title: "Reports",
        icon: <DescriptionIcon />,
        link: "/BursarPortal/Report"
    },
    // {
    //     title: "Settings",
    //     icon: <SettingsIcon />,
    //     link: "/BursarPortal/Settings"
    // },
    // {
    //     title: "Help & Support",
    //     icon: <HelpIcon />,
    //     link: "/BursarPortal/HelpSupport"
    // },
     {
        title: "LogOut",
        icon: <LogoutIcon sx={{color:'white',fontSize:30}}/>,
         link: "/Login"
     },
];

export default BursarData;