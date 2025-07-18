import Payment from '../models/Payment.js';
import Member from '../models/Member.js';
import TokenTransaction from '../models/TokenTransaction.js';
import asyncHandler from 'express-async-handler';

const createPayment = asyncHandler(async (req, res) => {
  const { memberId, tokens, paymentDetails } = req.body;

  const member = await Member.findById(memberId);
  if (!member) {
    res.status(404);
    throw new Error('Member not found');
  }

  const session = await Payment.startSession();
  session.startTransaction();

  try {
    const payment = await Payment.create([{
      member: memberId,
      tokensAdded: tokens,
      paymentDetails: paymentDetails || 'Token purchase'
    }], { session });

    member.tokenBalance += tokens;
    await member.save({ session });

    await TokenTransaction.create([{
      member: memberId,
      type: 'credit',
      amount: tokens,
      description: paymentDetails || 'Token purchase',
      reference: `PAY-${payment[0]._id}`
    }], { session });

    await session.commitTransaction();

    res.status(201).json({
      success: true,
      data: {
        paymentId: payment[0]._id,
        memberId: member._id,
        tokensAdded: tokens,
        newBalance: member.tokenBalance
      }
    });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

const getMemberPayments = asyncHandler(async (req, res) => {
  const { memberId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const member = await Member.findById(memberId);
  if (!member) {
    res.status(404);
    throw new Error('Member not found');
  }

  const [payments, total] = await Promise.all([
    Payment.find({ member: memberId })
      .sort({ paymentDate: -1 })
      .skip(skip)
      .limit(limit),
    Payment.countDocuments({ member: memberId })
  ]);

  res.json({
    success: true,
    count: payments.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: payments
  });
});

const getPaymentById = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id)
    .populate('member', 'name email');

  if (!payment) {
    res.status(404);
    throw new Error('Payment not found');
  }

  res.json({ success: true, data: payment });
});

const getAllPayments = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const [payments, total] = await Promise.all([
    Payment.find()
      .populate('member', 'name email')
      .sort({ paymentDate: -1 })
      .skip(skip)
      .limit(limit),
    Payment.countDocuments()
  ]);

  res.json({
    success: true,
    count: payments.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: payments
  });
});

const refundPayment = asyncHandler(async (req, res) => {
  const { paymentId } = req.params;
  const { refundAmount, reason } = req.body;

  const session = await Payment.startSession();
  session.startTransaction();

  try {
    const payment = await Payment.findById(paymentId).session(session);
    if (!payment) {
      res.status(404);
      throw new Error('Payment not found');
    }

    const member = await Member.findById(payment.member).session(session);
    if (!member) {
      res.status(404);
      throw new Error('Member not found');
    }

    const refundTokens = refundAmount || payment.tokensAdded;
    if (refundTokens > member.tokenBalance) {
      res.status(400);
      throw new Error('Insufficient token balance for refund');
    }

    member.tokenBalance -= refundTokens;
    await member.save({ session });

    await TokenTransaction.create([{
      member: member._id,
      type: 'debit',
      amount: refundTokens,
      description: reason || 'Payment refund',
      reference: `REFUND-${payment._id}`,
      createdBy: req.user._id
    }], { session });

    payment.refunded = true;
    payment.refundDate = new Date();
    payment.refundAmount = refundTokens;
    payment.refundReason = reason;
    await payment.save({ session });

    await session.commitTransaction();

    res.json({
      success: true,
      data: {
        paymentId: payment._id,
        memberId: member._id,
        tokensRefunded: refundTokens,
        newBalance: member.tokenBalance
      }
    });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

export {
  createPayment,
  getMemberPayments,
  getPaymentById,
  getAllPayments,
  refundPayment
};
