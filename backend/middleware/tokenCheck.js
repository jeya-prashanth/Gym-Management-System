import Token from '../models/tokenModel.js';
import { ErrorResponse } from '../utils/errorResponse.js';
import asyncHandler from './asyncHandler.js';
import { Types } from 'mongoose';

export const checkTokens = (options = {}) => {
  return asyncHandler(async (req, res, next) => {
    const { requiredTokens = 1, action = 'access', skipIfAdmin = true } = options;
    const { id: userId, role } = req.user;

    if (skipIfAdmin && role === 'admin') {
      return next();
    }

    if (!Types.ObjectId.isValid(userId)) {
      return next(new ErrorResponse('Invalid user ID', 400));
    }

    const userToken = await Token.findOne({ user: userId }).select('balance');

    if (!userToken) {
      return next(
        new ErrorResponse('No token account found for this user', 403)
      );
    }

    if (userToken.balance < requiredTokens) {
      return next(
        new ErrorResponse(
          `Insufficient tokens. Required: ${requiredTokens}, Available: ${userToken.balance}`,
          403
        )
      );
    }

    req.token = {
      currentBalance: userToken.balance,
      requiredTokens,
      action,
      tokenAccount: userToken._id
    };

    next();
  });
};

export const deductTokens = asyncHandler(async (req, res, next) => {
  if (!req.token) {
    return next(new ErrorResponse('Token check not performed', 500));
  }

  const { tokenAccount, currentBalance, requiredTokens } = req.token;
  
  try {
    const updatedToken = await Token.findByIdAndUpdate(
      tokenAccount,
      { 
        $inc: { balance: -requiredTokens },
        $push: { 
          transactions: {
            amount: -requiredTokens,
            type: 'debit',
            reference: req.token.action,
            referenceId: req.params.id || null,
            remainingBalance: currentBalance - requiredTokens
          }
        }
      },
      { new: true, runValidators: true }
    );

    if (!updatedToken) {
      return next(new ErrorResponse('Failed to update token balance', 500));
    }

    req.token.updatedBalance = updatedToken.balance;
    next();
  } catch (error) {
    return next(new ErrorResponse('Error processing token deduction', 500));
  }
});

export const refundTokens = async (userId, amount, reference, referenceId, session = null) => {
  try {
    const update = {
      $inc: { balance: amount },
      $push: {
        transactions: {
          amount,
          type: 'credit',
          reference,
          referenceId,
          isRefund: true
        }
      }
    };

    const options = { new: true, runValidators: true };
    if (session) {
      options.session = session;
    }

    const updatedToken = await Token.findOneAndUpdate(
      { user: userId },
      update,
      options
    );

    if (!updatedToken) {
      throw new Error('Failed to process token refund');
    }

    return updatedToken;
  } catch (error) {
    throw new Error(`Error refunding tokens: ${error.message}`);
  }
};

export const checkTokenRateLimit = (options = {}) => {
  const { limit = 5, windowMs = 60 * 60 * 1000 } = options;
  const tokenUsage = new Map();

  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;

    if (!tokenUsage.has(ip)) {
      tokenUsage.set(ip, []);
    }

    const requests = tokenUsage.get(ip).filter(timestamp => timestamp > windowStart);
    requests.push(now);
    tokenUsage.set(ip, requests);

    const currentUsage = requests.length;
    const isRateLimited = currentUsage > limit;

    res.set({
      'X-RateLimit-Limit': limit,
      'X-RateLimit-Remaining': isRateLimited ? 0 : limit - currentUsage
    });

    if (isRateLimited) {
      return next(
        new ErrorResponse(
          'Too many token operations, please try again later',
          429
        )
      );
    }

    next();
  };
};
