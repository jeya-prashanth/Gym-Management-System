import TokenTransaction from '../models/TokenTransaction.js';
import Member from '../models/Member.js';
import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';

const addTokens = asyncHandler(async (req, res) => {
  const { memberId } = req.params;
  const { amount, description = 'Admin adjustment' } = req.body;

  if (!amount || amount <= 0) {
    res.status(400);
    throw new Error('Amount must be a positive number');
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const member = await Member.findById(memberId).session(session);
    if (!member) {
      throw new Error('Member not found');
    }

    member.tokenBalance = (member.tokenBalance || 0) + amount;
    await member.save({ session });

    const transaction = await TokenTransaction.create([{
      member: memberId,
      type: 'credit',
      amount,
      description,
      createdBy: req.user._id,
      relatedTo: 'admin_adjustment'
    }], { session });

    await session.commitTransaction();

    res.status(201).json({
      success: true,
      data: {
        memberId: member._id,
        newBalance: member.tokenBalance,
        transaction: transaction[0]
      }
    });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

const getMemberTransactions = asyncHandler(async (req, res) => {
  const { memberId } = req.params;
  const { type, startDate, endDate, page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  const query = { member: memberId };
  if (type) query.type = type;
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59);
      query.createdAt.$lte = end;
    }
  }

  const [transactions, total] = await Promise.all([
    TokenTransaction.find(query)
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    TokenTransaction.countDocuments(query)
  ]);

  res.json({
    success: true,
    count: transactions.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    data: transactions
  });
});

const getMemberBalance = asyncHandler(async (req, res) => {
  const { memberId } = req.params;

  const result = await TokenTransaction.aggregate([
    { $match: { member: new mongoose.Types.ObjectId(memberId) } },
    {
      $group: {
        _id: null,
        totalCredits: {
          $sum: { $cond: [{ $eq: ['$type', 'credit'] }, '$amount', 0] }
        },
        totalDebits: {
          $sum: { $cond: [{ $eq: ['$type', 'debit'] }, '$amount', 0] }
        }
      }
    },
    {
      $project: {
        _id: 0,
        balance: { $subtract: ['$totalCredits', '$totalDebits'] },
        totalCredits: 1,
        totalDebits: 1
      }
    }
  ]);

  const balance = result[0]?.balance || 0;
  const totalCredits = result[0]?.totalCredits || 0;
  const totalDebits = result[0]?.totalDebits || 0;

  res.json({
    success: true,
    data: { balance, totalCredits, totalDebits }
  });
});

const getTokenUsageStats = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  
  const match = {};
  if (startDate || endDate) {
    match.createdAt = {};
    if (startDate) match.createdAt.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59);
      match.createdAt.$lte = end;
    }
  }

  const stats = await TokenTransaction.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }
    },
    {
      $group: {
        _id: null,
        credits: {
          $sum: { $cond: [{ $eq: ['$_id', 'credit'] }, '$totalAmount', 0] }
        },
        debits: {
          $sum: { $cond: [{ $eq: ['$_id', 'debit'] }, '$totalAmount', 0] }
        },
        creditCount: {
          $sum: { $cond: [{ $eq: ['$_id', 'credit'] }, '$count', 0] }
        },
        debitCount: {
          $sum: { $cond: [{ $eq: ['$_id', 'debit'] }, '$count', 0] }
        }
      }
    },
    {
      $project: {
        _id: 0,
        netTokens: { $subtract: ['$credits', '$debits'] },
        totalCredits: 1,
        totalDebits: 1,
        creditCount: 1,
        debitCount: 1
      }
    }
  ]);

  res.json({
    success: true,
    data: stats[0] || {
      netTokens: 0,
      credits: 0,
      debits: 0,
      creditCount: 0,
      debitCount: 0
    }
  });
});

export {
  addTokens,
  getMemberTransactions,
  getMemberBalance,
  getTokenUsageStats
};
