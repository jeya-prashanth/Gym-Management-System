import Member from '../models/Member.js';
import User from '../models/User.js';
import Attendance from '../models/Attendance.js';
import TokenTransaction from '../models/TokenTransaction.js';
import asyncHandler from 'express-async-handler';
import { validationResult } from 'express-validator';

const getMembers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const query = {};
  
  if (req.query.search) {
    const searchRegex = new RegExp(req.query.search, 'i');
    query.$or = [
      { memberId: searchRegex },
      { 'user.name': searchRegex },
      { 'user.email': searchRegex },
      { 'user.phone': searchRegex }
    ];
  }

  if (req.query.status) {
    query.isActive = req.query.status === 'active';
  }

  const [members, total] = await Promise.all([
    Member.find(query)
      .populate({
        path: 'user',
        select: 'name email phone'
      })
      .select('-__v')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),
    Member.countDocuments(query)
  ]);

  res.json({
    success: true,
    count: members.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: members
  });
});

const getMemberProfile = asyncHandler(async (req, res) => {
  const member = await Member.findOne({ user: req.user._id })
    .populate({
      path: 'user',
      select: 'name email phone'
    })
    .select('-__v');

  if (!member) {
    res.status(404);
    throw new Error('Member profile not found');
  }

  res.json({ success: true, data: member });
});

const getMemberById = asyncHandler(async (req, res) => {
  const member = await Member.findById(req.params.id)
    .populate({
      path: 'user',
      select: 'name email phone'
    })
    .select('-__v');

  if (!member) {
    res.status(404);
    throw new Error('Member not found');
  }

  res.json({ success: true, data: member });
});

const updateMemberProfile = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const user = await User.findById(req.user._id);
  if (user) {
    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;
    
    if (req.body.password) {
      user.password = req.body.password;
    }
    await user.save();
  }

  const member = await Member.findOne({ user: req.user._id });
  if (member) {
    member.emergencyContact = req.body.emergencyContact || member.emergencyContact;
    member.notes = req.body.notes || member.notes;
    await member.save();
  }

  const updatedMember = await Member.findOne({ user: req.user._id })
    .populate({
      path: 'user',
      select: 'name email phone'
    })
    .select('-__v');

  res.json({
    success: true,
    data: updatedMember
  });
});

const memberCheckIn = asyncHandler(async (req, res) => {
  const member = await Member.findOne({ user: req.user._id });
  
  if (!member) {
    res.status(404);
    throw new Error('Member profile not found');
  }

  if (!member.isActive) {
    res.status(400);
    throw new Error('Your account is not active. Please contact support.');
  }

  const activeCheckIn = await Attendance.findOne({
    member: member._id,
    checkOutTime: { $exists: false }
  });

  if (activeCheckIn) {
    res.status(400);
    throw new Error('You already have an active check-in. Please check out first.');
  }

  if (member.tokenBalance < 1) {
    res.status(400);
    throw new Error('Insufficient tokens. Please purchase more tokens.');
  }

  const checkIn = await Attendance.create({
    member: member._id,
    checkInTime: new Date(),
    tokenUsed: 1
  });

  member.tokenBalance -= 1;
  member.lastCheckIn = new Date();
  member.checkInCount += 1;
  await member.save();

  await TokenTransaction.create({
    member: member._id,
    type: 'debit',
    amount: 1,
    description: 'Gym check-in',
    reference: `CHECKIN-${checkIn._id}`
  });

  res.status(201).json({
    success: true,
    message: 'Check-in successful',
    data: {
      checkInId: checkIn._id,
      checkInTime: checkIn.checkInTime,
      remainingTokens: member.tokenBalance
    }
  });
});

const memberCheckOut = asyncHandler(async (req, res) => {
  const member = await Member.findOne({ user: req.user._id });
  
  if (!member) {
    res.status(404);
    throw new Error('Member profile not found');
  }

  const checkIn = await Attendance.findOne({
    member: member._id,
    checkOutTime: { $exists: false }
  });

  if (!checkIn) {
    res.status(400);
    throw new Error('No active check-in found');
  }

  checkIn.checkOutTime = new Date();
  checkIn.duration = Math.round((checkIn.checkOutTime - checkIn.checkInTime) / (1000 * 60)); // in minutes
  await checkIn.save();

  res.json({
    success: true,
    message: 'Check-out successful',
    data: {
      checkInTime: checkIn.checkInTime,
      checkOutTime: checkIn.checkOutTime,
      duration: checkIn.duration
    }
  });
});

const getCheckInHistory = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const member = await Member.findOne({ user: req.user._id });
  if (!member) {
    res.status(404);
    throw new Error('Member profile not found');
  }

  const [history, total] = await Promise.all([
    Attendance.find({ member: member._id })
      .select('-__v')
      .sort({ checkInTime: -1 })
      .skip(skip)
      .limit(limit),
    Attendance.countDocuments({ member: member._id })
  ]);

  res.json({
    success: true,
    count: history.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: history
  });
});

const getTokenTransactions = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const member = await Member.findOne({ user: req.user._id });
  if (!member) {
    res.status(404);
    throw new Error('Member profile not found');
  }

  const [transactions, total] = await Promise.all([
    TokenTransaction.find({ member: member._id })
      .select('-__v')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    TokenTransaction.countDocuments({ member: member._id })
  ]);

  res.json({
    success: true,
    count: transactions.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: transactions
  });
});

const addTokens = asyncHandler(async (req, res) => {
  const { amount, description } = req.body;

  if (!amount || amount <= 0) {
    res.status(400);
    throw new Error('Please provide a valid token amount');
  }

  const member = await Member.findById(req.params.id);
  if (!member) {
    res.status(404);
    throw new Error('Member not found');
  }

  member.tokenBalance += amount;
  await member.save();

  const transaction = await TokenTransaction.create({
    member: member._id,
    type: 'credit',
    amount,
    description: description || 'Admin token addition',
    createdBy: req.user._id
  });

  res.status(200).json({
    success: true,
    message: 'Tokens added successfully',
    data: {
      memberId: member._id,
      memberName: member.user?.name,
      tokenBalance: member.tokenBalance,
      transaction
    }
  });
});

export {
  getMembers,
  getMemberProfile,
  getMemberById,
  updateMemberProfile,
  memberCheckIn,
  memberCheckOut,
  getCheckInHistory,
  getTokenTransactions,
  addTokens
};
