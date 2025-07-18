import Attendance from '../models/Attendance.js';
import Member from '../models/Member.js';
import Class from '../models/Class.js';
import TokenTransaction from '../models/TokenTransaction.js';
import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';

const checkIn = asyncHandler(async (req, res) => {
  const { memberId, classId } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const member = await Member.findById(memberId).session(session);
    if (!member) {
      throw new Error('Member not found');
    }

    const classInfo = await Class.findById(classId).session(session);
    if (!classInfo) {
      throw new Error('Class not found');
    }

    if (member.tokenBalance < classInfo.tokenCost) {
      throw new Error('Insufficient tokens for this class');
    }

    const existingAttendance = await Attendance.findOne({
      member: memberId,
      class: classId,
      checkOut: { $exists: false }
    }).session(session);

    if (existingAttendance) {
      throw new Error('Already checked in to this class');
    }

    const attendance = await Attendance.create([{
      member: memberId,
      class: classId,
      checkIn: new Date(),
      tokenUsed: classInfo.tokenCost
    }], { session });

    member.tokenBalance -= classInfo.tokenCost;
    await member.save({ session });

    const transaction = await TokenTransaction.create([{
      member: memberId,
      type: 'debit',
      amount: classInfo.tokenCost,
      description: `Class attendance: ${classInfo.name}`,
      reference: `CHECKIN-${attendance[0]._id}`
    }], { session });

    await session.commitTransaction();

    res.status(201).json({
      success: true,
      data: {
        attendance: attendance[0],
        remainingTokens: member.tokenBalance
      }
    });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

const checkOut = asyncHandler(async (req, res) => {
  const { attendanceId } = req.params;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const attendance = await Attendance.findById(attendanceId).session(session);
    if (!attendance) {
      throw new Error('Attendance record not found');
    }

    if (attendance.checkOut) {
      throw new Error('Already checked out');
    }

    attendance.checkOut = new Date();
    await attendance.save({ session });

    await session.commitTransaction();

    res.json({
      success: true,
      data: {
        attendance,
        duration: attendance.duration
      }
    });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

const getMemberAttendance = asyncHandler(async (req, res) => {
  const { memberId } = req.params;
  const { startDate, endDate, page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  const query = { member: memberId };
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59);
      query.date.$lte = end;
    }
  }

  const [attendance, total] = await Promise.all([
    Attendance.find(query)
      .populate('class', 'name')
      .sort({ checkIn: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Attendance.countDocuments(query)
  ]);

  res.json({
    success: true,
    count: attendance.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    data: attendance
  });
});

const getClassAttendance = asyncHandler(async (req, res) => {
  const { classId } = req.params;
  const { date, page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  const query = { class: classId };
  if (date) {
    const start = new Date(date);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    query.checkIn = { $gte: start, $lt: end };
  }

  const [attendance, total] = await Promise.all([
    Attendance.find(query)
      .populate('member', 'name email')
      .sort({ checkIn: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Attendance.countDocuments(query)
  ]);

  res.json({
    success: true,
    count: attendance.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    data: attendance
  });
});

const getAttendanceStats = asyncHandler(async (req, res) => {
  const { memberId } = req.params;
  const { startDate, endDate } = req.query;

  const match = { member: new mongoose.Types.ObjectId(memberId) };
  if (startDate || endDate) {
    match.checkIn = {};
    if (startDate) match.checkIn.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59);
      match.checkIn.$lte = end;
    }
  }

  const stats = await Attendance.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalVisits: { $sum: 1 },
        totalHours: { $sum: { $divide: ['$duration', 60] } },
        tokensSpent: { $sum: '$tokenUsed' }
      }
    },
    {
      $project: {
        _id: 0,
        totalVisits: 1,
        totalHours: { $round: ['$totalHours', 1] },
        tokensSpent: 1,
        averageVisitLength: { $round: [{ $divide: ['$totalHours', '$totalVisits'] }, 1] }
      }
    }
  ]);

  res.json({
    success: true,
    data: stats[0] || {
      totalVisits: 0,
      totalHours: 0,
      tokensSpent: 0,
      averageVisitLength: 0
    }
  });
});

const getActiveCheckIns = asyncHandler(async (req, res) => {
  const activeCheckIns = await Attendance.find({
    checkOut: { $exists: false }
  })
    .populate('member', 'name email')
    .populate('class', 'name')
    .sort({ checkIn: -1 });

  res.json({
    success: true,
    count: activeCheckIns.length,
    data: activeCheckIns
  });
});

export {
  checkIn,
  checkOut,
  getMemberAttendance,
  getClassAttendance,
  getAttendanceStats,
  getActiveCheckIns
};
