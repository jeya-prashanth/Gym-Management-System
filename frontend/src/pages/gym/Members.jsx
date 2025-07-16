import React, { useState, useEffect } from 'react';
import { FaSearch, FaClock, FaUser } from 'react-icons/fa';

const Members = () => {
  // Mock data - In a real app, this would come from your API
  const [members, setMembers] = useState([
    { id: 1, name: 'John Doe', checkInTime: '10:30 AM', duration: '1h 30m' },
    { id: 2, name: 'Jane Smith', checkInTime: '09:15 AM', duration: '2h 15m' },
    { id: 3, name: 'Mike Johnson', checkInTime: '11:00 AM', duration: '1h 45m' },
    { id: 4, name: 'Sarah Wilson', checkInTime: '08:45 AM', duration: '1h 15m' },
    { id: 5, name: 'David Brown', checkInTime: '02:30 PM', duration: '2h 0m' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredMembers, setFilteredMembers] = useState(members);

  // Filter members based on search term
  useEffect(() => {
    const results = members.filter(member =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredMembers(results);
  }, [searchTerm, members]);

  return (
    <div className='min-h-screen bg-[#0e121d] py-8 px-4 mt-10 sm:mt-0'>
      <div className='max-w-6xl mx-auto'>
        <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-6'>
          <h1 className='text-2xl font-bold text-white mb-4 md:mb-0'>Gym Members</h1>
          
          {/* Search Bar */}
          <div className='relative w-full md:w-64'>
            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
              <FaSearch className='text-gray-400' />
            </div>
            <input
              type='text'
              placeholder='Search members...'
              className='w-full pl-10 pr-4 py-2 rounded-lg bg-[#2c2f3a] text-white border border-gray-600 focus:outline-none focus:border-[#2196f3]'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Members List */}
        <div className='bg-[#1c1f2a] rounded-lg shadow-lg overflow-hidden'>
          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-700'>
              <thead className='bg-[#2c2f3a]'>
                <tr>
                  <th scope='col' className='px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider'>
                    Member
                  </th>
                  <th scope='col' className='px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider'>
                    Check-in Time
                  </th>
                  <th scope='col' className='px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider'>
                    Duration
                  </th>
                </tr>
              </thead>
              <tbody className='bg-[#1c1f2a] divide-y divide-gray-700'>
                {filteredMembers.length > 0 ? (
                  filteredMembers.map((member) => (
                    <tr key={member.id} className='hover:bg-[#2c2f3a] transition-colors'>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='flex items-center'>
                          <div className='flex-shrink-0 h-10 w-10 rounded-full bg-[#2c2f3a] flex items-center justify-center'>
                            <FaUser className='text-gray-400' />
                          </div>
                          <div className='ml-4'>
                            <div className='text-sm font-medium text-white'>{member.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300 flex items-center'>
                        <FaClock className='mr-2 text-[#2196f3]' />
                        {member.checkInTime}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>
                        {member.duration}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan='3' className='px-6 py-4 text-center text-gray-400'>
                      No members found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Members;