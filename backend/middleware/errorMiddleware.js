import ApiError from '../utils/ApiError.js';
import { ZodError } from 'zod';
import mongoose from 'mongoose';

const handleMongooseError = (err) => {
  // Handle duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return new ApiError(400, `${field} already exists`);
  }
  
  // Handle validation errors
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message
    }));
    return new ApiError(400, 'Validation error', errors);
  }
  
  // Handle CastError (invalid ObjectId, etc.)
  if (err.name === 'CastError') {
    return new ApiError(400, `Invalid ${err.path}: ${err.value}`);
  }
  
  // Default database error
  return new ApiError(500, 'Database error');
};

const handleZodError = (err) => {
  const errors = err.errors.map(e => ({
    field: e.path.join('.'),
    message: e.message
  }));
  return new ApiError(400, 'Validation error', errors);
};

const handleJwtError = (err) => {
  if (err.name === 'JsonWebTokenError') {
    return new ApiError(401, 'Invalid token');
  }
  if (err.name === 'TokenExpiredError') {
    return new ApiError(401, 'Token expired');
  }
  return new ApiError(401, 'Authentication error');
};

const errorHandler = (err, req, res, next) => {
  // Default error response
  let error = {
    statusCode: err.statusCode || 500,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  };

  // Handle specific error types
  if (err instanceof mongoose.Error) {
    error = handleMongooseError(err);
  } else if (err instanceof ZodError) {
    error = handleZodError(err);
  } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    error = handleJwtError(err);
  }

  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', {
      message: error.message,
      stack: error.stack,
      path: req.path,
      method: req.method,
      body: req.body
    });
  }
  error.stack = process.env.NODE_ENV === 'production' ? '' : err.stack;

  // Handle Mongoose errors
  if (err instanceof mongoose.Error.ValidationError || 
      err.code === 11000 || 
      err.name === 'CastError') {
    error = handleMongooseError(err);
  } 
  // Handle Zod validation errors
  else if (err instanceof ZodError) {
    error = handleZodError(err);
  } 
  // Handle JWT errors
  else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    error = handleJwtError(err);
  } 
  // Handle custom ApiError
  else if (!(err instanceof ApiError)) {
    error = new ApiError(err.statusCode || 500, err.message);
  }

  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', {
      message: error.message,
      stack: error.stack,
      ...(error.errors && { errors: error.errors })
    });
  }

  // Send JSON response
  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    ...(process.env.NODE_ENV === 'development' && { 
      stack: error.stack,
      path: req.path,
      method: req.method
    }),
    ...(error.errors && { errors: error.errors })
  });
};

export default errorHandler;