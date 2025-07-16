import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import logo from '../assets/logo.png';

const Navbar = ({ role, username, gymname }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    // Handle logout logic here
    navigate('/');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayName = role === 'member' ? username : gymname;

  return (
    <div className='bg-[#1c1f2a] text-white shadow-lg py-0 sm:py-5'>
      <div className='container mx-auto px-4 py-3'>
        <div className='flex justify-between items-center'>
          <div className='flex sm:hidden items-center'>
            <Link to='/' className='flex items-center space-x-2'>
              <img src={logo} className='h-15 w-auto' alt='Rebel Fitness'/>
              <span className='Orbitron text-xl font-bold'>Rebel Fitness</span>
            </Link>
          </div>

          {/* Right side - Always visible */}
          <div className='flex items-center space-x-4 ml-auto'>
            <div className='relative' ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className='flex items-center space-x-2 focus:outline-none'
              >
                <div className='flex items-center space-x-2'>
                  <span className='hidden sm:inline text-white'>
                    Hi.. Welcome Back, {displayName}
                  </span>
                  <FaUserCircle className='text-white text-2xl' />
                </div>
              </button>

              {/* Profile Dropdown */}
              {isProfileOpen && (
                <div className='origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50'>
                  <div className='py-1' role='menu' aria-orientation='vertical'>
                    {/* <Link
                      to='/member/profile'
                      className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                      role='menuitem'
                      onClick={() => setIsProfileOpen(false)}
                    >
                      Your Profile
                    </Link> */}
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsProfileOpen(false);
                      }}
                      className='w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center'
                      role='menuitem'
                    >
                      <FaSignOutAlt className='mr-2' /> Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;