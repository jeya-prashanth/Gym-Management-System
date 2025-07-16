import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash, FaUser } from 'react-icons/fa';

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    profilePicture: null
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'file' ? files[0] : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Basic validation
      if (formData.password !== formData.confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }

      // Create form data for file upload
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null) {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Add role as 'member'
      formDataToSend.append('role', 'member');

      // Here you would typically make an API call to your backend
      // Example:
      // const response = await fetch('/api/members/signup', {
      //   method: 'POST',
      //   body: formDataToSend,
      //   // Don't set Content-Type header when using FormData
      //   // The browser will set it automatically with the correct boundary
      //   headers: {
      //     'Accept': 'application/json'
      //   }
      // });
      
      // For now, just simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // If successful
      toast.success('Member registration successful! Please login.');
      navigate('/login');
    } catch (error) {
      console.error('Signup error:', error);
      toast.error(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-[#0e121d] p-4'>
      <div className='bg-[#1c1f2a] p-6 rounded-lg w-full max-w-2xl'>
        <div className='text-center mb-6'>
          <div className='flex justify-center mb-4'>
            <FaUser className='text-4xl text-[#2196f3]' />
          </div>
          <h2 className='text-2xl text-white font-bold'>Member Registration</h2>
          <p className='text-gray-400 mt-1'>Create your member account</p>
        </div>
        
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label htmlFor='firstName' className='block text-sm text-white font-medium mb-1'>First Name</label>
              <input
                type='text'
                id='firstName'
                name='firstName'
                value={formData.firstName}
                onChange={handleChange}
                className='w-full px-3 py-2 rounded-lg bg-[#2c2f3a] text-white border border-gray-600 focus:outline-none focus:border-[#2196f3]'
                required
              />
            </div>
            <div>
              <label htmlFor='lastName' className='block text-sm text-white font-medium mb-1'>Last Name</label>
              <input
                type='text'
                id='lastName'
                name='lastName'
                value={formData.lastName}
                onChange={handleChange}
                className='w-full px-3 py-2 rounded-lg bg-[#2c2f3a] text-white border border-gray-600 focus:outline-none focus:border-[#2196f3]'
                required
              />
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label htmlFor='email' className='block text-sm text-white font-medium mb-1'>Email</label>
              <input
                type='email'
                id='email'
                name='email'
                value={formData.email}
                onChange={handleChange}
                className='w-full px-3 py-2 rounded-lg bg-[#2c2f3a] text-white border border-gray-600 focus:outline-none focus:border-[#2196f3]'
                required
              />
            </div>
            <div>
              <label htmlFor='phone' className='block text-sm text-white font-medium mb-1'>Phone Number</label>
              <input
                type='tel'
                id='phone'
                name='phone'
                value={formData.phone}
                onChange={handleChange}
                className='w-full px-3 py-2 rounded-lg bg-[#2c2f3a] text-white border border-gray-600 focus:outline-none focus:border-[#2196f3]'
                required
              />
            </div>
          </div>

          {/* <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label htmlFor='dob' className='block text-sm text-white font-medium mb-1'>Date of Birth</label>
              <input
                type='date'
                id='dob'
                name='dob'
                value={formData.dob}
                onChange={handleChange}
                className='w-full px-3 py-2 rounded-lg bg-[#2c2f3a] text-white border border-gray-600 focus:outline-none focus:border-[#2196f3]'
                required
              />
            </div>
            <div>
              <label htmlFor='gender' className='block text-sm text-white font-medium mb-1'>Gender</label>
              <select
                id='gender'
                name='gender'
                value={formData.gender}
                onChange={handleChange}
                className='w-full px-3 py-2 rounded-lg bg-[#2c2f3a] text-white border border-gray-600 focus:outline-none focus:border-[#2196f3]'
                required
              >
                <option value='male'>Male</option>
                <option value='female'>Female</option>
                <option value='other'>Other</option>
              </select>
            </div>
          </div> */}

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='relative'>
              <label htmlFor='password' className='block text-sm text-white font-medium mb-1'>Password</label>
              <div className='relative'>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id='password'
                  name='password'
                  value={formData.password}
                  onChange={handleChange}
                  minLength='6'
                  className='w-full px-3 py-2 rounded-lg bg-[#2c2f3a] text-white border border-gray-600 focus:outline-none focus:border-[#2196f3] pr-10'
                  required
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#2196f3]'
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              <p className='text-xs text-gray-400 mt-1'>Minimum 6 characters</p>
            </div>

            <div className='relative'>
              <label htmlFor='confirmPassword' className='block text-sm text-white font-medium mb-1'>Confirm Password</label>
              <div className='relative'>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id='confirmPassword'
                  name='confirmPassword'
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className='w-full px-3 py-2 rounded-lg bg-[#2c2f3a] text-white border border-gray-600 focus:outline-none focus:border-[#2196f3] pr-10'
                  required
                />
                <button
                  type='button'
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#2196f3]'
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor='profilePicture' className='block text-sm text-white font-medium mb-1'>Profile Picture</label>
            <input
              type='file'
              id='profilePicture'
              name='profilePicture'
              accept='image/*'
              onChange={handleChange}
              className='w-full px-3 py-2 rounded-lg bg-[#2c2f3a] text-white border border-gray-600 focus:outline-none focus:border-[#2196f3] file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#2196f3] file:text-white hover:file:bg-[#1c7ed6]'
            />
          </div>

          <button
            type='submit'
            disabled={isLoading}
            className={`w-full bg-[#1c1f2a] border-2 border-[#2196f3] hover:bg-[#2196f3] text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center ${
              isLoading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="border-4 border-t-4 border-white border-solid rounded-full w-5 h-5 animate-spin" />
                  Creating Account...
                </div>
              ) : (
                'Create Account'
            )}
          </button>
        </form>

        <div className='text-center mt-4'>
          <p className='text-sm text-white'>
            Already have an account?{' '}
            <Link to='/login' className='text-[#2196f3] hover:underline font-medium'>
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;