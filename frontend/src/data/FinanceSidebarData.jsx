import React from 'react';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import DescriptionIcon from '@mui/icons-material/Description';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpIcon from '@mui/icons-material/Help';
import LogoutIcon from '@mui/icons-material/Logout';

export const FinanceSidebarData = [
  
  {
    title: "Dashboard",
    icon: <DashboardIcon />,
    link: "/FinancePortal/Dashboard"
  },
  {
    title: "Finance Mgmnt",
    icon: <MonetizationOnIcon />,
    link: "/FinancePortal/FeeManagement"
  },
  // {
  //   title: "Expense Mgmnt",
  //   icon: <ReceiptIcon />,
  //   link: "/FinancePortal/ExpenseManagement"
  // },
  // {
  //   title: "Payroll Mgmnt",
  //   icon: <AttachMoneyIcon />,
  //   link: "/FinancePortal/PayrollManagement"
  // },
  // {
  //   title: "Reports",
  //   icon: <DescriptionIcon />,
  //   link: "/FinancePortal/Reports"
  // },
  // {
  //   title: "Settings",
  //   icon: <SettingsIcon />,
  //   link: "/FinancePortal/Settings"
  // },
  // {
  //   title: "Help & Support",
  //   icon: <HelpIcon />,
  //   link: "/FinancePortal/HelpSupport"
  // },
  // {
  //   title: "LogOut",
  //   icon: <LogoutIcon sx={{color:'white',fontSize:30}}/>,
  //   link: "/Login"
  // },
];

