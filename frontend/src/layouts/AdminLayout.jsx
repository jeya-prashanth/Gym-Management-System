import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { FaHome, FaUser, FaChartLine, FaCog, FaDatabase } from 'react-icons/fa';
import { TbBuildingPlus } from 'react-icons/tb';
import NavbarAdmin from '../components/NavbarAdmin';
import adminlogo from '../assets/logo_admin.png';

const AdminLayout = () => {
  const menuItems = [
    { path: '/admin/dashboard', icon: <FaHome className='text-white' />, label: 'Dashboard' },
    { path: '/admin/create-gym', icon: <TbBuildingPlus className='text-white' />, label: 'Create Gym' },
    { path: '/admin/member', icon: <FaUser className='text-white' />, label: 'Manage Members' }
  ];

  return (
    <div className='min-h-screen flex flex-col sm:flex-row'>
      <div className='sm:hidden fixed top-0 left-0 right-0 z-50'>
        <NavbarAdmin />
      </div>

      {/* Sidebar - For md and lg screens */}
      <div className='hidden sm:block w-64 bg-[#1c1f2a] h-[100%] fixed left-0 top-0 overflow-y-auto'>
        <div className='p-4 h-full flex flex-col'>
          <div>
            <Link to='/' className='flex items-center space-x-2'>
              <img src={adminlogo} className='h-15 w-auto' alt='Rebel Fitness Admin Panel' />
              <span className='Orbitron text-white text-xl font-bold'>Admin Panel</span>
            </Link>
          </div>
          <div className='space-y-2 mt-6 flex-1'>
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className='flex items-center space-x-3 p-3 text-gray-300 hover:bg-[#2c2f3a] rounded-lg transition-colors'
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className='sm:hidden mt-21 sm:mt-16 w-full bg-[#1c1f2a] fixed z-40'>
        <div className='grid grid-cols-3 gap-2 p-2'>
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className='flex gap-2 items-center justify-center p-2 text-gray-300 hover:bg-[#2c2f3a] rounded-lg transition-colors text-center'
            >
              <div className='text-lg'>{item.icon}</div>
              <span className='text-xs mt-1'>{item.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className='flex-1 sm:ml-64 mt-16 sm:mt-0 pt-4 sm:pt-0'>
        <div className='hidden sm:block'>
          <NavbarAdmin />
        </div>

        {/* Page Content */}
        <main className='p-6'>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
