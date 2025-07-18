import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import asyncHandler from 'express-async-handler';
import { JWT_SECRET } from '../config/config.js';

export const protect = asyncHandler(async (req, res, next) => {
  let token;
  
  if (req.headers.authorization?.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        res.status(401);
        throw new Error('Not authorized, user not found');
      }
      
      next();
    } catch (error) {
      console.error('Token verification failed:', error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized as an admin');
  }
};

export const gymOwner = (req, res, next) => {
  if (req.user && req.user.role === 'gym') {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized as a gym');
  }
};

export const member = (req, res, next) => {
  if (req.user && req.user.role === 'member') {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized as a member');
  }
};

export const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
};

export const getTokenFromHeader = (req) => {
  if (req.headers.authorization?.startsWith('Bearer')) {
    return req.headers.authorization.split(' ')[1];
  }
  return null;
};
