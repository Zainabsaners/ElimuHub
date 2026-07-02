import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FiLogOut, 
  FiChevronDown, 
  FiChevronRight,
  FiSun,
  FiMoon
} from 'react-icons/fi';
import { useAuth } from '../Authentication/AuthContext';
import { useTheme } from "@/hooks/useTheme";
import { StudentSidebarData } from '../../data/StudentSidebarData';

function StudentSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false); // false = open (default)
  const [openDropdown, setOpenDropdown] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleDropdown = (index) => {
    setOpenDropdown(openDropdown === index ? null : index);
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (window.innerWidth < 1024) {
      setIsCollapsed(true);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isActive = (path) => {
    if (path === '/student') {
      return location.pathname === '/student' || location.pathname === '/students/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="relative h-full">
      {/* Overlay for mobile when sidebar is open */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Toggle Button for Mobile when sidebar is collapsed */}
      {isCollapsed && (
        <button 
          onClick={toggleSidebar}
          className="fixed top-4 left-4 bg-indigo-700 hover:bg-indigo-600 text-white rounded-full p-3 shadow-lg border border-indigo-600 transition-all duration-200 hover:scale-110 z-50 lg:hidden"
          aria-label="Open sidebar"
        >
          <svg 
            className="w-5 h-5"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}

      {/* Sidebar */}
      <div 
        className={`
          h-screen bg-linear-to-b from-indigo-800 via-indigo-700 to-indigo-900 
          dark:from-gray-900 dark:via-gray-800 dark:to-gray-900
          shadow-2xl border-r border-indigo-600 dark:border-gray-700 transition-all duration-300 ease-in-out z-50
          ${isCollapsed ? 'w-20' : 'w-64'}
          fixed lg:relative top-0 left-0
          ${isCollapsed ? '-translate-x-full lg:translate-x-0' : 'translate-x-0'}
        `}
      >
        {/* Header Section */}
        <div className="flex flex-col items-center p-4 border-b border-indigo-600/50 dark:border-gray-700/50">
          <div className="flex items-center space-x-3 w-full">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0 border-2 border-white/20 dark:border-gray-600/30">
              <span className="text-white font-bold text-lg">E</span>
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <h1 className="text-white font-bold text-lg leading-tight">ELIMUHUB</h1>
                <h2 className="text-indigo-300 dark:text-indigo-400 text-xs font-semibold">STUDENT PORTAL</h2>
              </div>
            )}
          </div>

          {/* Toggle Button inside sidebar */}
          <button 
            onClick={toggleSidebar}
            className="absolute -right-3 top-6 bg-indigo-700 dark:bg-gray-700 hover:bg-indigo-600 dark:hover:bg-gray-600 text-white rounded-full p-2 shadow-lg border border-indigo-600 dark:border-gray-600 transition-all duration-200 hover:scale-110"
            aria-label="Toggle sidebar"
          >
            <svg 
              className="w-4 h-4"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {StudentSidebarData.map((val, key) => {
              const isItemActive = isActive(val.link);
              const isExpanded = openDropdown === key;

              return (
                <li key={key} className="relative">
                  <div
                    className={`
                      flex items-center w-full p-3 rounded-xl cursor-pointer transition-all duration-200 group
                      ${isItemActive ? 'bg-white/20 dark:bg-white/10 shadow-lg' : 'hover:bg-white/10 dark:hover:bg-white/5'}
                      ${isCollapsed ? 'justify-center' : 'justify-start'}
                    `}
                    onClick={() => {
                      if (val.subNav) {
                        handleDropdown(key);
                      } else {
                        handleNavigation(val.link);
                        if (window.innerWidth >= 1024) {
                          setIsCollapsed(true);
                        }
                      }
                    }}
                  >
                    <div className={`
                      shrink-0 transition-colors duration-200
                      ${isItemActive ? 'text-white' : 'text-indigo-200 dark:text-indigo-400 group-hover:text-white'}
                      ${isCollapsed ? 'text-xl' : 'text-lg'}
                    `}>
                      {val.icon}
                    </div>

                    {!isCollapsed && (
                      <div className="ml-3 flex-1">
                        <span className={`
                          font-medium transition-colors duration-200
                          ${isItemActive ? 'text-white' : 'text-indigo-100 dark:text-indigo-300 group-hover:text-white'}
                        `}>
                          {val.title}
                        </span>
                      </div>
                    )}

                    {!isCollapsed && val.subNav && (
                      <svg 
                        className={`
                          w-4 h-4 transition-transform duration-200 shrink-0
                          ${isExpanded ? 'rotate-180' : ''}
                          ${isItemActive ? 'text-white' : 'text-indigo-200 dark:text-indigo-400'}
                        `}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7-7-7-7" />
                      </svg>
                    )}
                  </div>

                  {/* Sub Navigation */}
                  {!isCollapsed && val.subNav && isExpanded && (
                    <ul className="ml-6 mt-1 space-y-1 animate-fadeIn">
                      {val.subNav.map((subVal, subKey) => {
                        const isSubItemActive = location.pathname === subVal.link;
                        return (
                          <li key={subKey}>
                            <div
                              className={`
                                flex items-center p-2 rounded-lg cursor-pointer transition-all duration-200 group
                                ${isSubItemActive ? 'bg-white/20 dark:bg-white/10 shadow-md' : 'hover:bg-white/10 dark:hover:bg-white/5'}
                              `}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleNavigation(subVal.link);
                                if (window.innerWidth >= 1024) {
                                  setIsCollapsed(true);
                                }
                              }}
                            >
                              <div className={`
                                shrink-0 text-sm transition-colors duration-200
                                ${isSubItemActive ? 'text-white' : 'text-indigo-200 dark:text-indigo-400 group-hover:text-white'}
                              `}>
                                {subVal.icon}
                              </div>
                              <span className={`
                                ml-2 text-sm font-medium transition-colors duration-200
                                ${isSubItemActive ? 'text-white' : 'text-indigo-100 dark:text-indigo-300 group-hover:text-white'}
                              `}>
                                {subVal.title}
                              </span>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Info, Theme Toggle & Logout */}
        <div className="px-3 pb-4 border-t border-indigo-400/20 dark:border-gray-700/30 mt-2 pt-4">
          {/* User Info - only when expanded */}
          {!isCollapsed && (
            <div className="flex items-center gap-3 px-3 py-2 mb-2 rounded-lg bg-white/5 dark:bg-white/5">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                <span className="text-white text-sm font-medium">
                  {user?.first_name?.charAt(0) || 'S'}
                  {user?.last_name?.charAt(0) || ''}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">
                  {user?.first_name || 'Student'}
                </p>
                <p className="text-indigo-300 dark:text-indigo-400 text-xs truncate">
                  {user?.email || 'student@elimuhub.ac.ke'}
                </p>
              </div>
            </div>
          )}

          {/* Theme Toggle */}
          <div
            className={`
              flex items-center w-full p-3 rounded-xl cursor-pointer transition-all duration-200 group
              ${isCollapsed ? 'justify-center' : 'justify-start'}
              hover:bg-white/10 dark:hover:bg-white/5
            `}
            onClick={toggleTheme}
          >
            {theme === 'dark' ? (
              <FiSun className={`text-indigo-200 dark:text-indigo-400 group-hover:text-white ${isCollapsed ? 'text-xl' : 'text-lg'}`} />
            ) : (
              <FiMoon className={`text-indigo-200 dark:text-indigo-400 group-hover:text-white ${isCollapsed ? 'text-xl' : 'text-lg'}`} />
            )}
            {!isCollapsed && (
              <span className="ml-3 font-medium text-indigo-100 dark:text-indigo-300 group-hover:text-white">
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </span>
            )}
          </div>

          {/* Logout Button */}
          <div
            className={`
              flex items-center w-full p-3 rounded-xl cursor-pointer transition-all duration-200 group
              ${isCollapsed ? 'justify-center' : 'justify-start'}
              hover:bg-white/10 dark:hover:bg-white/5
            `}
            onClick={handleLogout}
          >
            <FiLogOut className={`text-indigo-200 dark:text-indigo-400 group-hover:text-white ${isCollapsed ? 'text-xl' : 'text-lg'}`} />
            {!isCollapsed && (
              <span className="ml-3 font-medium text-indigo-100 dark:text-indigo-300 group-hover:text-white">Logout</span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className={`
          border-t border-indigo-700/50 dark:border-gray-700/30 p-4 transition-all duration-300
          ${isCollapsed ? 'text-center' : ''}
        `}>
          <div className={`
            text-indigo-300 dark:text-indigo-400 transition-all duration-300 overflow-hidden
            ${isCollapsed ? 'text-xs opacity-70' : 'text-sm'}
          `}>
            {!isCollapsed ? (
              <div>
                <p className="font-semibold">© {new Date().getFullYear()} ElimuHub</p>
                <p className="text-xs opacity-60">Student Portal v2.0</p>
              </div>
            ) : (
              <div className="rotate-90 whitespace-nowrap mt-8">
                <span className="font-semibold">©{new Date().getFullYear()}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentSidebar;
