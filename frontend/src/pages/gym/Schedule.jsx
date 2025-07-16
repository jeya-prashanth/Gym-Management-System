import React, { useState } from 'react';
import { FaCalendarAlt, FaClock, FaUserTie, FaUsers, FaInfoCircle } from 'react-icons/fa';

const Schedule = () => {
  // Days of the week
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  // Time slots
  const timeSlots = ['06:00 AM', '08:00 AM', '10:00 AM', '04:00 PM', '06:00 PM', '08:00 PM'];
  
  // Mock schedule data
  const [schedule, setSchedule] = useState([
    {
      id: 1,
      className: 'Yoga',
      trainer: 'Alex Johnson',
      time: '06:00 AM',
      day: 'Monday',
      duration: '1h',
      capacity: 15,
      enrolled: 12
    },
    {
      id: 2,
      className: 'HIIT',
      trainer: 'Sarah Miller',
      time: '06:00 PM',
      day: 'Monday',
      duration: '45m',
      capacity: 20,
      enrolled: 18
    },
    {
      id: 3,
      className: 'Zumba',
      trainer: 'Mike Chen',
      time: '06:00 PM',
      day: 'Wednesday',
      duration: '1h',
      capacity: 25,
      enrolled: 22
    },
    {
      id: 4,
      className: 'Weight Training',
      trainer: 'David Wilson',
      time: '08:00 AM',
      day: 'Tuesday',
      duration: '1h 30m',
      capacity: 10,
      enrolled: 8
    },
    {
      id: 5,
      className: 'Pilates',
      trainer: 'Emma Davis',
      time: '10:00 AM',
      day: 'Thursday',
      duration: '1h',
      capacity: 12,
      enrolled: 10
    }
  ]);

  const [selectedDay, setSelectedDay] = useState('Monday');
  const [showModal, setShowModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);

  // Filter classes by selected day
  const filteredClasses = schedule.filter(cls => cls.day === selectedDay);

  // Group classes by time
  const scheduleByTime = timeSlots.map(time => ({
    time,
    classes: filteredClasses.filter(cls => cls.time === time)
  }));

  const handleClassClick = (cls) => {
    setSelectedClass(cls);
    setShowModal(true);
  };

  // Calculate progress percentage for the capacity bar
  const getProgressPercentage = (enrolled, capacity) => {
    return (enrolled / capacity) * 100;
  };

  return (
    <div className='min-h-screen bg-[#0e121d] py-8 px-4 mt-10 sm:mt-0'>
      <div className='max-w-6xl mx-auto'>
        <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-6'>
          <h1 className='text-2xl font-bold text-white mb-4 md:mb-0'>Class Schedule</h1>
          
          {/* Day Selector */}
          <div className='flex space-x-2 overflow-x-auto pb-2 w-full md:w-auto'>
            {days.map(day => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                  selectedDay === day
                    ? 'bg-[#2196f3] text-white'
                    : 'bg-[#2c2f3a] text-gray-300 hover:bg-[#3a3e4a]'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        {/* Schedule Table */}
        <div className='bg-[#1c1f2a] rounded-lg shadow-lg overflow-hidden'>
          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-700'>
              <thead className='bg-[#2c2f3a]'>
                <tr>
                  <th className='w-1/6 px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider whitespace-nowrap'>
                    Time
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider whitespace-nowrap'>
                    Class Details
                  </th>
                  <th className='w-1/4 px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider whitespace-nowrap'>
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className='bg-[#1c1f2a] divide-y divide-gray-700'>
                {scheduleByTime.map(({ time, classes }) => (
                  <tr key={time} className={classes.length === 0 ? 'h-16' : ''}>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>
                      <div className='flex items-center'>
                        <FaClock className='mr-2 text-[#2196f3]' />
                        {time}
                      </div>
                    </td>
                    <td className='px-6 py-4 min-w-[300px]'>
                      {classes.length > 0 ? (
                        classes.map((cls) => (
                          <div 
                            key={cls.id} 
                            className='mb-2 last:mb-0 p-3 bg-[#2c2f3a] rounded-lg cursor-pointer hover:bg-[#3a3e4a] transition-colors min-w-[280px]'
                            onClick={() => handleClassClick(cls)}
                          >
                            <div className='flex justify-between items-start'>
                              <div>
                                <h3 className='text-white font-medium'>{cls.className}</h3>
                                <div className='flex items-center mt-1 text-sm text-gray-400'>
                                  <FaUserTie className='mr-1' />
                                  <span>{cls.trainer}</span>
                                </div>
                              </div>
                              <span className='text-sm text-gray-400'>{cls.duration}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <span className='text-gray-500 text-sm'>No classes scheduled</span>
                      )}
                    </td>
                    <td className='px-6 py-4 min-w-[200px]'>
                      {classes.length > 0 ? (
                        classes.map((cls) => (
                          <div key={cls.id} className='mb-2 last:mb-0'>
                            <div className='flex justify-between text-sm text-gray-300 mb-1'>
                              <span>Available spots</span>
                              <span>{cls.capacity - cls.enrolled} of {cls.capacity}</span>
                            </div>
                            <div className='w-full bg-gray-700 rounded-full h-2.5'>
                              <div 
                                className={`h-2.5 rounded-full ${
                                  getProgressPercentage(cls.enrolled, cls.capacity) > 80 
                                    ? 'bg-red-500' 
                                    : getProgressPercentage(cls.enrolled, cls.capacity) > 50
                                    ? 'bg-yellow-500'
                                    : 'bg-green-500'
                                }`}
                                style={{ width: `${getProgressPercentage(cls.enrolled, cls.capacity)}%` }}
                              ></div>
                            </div>
                          </div>
                        ))
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Class Details Modal */}
      {showModal && selectedClass && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
          <div className='bg-[#1c1f2a] rounded-lg max-w-md w-full p-6 relative'>
            <button 
              onClick={() => setShowModal(false)}
              className='absolute top-4 right-4 text-gray-400 hover:text-white'
            >
              ✕
            </button>
            
            <h2 className='text-2xl font-bold text-white mb-2'>{selectedClass.className}</h2>
            <div className='space-y-4'>
              <div className='flex items-center text-gray-300'>
                <FaUserTie className='mr-2 text-[#2196f3]' />
                <span>{selectedClass.trainer}</span>
              </div>
              <div className='flex items-center text-gray-300'>
                <FaCalendarAlt className='mr-2 text-[#2196f3]' />
                <span>{selectedClass.day}, {selectedClass.time} ({selectedClass.duration})</span>
              </div>
              <div className='flex items-center text-gray-300'>
                <FaUsers className='mr-2 text-[#2196f3]' />
                <span>{selectedClass.enrolled} / {selectedClass.capacity} members enrolled</span>
              </div>
              
              <div className='pt-4 border-t border-gray-700'>
                <h3 className='font-medium text-white mb-2 flex items-center'>
                  <FaInfoCircle className='mr-2 text-[#2196f3]' />
                  Class Description
                </h3>
                <p className='text-gray-300 text-sm'>
                  {`This is a ${selectedClass.duration} ${selectedClass.className} class led by our professional trainer ${selectedClass.trainer}. `}
                  {selectedClass.className === 'Yoga' && 'Focus on flexibility, balance, and mindfulness with our expert yoga instructors.'}
                  {selectedClass.className === 'HIIT' && 'High-Intensity Interval Training to burn calories and improve cardiovascular health.'}
                  {selectedClass.className === 'Zumba' && 'Dance-based fitness that combines Latin and international music with dance moves.'}
                  {selectedClass.className === 'Weight Training' && 'Build strength and muscle with proper form and technique guidance.'}
                  {selectedClass.className === 'Pilates' && 'Improve flexibility, strength, and body awareness with controlled movements.'}
                </p>
              </div>
              
              <div className='flex justify-end space-x-3 pt-4'>
                <button 
                  onClick={() => setShowModal(false)}
                  className='px-4 py-2 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-700 transition-colors'
                >
                  Close
                </button>
                <button 
                  className='px-4 py-2 rounded-lg bg-[#2196f3] text-white hover:bg-blue-600 transition-colors'
                  onClick={() => {
                    alert(`You've been added to the ${selectedClass.className} class!`);
                    setShowModal(false);
                  }}
                >
                  Join Class
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Schedule;
