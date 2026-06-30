import React from 'react';
import { 
  FiLayout,
  FiBookOpen,
  FiCalendar,
  FiClock,
  FiDollarSign,
  FiMessageSquare,
  FiActivity,
  FiUser,
  FiSettings,
  FiHome,
  FiTrendingUp,
  FiCreditCard,
  FiBell,
  FiMail,
  FiFileText,
  FiCheckSquare,
  FiList,
  FiClipboard,
  FiBarChart2
} from 'react-icons/fi';
import { FaMoneyBillWave, FaGraduationCap, FaReceipt } from 'react-icons/fa';

export const StudentSidebarData = [
  { 
    title: "Dashboard", 
    link: "/student", 
    icon: <FiHome className="text-xl" /> 
  },
  { 
    title: "Academics", 
    icon: <FiBookOpen className="text-xl" />,
    subNav: [
      { title: "My Courses", link: "/student/academics/courses", icon: <FiBookOpen /> },
      { title: "Results", link: "/student/academics/results", icon: <FiTrendingUp /> },
      { title: "Report Cards", link: "/student/academics/report-cards", icon: <FiFileText /> },
      { title: "Assignments", link: "/student/academics/assignments", icon: <FiCheckSquare /> },
      { title: "Learning Materials", link: "/student/academics/learning", icon: <FiBookOpen /> }
    ]
  },
  { 
    title: "Finance", 
    link: "/student/finance",
    icon: <FiDollarSign className="text-xl" />,
    subNav: [
      { title: "Fee Statement", link: "/student/finance", icon: <FaReceipt /> },
      { title: "Payment History", link: "/student/finance/payments", icon: <FaMoneyBillWave /> },
    ]
  },
  { 
    title: "Attendance", 
    link: "/student/attendance", 
    icon: <FiCalendar className="text-xl" /> 
  },
  { 
    title: "Timetable", 
    link: "/student/timetable", 
    icon: <FiClock className="text-xl" /> 
  },
  { 
    title: "Communication", 
    icon: <FiMessageSquare className="text-xl" />,
    subNav: [
      //{ title: "Announcements", link: "/student/communication/announcements", icon: <FiBell /> },
      //{ title: "Messages", link: "/student/communication/messages", icon: <FiMail /> },
      { title: "Notifications", link: "/student/communication/notifications", icon: <FiBell /> }
    ]
  },
  { 
    title: "Activities", 
    link: "/student/activities", 
    icon: <FiActivity className="text-xl" /> 
  },
  { 
    title: "Profile", 
    link: "/student/profile", 
    icon: <FiUser className="text-xl" /> 
  },
  { 
    title: "Settings", 
    link: "/student/settings", 
    icon: <FiSettings className="text-xl" /> 
  }
];
