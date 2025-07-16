import React, { useState } from 'react';
import { FaEye, FaEyeSlash, FaTrash, FaSearch } from 'react-icons/fa';

const ManageMember = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showPassword, setShowPassword] = useState({});

  // Sample member data
  const [members, setMembers] = useState([
    {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '1234567890',
      tokens: 10,
      password: 'password123'
    },
    {
      id: 2,
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      phone: '9876543210',
      tokens: 5,
      password: 'securepass'
    },
    {
      id: 3,
      firstName: 'Alex',
      lastName: 'Johnson',
      email: 'alex.j@example.com',
      phone: '5551234567',
      tokens: 15,
      password: 'alexpass123'
    }
  ]);

  const togglePasswordVisibility = (id) => {
    setShowPassword(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Delete member
  const handleDeleteMember = (id) => {
    if (window.confirm('Are you sure you want to delete this member?')) {
      setMembers(members.filter(member => member.id !== id));
    }
  };

  // Filter members based on search term
  const filteredMembers = members.filter(member => 
    `${member.firstName} ${member.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.phone.includes(searchTerm)
  );

  return (
    <div className='p-6 mt-15 sm:mt-0'>
      <div className='flex justify-between items-center mb-6'>
        <h2 className='text-2xl font-bold text-white'>Manage Members</h2>
        <div className='relative w-64'>
          <input
            type='text'
            placeholder='Search members...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='w-full px-4 py-2 pl-10 bg-[#2c2f3a] text-white rounded-lg border border-gray-600 focus:outline-none focus:border-[#2196f3]'
          />
          <FaSearch className='absolute left-3 top-3 text-gray-400' />
        </div>
      </div>

      <div className='bg-[#1c1f2a] rounded-lg overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='min-w-full'>
            <thead>
              <tr className='bg-[#2c2f3a] text-left text-gray-300'>
                <th className='px-6 py-3'>Name</th>
                <th className='px-6 py-3'>Email</th>
                <th className='px-6 py-3'>Phone</th>
                <th className='px-6 py-3'>Tokens</th>
                <th className='px-6 py-3'>Password</th>
                <th className='px-6 py-3 text-center'>Actions</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-700'>
              {filteredMembers.length > 0 ? (
                filteredMembers.map(member => (
                  <tr key={member.id} className='hover:bg-[#2c2f3a] transition-colors'>
                    <td className='px-6 py-4 text-white'>
                      {`${member.firstName} ${member.lastName}`}
                    </td>
                    <td className='px-6 py-4 text-gray-300'>{member.email}</td>
                    <td className='px-6 py-4 text-gray-300'>{member.phone}</td>
                    <td className='px-6 py-4 text-gray-300'>{member.tokens}</td>
                    <td className='px-6 py-4'>
                      <div className='flex items-center text-gray-400'>
                        <span className='mr-2'>
                          {showPassword[member.id] ? member.password : '••••••••'}
                        </span>
                        <button
                          onClick={() => togglePasswordVisibility(member.id)}
                          className='text-gray-400 hover:text-[#2196f3]'
                        >
                          {showPassword[member.id] ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </td>
                    <td className='px-6 py-4 text-center'>
                      <button
                        onClick={() => handleDeleteMember(member.id)}
                        className='text-red-500 hover:text-red-400'
                        title='Delete Member'
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan='6' className='px-6 py-4 text-center text-gray-400'>
                    No members found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageMember;
