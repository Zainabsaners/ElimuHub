import React, { useState } from 'react';
import SidebarItem from './SidebarItem';
import { FiLogOut } from 'react-icons/fi';
import SysAdminData from "../../data/SystemAdminSidebarData";
import { useNavigate } from 'react-router-dom';

function SysAdminSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [openDropdown, setOpenDropdown] = useState(null);
  const navigate = useNavigate();

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

  return (
    <div className="relative h-full">
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {isCollapsed && (
        <button 
          onClick={toggleSidebar}
          className="fixed top-4 left-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-3 shadow-lg border border-indigo-500 transition-all duration-200 z-50 lg:hidden"
          aria-label="Open sidebar"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}

      {/* Sidebar - Updated to ElimuHub Professional Indigo Theme */}
      <div 
        className={`
          h-screen bg-indigo-900 shadow-2xl border-r border-indigo-800 transition-all duration-300 ease-in-out z-50
          ${isCollapsed ? 'w-20' : 'w-64'}
          fixed lg:relative top-0 left-0
          ${isCollapsed ? '-translate-x-full lg:translate-x-0' : 'translate-x-0'}
        `}
      >
        <div className="flex flex-col items-center p-4 border-b border-indigo-800">
          <div className="flex items-center space-x-3 w-full">
            <img 
              src="/logo.jpeg" 
              alt="ElimuHub Logo" 
              className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-lg"
            />
            {!isCollapsed && (
              <div className="flex flex-col">
                <h1 className="text-white font-bold text-lg leading-tight">ELIMUHUB</h1>
                <h2 className="text-indigo-300 text-xs font-semibold">ADMIN PORTAL</h2>
              </div>
            )}
          </div>

          <button 
            onClick={toggleSidebar}
            className="absolute -right-2 top-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-2 shadow-lg border border-indigo-500 transition-all duration-200"
            aria-label="Toggle sidebar"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {SysAdminData.map((val, key) => (
              <li key={key} className="relative">
                <div
                  className={`
                    flex items-center w-full p-3 rounded-xl cursor-pointer transition-all duration-200 group
                    ${window.location.pathname === val.link ? 'bg-indigo-600 shadow-lg' : 'hover:bg-indigo-800'}
                    ${isCollapsed ? 'justify-center' : 'justify-start'}
                  `}
                  onClick={() => {
                    if (val.subNav) {
                      handleDropdown(key);
                    } else {
                      handleNavigation(val.link);
                      if (window.innerWidth >= 1024) setIsCollapsed(true);
                    }
                  }}
                >
                  <div className={`shrink-0 ${window.location.pathname === val.link ? 'text-white' : 'text-indigo-300 group-hover:text-white'}`}>
                    {val.icon}
                  </div>
                  {!isCollapsed && (
                    <div className="ml-3 flex-1">
                      <span className={`font-medium ${window.location.pathname === val.link ? 'text-white' : 'text-indigo-100 group-hover:text-white'}`}>
                        {val.title}
                      </span>
                    </div>
                  )}
                  {!isCollapsed && val.subNav && (
                    <svg className={`w-4 h-4 transition-transform duration-200 ${openDropdown === key ? 'rotate-180' : ''} text-indigo-300`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7-7-7-7" />
                    </svg>
                  )}
                </div>

                {!isCollapsed && val.subNav && openDropdown === key && (
                  <ul className="ml-6 mt-1 space-y-1">
                    {val.subNav.map((subVal, subKey) => (
                      <li key={subKey}>
                        <div
                          className={`flex items-center p-2 rounded-lg cursor-pointer hover:bg-indigo-800 ${window.location.pathname === subVal.link ? 'bg-indigo-700' : ''}`}
                          onClick={(e) => { e.stopPropagation(); handleNavigation(subVal.link); }}
                        >
                          <span className="text-indigo-200 text-sm ml-2">{subVal.title}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="px-3 pb-4 border-t border-indigo-800 mt-2 pt-4">
          <SidebarItem to="/logout" icon={FiLogOut} label="Logout" isCollapsed={isCollapsed} colorClass="text-indigo-200 hover:text-white" onClick={() => handleNavigation('/logout')} />
        </div>
      </div>
    </div>
  );
}

export default SysAdminSidebar;