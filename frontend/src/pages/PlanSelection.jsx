import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaCalendarCheck, FaCreditCard } from 'react-icons/fa';

const PlanSelection = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState(null);

  const plans = [
    {
      id: 'weekly',
      name: 'Weekly Plan',
      tokens: 7,
      price: 1000,
      duration: '7 days'
    },
    {
      id: 'monthly',
      name: 'Monthly Plan',
      tokens: 30,
      price: 4000,
      duration: '30 days'
    },
    {
      id: 'yearly',
      name: 'Yearly Plan',
      tokens: 365,
      price: 40000,
      duration: '365 days'
    }
  ];

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
    navigate('/member/payment', { state: { plan } });
  };

  return (
    <div className='min-h-screen bg-[#0e121d] py-10'>
      <div className='container mx-auto px-4'>
        <h1 className='text-3xl text-white font-bold mb-8'>Choose Your Plan</h1>
        
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
          {plans.map((plan) => (
            <div
              key={plan.id}
              className='bg-[#1c1f2a] rounded-lg p-6 text-center hover:shadow-lg transition-all'
              onClick={() => handlePlanSelect(plan)}
            >
              <div className='mb-4'>
                <FaCalendarCheck className='text-[#2196f3] text-4xl mb-4' />
                <h3 className='text-xl text-white font-bold mb-2'>{plan.name}</h3>
              </div>
              <div className='mb-4'>
                <p className='text-2xl font-bold text-[#2196f3]'>Rs.{plan.price}</p>
                <p className='text-gray-400'>Per {plan.duration}</p>
              </div>
              <div className='mb-4'>
                <p className='text-white'>Tokens Included: {plan.tokens}</p>
              </div>
              <button
                className='w-full bg-[#2196f3] hover:bg-[#1c1f2a] border-2 border-[#2196f3] text-white py-2 px-4 rounded-lg transition-colors'
              >
                Choose Plan
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlanSelection;
