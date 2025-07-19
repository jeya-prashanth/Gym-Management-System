import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const passwordRef = useRef(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleEmailKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (email.trim() === '') {
        setEmailError('Email is required');
        return;
      }
      if (!validateEmail(email)) {
        setEmailError('Please enter a valid email address');
        return;
      }
      setEmailError('');
      passwordRef.current?.focus();
    }
  };

  const handleEmailBlur = () => {
    if (email.trim() === '') {
      setEmailError('Email is required');
    } else if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      return;
    }

    try {
      setIsLoading(true);
      const result = await login(email, password);
      
      if (result?.success) {
        const redirectPath = result.role === 'admin' 
          ? '/admin/dashboard' 
          : result.role === 'gym' 
            ? '/gym/dashboard' 
            : '/member/dashboard';
        
        toast.success('Login successful!', {
          position: 'top-right',
          autoClose: 3000,
          theme:'dark'
        });
        
        // Small delay to show the success message before redirecting
        setTimeout(() => {
          navigate(redirectPath, { replace: true });
        }, 1000);
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Login failed. Please try again.';
      
      toast.error(errorMessage, {
        position: 'top-right',
        autoClose: 3000,
        theme:'dark'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center p-4'>
      <div className='bg-[#1c1f2a] p-8 rounded-lg w-full max-w-md shadow-xl border border-gray-700'>
        <h2 className='text-2xl text-white font-bold mb-6 text-center'>Login</h2>
        
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label htmlFor='email' className='block text-sm text-white font-medium mb-1'>Email</label>
            <input
              type='email'
              id='email'
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError('');
              }}
              onKeyDown={handleEmailKeyDown}
              onBlur={handleEmailBlur}
              className={`w-full px-4 py-2.5 rounded-lg bg-[#2c2f3a] text-white border ${emailError ? 'border-red-500' : 'border-gray-600'} focus:outline-none focus:border-[#2196f3] transition-colors`}
              placeholder='Enter your email'
              disabled={isLoading}
              autoComplete='email'
            />
            {emailError && <p className='mt-1 text-sm text-red-500'>{emailError}</p>}
          </div>

          <div className='relative'>
            <label htmlFor='password' className='block text-sm text-white font-medium mb-1'>Password</label>
            <div className='relative'>
              <input
                type={showPassword ? 'text' : 'password'}
                id='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                ref={passwordRef}
                className='w-full pr-10 px-4 py-2.5 rounded-lg bg-[#2c2f3a] text-white border border-gray-600 focus:outline-none focus:border-[#2196f3] transition-colors'
                placeholder='Enter your password'
                disabled={isLoading}
                autoComplete='current-password'
              />
              <button
                type='button'
                onClick={() => setShowPassword(!showPassword)}
                className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#2196f3] transition-colors'
                disabled={isLoading}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button
            type='submit'
            disabled={isLoading}
            className='w-full bg-[#1c1f2a] border-2 border-[#2196f3] hover:bg-[#2196f3] text-white py-2 px-4 rounded-lg transition-colors h-11 disabled:opacity-70 disabled:cursor-not-allowed'
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className='text-center mt-4'>
          <p className='text-sm text-white'>Don't have an account? <Link to='/signup' className='text-[#2196f3] hover:underline'>Sign up</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
