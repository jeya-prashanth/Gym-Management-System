import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Member from '../models/Member.js';
import Gym from '../models/Gym.js';
import asyncHandler from 'express-async-handler';
import { validationResult } from 'express-validator';

const register = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password, role, phone, address } = req.body;

  if (await User.findOne({ email })) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const user = await User.create({
    name,
    email,
    password,
    role,
    phone,
    address,
    isActive: true
  });

  if (!user) {
    return res.status(400).json({ message: 'Invalid user data' });
  }

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
      address: user.address,
      isActive: true
    });
  }

  const token = generateToken(user._id, user.role);

  res.status(201).json({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  if (!user.isActive) {
    return res.status(403).json({ message: 'Account is deactivated' });
  }

  const token = generateToken(user._id, user.role);
  const userData = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token
  };

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

const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const userData = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    address: user.address,
    isActive: user.isActive
  };

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

const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const { name, email, phone, address, password } = req.body;
  
  user.name = name || user.name;
  user.email = email || user.email;
  user.phone = phone || user.phone;
  user.address = address || user.address;
  
  if (password) {
    user.password = password;
  }

  const updatedUser = await user.save();

  res.json({
    id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    role: updatedUser.role,
    phone: updatedUser.phone,
    address: updatedUser.address
  });
});

const logout = asyncHandler(async (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

export {
  register,
  login,
  getMe,
  updateProfile,
  logout
};
