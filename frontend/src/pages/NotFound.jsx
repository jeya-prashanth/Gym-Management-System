import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaHome, FaExclamationTriangle, FaArrowLeft } from 'react-icons/fa';

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const error = location.state?.error;
  const isApiError = location.state?.isApiError;

  useEffect(() => {
    document.title = error?.message || 'Page Not Found | Gym Management';
  }, [error]);

  const handleGoBack = () => {
    if (isApiError) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <div className='min-h-screen bg-[#0e121d] flex flex-col items-center justify-center p-4'>
      <div className='max-w-md w-full bg-[#1c1f2a] rounded-lg shadow-lg p-8 text-center'>
        <div className='text-[#2196f3] text-6xl mb-4'>
          <FaExclamationTriangle className='mx-auto' />
        </div>
        <h1 className='text-4xl font-bold text-white mb-2'>
          {error?.statusCode || 404}
        </h1>
        <h2 className='text-2xl text-gray-300 mb-2'>
          {error?.error || 'Page Not Found'}
        </h2>
        <p className='text-gray-400 mb-6'>
          {error?.message || "The page you're looking for doesn't exist or has been moved."}
        </p>
        
        {error?.details && (
          <div className='mb-6 p-3 bg-gray-800 rounded text-left text-sm text-gray-300'>
            <pre className='whitespace-pre-wrap'>{JSON.stringify(error.details, null, 2)}</pre>
          </div>
        )}

        <div className='flex flex-col sm:flex-row gap-4 justify-center'>
          <button
            onClick={handleGoBack}
            className='flex-1 sm:flex-none flex items-center justify-center px-6 py-3 rounded-lg bg-[#2196f3] text-white hover:bg-[#1c1f2a] hover:border-2 hover:border-[#2196f3] transition-colors'
          >
            {isApiError ? (
              <>
                <FaArrowLeft className='mr-2' />
                Go Back
              </>
            ) : (
              <>
                <FaHome className='mr-2' />
                Back to Home
              </>
            )}
          </button>
          
          {isApiError && (
            <Link
              to='/'
              className='flex-1 sm:flex-none flex items-center justify-center px-6 py-3 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-colors'
            >
              <FaHome className='mr-2' />
              Home
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotFound;
