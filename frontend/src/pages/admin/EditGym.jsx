import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaSave, FaTimes, FaPhone, FaMapMarkerAlt, FaEnvelope, FaBuilding } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../utils/axios';
import { useAuth } from '../../contexts/AuthContext';

const EditGym = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: '********' // Placeholder for password
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [originalData, setOriginalData] = useState(null);

  // Fetch gym data when component mounts
  useEffect(() => {
    const fetchGymData = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/api/v1/gyms/${id}`);
        const gymData = response.data.data;
        
        setOriginalData(gymData);
        setFormData({
          name: gymData.name,
          email: gymData.email,
          phone: gymData.phone,
          address: gymData.address,
          password: '********'
        });
      } catch (error) {
        console.error('Error fetching gym data:', error);
        const errorMessage = error.response?.data?.message || 'Failed to load gym data';
        toast.error(errorMessage);
        navigate('/admin/manage-gyms');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchGymData();
    }
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isEditingPassword && formData.password !== '********' && formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    
    if (!/^\d{10,15}$/.test(formData.phone)) {
      toast.error('Please enter a valid phone number (10-15 digits)');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Prepare update data
      const updateData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address
      };
      
      // Only include password if it was changed
      if (isEditingPassword && formData.password !== '********') {
        updateData.password = formData.password;
      }
      
      // Update gym data
      await api.put(`/api/v1/gyms/${id}`, updateData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        }
      });
      
      toast.success('Gym updated successfully!');
      navigate('/admin/manage-gyms');
    } catch (error) {
      console.error('Error updating gym:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update gym';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
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
                name='name'
                value={formData.name}
                onChange={handleChange}
                className='w-full pl-10 pr-4 py-3 rounded-lg bg-[#2c2f3a] text-white border border-gray-600 focus:border-[#2196f3] focus:outline-none'
                placeholder='Gym Name'
                required
                disabled={isLoading}
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
                name='phone'
                value={formData.phone}
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
                name='address'
                value={formData.address}
                onChange={handleChange}
                className='w-full pl-10 pr-4 py-3 rounded-lg bg-[#2c2f3a] text-white border border-gray-600 focus:border-[#2196f3] focus:outline-none'
                placeholder='Gym Location'
                required
              />
            </div>
            
            {/* Password */}
            <div className='relative mt-4'>
              <div className='flex justify-between items-center mb-2'>
                <label className='text-gray-300'>Password</label>
                <button
                  type='button'
                  onClick={togglePasswordEdit}
                  className='text-sm text-[#2196f3] hover:underline'
                  disabled={isLoading}
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
                  className='w-full pl-10 pr-12 py-3 rounded-lg bg-[#2c2f3a] text-white border border-gray-600 focus:border-[#2196f3] focus:outline-none disabled:opacity-50'
                  placeholder='Enter new password'
                  disabled={!isEditingPassword || isLoading}
                  required={isEditingPassword}
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-[#2196f3] disabled:opacity-50'
                  disabled={!isEditingPassword || isLoading}
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
            <div className='flex justify-end space-x-4 pt-6'>
              <button
                type='button'
                onClick={() => navigate('/admin/manage-gyms')}
                className='px-6 py-3 border border-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50'
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type='submit'
                disabled={isLoading}
                className={`flex items-center px-6 py-3 ${
                  isLoading ? 'bg-[#0d8aee]' : 'bg-[#2196f3] hover:bg-[#0d8aee]'
                } text-white rounded-lg font-medium transition-colors`}
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
