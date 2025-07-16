import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaCreditCard, FaCheckCircle } from 'react-icons/fa';

const MockPayment = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [plan] = useState(window.location.state?.plan);

  const handlePayment = () => {
    setIsLoading(true);
    setTimeout(() => {
      toast.success('Payment successful!');
      navigate('/member/dashboard');
    }, 2000);
  };

  return (
    <div className='min-h-screen bg-[#0e121d] py-10'>
      <div className='container mx-auto px-4'>
        <div className='max-w-md mx-auto bg-[#1c1f2a] rounded-lg p-8'>
          <h2 className='text-2xl text-white font-bold mb-6 text-center'>Payment Details</h2>
          
          <div className='bg-[#2c2f3a] p-4 rounded-lg mb-6'>
            <h3 className='text-white font-semibold mb-2'>Selected Plan</h3>
            <p className='text-gray-400'>₹{plan?.price || '0'} for {plan?.duration || '0'} days</p>
            <p className='text-gray-400'>Tokens Included: {plan?.tokens || '0'}</p>
          </div>

          <div className='space-y-4'>
            <div className='flex items-center space-x-3'>
              <FaCreditCard className='text-[#2196f3] text-xl' />
              <div>
                <h3 className='text-white font-semibold'>Payment Method</h3>
                <p className='text-gray-400'>Credit/Debit Card</p>
              </div>
            </div>

            <div className='flex items-center space-x-3'>
              <FaCheckCircle className='text-[#2196f3] text-xl' />
              <div>
                <h3 className='text-white font-semibold'>Secure Payment</h3>
                <p className='text-gray-400'>100% secure transaction</p>
              </div>
            </div>

            <button
              onClick={handlePayment}
              disabled={isLoading}
              className='w-full bg-[#2196f3] hover:bg-[#1c1f2a] border-2 border-[#2196f3] text-white py-3 px-4 rounded-lg transition-colors disabled:opacity-50'
            >
              {isLoading ? 'Processing...' : 'Pay Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MockPayment;
