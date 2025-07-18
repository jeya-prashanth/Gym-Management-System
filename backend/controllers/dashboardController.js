import Member from '../models/Member.js';
import Gym from '../models/Gym.js';
import Attendance from '../models/Attendance.js';
import TokenTransaction from '../models/TokenTransaction.js';
import Class from '../models/Class.js';
import asyncHandler from 'express-async-handler';

const getAdminDashboardStats = asyncHandler(async (req, res) => {
  const [
    totalMembers,
    activeMembers,
    totalGyms,
    recentTransactions,
    memberGrowth,
    tokenStats
  ] = await Promise.all([
    Member.countDocuments(),
    Member.countDocuments({ isActive: true }),
    Gym.countDocuments(),
    TokenTransaction.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('member', 'memberId')
      .populate('createdBy', 'name'),
    Member.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 12 }
    ]),
    TokenTransaction.aggregate([
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' }
        }
      }
    ])
  ]);

  const stats = {
    totalMembers,
    activeMembers,
    totalGyms,
    recentTransactions,
    memberGrowth,
    tokenUsage: tokenStats.reduce((acc, curr) => {
      acc[curr._id] = curr.total;
      return acc;
    }, {})
  };

  res.json({ success: true, data: stats });
});

const getGymDashboardStats = asyncHandler(async (req, res) => {
  const gymId = req.gym._id;
  const { period = 'daily' } = req.query;

  const dateFilter = getDateFilter(period);
  
  const [
    memberCount,
    checkIns,
    upcomingClasses,
    revenue
  ] = await Promise.all([
    Member.countDocuments({ gym: gymId, isActive: true }),
    Attendance.countDocuments({ 
      gym: gymId, 
      checkIn: { $gte: dateFilter } 
    }),
    Class.countDocuments({ 
      gym: gymId, 
      'schedule.startTime': { $gte: new Date() } 
    }),
    TokenTransaction.aggregate([
      { 
        $match: { 
          gym: gymId,
          type: 'debit',
          createdAt: { $gte: dateFilter }
        } 
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ])
  ]);

  res.json({
    success: true,
    data: {
      memberCount,
      checkIns,
      upcomingClasses,
      revenue: revenue[0]?.total || 0
    }
  });
});

const getMemberDashboardStats = asyncHandler(async (req, res) => {
  const memberId = req.member._id;

  const [
    tokenBalance,
    recentVisits,
    upcomingClasses
  ] = await Promise.all([
    Member.findById(memberId).select('tokenBalance'),
    Attendance.find({ member: memberId })
      .sort({ checkIn: -1 })
      .limit(5)
      .select('checkIn checkOut')
      .lean(),
    Class.find({ 
      'attendance.member': memberId,
      'schedule.startTime': { $gte: new Date() }
    })
    .sort({ 'schedule.startTime': 1 })
    .limit(3)
  ]);

  const formattedVisits = recentVisits.map(visit => ({
    date: formatDate(visit.checkIn),
    time: formatTime(visit.checkIn),
    duration: visit.checkOut 
      ? `${Math.round((visit.checkOut - visit.checkIn) / (1000 * 60 * 60 * 24 * 30))} months` 
      : 'In Progress'
  }));

  res.json({
    success: true,
    data: {
      tokenBalance: tokenBalance.tokenBalance,
      recentVisits: formattedVisits,
      upcomingClasses
    }
  });
});

const getGymMemberStats = asyncHandler(async (req, res) => {
  const gymId = req.gym._id;
  const { period = 'monthly' } = req.query;
  const dateFilter = getDateFilter(period);

  const stats = await Member.aggregate([
    {
      $match: { 
        gym: gymId,
        createdAt: { $gte: dateFilter }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { 
            format: period === 'yearly' ? '%Y' : '%Y-%m', 
            date: '$createdAt' 
          }
        },
        newMembers: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  res.json({ success: true, data: stats });
});

const getGymAttendanceStats = asyncHandler(async (req, res) => {
  const gymId = req.gym._id;
  const { period = 'monthly' } = req.query;
  const dateFilter = getDateFilter(period);

  const stats = await Attendance.aggregate([
    {
      $match: { 
        gym: gymId,
        checkIn: { $gte: dateFilter }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { 
            format: period === 'yearly' ? '%Y' : '%Y-%m', 
            date: '$checkIn' 
          }
        },
        checkIns: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  res.json({ success: true, data: stats });
});

// Helper functions
function getDateFilter(period) {
  const now = new Date();
  switch (period) {
    case 'daily':
      return new Date(now.setHours(0, 0, 0, 0));
    case 'weekly':
      return new Date(now.setDate(now.getDate() - 7));
    case 'monthly':
      return new Date(now.setMonth(now.getMonth() - 1));
    case 'yearly':
      return new Date(now.setFullYear(now.getFullYear() - 1));
    default:
      return new Date(0);
  }
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function formatTime(date) {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

export {
  getAdminDashboardStats,
  getGymDashboardStats,
  getMemberDashboardStats,
  getGymMemberStats,
  getGymAttendanceStats
};
