import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaUser, FaCalendarCheck, FaHistory, FaCog, FaEye, FaEyeSlash } from 'react-icons/fa';

const MemberDashboard = () => {
  const navigate = useNavigate();
  const [tokens, setTokens] = useState(30); // Mock token count
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');

  // Mock visit data
  const recentVisits = [
    { date: 'Today', time: '10:30 AM', duration: '1 hour 30 minutes' },
    { date: 'Yesterday', time: '04:45 PM', duration: '2 hours' },
    { date: '2 days ago', time: '07:15 AM', duration: '1 hour' }
  ];

  const handleCheckIn = () => {
    if (tokens <= 0) {
      toast.error('No tokens available. Please purchase a plan.');
      navigate('/member/plans');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      toast.success('Check-in successful!');
      setTokens(tokens - 1);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className='min-h-screen bg-[#0e121d] py-10 mt-15 sm:mt-0'>
      <div className='container mx-auto px-4'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-3'>
          <div className='grid grid-cols-2 gap-3'>
          <div className='bg-[#1c1f2a] rounded-lg p-6'>
            <div className='flex flex-col items-center justify-between mb-4'>
              <h2 className='text-2xl text-white font-bold'>Tokens</h2>
              <div className='text-4xl text-[#2196f3] font-bold mt-5'>{tokens}</div>
              <Link
                to='/member/plans'
                className='bg-[#2196f3] hover:bg-[#1c1f2a] border-2 border-[#2196f3] text-white text-center py-3 px-4 rounded-lg transition-colors disabled:opacity-50 mt-10'
              >
                Purchase More
              </Link>
            </div>
          </div>

          <div className='flex flex-col items-center bg-[#1c1f2a] rounded-lg p-6'>
            <h2 className='text-2xl text-white font-bold'>Check-In</h2>
            <button
              onClick={handleCheckIn}
              disabled={isLoading || tokens <= 0}
              className='w-full bg-[#2196f3] hover:bg-[#1c1f2a] border-2 border-[#2196f3] text-white text-center py-3 px-4 rounded-lg transition-colors disabled:opacity-50 mt-12'
            >
              {isLoading ? 'Checking In...' : 'Check-In Now'}
            </button>
          </div>
          </div>

          {/* Visit History Card */}
          <div className='bg-[#1c1f2a] rounded-lg p-6'>
            <h2 className='text-xl text-white font-bold mb-4'>Recent Visits</h2>
            <div className='space-y-4'>
              {recentVisits.map((visit, index) => (
                <div
                  key={index}
                  className='bg-[#2c2f3a] p-3 rounded-lg flex justify-between items-center'
                >
                  <div>
                    <p className='text-white'>{visit.date}</p>
                    <p className='text-gray-400'>{visit.time}</p>
                  </div>
                  <span className='text-gray-400'>{visit.duration}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Profile Section */}
        <div className='mt-8 bg-[#1c1f2a] rounded-lg p-6'>
          <h2 className='text-xl text-white font-bold mb-6'>Profile</h2>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
            <div>
              <div className='bg-[#2c2f3a] p-4 rounded-lg text-center'>
                <FaUser className='text-[#2196f3] text-4xl mb-4' />
                <h3 className='text-xl text-white font-bold mb-2'>Prashanth</h3>
                <p className='text-gray-400'>Member Since: July 2025</p>
              </div>
            </div>
            
            <div>
              <div className='bg-[#2c2f3a] p-4 rounded-lg'>
                <h3 className='text-xl text-white font-bold mb-4'>Profile Settings</h3>
                <div className='space-y-4'>
                  <div>
                    <label className='text-white block mb-2'>Name</label>
                    <input
                      type='text'
                      className='w-full px-3 py-2 rounded-lg bg-[#2c2f3a] text-white border border-gray-600 focus:outline-none focus:border-[#2196f3]'
                      defaultValue='John Doe'
                    />
                  </div>
                  <div>
                    <label className='text-white block mb-2'>Email</label>
                    <input
                      type='email'
                      className='w-full px-3 py-2 rounded-lg bg-[#2c2f3a] text-white border border-gray-600 focus:outline-none focus:border-[#2196f3]'
                      defaultValue='prashanth@gmail.com'
                    />
                  </div>
                  <div>
                  <label className='text-white block mb-2'>Password</label>
                  <div className='relative'>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className='w-full px-3 py-2 pr-10 rounded-lg bg-[#2c2f3a] text-white border border-gray-600 focus:outline-none focus:border-[#2196f3]'
                      placeholder=''
                    />
                    <button
                      type='button'
                      onClick={() => setShowPassword(!showPassword)}
                      className='absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white'
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <FaEyeSlash className='h-5 w-5 text-gray-400 hover:text-[#2196f3]' />
                      ) : (
                        <FaEye className='h-5 w-5 text-gray-400 hover:text-[#2196f3]' />
                      )}
                    </button>
                  </div>
                </div>
                  <button
                    className='w-full bg-[#2196f3] hover:bg-[#1c1f2a] border-2 border-[#2196f3] text-white py-2 px-4 rounded-lg transition-colors'
                  >
                    Update Profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberDashboard;
