import React, { useState } from 'react';
import { FaUser, FaCalendar, FaDownload, FaCog } from 'react-icons/fa';

const GymDashboard = () => {
  // Mock data for stats
  const stats = {
    daily: { members: 50, visits: 120 },
    weekly: { members: 250, visits: 650 },
    monthly: { members: 800, visits: 2500 },
    yearly: { members: 10000, visits: 30000 }
  };

  // Mock checked-in members data
  const checkedInMembers = [
    { id: 1, name: 'John Doe', time: '10:30 AM', duration: '1 hour 30 minutes' },
    { id: 2, name: 'Jane Smith', time: '10:45 AM', duration: '2 hours' },
    { id: 3, name: 'Mike Johnson', time: '11:00 AM', duration: '1 hour' },
    { id: 4, name: 'Sarah Wilson', time: '11:15 AM', duration: '1 hour 45 minutes' },
    { id: 5, name: 'David Brown', time: '11:30 AM', duration: '2 hours' }
  ];

  const [selectedPeriod, setSelectedPeriod] = useState('daily');
  const [isEditing, setIsEditing] = useState(false);

  const exportToCSV = (data, filename = 'export') => {
    // Convert array of objects to CSV string
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(obj => 
      Object.values(obj).map(value => 
        `"${value.toString().replace(/"/g, '\"')}"`
      ).join(',')
    );
    const csvContent = [headers, ...rows].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToJSON = (data, filename = 'export') => {
    // Convert data to JSON string with pretty print
    const jsonContent = JSON.stringify(data, null, 2);
    
    // Create download link
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExport = (format) => {
    // Prepare data for export (you can modify this based on what data you want to export)
    const exportData = checkedInMembers.map(member => ({
      'Member ID': member.id,
      'Name': member.name,
      'Check-in Time': member.time,
      'Duration': member.duration
    }));

    if (format === 'csv') {
      exportToCSV(exportData, 'gym_members');
    } else if (format === 'json') {
      exportToJSON(exportData, 'gym_members');
    }
  };

  const statsCards = [
    { id: 'daily', title: 'Daily', icon: <FaCalendar className='text-[#2196f3] text-2xl' /> },
    { id: 'weekly', title: 'Weekly', icon: <FaCalendar className='text-[#2196f3] text-2xl' /> },
    { id: 'monthly', title: 'Monthly', icon: <FaCalendar className='text-[#2196f3] text-2xl' /> },
    { id: 'yearly', title: 'Yearly', icon: <FaCalendar className='text-[#2196f3] text-2xl' /> }
  ];

  return (
    <div className='min-h-screen bg-[#0e121d] py-10 mt-8 sm:mt-0'>
      <div className='container mx-auto px-4'>
        {/* Stats Section */}
        <div className='mb-8'>
          <h1 className='text-2xl text-white font-bold mb-6'>Gym Statistics</h1>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
            {statsCards.map((card) => (
              <div
                key={card.id}
                className='bg-[#1c1f2a] rounded-lg p-6 cursor-pointer hover:shadow-lg transition-all'
                onClick={() => setSelectedPeriod(card.id)}
              >
                <div className='flex items-center justify-between mb-4'>
                  <div>
                    <h3 className='text-xl text-white font-bold'>{card.title}</h3>
                    <p className='text-gray-400'>Members: {stats[card.id].members}</p>
                    <p className='text-gray-400'>Visits: {stats[card.id].visits}</p>
                  </div>
                  {card.icon}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Checked-In Members Table */}
        <div className='bg-[#1c1f2a] rounded-lg p-6 mb-8'>
          <div className='flex justify-between items-center mb-6'>
            <h2 className='text-xl text-white font-bold'>Checked-In Members</h2>
            <div className='flex space-x-4'>
              <button
                onClick={() => handleExport('csv')}
                className='bg-[#2196f3] hover:bg-[#1c1f2a] border-2 border-[#2196f3] text-white px-4 py-2 rounded-lg transition-colors'
              >
                <FaDownload className='inline-block mr-2' />
                Export CSV
              </button>
              <button
                onClick={() => handleExport('json')}
                className='bg-[#2196f3] hover:bg-[#1c1f2a] border-2 border-[#2196f3] text-white px-4 py-2 rounded-lg transition-colors'
              >
                <FaDownload className='inline-block mr-2' />
                Export JSON
              </button>
            </div>
          </div>

          <div className='overflow-x-auto'>
            <table className='w-full text-white'>
              <thead>
                <tr className='bg-[#2c2f3a]'>
                  <th className='px-6 py-3 text-left'>Member Name</th>
                  <th className='px-6 py-3 text-left'>Check-In Time</th>
                  <th className='px-6 py-3 text-left'>Duration</th>
                </tr>
              </thead>
              <tbody>
                {checkedInMembers.map((member) => (
                  <tr key={member.id} className='border-t border-gray-700'>
                    <td className='px-6 py-4'>{member.name}</td>
                    <td className='px-6 py-4'>{member.time}</td>
                    <td className='px-6 py-4'>{member.duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Gym Profile Section */}
        <div className='bg-[#1c1f2a] rounded-lg p-6'>
          <div className='flex justify-between items-center mb-6'>
            <h2 className='text-xl text-white font-bold'>Gym Profile</h2>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className='bg-[#2196f3] hover:bg-[#1c1f2a] border-2 border-[#2196f3] text-white px-4 py-2 rounded-lg transition-colors'
            >
              {isEditing ? 'Save' : 'Edit'}
            </button>
          </div>

          <div className='grid grid-cols-1 gap-8'>
            <div className='bg-[#2c2f3a] p-6 rounded-lg text-center'>
              <FaUser className='text-[#2196f3] text-4xl mb-4' />
              <h3 className='text-xl text-white font-bold mb-2'>Fitness Hub</h3>
              <p className='text-gray-400'>Member Since: July 2025</p>
            </div>

            <div className='bg-[#2c2f3a] p-6 rounded-lg'>
              <div className='space-y-4'>
                <div>
                  <label className='text-white block mb-2'>Gym Name</label>
                  <input
                    type='text'
                    className='w-full px-3 py-2 rounded-lg bg-[#2c2f3a] text-white border border-gray-600 focus:outline-none focus:border-[#2196f3]'
                    defaultValue='Fitness Hub'
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label className='text-white block mb-2'>Email</label>
                  <input
                    type='email'
                    className='w-full px-3 py-2 rounded-lg bg-[#2c2f3a] text-white border border-gray-600 focus:outline-none focus:border-[#2196f3]'
                    defaultValue='gym@example.com'
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label className='text-white block mb-2'>Phone</label>
                  <input
                    type='tel'
                    className='w-full px-3 py-2 rounded-lg bg-[#2c2f3a] text-white border border-gray-600 focus:outline-none focus:border-[#2196f3]'
                    defaultValue='+91 1234567890'
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label className='text-white block mb-2'>Address</label>
                  <textarea
                    rows={3}
                    className='w-full px-3 py-2 rounded-lg bg-[#2c2f3a] text-white border border-gray-600 focus:outline-none focus:border-[#2196f3]'
                    defaultValue='123 Gym Street, City, Country'
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GymDashboard;
