import React, { useState } from 'react';
import { FaUser, FaEnvelope, FaPhone, FaLock, FaEye, FaEyeSlash, FaCamera, FaSave } from 'react-icons/fa';

const Profile = () => {
  // Mock user data - replace with actual user data from your state/context
  const [user, setUser] = useState({
    firstName: 'Jeya',
    lastName: 'Prashanth',
    email: 'jeyaprashanth@gmail.com',
    phone: '+94 77 851 6783',
  });

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add your save logic here
    setIsEditing(false);
  };

  return (
    <div className='min-h-screen bg-[#0e121d] py-8 px-4'>
      <div className='max-w-4xl mx-auto'>
        <h1 className='text-2xl font-bold text-white mb-8'>Profile Settings</h1>
        
        <div className='bg-[#1c1f2a] rounded-lg shadow-lg overflow-hidden'>
          {/* Profile Header */}
          <div className='bg-[#2c2f3a] p-6 flex flex-col items-center'>
            <div className='relative mb-4 group'>
              <div className='w-32 h-32 rounded-full bg-[#2c2f3a] border-2 border-[#2196f3] overflow-hidden'>
                {profileImage ? (
                  <img 
                    src={profileImage} 
                    alt='Profile' 
                    className='w-full h-full object-cover'
                  />
                ) : (
                  <div className='w-full h-full flex items-center justify-center bg-[#1c1f2a]'>
                    <FaUser className='text-5xl text-gray-400' />
                  </div>
                )}
              </div>
              {isEditing && (
                <label className='absolute bottom-0 right-0 bg-[#2196f3] text-white p-2 rounded-full cursor-pointer hover:bg-blue-600 transition-colors'>
                  <FaCamera />
                  <input
                    type='file'
                    className='hidden'
                    accept='image/*'
                    onChange={handleImageChange}
                  />
                </label>
              )}
            </div>
            <h2 className='text-xl font-semibold text-white'>
              {user.firstName} {user.lastName}
            </h2>
            <p className='text-gray-400'>{user.email}</p>
          </div>

          {/* Profile Form */}
          <form onSubmit={handleSubmit} className='p-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              {/* First Name */}
              <div>
                <label className='block text-sm font-medium text-gray-300 mb-1'>First Name</label>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <FaUser className='text-gray-400' />
                  </div>
                  <input
                    type='text'
                    name='firstName'
                    value={user.firstName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full pl-10 pr-4 py-2 rounded-lg bg-[#2c2f3a] text-white border ${isEditing ? 'border-gray-500' : 'border-gray-600'} focus:outline-none focus:border-[#2196f3]`}
                  />
                </div>
              </div>

              {/* Last Name */}
              <div>
                <label className='block text-sm font-medium text-gray-300 mb-1'>Last Name</label>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <FaUser className='text-gray-400' />
                  </div>
                  <input
                    type='text'
                    name='lastName'
                    value={user.lastName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full pl-10 pr-4 py-2 rounded-lg bg-[#2c2f3a] text-white border ${isEditing ? 'border-gray-500' : 'border-gray-600'} focus:outline-none focus:border-[#2196f3]`}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className='block text-sm font-medium text-gray-300 mb-1'>Email</label>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <FaEnvelope className='text-gray-400' />
                  </div>
                  <input
                    type='email'
                    value={user.email}
                    disabled
                    className='w-full pl-10 pr-4 py-2 rounded-lg bg-[#2c2f3a] text-gray-400 border border-gray-600 cursor-not-allowed'
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className='block text-sm font-medium text-gray-300 mb-1'>Phone</label>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <FaPhone className='text-gray-400' />
                  </div>
                  <input
                    type='tel'
                    name='phone'
                    value={user.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full pl-10 pr-4 py-2 rounded-lg bg-[#2c2f3a] text-white border ${isEditing ? 'border-gray-500' : 'border-gray-600'} focus:outline-none focus:border-[#2196f3]`}
                  />
                </div>
              </div>

              {/* Password */}
              <div className='md:col-span-2'>
                <label className='block text-sm font-medium text-gray-300 mb-1'>Password</label>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <FaLock className='text-gray-400' />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={!isEditing}
                    className='w-full pl-10 pr-12 py-2 rounded-lg bg-[#2c2f3a] text-white border border-gray-600 focus:outline-none focus:border-[#2196f3]'
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword)}
                    className='absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-[#2196f3]'
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {isEditing && (
                  <p className='mt-1 text-xs text-gray-400'>
                    Leave blank to keep current password
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className='mt-8 flex justify-end space-x-3'>
              {isEditing ? (
                <>
                  <button
                    type='button'
                    onClick={() => setIsEditing(false)}
                    className='px-4 py-2 rounded-lg border border-gray-600 text-white hover:bg-gray-700 transition-colors'
                  >
                    Cancel
                  </button>
                  <button
                    type='submit'
                    className='px-4 py-2 rounded-lg bg-[#2196f3] text-white hover:bg-blue-600 transition-colors flex items-center space-x-2'
                  >
                    <FaSave />
                    <span>Save Changes</span>
                  </button>
                </>
              ) : (
                <button
                  type='button'
                  onClick={() => setIsEditing(true)}
                  className='px-4 py-2 rounded-lg bg-[#2196f3] text-white hover:bg-blue-600 transition-colors'
                >
                  Edit Profile
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
