import { ErrorResponse } from '../utils/errorResponse.js';
import User from '../models/userModel.js';
import Membership from '../models/membershipModel.js';
import Payment from '../models/paymentModel.js';
import Class from '../models/classModel.js';
import { logger, securityLogger } from './logger.js';
import { Types } from 'mongoose';

const validateObjectId = (id) => Types.ObjectId.isValid(id);

export const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    securityLogger('UNAUTHORIZED_ADMIN_ACCESS', {
      userId: req.user.id,
      path: req.path,
      method: req.method
    });
    return next(new ErrorResponse('Not authorized to access this route', 403));
  }
  next();
};

export const requireAdminOrManager = (req, res, next) => {
  if (!['admin', 'manager'].includes(req.user.role)) {
    return next(new ErrorResponse('Not authorized to access this route', 403));
  }
  next();
};

export const checkUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }
    
    if (user.status === 'suspended' || user.status === 'banned') {
      return next(new ErrorResponse('This account is restricted', 403));
    }
    
    req.targetUser = user;
    next();
  } catch (error) {
    next(error);
  }
};

export const validateMembershipUpdate = async (req, res, next) => {
  const { startDate, endDate, status } = req.body;
  
  if (startDate && new Date(startDate) > new Date(endDate)) {
    return next(new ErrorResponse('Start date cannot be after end date', 400));
  }
  
  if (status === 'active' && (!startDate || !endDate)) {
    return next(new ErrorResponse('Start date and end date are required for active memberships', 400));
  }
  
  next();
};

export const checkResourceAccess = (resourceType) => {
  return async (req, res, next) => {
    try {
      let resource;
      const resourceId = req.params[`${resourceType}Id`] || req.params.id;
      
      if (!validateObjectId(resourceId)) {
        return next(new ErrorResponse('Invalid resource ID', 400));
      }
      
      switch (resourceType) {
        case 'user':
          resource = await User.findById(resourceId);
          break;
        case 'class':
          resource = await Class.findById(resourceId);
          break;
        case 'payment':
          resource = await Payment.findById(resourceId);
          break;
        case 'membership':
          resource = await Membership.findById(resourceId);
          break;
        default:
          return next(new ErrorResponse('Invalid resource type', 400));
      }
      
      if (!resource) {
        return next(new ErrorResponse(`${resourceType} not found`, 404));
      }
      
      req[resourceType] = resource;
      next();
    } catch (error) {
      next(error);
    }
  };
};

export const validateBulkAction = (req, res, next) => {
  const { action, ids } = req.body;
  
  if (!action || !ids || !Array.isArray(ids) || ids.length === 0) {
    return next(new ErrorResponse('Invalid bulk action request', 400));
  }
  
  const validActions = ['activate', 'deactivate', 'delete', 'suspend'];
  if (!validActions.includes(action)) {
    return next(new ErrorResponse('Invalid action specified', 400));
  }
  
  if (ids.some(id => !validateObjectId(id))) {
    return next(new ErrorResponse('Invalid ID in request', 400));
  }
  
  next();
};

export const checkAdminPrivilege = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.id !== req.params.userId) {
    return next(new ErrorResponse('Not authorized to perform this action', 403));
  }
  next();
};

export const validateReportParams = (req, res, next) => {
  const { startDate, endDate, type } = req.query;
  
  if (startDate && isNaN(Date.parse(startDate))) {
    return next(new ErrorResponse('Invalid start date format', 400));
  }
  
  if (endDate && isNaN(Date.parse(endDate))) {
    return next(new ErrorResponse('Invalid end date format', 400));
  }
  
  if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
    return next(new ErrorResponse('Start date cannot be after end date', 400));
  }
  
  const validReportTypes = ['revenue', 'attendance', 'memberships', 'classes'];
  if (type && !validReportTypes.includes(type)) {
    return next(new ErrorResponse('Invalid report type', 400));
  }
  
  next();
};

export const logAdminAction = (action) => {
  return (req, res, next) => {
    logger.info(`ADMIN_ACTION: ${action}`, {
      adminId: req.user.id,
      targetId: req.params.id || req.params.userId,
      action,
      timestamp: new Date().toISOString(),
      ip: req.ip,
      userAgent: req.get('user-agent')
    });
    next();
  };
};

export const checkResourceOwnership = (resourceType) => {
  return async (req, res, next) => {
    try {
      const resource = req[resourceType];
      
      if (resourceType === 'user' && req.user.role !== 'admin' && resource._id.toString() !== req.user.id) {
        return next(new ErrorResponse('Not authorized to modify this resource', 403));
      }
      
      if (resourceType === 'class' && req.user.role === 'trainer' && resource.trainer.toString() !== req.user.id) {
        return next(new ErrorResponse('Not authorized to modify this class', 403));
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
};