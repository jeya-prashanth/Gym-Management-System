import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaBuilding, FaChartLine, FaDownload, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

const AdminDashboard = () => {
  const navigate = useNavigate();
  
  const navigateToCreateGym = () => {
    navigate('/admin/create-gym');
  };
  // Mock data for gyms
  const gyms = [
    { id: 1, name: 'Fitness Hub', members: 500, location: 'City Center' },
    { id: 2, name: 'Power Gym', members: 300, location: 'East Side' },
    { id: 3, name: 'Elite Fitness', members: 400, location: 'West Side' }
  ];

  // Mock data for members
  const members = [
    { id: 1, name: 'John Doe', email: 'john@example.com', tokens: 30, lastVisit: '2025-07-15' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', tokens: 15, lastVisit: '2025-07-14' },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com', tokens: 20, lastVisit: '2025-07-13' }
  ];

  // Mock system stats
  const stats = {
    totalMembers: 1200,
    activeMembers: 800,
    totalGyms: 3,
    tokenUsage: 7500,
    totalVisits: 2500
  };

  const [selectedTab, setSelectedTab] = useState('gyms');

  const handleExport = (format) => {
    // Get the current data based on active tab
    const exportData = selectedTab === 'gyms' ? [...gyms] : [...members];
    
    if (!exportData || exportData.length === 0) {
      alert('No data available to export');
      return;
    }

    try {
      let content, mimeType, extension;
      
      if (format === 'csv') {
        const headers = Object.keys(exportData[0]).join(',');
        const csvRows = exportData.map(item => 
          Object.values(item)
            .map(value => 
              typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
            )
            .join(',')
        );
        content = [headers, ...csvRows].join('\n');
        mimeType = 'text/csv';
        extension = 'csv';
      } else if (format === 'json') {
        content = JSON.stringify(exportData, null, 2);
        mimeType = 'application/json';
        extension = 'json';
      } else {
        throw new Error('Unsupported export format');
      }

      const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const fileName = `${selectedTab}_${new Date().toISOString().split('T')[0]}.${extension}`;
      
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
      
    } catch (error) {
      console.error('Export failed:', error);
      alert(`Failed to export data: ${error.message}`);
    }
  };

  const handleAction = (type, id) => {
    // Mock action handling
    alert(`Action ${type} triggered for ID: ${id}`);
  };

  return (
    <div className='min-h-screen bg-[#0e121d] py-10 mt-15 sm:mt-0'>
      <div className='container mx-auto px-4'>
        {/* System Stats */}
        <div className='bg-[#1c1f2a] rounded-lg p-6 mb-8'>
          <h2 className='text-xl text-white font-bold mb-6'>System Statistics</h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <div className='bg-[#2c2f3a] p-6 rounded-lg text-center'>
              <FaUser className='text-[#2196f3] text-3xl mb-4' />
              <h3 className='text-2xl text-white font-bold mb-2'>Total Members</h3>
              <p className='text-[#2196f3] text-4xl'>{stats.totalMembers}</p>
            </div>
            <div className='bg-[#2c2f3a] p-6 rounded-lg text-center'>
              <FaBuilding className='text-[#2196f3] text-3xl mb-4' />
              <h3 className='text-2xl text-white font-bold mb-2'>Total Gyms</h3>
              <p className='text-[#2196f3] text-4xl'>{stats.totalGyms}</p>
            </div>
            <div className='bg-[#2c2f3a] p-6 rounded-lg text-center'>
              <FaChartLine className='text-[#2196f3] text-3xl mb-4' />
              <h3 className='text-2xl text-white font-bold mb-2'>Active Members</h3>
              <p className='text-[#2196f3] text-4xl'>{stats.activeMembers}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className='mb-8'>
          <div className='bg-[#1c1f2a] rounded-lg p-4'>
            <button
              onClick={() => setSelectedTab('gyms')}
              className={`px-4 py-2 rounded-lg mr-10 transition-colors duration-200 ${
                selectedTab === 'gyms' ? 'bg-[#2196f3] text-white' : 'text-white hover:bg-[#2196f3]'
              }`}
            >
              Gyms List
            </button>
            <button
              onClick={() => setSelectedTab('members')}
              className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                selectedTab === 'members' ? 'bg-[#2196f3] text-white' : 'text-white hover:bg-[#2196f3]'
              }`}
            >
              Members List
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {selectedTab === 'gyms' ? (
          <div className='bg-[#1c1f2a] rounded-lg p-6'>
            <div className='flex justify-between items-center mb-6'>
              <h2 className='text-xl text-white font-bold'>Gyms</h2>
              <button
                onClick={navigateToCreateGym}
                className='flex items-center space-x-2 bg-[#2196f3] hover:bg-[#1c1f2a] border-2 border-[#2196f3] text-white px-4 py-2 rounded-lg transition-colors'
              >
                <FaPlus />
                <span>Add Gym</span>
              </button>
            </div>

            <div className='overflow-x-auto'>
              <table className='w-full text-white'>
                <thead>
                  <tr className='bg-[#2c2f3a]'>
                    <th className='px-6 py-3 text-left'>Gym Name</th>
                    <th className='px-6 py-3 text-left'>Members</th>
                    <th className='px-6 py-3 text-left'>Location</th>
                    <th className='px-6 py-3 text-left'>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {gyms.map((gym) => (
                    <tr key={gym.id} className='border-t border-gray-700'>
                      <td className='px-6 py-4'>{gym.name}</td>
                      <td className='px-6 py-4'>{gym.members}</td>
                      <td className='px-6 py-4'>{gym.location}</td>
                      <td className='px-6 py-4'>
                        <button
                          onClick={() => handleAction('edit', gym.id)}
                          className='text-[#2196f3] hover:text-white mr-4'
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleAction('delete', gym.id)}
                          className='text-red-500 hover:text-white'
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className='bg-[#1c1f2a] rounded-lg p-6'>
            <div className='flex justify-between items-center mb-6'>
              <h2 className='text-xl text-white font-bold'>Members</h2>
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
                    <th className='px-6 py-3 text-left'>Name</th>
                    <th className='px-6 py-3 text-left'>Email</th>
                    <th className='px-6 py-3 text-left'>Tokens</th>
                    <th className='px-6 py-3 text-left'>Last Visit</th>
                    <th className='px-6 py-3 text-left'>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => (
                    <tr key={member.id} className='border-t border-gray-700'>
                      <td className='px-6 py-4'>{member.name}</td>
                      <td className='px-6 py-4'>{member.email}</td>
                      <td className='px-6 py-4'>{member.tokens}</td>
                      <td className='px-6 py-4'>{member.lastVisit}</td>
                      <td className='px-6 py-4'>
                        <button
                          onClick={() => handleAction('edit', member.id)}
                          className='text-[#2196f3] hover:text-white mr-4'
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleAction('delete', member.id)}
                          className='text-red-500 hover:text-white'
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
