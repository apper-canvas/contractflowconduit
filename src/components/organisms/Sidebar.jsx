import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import { cn } from '@/utils/cn';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  
const navigation = [
    { name: 'Dashboard', href: '/', icon: 'LayoutDashboard' },
    { name: 'Create Ticket', href: '/tickets/create', icon: 'Plus' },
    { name: 'Offboarding Process', href: '/tickets/create?category=Offboarding', icon: 'UserX' },
    { name: 'Contractors', href: '/contractors', icon: 'Users' },
    { name: 'Requisitions', href: '/requisitions', icon: 'FileText' },
    { name: 'TOR Management', href: '/tors', icon: 'FileCheck' },
    { name: 'Timesheet Management', href: '/timesheets', icon: 'Clock' },
    { name: 'Overtime Management', href: '/overtime', icon: 'Timer' },
    { name: 'Time Off Management', href: '/time-off', icon: 'Calendar' },
    { name: 'Reports', href: '/reports', icon: 'BarChart3' },
    { name: 'Agencies', href: '/agencies', icon: 'Building2' },
    { name: 'Settings', href: '/settings', icon: 'Settings' }
  ];

  const MobileSidebar = () => (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed inset-y-0 left-0 z-50 w-64 bg-primary shadow-lg lg:hidden"
          >
            <SidebarContent onItemClick={onClose} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  const DesktopSidebar = () => (
    <div className="hidden lg:block w-64 bg-primary shadow-lg">
      <SidebarContent />
    </div>
  );

  const SidebarContent = ({ onItemClick }) => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-primary/20">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
            <ApperIcon name="Briefcase" className="w-6 h-6 text-primary" />
          </div>
          <div className="ml-3">
            <h2 className="text-xl font-bold text-white">ContractFlow</h2>
            <p className="text-primary/60 text-sm">Bank Portal</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 py-6">
        <ul className="space-y-2 px-4">
          {navigation.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.href}
                onClick={onItemClick}
className={({ isActive }) =>
                  cn(
                    "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-white text-primary shadow-sm"
                      : "text-white/90 hover:text-white hover:bg-primary/20"
                  )
                }
              >
                <ApperIcon name={item.icon} className="w-5 h-5 mr-3" />
                {item.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-primary/20">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
            <ApperIcon name="User" className="w-4 h-4 text-white" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-white">Admin User</p>
            <p className="text-xs text-primary/60">System Administrator</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <DesktopSidebar />
      <MobileSidebar />
    </>
  );
};

export default Sidebar;