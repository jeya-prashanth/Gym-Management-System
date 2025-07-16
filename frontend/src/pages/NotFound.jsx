import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaExclamationTriangle } from 'react-icons/fa';

const NotFound = () => {
  return (
    <div className='min-h-screen bg-[#0e121d] flex flex-col items-center justify-center p-4'>
      <div className='max-w-md w-full bg-[#1c1f2a] rounded-lg shadow-lg p-8 text-center'>
        <div className='text-[#2196f3] text-6xl mb-4'>
          <FaExclamationTriangle className='mx-auto' />
        </div>
        <h1 className='text-4xl font-bold text-white mb-4'>404</h1>
        <h2 className='text-2xl text-gray-300 mb-6'>Page Not Found</h2>
        <p className='text-gray-400 mb-8'>
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to='/'
          className='inline-flex items-center px-6 py-3 rounded-lg bg-[#2196f3] text-white hover:bg-[#1c1f2a] hover:border-2 hover:border-[#2196f3] transition-colors'
        >
          <FaHome className='mr-2' />
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
