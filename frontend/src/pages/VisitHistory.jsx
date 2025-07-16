import React, { useState } from 'react';
import { FaCalendar, FaClock, FaSearch } from 'react-icons/fa';

const VisitHistory = () => {
  const [selectedDate, setSelectedDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock visit history data
  const visits = [
    {
      id: 1,
      date: '2025-07-15',
      time: '10:30 AM',
      duration: '1 hour 30 minutes'
    },
    {
      id: 2,
      date: '2025-07-14',
      time: '04:45 PM',
      duration: '2 hours'
    },
    {
      id: 3,
      date: '2025-07-13',
      time: '07:15 AM',
      duration: '1 hour'
    }
  ];

  // Filter visits based on date
  const filteredVisits = selectedDate 
    ? visits.filter(visit => visit.date === selectedDate)
    : visits;

  return (
    <div className='min-h-screen bg-[#0e121d] py-6 sm:py-10 px-4 mt-5 sm:mt-0'>
      <div className='max-w-4xl mx-auto'>
        <h1 className='text-2xl font-bold text-white mb-6'>Visit History</h1>
        
        {/* Date Filter */}
        <div className='flex flex-col sm:flex-row gap-4 mb-6'>
          <div className='relative flex-1'>
            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
              <FaSearch className='text-gray-400' />
            </div>
            <input
              type='text'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder='Search by date...'
              className='w-full pl-10 pr-4 py-2 rounded-lg bg-[#1c1f2a] text-white border border-gray-600 focus:outline-none focus:border-[#2196f3]'
            />
          </div>
          
          <div className='relative'>
            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
              <FaCalendar className='text-gray-400' />
            </div>
            <input
              type='date'
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className='pl-10 pr-4 py-2 rounded-lg bg-[#1c1f2a] text-white border border-gray-600 focus:outline-none focus:border-[#2196f3]'
            />
          </div>
        </div>

        {/* Visits List */}
        <div className='bg-[#1c1f2a] rounded-lg overflow-hidden shadow-lg'>
          {filteredVisits.length > 0 ? (
            <div className='divide-y divide-gray-700'>
              {filteredVisits.map((visit) => (
                <div key={visit.id} className='p-4 hover:bg-[#2c2f3a] transition-colors'>
                  <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
                    <div className='flex items-center space-x-4'>
                      <div className='p-3 rounded-full bg-[#2c2f3a]'>
                        <FaCalendar className='text-[#2196f3]' />
                      </div>
                      <div>
                        <h3 className='text-white font-medium'>{visit.date}</h3>
                        <div className='flex items-center space-x-2 text-sm text-gray-400 mt-1'>
                          <FaClock className='text-[#2196f3]' />
                          <span>{visit.time}</span>
                        </div>
                      </div>
                    </div>
                    <div className='px-4 py-2 bg-[#2c2f3a] rounded-full text-sm text-gray-300'>
                      {visit.duration}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='text-center py-12'>
              <p className='text-gray-400'>No visits found for selected date</p>
              {selectedDate && (
                <button
                  onClick={() => setSelectedDate('')}
                  className='mt-2 text-[#2196f3] hover:underline'
                >
                  Clear date filter
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VisitHistory;
