// In src/data/TeacherSidebarData.jsx
import { FiHome, FiUsers, FiCalendar, FiBookOpen, FiFileText, FiUser, FiSettings, FiClipboard, FiCheckSquare, FiClock } from 'react-icons/fi';

export const TeacherSidebarData = [
  { title: "Dashboard", link: "/teacher", icon: <FiHome className="text-xl" /> },
  { title: "My Classes", link: "/teacher/classes", icon: <FiUsers className="text-xl" /> },
  { title: "Attendance", link: "/teacher/attendance", icon: <FiCalendar className="text-xl" /> },
  { title: "Grades", link: "/teacher/grades", icon: <FiBookOpen className="text-xl" /> },
  { 
    title: "Assignments", 
    icon: <FiFileText className="text-xl" />,
    subNav: [
      { title: "All Assignments", link: "/teacher/assignments", icon: <FiClipboard /> },
      { title: "Create New", link: "/teacher/assignments/create", icon: <FiCheckSquare /> },
      { title: "Submissions", link: "/teacher/submissions", icon: <FiFileText /> },
    ]
  },
  { title: "Timetable", link: "/teacher/timetable", icon: <FiClock className="text-xl" /> },
  { title: "Profile", link: "/teacher/profile", icon: <FiUser className="text-xl" /> },
  { title: "Settings", link: "/teacher/settings", icon: <FiSettings className="text-xl" /> },
];