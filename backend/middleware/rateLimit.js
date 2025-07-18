import rateLimit from 'express-rate-limit';
import { ErrorResponse } from '../utils/errorResponse.js';
import RedisStore from 'rate-limit-redis';
import redisClient from '../config/redis.js';

const isProduction = process.env.NODE_ENV === 'production';

const rateLimitConfig = {
  windowMs: 15 * 60 * 1000,
  max: isProduction ? 100 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.user?.role === 'admin',
  store: redisClient ? new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args)
  }) : undefined,
  handler: (req, res, next) => {
    next(new ErrorResponse('Too many requests, please try again later.', 429));
  }
};

export const apiLimiter = rateLimit({
  ...rateLimitConfig,
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

export const authLimiter = rateLimit({
  ...rateLimitConfig,
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts, please try again after an hour'
});

export const passwordResetLimiter = rateLimit({
  ...rateLimitConfig,
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: 'Too many password reset attempts, please try again later'
});

export const tokenPurchaseLimiter = rateLimit({
  ...rateLimitConfig,
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: 'Too many token purchase attempts, please try again later'
});

export const publicAPILimiter = rateLimit({
  ...rateLimitConfig,
  windowMs: 60 * 60 * 1000,
  max: isProduction ? 60 : 600,
  message: 'Too many requests, please try again later'
});

export const createRateLimiter = (options = {}) => {
  return rateLimit({
    ...rateLimitConfig,
    ...options,
    windowMs: options.windowMs || rateLimitConfig.windowMs,
    max: options.max || rateLimitConfig.max,
    handler: (req, res, next) => {
      const message = options.message || rateLimitConfig.handler.message;
      next(new ErrorResponse(message, 429));
    }
  });
};

export const userSpecificLimiter = (req, res, next) => {
  const userSpecificRateLimit = rateLimit({
    ...rateLimitConfig,
    keyGenerator: (req) => req.user ? req.user.id : req.ip,
    max: 100,
    message: 'Too many requests for this user, please try again later'
  });
  
  return userSpecificRateLimit(req, res, next);
};

export const routeSpecificLimiter = (routeName, maxRequests = 100, windowMinutes = 15) => {
  return rateLimit({
    ...rateLimitConfig,
    keyGenerator: (req) => `${routeName}_${req.ip}`,
    windowMs: windowMinutes * 60 * 1000,
    max: maxRequests,
    message: `Too many requests to ${routeName}, please try again later`
  });
};

export const globalRateLimiter = rateLimit(rateLimitConfig);
