import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaBell, FaCog, FaUsers, FaBuilding, FaUserCircle } from 'react-icons/fa';
import adminlogo from '../assets/logo_admin.png';

const NavbarAdmin = ({ username }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    // Mock logout - clear role in future
    navigate('/');
  };

  const renderAdminSection = () => (
    <div className='flex items-center space-x-4 py-[10px]'>
      <div className='flex items-center space-x-2'>
        <span className='text-white'>Welcome Back , Admin</span>
        <FaUserCircle className='text-white' />
      </div>
      <button
        onClick={handleLogout}
        className='bg-[#2196f3] hover:bg-[#1c1f2a] border-2 border-[#2196f3] text-white px-4 py-2 rounded-lg transition-colors'
      >
        Logout
      </button>
    </div>
  );

  return (
    <div className='bg-[#1c1f2a] text-white shadow-lg'>
      <div className='container mx-auto px-4 py-3 flex justify-between items-center'>
        <div className='flex-1'>
          <Link to='/' className='flex sm:hidden items-center space-x-2'>
            <img src={adminlogo} className='h-15 w-auto' alt='Rebel Fitness'/>
            <span className='Orbitron text-white text-xl font-bold'>Admin Panel</span>
          </Link>
        </div>

        <div className='hidden sm:flex items-center space-x-8'>
          <Link to='/admin/manage-gym' className='flex items-center space-x-2 hover:text-[#2196f3] transition-colors'>
            <FaBuilding className='text-white' />
            <span>Gym Management</span>
          </Link>
          {renderAdminSection()}
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className='sm:hidden text-white'
        >
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className='sm:hidden bg-[#1c1f2a] p-4 space-y-4'>
          <Link to='/admin/manage-gym' className='flex items-center space-x-2 text-white hover:text-[#2196f3] transition-colors'>
            <FaBuilding />
            <span>Gym Management</span>
          </Link>
          {renderAdminSection()}
        </div>
      )}
    </div>
  );
};

export default NavbarAdmin;
