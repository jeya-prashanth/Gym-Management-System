import Class from '../models/Class.js';
import Member from '../models/Member.js';
import Attendance from '../models/Attendance.js';
import TokenTransaction from '../models/TokenTransaction.js';
import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';

const createClass = asyncHandler(async (req, res) => {
  const { name, description, schedule, maxCapacity, tokenCost } = req.body;

  const newClass = await Class.create({
    name,
    description,
    schedule,
    maxCapacity,
    tokenCost
  });

  res.status(201).json({ success: true, data: newClass });
});

const getClasses = asyncHandler(async (req, res) => {
  const { day, active } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const query = {};
  if (day) query['schedule.day'] = day.toLowerCase();
  if (active !== undefined) query.isActive = active === 'true';

  const [classes, total] = await Promise.all([
    Class.find(query)
      .sort({ 'schedule.day': 1, 'schedule.startTime': 1 })
      .skip(skip)
      .limit(limit),
    Class.countDocuments(query)
  ]);

  res.json({
    success: true,
    count: classes.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: classes
  });
});

const getClassById = asyncHandler(async (req, res) => {
  const classData = await Class.findById(req.params.id);
  
  if (!classData) {
    res.status(404);
    throw new Error('Class not found');
  }

  res.json({ success: true, data: classData });
});

const updateClass = asyncHandler(async (req, res) => {
  const { name, description, schedule, maxCapacity, tokenCost, isActive } = req.body;

  const updatedClass = await Class.findByIdAndUpdate(
    req.params.id,
    { name, description, schedule, maxCapacity, tokenCost, isActive },
    { new: true, runValidators: true }
  );

  if (!updatedClass) {
    res.status(404);
    throw new Error('Class not found');
  }

  res.json({ success: true, data: updatedClass });
});

const deleteClass = asyncHandler(async (req, res) => {
  const classToDelete = await Class.findById(req.params.id);
  
  if (!classToDelete) {
    res.status(404);
    throw new Error('Class not found');
  }

  if (classToDelete.currentEnrollment > 0) {
    res.status(400);
    throw new Error('Cannot delete class with active enrollments');
  }

  await classToDelete.remove();
  res.json({ success: true, data: {} });
});

const enrollInClass = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { memberId } = req.params;
    const { classId } = req.body;

    const member = await Member.findById(memberId).session(session);
    if (!member) {
      throw new Error('Member not found');
    }

    const classToEnroll = await Class.findById(classId).session(session);
    if (!classToEnroll) {
      throw new Error('Class not found');
    }

    if (!classToEnroll.isActive) {
      throw new Error('This class is not currently active');
    }

    if (!classToEnroll.hasAvailableSpots()) {
      throw new Error('This class is full');
    }

    if (member.tokenBalance < classToEnroll.tokenCost) {
      throw new Error('Insufficient tokens for this class');
    }

    const existingEnrollment = await Attendance.findOne({
      member: memberId,
      class: classId,
      checkOutTime: { $exists: false }
    }).session(session);

    if (existingEnrollment) {
      throw new Error('Already enrolled in this class');
    }

    member.tokenBalance -= classToEnroll.tokenCost;
    await member.save({ session });

    await classToEnroll.incrementEnrollment();

    const attendance = await Attendance.create([{
      member: memberId,
      class: classId,
      tokenUsed: classToEnroll.tokenCost
    }], { session });

    await TokenTransaction.create([{
      member: memberId,
      type: 'debit',
      amount: classToEnroll.tokenCost,
      description: `Enrollment in ${classToEnroll.name}`,
      reference: `CLASS-${classToEnroll._id}`
    }], { session });

    await session.commitTransaction();

    res.json({
      success: true,
      data: {
        classId: classToEnroll._id,
        className: classToEnroll.name,
        remainingTokens: member.tokenBalance,
        attendanceId: attendance[0]._id
      }
    });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

const getClassAttendees = asyncHandler(async (req, res) => {
  const { classId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const classData = await Class.findById(classId);
  if (!classData) {
    res.status(404);
    throw new Error('Class not found');
  }

  const [attendees, total] = await Promise.all([
    Attendance.find({ class: classId })
      .populate('member', 'name email')
      .sort({ checkInTime: -1 })
      .skip(skip)
      .limit(limit),
    Attendance.countDocuments({ class: classId })
  ]);

  res.json({
    success: true,
    count: attendees.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: attendees
  });
});

const getMemberClasses = asyncHandler(async (req, res) => {
  const { memberId } = req.params;
  const { upcoming = 'true' } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const member = await Member.findById(memberId);
  if (!member) {
    res.status(404);
    throw new Error('Member not found');
  }

  const now = new Date();
  const query = { member: memberId };
  
  if (upcoming === 'true') {
    query.checkInTime = { $gte: now };
  }

  const [attendances, total] = await Promise.all([
    Attendance.find(query)
      .populate({
        path: 'class',
        select: 'name description schedule tokenCost'
      })
      .sort({ checkInTime: 1 })
      .skip(skip)
      .limit(limit),
    Attendance.countDocuments(query)
  ]);

  res.json({
    success: true,
    count: attendances.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: attendances
  });
});

export {
  createClass,
  getClasses,
  getClassById,
  updateClass,
  deleteClass,
  enrollInClass,
  getClassAttendees,
  getMemberClasses
};
