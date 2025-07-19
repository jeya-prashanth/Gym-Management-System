import asyncHandler from 'express-async-handler';
import Gym from '../models/Gym.js';
import User from '../models/User.js';

export const getGyms = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const gyms = await Gym.find()
    .skip(skip)
    .limit(limit)
    .populate('owner', 'name email');

  const count = await Gym.countDocuments();

  res.json({
    success: true,
    count: gyms.length,
    total: count,
    data: gyms
  });
});

export const getGymById = asyncHandler(async (req, res) => {
  const gym = await Gym.findById(req.params.id).populate('owner', 'name email');
  
  if (!gym) {
    res.status(404);
    throw new Error('Gym not found');
  }

  res.json({
    success: true,
    data: gym
  });
});

export const searchGyms = asyncHandler(async (req, res) => {
  const { name } = req.query;
  
  let query = {};
  
  if (name) {
    query.name = { $regex: name, $options: 'i' };
  }

  const gyms = await Gym.find(query).limit(10);
  
  res.json({
    success: true,
    count: gyms.length,
    data: gyms
  });
});

export const getMyGym = asyncHandler(async (req, res) => {
  const gym = await Gym.findOne({ owner: req.user.id });
  
  if (!gym) {
    res.status(404);
    throw new Error('Gym not found for this user');
  }

  res.json({
    success: true,
    data: gym
  });
});

export const updateMyGym = asyncHandler(async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'email', 'phone', 'address', 'operatingHours', 'features'];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    res.status(400);
    throw new Error('Invalid updates!');
  }

  const gym = await Gym.findOne({ owner: req.user.id });
  
  if (!gym) {
    res.status(404);
    throw new Error('Gym not found');
  }

  updates.forEach(update => gym[update] = req.body[update]);
  await gym.save();

  res.json({
    success: true,
    data: gym
  });
});

export const createGym = asyncHandler(async (req, res) => {
  const { name, email, phone, address, password } = req.body;
  
  // Check if user with this email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400);
    throw new Error('User with this email already exists');
  }

  // Create user first
  const user = new User({
    name,
    email,
    password,
    phone,
    role: 'gym',
    isActive: true
  });

  await user.save();

  // Then create gym
  const gym = await Gym.create({
    name,
    email,
    phone,
    address,
    owner: user._id
  });

  // Update user with gym reference
  user.gym = gym._id;
  await user.save();

  res.status(201).json({
    success: true,
    data: {
      id: gym._id,
      name: gym.name,
      email: gym.email,
      phone: gym.phone,
      address: gym.address,
      owner: user._id
    }
  });
});

export const updateGym = asyncHandler(async (req, res) => {
  const gym = await Gym.findById(req.params.id);
  
  if (!gym) {
    res.status(404);
    throw new Error('Gym not found');
  }

  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'email', 'phone', 'address', 'operatingHours', 'features', 'isActive', 'owner'];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    res.status(400);
    throw new Error('Invalid updates!');
  }

  updates.forEach(update => gym[update] = req.body[update]);
  await gym.save();

  res.json({
    success: true,
    data: gym
  });
});

export const deleteGym = asyncHandler(async (req, res) => {
  const gym = await Gym.findByIdAndDelete(req.params.id);
  
  if (!gym) {
    res.status(404);
    throw new Error('Gym not found');
  }

  res.json({
    success: true,
    data: {}
  });
});

export const getGymMembers = asyncHandler(async (req, res) => {
  const gym = await Gym.findById(req.params.id).populate('members');
  
  if (!gym) {
    res.status(404);
    throw new Error('Gym not found');
  }

  res.json({
    success: true,
    count: gym.members.length,
    data: gym.members
  });
});

export const getGymClasses = asyncHandler(async (req, res) => {
  const gym = await Gym.findById(req.params.id).populate('classes');
  
  if (!gym) {
    res.status(404);
    throw new Error('Gym not found');
  }

  res.json({
    success: true,
    count: gym.classes ? gym.classes.length : 0,
    data: gym.classes || []
  });
});

export const getGymStats = asyncHandler(async (req, res) => {
  const gym = await Gym.findById(req.params.id);
  
  if (!gym) {
    res.status(404);
    throw new Error('Gym not found');
  }

  const stats = {
    totalMembers: gym.members ? gym.members.length : 0,
    totalClasses: gym.classes ? gym.classes.length : 0,
    active: gym.isActive,
    createdAt: gym.createdAt
  };

  res.json({
    success: true,
    data: stats
  });
});

export const getMyGymStats = asyncHandler(async (req, res) => {
  const gym = await Gym.findOne({ owner: req.user.id });
  
  if (!gym) {
    res.status(404);
    throw new Error('Gym not found');
  }

  const stats = {
    totalMembers: gym.members ? gym.members.length : 0,
    totalClasses: gym.classes ? gym.classes.length : 0,
    active: gym.isActive,
    createdAt: gym.createdAt
  };

  res.json({
    success: true,
    data: stats
  });
});
