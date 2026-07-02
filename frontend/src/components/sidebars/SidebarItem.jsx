import { Link, useLocation } from 'react-router-dom';

const SidebarItem = ({ to, icon: Icon, label, isCollapsed, isMobileView, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  // Base styles for both desktop and mobile
  const baseClasses = `flex items-center rounded-xl transition-all duration-300 group relative overflow-hidden`;
  
  // Desktop vs Mobile specific layout
  const layoutClasses = isMobileView 
    ? `flex-col justify-center px-3 py-1 ${isActive ? 'bg-red-500 text-white scale-110' : 'text-red-100'}`
    : `w-full p-3 ${isCollapsed ? 'justify-center' : 'justify-start'} ${isActive ? 'bg-red-700 text-white shadow-xl border border-red-300/50' : 'text-red-100 hover:bg-red-600/50'}`;

  return (
    <Link to={to} onClick={onClick} className={`${baseClasses} ${layoutClasses}`}>
      {/* Shine effect on hover */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-linear-to-r from-transparent via-white/20 to-transparent"></div>
      
      <div className={`${isMobileView ? 'text-xl mb-1' : 'text-xl'} drop-shadow-lg`}>
        {typeof Icon === 'function' ? <Icon /> : Icon}
      </div>

      {(!isCollapsed || isMobileView) && (
        <span className={`${isMobileView ? 'text-[10px] font-bold' : 'ml-3 font-bold'} whitespace-nowrap drop-shadow-md`}>
          {label}
        </span>
      )}
    </Link>
  );
};

export default SidebarItem;