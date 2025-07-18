import Member from '../models/Member.js';
import Gym from '../models/Gym.js';
import Attendance from '../models/Attendance.js';
import TokenTransaction from '../models/TokenTransaction.js';
import Class from '../models/Class.js';
import { Parser } from 'json2csv';
import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';

const validExportTypes = ['members', 'gyms', 'attendance', 'classes', 'transactions'];
const validFormats = ['json', 'csv'];

const getExportData = async (type, filters = {}) => {
  const query = buildQuery(type, filters);
  const data = await executeQuery(type, query);
  return transformData(type, data);
};

const buildQuery = (type, filters) => {
  const { search, status, startDate, endDate, ...rest } = filters;
  const query = { ...rest };

  if (search) {
    query.$or = getSearchConditions(type, search);
  }

  if (status) {
    query.isActive = status === 'active';
  }

  if (startDate || endDate) {
    const dateField = type === 'attendance' ? 'checkIn' : 'createdAt';
    query[dateField] = {};
    if (startDate) query[dateField].$gte = new Date(startDate);
    if (endDate) query[dateField].$lte = new Date(endDate);
  }

  return query;
};

const getSearchConditions = (type, search) => {
  const conditions = [];
  const searchTerm = { $regex: search, $options: 'i' };

  switch (type) {
    case 'members':
      conditions.push(
        { 'user.name': searchTerm },
        { 'user.email': searchTerm },
        { memberId: searchTerm }
      );
      break;
    case 'gyms':
      conditions.push(
        { name: searchTerm },
        { location: searchTerm },
        { phone: searchTerm }
      );
      break;
    case 'attendance':
      if (mongoose.Types.ObjectId.isValid(search)) {
        conditions.push({ member: new mongoose.Types.ObjectId(search) });
      }
      break;
  }

  return conditions;
};

const executeQuery = async (type, query) => {
  const modelMap = {
    members: Member,
    gyms: Gym,
    attendance: Attendance,
    classes: Class,
    transactions: TokenTransaction
  };

  const model = modelMap[type];
  if (!model) {
    throw new Error(`Invalid export type: ${type}`);
  }

  let results = await model.find(query).lean();

  if (type === 'transactions') {
    results = await TokenTransaction.aggregate([
      { $match: query },
      {
        $lookup: {
          from: 'members',
          localField: 'member',
          foreignField: '_id',
          as: 'member'
        }
      },
      { $unwind: '$member' }
    ]);
  }

  return results;
};

const transformData = (type, data) => {
  if (type === 'transactions') {
    return data.map(tx => ({
      id: tx._id,
      amount: tx.amount,
      type: tx.type,
      description: tx.description,
      date: tx.createdAt,
      memberId: tx.member?.memberId
    }));
  }
  return data;
};

const exportReport = asyncHandler(async (req, res) => {
  const { type } = req.params;
  const format = req.params.format || 'json';
  const filters = req.query;

  try {
    if (!validExportTypes.includes(type)) {
      return res.status(400).json({ 
        success: false, 
        message: `Invalid export type. Must be one of: ${validExportTypes.join(', ')}` 
      });
    }

    if (!validFormats.includes(format)) {
      return res.status(400).json({ 
        success: false, 
        message: `Invalid format. Must be one of: ${validFormats.join(', ')}` 
      });
    }

    const data = await getExportData(type, filters);

    if (format === 'csv') {
      const fields = Object.keys(data[0] || {}).map(key => ({
        label: key,
        value: key
      }));

      const json2csv = new Parser({ fields });
      const csv = data.length > 0 ? json2csv.parse(data) : 'No data found';
      
      res.header('Content-Type', 'text/csv');
      res.attachment(`${type}_report_${new Date().toISOString().split('T')[0]}.csv`);
      return res.send(csv);
    }

    res.json({ 
      success: true, 
      count: data.length, 
      data 
    });

  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate report', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
});

export { exportReport };
