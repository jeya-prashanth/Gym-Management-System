import React, { useState } from 'react';
import { FaEye, FaEyeSlash, FaPlus, FaMapMarkerAlt, FaPhone, FaEnvelope, FaLock, FaBuilding } from 'react-icons/fa';
import { toast } from 'react-toastify';

const CreateGym = () => {
  const [formData, setFormData] = useState({
    gymName: '',
    email: '',
    phoneNumber: '',
    place: '',
    password: '',
    confirmPassword: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    
    if (!/^\d{10}$/.test(formData.phoneNumber)) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log('Gym data to be submitted:', formData);
      toast.success('Gym created successfully!');
      // Reset form
      setFormData({
        gymName: '',
        email: '',
        phoneNumber: '',
        place: '',
        password: '',
        confirmPassword: ''
      });
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className='bg-[#0e121d] min-h-screen p-6 mt-15 sm:mt-0'>
      <div className='max-w-2xl mx-auto'>
        <div className='bg-[#1c1f2a] rounded-lg shadow-lg p-6'>
          <div className='flex items-center mb-6'>
            <FaBuilding className='text-[#2196f3] text-2xl mr-2' />
            <h1 className='text-2xl font-bold text-white'>Create New Gym</h1>
          </div>
          
          <form onSubmit={handleSubmit} className='space-y-6'>
            {/* Gym Name */}
            <div className='relative'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <FaBuilding className='text-gray-400' />
              </div>
              <input
                type='text'
                name='gymName'
                value={formData.gymName}
                onChange={handleChange}
                className='w-full pl-10 pr-4 py-3 rounded-lg bg-[#2c2f3a] text-white border border-gray-600 focus:border-[#2196f3] focus:outline-none'
                placeholder='Gym Name'
                required
              />
            </div>
            
            {/* Email */}
            <div className='relative'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <FaEnvelope className='text-gray-400' />
              </div>
              <input
                type='email'
                name='email'
                value={formData.email}
                onChange={handleChange}
                className='w-full pl-10 pr-4 py-3 rounded-lg bg-[#2c2f3a] text-white border border-gray-600 focus:border-[#2196f3] focus:outline-none'
                placeholder='Email Address'
                required
              />
            </div>
            
            {/* Phone Number */}
            <div className='relative'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <FaPhone className='text-gray-400' />
              </div>
              <input
                type='tel'
                name='phoneNumber'
                value={formData.phoneNumber}
                onChange={handleChange}
                className='w-full pl-10 pr-4 py-3 rounded-lg bg-[#2c2f3a] text-white border border-gray-600 focus:border-[#2196f3] focus:outline-none'
                placeholder='Phone Number'
                pattern='[0-9]{10}'
                required
              />
            </div>
            
            {/* Place */}
            <div className='relative'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <FaMapMarkerAlt className='text-gray-400' />
              </div>
              <input
                type='text'
                name='place'
                value={formData.place}
                onChange={handleChange}
                className='w-full pl-10 pr-4 py-3 rounded-lg bg-[#2c2f3a] text-white border border-gray-600 focus:border-[#2196f3] focus:outline-none'
                placeholder='Gym Location'
                required
              />
            </div>
            
            {/* Password */}
            <div className='relative'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <FaLock className='text-gray-400' />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                name='password'
                value={formData.password}
                onChange={handleChange}
                className='w-full pl-10 pr-12 py-3 rounded-lg bg-[#2c2f3a] text-white border border-gray-600 focus:border-[#2196f3] focus:outline-none'
                placeholder='Password'
                required
              />
              <button
                type='button'
                onClick={() => setShowPassword(!showPassword)}
                className='absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-[#2196f3]'
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            
            {/* Confirm Password */}
            <div className='relative'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <FaLock className='text-gray-400' />
              </div>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name='confirmPassword'
                value={formData.confirmPassword}
                onChange={handleChange}
                className='w-full pl-10 pr-12 py-3 rounded-lg bg-[#2c2f3a] text-white border border-gray-600 focus:border-[#2196f3] focus:outline-none'
                placeholder='Confirm Password'
                required
              />
              <button
                type='button'
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className='absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-[#2196f3]'
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            
            {/* Submit Button */}
            <button
              type='submit'
              disabled={isLoading}
              className='w-full flex justify-center items-center space-x-2 bg-[#2196f3] hover:bg-[#1c1f2a] border-2 border-[#2196f3] text-white py-3 px-6 rounded-lg transition-colors disabled:opacity-50'
            >
              {isLoading ? (
                'Creating...'
              ) : (
                <>
                  <FaPlus />
                  <span>Create Gym</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateGym;
