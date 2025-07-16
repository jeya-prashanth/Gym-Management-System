import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaSave, FaTimes, FaPhone, FaMapMarkerAlt, FaEnvelope, FaBuilding } from 'react-icons/fa';
import { toast } from 'react-toastify';

const EditGym = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    gymName: '',
    email: '',
    phoneNumber: '',
    place: '',
    password: '********' // Placeholder for password
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);

  // Fetch gym data when component mounts
  useEffect(() => {
    // Simulate API call to fetch gym data
    const fetchGymData = async () => {
      try {
        setIsLoading(true);
        // Replace with actual API call
        const mockGymData = {
          id,
          gymName: 'Fitness Center',
          email: 'fitness@example.com',
          phoneNumber: '9876543210',
          place: 'Chennai',
        };
        setFormData(prev => ({
          ...prev,
          ...mockGymData
        }));
      } catch (error) {
        toast.error('Failed to load gym data');
        console.error('Error fetching gym data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGymData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (isEditingPassword && formData.password.length < 6) {
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
      console.log('Updated gym data:', formData);
      toast.success('Gym updated successfully!');
      setIsLoading(false);
      navigate('/admin/manage-gyms');
    }, 1000);
  };

  const togglePasswordEdit = () => {
    if (isEditingPassword) {
      setFormData(prev => ({
        ...prev,
        password: '********'
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        password: ''
      }));
    }
    setIsEditingPassword(!isEditingPassword);
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen bg-[#0e121d]'>
        <div className='text-white'>Loading gym data...</div>
      </div>
    );
  }

  return (
    <div className='bg-[#0e121d] min-h-screen p-6'>
      <div className='max-w-3xl mx-auto'>
        <div className='bg-[#1c1f2a] rounded-lg shadow-lg p-6'>
          <div className='flex justify-between items-center mb-6'>
            <h1 className='text-2xl font-bold text-white flex items-center'>
              <FaBuilding className='text-[#2196f3] mr-2' />
              Edit Gym
            </h1>
            <button
              onClick={() => navigate('/admin/manage-gyms')}
              className='flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors'
            >
              <FaTimes className='mr-2' />
              Cancel
            </button>
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
              <div className='flex justify-between items-center mb-2'>
                <label className='text-gray-300'>Password</label>
                <button
                  type='button'
                  onClick={togglePasswordEdit}
                  className='text-sm text-[#2196f3] hover:underline'
                >
                  {isEditingPassword ? 'Cancel' : 'Change Password'}
                </button>
              </div>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <FaEye className='text-gray-400' />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name='password'
                  value={formData.password}
                  onChange={handleChange}
                  className='w-full pl-10 pr-12 py-3 rounded-lg bg-[#2c2f3a] text-white border border-gray-600 focus:border-[#2196f3] focus:outline-none'
                  placeholder='Password'
                  disabled={!isEditingPassword}
                  required={isEditingPassword}
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-[#2196f3]'
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {!isEditingPassword && (
                <p className='mt-1 text-xs text-gray-400'>
                  Click "Change Password" to update the password
                </p>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className='flex justify-end space-x-4 pt-4'>
              <button
                type='button'
                onClick={() => navigate('/admin/manage-gyms')}
                className='px-6 py-3 border border-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors'
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type='submit'
                disabled={isLoading}
                className='flex items-center px-6 py-3 bg-[#2196f3] hover:bg-[#1c1f2a] border-2 border-[#2196f3] text-white rounded-lg transition-colors disabled:opacity-50'
              >
                <FaSave className='mr-2' />
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditGym;
