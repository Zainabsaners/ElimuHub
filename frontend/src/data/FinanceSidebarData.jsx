// frontend/src/data/FinanceSidebarData.jsx
import React from 'react';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import DescriptionIcon from '@mui/icons-material/Description';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpIcon from '@mui/icons-material/Help';
import LogoutIcon from '@mui/icons-material/Logout';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

export const FinanceSidebarData = [
  {
    title: "Dashboard",
    icon: <DashboardIcon />,
    link: "/FinancePortal/Dashboard"
  },
  {
    title: "Fee Management",
    icon: <MonetizationOnIcon />,
    link: "/FinancePortal/FeeManagement"
  },
  //{
    //title: "Payments",
   // icon: <CreditCardIcon />,
    //link: "/FinancePortal/Payments"
 // },
  {
    title: "Expense Management",
    icon: <ReceiptIcon />,
    link: "/FinancePortal/ExpenseManagement"
  },
  {
    title: "Payroll Management",
    icon: <AttachMoneyIcon />,
    link: "/FinancePortal/PayrollManagement"
  },
  //{
    //title: "Invoices",
   // icon: <ReceiptLongIcon />,
    //link: "/FinancePortal/Invoices"
 // },
  {
    title: "Reports",
    icon: <DescriptionIcon />,
    link: "/FinancePortal/Reports"
  },
 // {
   // title: "Budget",
    //icon: <TrendingDownIcon />,
    //link: "/FinancePortal/Budget"
 // },
  //{
  //  title: "Cash Flow",
   // icon: <TrendingUpIcon />,
    //link: "/FinancePortal/CashFlow"
  //},
 /* {
    title: "Analytics",
    icon: <AnalyticsIcon />,
    link: "/FinancePortal/Analytics"
  },
  {
    title: "Academic Calendar",
    icon: <CalendarMonthIcon />,
    link: "/FinancePortal/AcademicCalendar"
  },*/
  {
    title: "Settings",
    icon: <SettingsIcon />,
    link: "/FinancePortal/Settings"
  },
  {
    title: "Help & Support",
    icon: <HelpIcon />,
    link: "/FinancePortal/HelpSupport"
  },
 /* {
    title: "Logout",
    icon: <LogoutIcon sx={{color:'white',fontSize:30}}/>,
    link: "/Login"
  },*/
];