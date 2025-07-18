import celebratePkg from 'celebrate';
const { isCelebrate } = celebratePkg;
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import path from 'path';

const { JsonWebTokenError, TokenExpiredError } = jwt;

class ApiError extends Error {
  constructor(statusCode, message, isOperational = true, stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export class BadRequestError extends ApiError {
  constructor(message = 'Bad Request') {
    super(400, message);
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = 'Not authorized') {
    super(401, message);
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = 'Forbidden') {
    super(403, message);
  }
}

export class NotFoundError extends ApiError {
  constructor(message = 'Resource not found') {
    super(404, message);
  }
}

export class ConflictError extends ApiError {
  constructor(message = 'Conflict') {
    super(409, message);
  }
}

export const notFound = (req, res, next) => {
  if (isApiRequest(req)) {
    return next(new NotFoundError(`Cannot ${req.method} ${req.originalUrl}`));
  }
  
  res.status(404).render('404', {
    title: 'Page Not Found',
    message: `The requested URL ${req.originalUrl} was not found`
  });
};

const isApiRequest = (req) => {
  return req.originalUrl.startsWith('/api/');
};

export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;
  error.error = err.status || 'error';

  if (isCelebrate(err)) {
    const details = [];
    for (const [segment, joiError] of err.details.entries()) {
      details.push({
        segment,
        message: joiError.details.map(d => d.message).join(', ')
      });
    }
    
    error = new BadRequestError('Validation failed');
    error.details = details;
  }

  if (err instanceof JsonWebTokenError) {
    error = new UnauthorizedError('Invalid token');
  } else if (err instanceof TokenExpiredError) {
    error = new UnauthorizedError('Token expired');
  } else if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error = new ConflictError(`${field} already exists`);
  } else if (err.name === 'CastError') {
    error = new BadRequestError(`Invalid ${err.path}: ${err.value}`);
  } else if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    error = new BadRequestError(messages.join(', '));
    error.details = messages;
  } else if (err.name === 'MongoServerError') {
    error = new ApiError(500, 'Database error', true);
  }

  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', {
      message: err.message,
      stack: err.stack,
      name: err.name,
      path: req.path,
      method: req.method,
      body: req.body
    });
  }

  if (isApiRequest(req)) {
    const response = {
      success: false,
      statusCode: error.statusCode,
      error: error.error,
      message: error.message,
      ...(error.details && { details: error.details }),
      ...(process.env.NODE_ENV === 'development' && { 
        stack: error.stack,
        path: req.path 
      })
    };
    return res.status(error.statusCode).json(response);
  }

  res.status(error.statusCode).render('error', {
    title: 'Error',
    statusCode: error.statusCode,
    message: error.message
  });
};

export const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    err.path = req.originalUrl;
    err.method = req.method;
    next(err);
  });
};
