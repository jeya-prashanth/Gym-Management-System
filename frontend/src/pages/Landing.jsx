import React from 'react';
import { Link } from 'react-router-dom';
import { FaUser, FaBuilding } from 'react-icons/fa';
import logo from '../assets/logo.png';

const Landing = () => {
  return (
    <div className='min-h-screen text-white'>
      <div className='container mx-auto px-4 py-20'>
        <div className='max-w-4xl mx-auto text-center'>
          <div className='flex flex-col items-center'>
            <img src={logo} className='h-50 mt-10 sm:mt-5' alt="" />
            <p className='Orbitron text-xl md:text-3xl mb-8'>Transform Your Journey with Premium Gym Experience</p>

            <div className='flex flex-col md:flex-row justify-center gap-4 mb-12'>
              <Link to='/login'
                className='bg-[#2196f3] hover:bg-[#1c1f2a] border-2 border-[#2196f3] text-white px-10 py-3 rounded-lg transition-colors'>
                Login
              </Link>
              <Link to='/signup'
                className='bg-[#2196f3] hover:bg-[#1c1f2a] border-2 border-[#2196f3] text-white px-8 py-3 rounded-lg transition-colors'>
                Sign Up
              </Link>
            </div>
          </div>
          
          <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
            <div className='bg-[#1c1f2a] p-6 rounded-lg'>
              <FaUser className='text-[#2196f3] text-4xl mb-4' />
              <h3 className='Orbitron text-2xl mb-2'>For Members</h3>
              <p>Join our community and access premium fitness facilities.</p>
            </div>
            <div className='bg-[#1c1f2a] p-6 rounded-lg'>
              <FaBuilding className='text-[#2196f3] text-4xl mb-4' />
              <h3 className='Orbitron text-2xl mb-2'>For Gyms</h3>
              <p>Manage your gym operations efficiently with our platform.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
