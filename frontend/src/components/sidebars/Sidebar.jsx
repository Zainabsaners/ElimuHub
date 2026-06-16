/* src/components/sidebars/Sidebar.jsx */
import SidebarItem from './SidebarItem';
import { FiHome, FiDollarSign, FiLogOut, FiUsers } from 'react-icons/fi';

const Navigation = ({ isCollapsed }) => {
  const navLinks = [
    { to: "/dashboard", icon: FiHome, label: "Home" },
    { to: "/students", icon: FiUsers, label: "Students" },
    { to: "/fees", icon: FiDollarSign, label: "Fees" },
  ];

  return (
    <>
      {/* DESKTOP SIDEBAR: Clean Slate Gray/Blue */}
      <div className={`hidden lg:flex flex-col h-screen bg-slate-900 text-slate-100 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
        <nav className="flex-1 px-3 py-6 space-y-2">
          {navLinks.map(link => (
            <SidebarItem key={link.to} {...link} isCollapsed={isCollapsed} />
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <SidebarItem to="/logout" icon={FiLogOut} label="Logout" isCollapsed={isCollapsed} colorClass="text-slate-400 hover:text-white" />
        </div>
      </div>

      {/* MOBILE BOTTOM NAV: Matching Mobile Header Accent */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-900 text-slate-200 h-16 flex justify-around items-center px-2 z-50 shadow-2xl border-t border-slate-800">
        {navLinks.map(link => (
          <SidebarItem key={link.to} {...link} isMobileView={true} />
        ))}
        <SidebarItem to="/logout" icon={FiLogOut} label="Exit" isMobileView={true} />
      </div>
    </>
  );
};

export default Navigation;