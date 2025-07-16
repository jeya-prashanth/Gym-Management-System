import React from 'react';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Mock login - in real app, this would connect to backend
    if (email && password) {
      toast.success('Login successful!');
      // Redirect to appropriate dashboard based on role
      // In Phase 1, we'll use a mock role selection
      const role = window.prompt('Select role (member/gym/admin):');
      if (role) {
        navigate(`/${role === 'member' ? 'member' : role === 'gym' ? 'gym' : 'admin'}/dashboard`);
      }
    } else {
      toast.error('Please fill in all fields');
    }
  };

  return (
    <div className='min-h-screen bg-[#0e121d] flex items-center justify-center p-4'>
      <div className='bg-[#1c1f2a] p-8 rounded-lg w-full max-w-md'>
        <h2 className='text-2xl text-white font-bold mb-6 text-center'>Login</h2>
        
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label htmlFor='email' className='text-white block text-sm font-medium mb-1'>Email</label>
            <input
              type='email'
              id='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className='w-full px-3 py-2 rounded-lg bg-[#2c2f3a] text-white border border-gray-600 focus:outline-none focus:border-[#2196f3]'
              required
            />
          </div>

          <div className='relative'>
            <label htmlFor='password' className='text-white block text-sm font-medium mb-1'>Password</label>
            <div className='relative'>
              <input
                type={showPassword ? 'text' : 'password'}
                id='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
          </div>

          <button
            type='submit'
            className='w-full bg-[#1c1f2a] border-2 border-[#2196f3] hover:bg-[#2196f3] text-white py-2 px-4 rounded-lg transition-colors'
          >
            Login
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
