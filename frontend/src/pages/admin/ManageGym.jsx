import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaPlus, FaTrash, FaEdit, FaSearch, FaBuilding } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../utils/axios';
import { useAuth } from '../../contexts/AuthContext';

const ManageGym = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [gyms, setGyms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchGyms = async () => {
      try {
        setIsLoading(true);
        console.log('Fetching gyms...');
        const response = await api.get('/api/v1/gyms', {
          headers: {
            'Authorization': `Bearer ${user?.token}`
          }
        });
        
        console.log('API Response:', response);
        
        if (response.data && response.data.success) {
          setGyms(response.data.data || []);
          console.log('Gyms data set:', response.data.data);
        } else {
          console.error('Unexpected response format:', response.data);
          toast.error('Unexpected response format from server');
          setGyms([]);
        }
      } catch (error) {
        console.error('Error fetching gyms:', error);
        const errorMessage = error.response?.data?.message || 'Failed to load gyms. Please try again.';
        console.error('Error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        });
        toast.error(errorMessage);
        setGyms([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.token) {
      fetchGyms();
    } else {
      console.error('No user token found');
      setIsLoading(false);
      setGyms([]);
    }
  }, [user?.token]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this gym? This action cannot be undone.')) {
      try {
        await api.delete(`/api/v1/gyms/${id}`, {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        });
        setGyms(gyms.filter(gym => gym._id !== id));
        toast.success('Gym deleted successfully');
      } catch (error) {
        console.error('Error deleting gym:', error);
        const errorMessage = error.response?.data?.message || 'Failed to delete gym';
        toast.error(errorMessage);
      }
    }
  };

  // Removed unused togglePasswordVisibility function

  const filteredGyms = gyms.filter(gym => {
    if (!gym) return false;
    
    const searchableFields = ['name', 'email', 'phone', 'address'];
    return searchableFields.some(field => {
      // Safely access nested properties
      const value = field.split('.').reduce((obj, key) => 
        obj && typeof obj === 'object' ? obj[key] : null, gym);
      
      return value && String(value).toLowerCase().includes(searchTerm.toLowerCase());
    });
  });

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen bg-[#0e121d]'>
        <div className='text-white'>Loading gyms...</div>
      </div>
    );
  }

  return (
    <div className='bg-[#0e121d] min-h-screen p-6'>
      <div className='max-w-6xl mx-auto'>
        <div className='flex flex-col md:flex-row md:items-center md:justify-between mb-6 mt-15 sm:mt-0'>
          <h1 className='text-2xl font-bold text-white flex items-center mb-5'>
            <FaBuilding className='text-[#2196f3] mr-2' />
            Manage Gyms
          </h1>
          <div className='flex flex-col sm:flex-row gap-4 mt-4 sm:mt-0'>
            <div className='relative'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <FaSearch className='text-gray-400' />
              </div>
              <input
                type='text'
                placeholder='Search gyms...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='pl-10 pr-4 py-2 rounded-lg bg-[#2c2f3a] text-white border border-gray-600 focus:border-[#2196f3] focus:outline-none w-full'
              />
            </div>
            <button
              onClick={() => navigate('/admin/create-gym')}
              className='flex items-center justify-center px-4 py-2 bg-[#2196f3] hover:bg-[#1c1f2a] border-2 border-[#2196f3] text-white rounded-lg transition-colors'
            >
              <FaPlus className='mr-2' />
              Create Gym
            </button>
          </div>
        </div>

        <div className='bg-[#1c1f2a] rounded-lg shadow-lg overflow-hidden'>
          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-700'>
              <thead className='bg-[#252936]'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider'>Gym Name</th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider'>Location</th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider'>Email</th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider'>Phone</th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider'>Password</th>
                  <th className='px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider'>Actions</th>
                </tr>
              </thead>
              <tbody className='bg-[#1c1f2a] divide-y divide-gray-700'>
                {filteredGyms.length > 0 ? (
                  filteredGyms.map((gym) => (
                    <tr key={gym._id} className='hover:bg-[#252936]'>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-white'>
                        {gym.name || 'N/A'}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>
                        {gym.address || 'N/A'}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>
                        {gym.owner?.email || gym.email || 'N/A'}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>
                        {gym.phone || 'N/A'}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>
                        <div className='flex items-center'>
                          <span className='text-gray-500 italic'>Password hidden</span>
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                        <div className='flex justify-end space-x-2'>
                          <button
                            onClick={() => navigate(`/admin/edit-gym/${gym._id}`)}
                            className='text-blue-400 hover:text-blue-300 p-1 rounded-full hover:bg-blue-900/20 transition-colors'
                            title='Edit Gym'
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(gym._id)}
                            className='text-red-400 hover:text-red-300 p-1 rounded-full hover:bg-red-900/20 transition-colors'
                            title='Delete Gym'
                            disabled={isLoading}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan='6' className='px-6 py-4 text-center text-gray-400'>
                      No gyms found
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

export default ManageGym;
