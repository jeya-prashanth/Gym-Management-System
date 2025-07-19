import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Member from '../models/Member.js';
import Gym from '../models/Gym.js';
import asyncHandler from 'express-async-handler';

const registerMember = async (req, res) => {
  console.log('=== REGISTRATION REQUEST ===');
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  
  try {
    // 1. Basic validation
    const { name, email, password, phone } = req.body;
    
    if (!name || !email || !password) {
      const error = new Error('Name, email, and password are required');
      console.error('Validation error:', error.message);
      return res.status(400).json({ 
        success: false,
        message: error.message 
      });
    }

    // 2. Check if user exists
    console.log('Checking if user exists...');
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.error('User already exists with email:', email);
      return res.status(400).json({ 
        success: false,
        message: 'User already exists with this email' 
      });
    }

    // 3. Create user
    console.log('Creating user...');
    const user = new User({
      name,
      email,
      password,
      role: 'member',
      phone: phone || undefined,
      isActive: true
    });
    
    // Save user
    console.log('Saving user to database...');
    await user.save();
    console.log('User created successfully:', user._id);
    
    // 4. Create member profile
    console.log('Creating member profile...');
    const memberId = `MEM${Date.now().toString().slice(-6)}`;
    const member = new Member({
      user: user._id,
      memberId,
      tokenBalance: 10,
      isActive: true
    });
    
    await member.save();
    console.log('Member profile created successfully:', member._id);
    
    // 5. Generate token
    console.log('Generating auth token...');
    const token = generateToken(user._id, user.role);
    
    console.log('=== REGISTRATION SUCCESSFUL ===');
    
    // 6. Send success response
    return res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token
      }
    });
    
  } catch (error) {
    console.error('\n=== REGISTRATION ERROR ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      console.error('Validation errors:', messages);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }
    
    console.error('Error stack:', error.stack);
    
    // If it's a duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const value = error.keyValue[field];
      console.error(`Duplicate key error: ${field} "${value}" already exists`);
      return res.status(400).json({
        success: false,
        message: `${field} "${value}" is already in use`,
        field,
        value
      });
    }
    
    // Default error response
    console.error('Unexpected error during registration:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        name: error.name,
        ...(error.code && { code: error.code }),
        ...(error.keyPattern && { keyPattern: error.keyPattern }),
        ...(error.keyValue && { keyValue: error.keyValue })
      } : undefined
    });
  }
};

const login = asyncHandler(async (req, res) => {
  try {
    console.log('Login attempt with data:', { email: req.body.email });
    
    const { email, password } = req.body;
    
    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    console.log('User found:', user ? 'Yes' : 'No');

    if (!user) {
      console.log('No user found with email:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    console.log('Password match:', isMatch);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      console.log('Account is deactivated for user:', user._id);
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

    try {
      if (user.role === 'member') {
        const member = await Member.findOne({ user: user._id });
        if (member) {
          userData.memberId = member.memberId;
          userData.tokenBalance = member.tokenBalance;
        }
      } else if (user.role === 'gym') {
        const gym = await Gym.findOne({ owner: user._id });
        if (gym) {
          userData.gymId = gym._id;
          userData.gymName = gym.name;
        } else {
          console.log('No gym found for user:', user._id);
        }
      }
    } catch (profileError) {
      console.error('Error fetching profile data:', profileError);
      return res.status(500).json({ 
        message: 'Error fetching profile data',
        error: profileError.message 
      });
    }

    console.log('Login successful for user:', user._id);
    res.json(userData);
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Server error during login',
      error: error.message 
    });
  }
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

const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return res.status(401).json({ message: 'No refresh token provided' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const accessToken = generateToken(decoded.id, decoded.role, '15m');
    
    res.status(200).json({ accessToken });
  } catch (error) {
    console.error('Refresh token error:', error);
    return res.status(403).json({ message: 'Invalid refresh token' });
  }
});

const revokeTokens = asyncHandler(async (req, res) => {
  // In a real app, you would add the refresh token to a blacklist
  res.status(200).json({ message: 'All refresh tokens have been revoked' });
});

export {
  registerMember,
  login,
  getMe,
  updateProfile,
  logout,
  refreshToken,
  revokeTokens,
  generateToken
};
