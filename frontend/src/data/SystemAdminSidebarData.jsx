import DashboardIcon from '@mui/icons-material/Dashboard';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import DescriptionIcon from '@mui/icons-material/Description';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpIcon from '@mui/icons-material/Help';
import LogoutIcon from '@mui/icons-material/Logout';
import PeopleIcon from '@mui/icons-material/People';
import ScheduleIcon from '@mui/icons-material/Schedule';
import { DatabaseIcon } from 'lucide-react';

const SysAdminData = [
    // {
    //     title: "Dashboard",
    //     icon: <DashboardIcon />,
    //     link: "/SystemAdminPortal/SystemDashboard"
    // },
    {
        title: "Users Mng",
        icon: <PeopleIcon />,
        link: "/SystemAdminPortal/users"
    },
    {
        title: "Staff Mng",
        icon: <PeopleIcon />,
        link: "/SystemAdminPortal/staff"
    },
    // {
    //     title: "Database Mng",
    //     icon: <MonetizationOnIcon />,
    //     link: "/SystemAdminPortal/database"
    // },
    
    // {
    //     title: "Permissions",
    //     icon: <AttachMoneyIcon />,
    //     link: "/SystemAdminPortal/permissions"
    // },
    // {
    //     title: "Audit",
    //     icon: <DescriptionIcon />,
    //     link: "/SystemAdminPortal/audit"
    // },
    {
        title: "Backup",
        icon: <DatabaseIcon />,
        link: "/SystemAdminPortal/backup"
    },
    // {
    //     title: "Api",
    //     icon: <HelpIcon />,
    //     link: "/SystemAdminPortal/api"
    // },
    // {
    //     title: "Settings",
    //     icon: <SettingsIcon />,
    //     link: "/SystemAdminPortal/Settings"
    // },
    
   // {
      //  title: "LogOut",
       // icon: <LogoutIcon sx={{color:'white',fontSize:30}}/>,
       // link: "/Login"
   // },
];

export default SysAdminData;