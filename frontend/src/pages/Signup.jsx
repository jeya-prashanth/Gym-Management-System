import React, { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash, FaUser } from 'react-icons/fa';
import api from '../utils/axios';

const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

const validatePhone = (phone) => {
  const re = /^[0-9]{10,15}$/;
  return re.test(phone);
};

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });
  
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validateForm = useCallback(() => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (formData.phone && !validatePhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number (10-15 digits)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);

    try {
      const { confirmPassword, ...registrationData } = formData;
      
      const response = await api.post('/auth/register', registrationData);
      
      toast.success('Registration successful! Redirecting to login...', {
        position: 'top-right',
        autoClose: 3000,
        onClose: () => navigate('/login')
      });
      
    } catch (error) {
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error.response) {
        switch (error.response.status) {
          case 1:
            errorMessage = error.response.data?.message || 'Invalid input data';
            break;
          case 2:
            errorMessage = 'An account with this email already exists';
            break;
          case 3:
            errorMessage = 'Server error. Please try again later.';
            break;
          default:
            errorMessage = error.response.data?.message || errorMessage;
        }
      } else if (error.request) {
        errorMessage = 'No response from server. Please check your connection.';
      }
      
      toast.error(errorMessage, {
        position: 'top-right',
        autoClose: 3000,
        theme : 'dark'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center p-4'>
      <div className='bg-[#1c1f2a] p-8 rounded-lg w-full max-w-md shadow-xl border border-gray-700'>
        <div className='text-center mb-8'>
          <div className='flex justify-center mb-4'>
            <div className='bg-[#2196f3] p-3 rounded-full'>
              <FaUser className='text-2xl text-white' />
            </div>
          </div>
          <h2 className='text-2xl text-white font-bold'>Member Registration</h2>
          <p className='text-gray-400 mt-2'>Create your member account to get started</p>
        </div>
        
        <form onSubmit={handleSubmit} className='space-y-5'>
          {/* Name Field */}
          <div>
            <label htmlFor='name' className='block text-sm text-white font-medium mb-1'>Full Name</label>
            <div className='relative'>
              <input
                type='text'
                id='name'
                name='name'
                value={formData.name}
                onChange={handleChange}
                className={'w-full px-4 py-2.5 rounded-lg bg-[#2c2f3a] text-white border ' + (errors.name ? 'border-red-500' : 'border-gray-600') + ' focus:outline-none focus:border-[#2196f3] transition-colors'}
                placeholder='Enter your full name'
              />
            </div>
            {errors.name && <p className='mt-1 text-sm text-red-400'>{errors.name}</p>}
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor='email' className='block text-sm text-white font-medium mb-1'>Email</label>
            <div className='relative'>
              <input
                type='email'
                id='email'
                name='email'
                value={formData.email}
                onChange={handleChange}
                className={'w-full px-4 py-2.5 rounded-lg bg-[#2c2f3a] text-white border ' + (errors.email ? 'border-red-500' : 'border-gray-600') + ' focus:outline-none focus:border-[#2196f3] transition-colors'}
                placeholder='Enter your email'
              />
            </div>
            {errors.email && <p className='mt-1 text-sm text-red-400'>{errors.email}</p>}
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {/* Password Field */}
            <div>
              <label htmlFor='password' className='block text-sm text-white font-medium mb-1'>Password</label>
              <div className='relative'>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id='password'
                  name='password'
                  value={formData.password}
                  onChange={handleChange}
                  className={'w-full pr-10 px-4 py-2.5 rounded-lg bg-[#2c2f3a] text-white border ' + (errors.password ? 'border-red-500' : 'border-gray-600') + ' focus:outline-none focus:border-[#2196f3] transition-colors'}
                  placeholder='Password'
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-[#2196f3] transition-colors'
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.password && <p className='mt-1 text-sm text-red-400'>{errors.password}</p>}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor='confirmPassword' className='block text-sm text-white font-medium mb-1'>Confirm Password</label>
              <div className='relative'>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id='confirmPassword'
                  name='confirmPassword'
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={'w-full pr-10 px-4 py-2.5 rounded-lg bg-[#2c2f3a] text-white border ' + (errors.confirmPassword ? 'border-red-500' : 'border-gray-600') + ' focus:outline-none focus:border-[#2196f3] transition-colors'}
                  placeholder='Confirm password'
                />
                <button
                  type='button'
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className='absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-[#2196f3] transition-colors'
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.confirmPassword && <p className='mt-1 text-sm text-red-400'>{errors.confirmPassword}</p>}
            </div>
          </div>

          {/* Phone Field */}
          <div>
            <label htmlFor='phone' className='block text-sm text-white font-medium mb-1'>Phone Number (Optional)</label>
            <div className='relative'>
              <input
                type='tel'
                id='phone'
                name='phone'
                value={formData.phone}
                onChange={handleChange}
                className={'w-full px-4 py-2.5 rounded-lg bg-[#2c2f3a] text-white border ' + (errors.phone ? 'border-red-500' : 'border-gray-600') + ' focus:outline-none focus:border-[#2196f3] transition-colors'}
                placeholder='Enter phone number'
              />
            </div>
            {errors.phone && <p className='mt-1 text-sm text-red-400'>{errors.phone}</p>}
            <p className='mt-1 text-xs text-gray-400'>9-15 digits, numbers only</p>
          </div>

          {/* Submit Button */}
          <button
            type='submit'
            disabled={isLoading}
            className='w-full bg-[#1c1f2a] border-2 border-[#2196f3] hover:bg-[#2196f3] text-white py-2 px-4 rounded-lg transition-colors h-11'
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>

          <div className='text-center'>
            <p className='text-sm text-gray-400'>
              Already have an account?{' '}
              <Link to='/login' className='text-[#2196f3] hover:underline font-medium'>
                Login
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;