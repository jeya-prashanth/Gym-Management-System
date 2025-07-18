import User from '../models/User.js';
import Member from '../models/Member.js';
import Gym from '../models/Gym.js';
import TokenTransaction from '../models/TokenTransaction.js';
import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';

const getDashboardStats = asyncHandler(async (req, res) => {
  const [
    totalMembers,
    activeMembers,
    totalGyms,
    recentTransactions,
    memberGrowth,
    tokenUsage
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
      { $limit: 6 }
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
    tokenUsage: tokenUsage.reduce((acc, curr) => {
      acc[curr._id] = curr.total;
      return acc;
    }, {})
  };

  res.json({ success: true, data: stats });
});

const createGym = asyncHandler(async (req, res) => {
  const { name, email, phone, place, password } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const existingUser = await User.findOne({ email }).session(session);
    if (existingUser) {
      throw new Error('Email already in use');
    }

    const gymUser = await User.create([{
      name,
      email,
      password,
      phone,
      role: 'gym'
    }], { session });

    const gym = await Gym.create([{
      user: gymUser[0]._id,
      name,
      email,
      phone,
      place
    }], { session });

    await session.commitTransaction();

    res.status(201).json({
      success: true,
      data: {
        id: gym[0]._id,
        name: gym[0].name,
        email: gym[0].email,
        phone: gym[0].phone,
        place: gym[0].place
      }
    });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

const updateGym = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, place, password } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const gym = await Gym.findById(id).session(session);
    if (!gym) {
      throw new Error('Gym not found');
    }

    const updateData = { name, email, phone, place };
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        gym[key] = updateData[key];
      }
    });

    const user = await User.findById(gym.user).session(session);
    if (email) user.email = email;
    if (name) user.name = name;
    if (password) user.password = password;

    await Promise.all([
      gym.save({ session }),
      user.save({ session })
    ]);

    await session.commitTransaction();

    res.json({
      success: true,
      data: {
        id: gym._id,
        name: gym.name,
        email: gym.email,
        phone: gym.phone,
        place: gym.place
      }
    });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

const deleteGym = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const gym = await Gym.findById(id).session(session);
    if (!gym) {
      throw new Error('Gym not found');
    }

    await Promise.all([
      User.deleteOne({ _id: gym.user }).session(session),
      Gym.deleteOne({ _id: id }).session(session)
    ]);

    await session.commitTransaction();

    res.json({
      success: true,
      message: 'Gym deleted successfully'
    });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

const getGyms = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search = '' } = req.query;
  const skip = (page - 1) * limit;

  const query = {};
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { place: { $regex: search, $options: 'i' } }
    ];
  }

  const [gyms, total] = await Promise.all([
    Gym.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Gym.countDocuments(query)
  ]);

  res.json({
    success: true,
    count: gyms.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    data: gyms
  });
});

const getGymById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const gym = await Gym.findById(id).populate('user', 'name email phone');

  if (!gym) {
    res.status(404);
    throw new Error('Gym not found');
  }

  res.json({
    success: true,
    data: gym
  });
});

const getMembers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search = '', status } = req.query;
  const skip = (page - 1) * limit;

  const query = {};
  if (search) {
    query.$or = [
      { 'user.name': { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { memberId: { $regex: search, $options: 'i' } }
    ];
  }
  if (status === 'active') {
    query.isActive = true;
  } else if (status === 'inactive') {
    query.isActive = false;
  }

  const [members, total] = await Promise.all([
    Member.find(query)
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Member.countDocuments(query)
  ]);

  res.json({
    success: true,
    count: members.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    data: members
  });
});

export {
  getDashboardStats,
  createGym,
  updateGym,
  deleteGym,
  getGyms,
  getGymById,
  getMembers
};
