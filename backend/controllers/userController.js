import User from '../models/User.js';
import Member from '../models/Member.js';
import Gym from '../models/Gym.js';
import asyncHandler from 'express-async-handler';
import { validationResult } from 'express-validator';
import { generateToken } from './authController.js';

const getUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const query = {};
  
  if (req.query.search) {
    const searchRegex = new RegExp(req.query.search, 'i');
    query.$or = [
      { name: searchRegex },
      { email: searchRegex },
      { phone: searchRegex }
    ];
  }

  if (req.query.role) {
    query.role = req.query.role;
  }

  const [users, total] = await Promise.all([
    User.find(query).select('-password').skip(skip).limit(limit).sort({ createdAt: -1 }),
    User.countDocuments(query)
  ]);

  res.json({
    count: users.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: users
  });
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const userData = user.toObject();
  
  if (user.role === 'member') {
    const member = await Member.findOne({ user: user._id });
    if (member) {
      userData.memberId = member.memberId;
      userData.tokenBalance = member.tokenBalance;
    }
  } else if (user.role === 'gym') {
    const gym = await Gym.findOne({ user: user._id });
    if (gym) {
      userData.gymId = gym._id;
      userData.gymName = gym.name;
    }
  }

  res.json(userData);
});

const createUser = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password, role, phone } = req.body;

  if (await User.findOne({ email })) {
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await User.create({
    name,
    email,
    password,
    role,
    phone,
    isActive: true
  });

  if (role === 'member') {
    await Member.create({
      user: user._id,
      memberId: `MEM${Date.now().toString().slice(-6)}`,
      tokenBalance: 10,
      isActive: true
    });
  } else if (role === 'gym') {
    await Gym.create({
      user: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      isActive: true
    });
  }

  const token = generateToken(user._id, user.role);

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    token
  });
});

const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(401);
    throw new Error('Not authorized to update this user');
  }

  const { name, email, phone, role, password } = req.body;
  
  user.name = name || user.name;
  user.email = email || user.email;
  user.phone = phone || user.phone;
  
  if (role && req.user.role === 'admin') {
    user.role = role;
  }

  if (password) {
    user.password = password;
  }

  const updatedUser = await user.save();

  res.json({
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    role: updatedUser.role,
    phone: updatedUser.phone
  });
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user._id.toString() === req.user._id.toString()) {
    res.status(400);
    throw new Error('Cannot delete your own account');
  }

  if (user.role === 'member') {
    await Member.findOneAndDelete({ user: user._id });
  } else if (user.role === 'gym') {
    await Gym.findOneAndDelete({ user: user._id });
  }

  await user.deleteOne();
  res.json({ message: 'User removed' });
});

const toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user._id.toString() === req.user._id.toString()) {
    res.status(400);
    throw new Error('Cannot deactivate your own account');
  }

  user.isActive = !user.isActive;
  await user.save();

  res.json({
    success: true,
    data: {
      _id: user._id,
      isActive: user.isActive
    }
  });
});

export {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus
};
