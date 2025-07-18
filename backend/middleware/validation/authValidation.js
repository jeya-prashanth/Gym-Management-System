import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import User from '../../models/userModel.js';
import { ErrorResponse } from '../../utils/errorResponse.js';

const verifyJwt = promisify(jwt.verify);

export const protect = async (req, res, next) => {
  try {
    let token;
    
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return next(new ErrorResponse('Not authorized to access this route', 401));
    }

    const decoded = await verifyJwt(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    if (user.isBlocked) {
      return next(new ErrorResponse('Account is blocked', 403));
    }

    if (user.passwordChangedAfter(decoded.iat)) {
      return next(new ErrorResponse('Password was changed. Please log in again', 401));
    }

    req.user = user;
    next();
  } catch (error) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(`User role ${req.user.role} is not authorized to access this route`, 403)
      );
    }
    next();
  };
};

export const checkOwnership = (model, paramName = 'id') => {
  return async (req, res, next) => {
    try {
      const resource = await model.findById(req.params[paramName]);
      
      if (!resource) {
        return next(new ErrorResponse('Resource not found', 404));
      }

      if (resource.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse('Not authorized to modify this resource', 403));
      }

      req.resource = resource;
      next();
    } catch (error) {
      next(error);
    }
  };
};

export const checkEmailVerified = async (req, res, next) => {
  if (!req.user.isEmailVerified) {
    return next(new ErrorResponse('Please verify your email address', 403));
  }
  next();
};

export const check2FA = async (req, res, next) => {
  if (req.user.twoFactorEnabled && !req.session.twoFactorVerified) {
    return next(new ErrorResponse('Two-factor authentication required', 403));
  }
  next();
};

export const checkSubscription = async (req, res, next) => {
  if (req.user.role === 'member' && !req.user.hasActiveSubscription) {
    return next(new ErrorResponse('Active subscription required', 403));
  }
  next();
};

export const checkGymAccess = async (req, res, next) => {
  if (req.user.role === 'trainer' && !req.user.assignedGym) {
    return next(new ErrorResponse('No gym assigned', 403));
  }
  
  if (req.params.gymId && req.user.assignedGym?.toString() !== req.params.gymId && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to access this gym', 403));
  }
  
  next();
};

export const preventConcurrentSessions = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.cookies?.token;
  
  if (req.user.currentSessionToken !== token) {
    return next(new ErrorResponse('Session expired', 401));
  }
  
  next();
};
