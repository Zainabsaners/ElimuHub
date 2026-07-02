import React, { useState } from 'react';
import SidebarItem from './SidebarItem';
import { FiLogOut } from 'react-icons/fi';
import { HrData } from '../../data/HrSidebarData';
import { useNavigate } from 'react-router-dom';

function HrSidebar() {
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
    // Auto-close sidebar on mobile after navigation
    if (window.innerWidth < 1024) {
      setIsCollapsed(true);
    }
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
          className="fixed top-4 left-4 bg-blue-700 hover:bg-blue-600 text-white rounded-full p-3 shadow-lg border border-blue-600 transition-all duration-200 hover:scale-110 z-50 lg:hidden"
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
          h-screen bg-linear-to-b from-red-700 to-red-800 
          shadow-2xl border-r border-red-600 transition-all duration-300 ease-in-out z-50
          ${isCollapsed ? 'w-20' : 'w-64'}
          /* Mobile styles */
          fixed lg:relative top-0 left-0
          ${isCollapsed ? '-translate-x-full lg:translate-x-0' : 'translate-x-0'}
        `}
      >
        {/* Header Section */}
        <div className="flex flex-col items-center p-4 border-b border-blue-700">
          {/* School Logo and Name */}
          <div className="flex items-center space-x-3 w-full">
            <img 
              src="assets/logo.jpg" 
              alt="ElimuHub Logo" 
              className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-lg"
            />
            {!isCollapsed && (
              <div className="flex flex-col">
                <h1 className="text-white font-bold text-lg leading-tight">ELIMUHUB</h1>
                <h2 className="text-blue-200 text-xs font-semibold">HR PORTAL</h2>
              </div>
            )}
          </div>

          {/* Toggle Button inside sidebar - Hidden when collapsed */}
          
            <button 
              onClick={toggleSidebar}
              className="absolute -right-2 top-6 bg-blue-700 hover:bg-blue-600 text-white rounded-full p-2 shadow-lg border border-blue-600 transition-all duration-200 hover:scale-110"
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
            {HrData.map((val, key) => (
              <li key={key} className="relative">
                {/* Main Navigation Item */}
                <div
                  className={`
                    flex items-center w-full p-3 rounded-xl cursor-pointer transition-all duration-200 group
                    ${window.location.pathname === val.link ? 'bg-blue-600 shadow-lg' : 'hover:bg-blue-700'}
                    ${isCollapsed ? 'justify-center' : 'justify-start'}
                  `}
                  onClick={() => {
                    if (val.subNav) {
                      handleDropdown(key);
                    } else {
                      handleNavigation(val.link);
                      // Auto-close sidebar on desktop when link is clicked
                      if (window.innerWidth >= 1024) {
                        setIsCollapsed(true);
                      }
                    }
                  }}
                >
                  {/* Icon */}
                  <div className={`
                    shrink-0 transition-colors duration-200
                    ${window.location.pathname === val.link ? 'text-white' : 'text-blue-200 group-hover:text-white'}
                    ${isCollapsed ? 'text-xl' : 'text-lg'}
                  `}>
                    {val.icon}
                  </div>

                  {/* Title */}
                  {!isCollapsed && (
                    <div className="ml-3 flex-1">
                      <span className={`
                        font-medium transition-colors duration-200
                        ${window.location.pathname === val.link ? 'text-white' : 'text-blue-100 group-hover:text-white'}
                      `}>
                        {val.title}
                      </span>
                    </div>
                  )}

                  {/* Dropdown Arrow */}
                  {!isCollapsed && val.subNav && (
                    <svg 
                      className={`
                        w-4 h-4 transition-transform duration-200 shrink-0
                        ${openDropdown === key ? 'rotate-180' : ''}
                        ${window.location.pathname === val.link ? 'text-white' : 'text-blue-200'}
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
                {!isCollapsed && val.subNav && openDropdown === key && (
                  <ul className="ml-6 mt-1 space-y-1 animate-fadeIn">
                    {val.subNav.map((subVal, subKey) => (
                      <li key={subKey}>
                        <div
                          className={`
                            flex items-center p-2 rounded-lg cursor-pointer transition-all duration-200 group
                            ${window.location.pathname === subVal.link ? 'bg-blue-500 shadow-md' : 'hover:bg-blue-600'}
                          `}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNavigation(subVal.link);
                            // Auto-close sidebar on desktop when sublink is clicked
                            if (window.innerWidth >= 1024) {
                              setIsCollapsed(true);
                            }
                          }}
                        >
                          <div className={`
                            shrink-0 text-sm transition-colors duration-200
                            ${window.location.pathname === subVal.link ? 'text-white' : 'text-blue-200 group-hover:text-white'}
                          `}>
                            {subVal.icon}
                          </div>
                          <span className={`
                            ml-2 text-sm font-medium transition-colors duration-200
                            ${window.location.pathname === subVal.link ? 'text-white' : 'text-blue-100 group-hover:text-white'}
                          `}>
                            {subVal.title}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="px-3 pb-4 border-t border-red-400/20 mt-2 pt-4">
          <SidebarItem 
            to="/logout" 
            icon={FiLogOut} 
            label="Logout" 
            isCollapsed={isCollapsed}
            colorClass="text-white hover:bg-red-700" 
            onClick={() => handleNavigation('/logout')}
          />
        </div>
      

        

        {/* Footer */}
        <div className={`
          border-t border-blue-700 p-4 transition-all duration-300
          ${isCollapsed ? 'text-center' : ''}
        `}>
          <div className={`
            text-blue-200 transition-all duration-300 overflow-hidden
            ${isCollapsed ? 'text-xs opacity-70' : 'text-sm'}
          `}>
            {!isCollapsed ? (
              <div>
                <p className="font-semibold">© {new Date().getFullYear()} ElimuHub</p>
              </div>
            ) : (
              <div className="rotate-90 whitespace-nowrap mt-8">
                <span className="font-semibold">©{new Date().getFullYear()} ElimuHub</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HrSidebar;