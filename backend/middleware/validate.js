import Joi from 'joi';
import { BadRequestError } from './errorHandler.js';

export const validateRequest = (schema) => (req, res, next) => {
  const options = {
    abortEarly: false,
    allowUnknown: true,
    stripUnknown: true
  };

  const { error, value } = schema.validate(req.body, options);

  if (error) {
    const messages = error.details.map(detail => detail.message);
    throw new BadRequestError(messages.join(', '));
  }

  req.body = value;
  next();
};

const patterns = {
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  phone: /^[0-9]{10,15}$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  objectId: /^[0-9a-fA-F]{24}$/
};

export const validationSchemas = {
  register: Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().pattern(patterns.email).required().email(),
    password: Joi.string().pattern(patterns.password).required(),
    role: Joi.string().valid('member', 'gym').default('member'),
    phone: Joi.string().pattern(patterns.phone).allow('')
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  updateProfile: Joi.object({
    name: Joi.string().min(2).max(50),
    email: Joi.string().email(),
    phone: Joi.string().pattern(patterns.phone).allow(''),
    currentPassword: Joi.string(),
    newPassword: Joi.string().pattern(patterns.password)
  }).with('newPassword', 'currentPassword'),

  class: Joi.object({
    title: Joi.string().min(3).max(100).required(),
    description: Joi.string().allow(''),
    schedule: Joi.object({
      days: Joi.array().items(Joi.string().valid(
        'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
      )).required(),
      startTime: Joi.string().required(),
      endTime: Joi.string().required()
    }).required(),
    capacity: Joi.number().integer().min(1).required(),
    trainer: Joi.string().pattern(patterns.objectId).required()
  }),

  attendance: Joi.object({
    memberId: Joi.string().pattern(patterns.objectId).required(),
    classId: Joi.string().pattern(patterns.objectId).required(),
    status: Joi.string().valid('present', 'absent', 'late').required(),
    date: Joi.date().required()
  }),

  payment: Joi.object({
    memberId: Joi.string().pattern(patterns.objectId).required(),
    amount: Joi.number().positive().required(),
    paymentMethod: Joi.string().valid('cash', 'card', 'online').required(),
    description: Joi.string().allow('')
  }),

  tokenTransaction: Joi.object({
    memberId: Joi.string().pattern(patterns.objectId).required(),
    amount: Joi.number().integer().required(),
    transactionType: Joi.string().valid('earn', 'spend', 'transfer').required(),
    relatedTo: Joi.string().pattern(patterns.objectId).required(),
    relatedToType: Joi.string().valid('class', 'payment', 'membership').required(),
    description: Joi.string().allow('')
  }),

  reportGeneration: Joi.object({
    type: Joi.string().valid('users', 'payments', 'attendance', 'transactions').required(),
    startDate: Joi.date().required(),
    endDate: Joi.date().min(Joi.ref('startDate')).required(),
    format: Joi.string().valid('csv', 'pdf', 'json').default('json')
  }),

  gymManagement: Joi.object({
    name: Joi.string().min(3).max(100).required(),
    address: Joi.string().required(),
    contact: Joi.string().pattern(patterns.phone).required(),
    status: Joi.string().valid('active', 'inactive', 'suspended').default('active'),
    settings: Joi.object({
      maxMembers: Joi.number().integer().min(1),
      autoApproveMembers: Joi.boolean().default(false),
      tokenExpiryDays: Joi.number().integer().min(1).default(30)
    })
  }),

  roleUpdate: Joi.object({
    role: Joi.string().valid('admin', 'gym', 'member').required(),
    permissions: Joi.array().items(Joi.string())
  }),

  systemSettings: Joi.object({
    maintenanceMode: Joi.boolean(),
    tokenValue: Joi.number().positive(),
    currency: Joi.string().length(3).uppercase(),
    emailNotifications: Joi.boolean(),
    smsNotifications: Joi.boolean()
  }),

  gymSettings: Joi.object({
    maxMembers: Joi.number().integer().min(1),
    autoApproveMembers: Joi.boolean(),
    tokenExpiryDays: Joi.number().integer().min(1),
    classCapacity: Joi.number().integer().min(1),
    allowMemberCancellation: Joi.boolean(),
    cancellationWindowHours: Joi.number().integer().min(1),
    paymentMethods: Joi.array().items(Joi.string().valid('cash', 'card', 'online')),
    taxRate: Joi.number().min(0).max(100)
  }),

  forgotPassword: Joi.object({
    email: Joi.string().email().required()
  }),

  resetPassword: Joi.object({
    password: Joi.string().pattern(patterns.password).required(),
    confirmPassword: Joi.ref('password')
  }).with('password', 'confirmPassword'),

  updatePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().pattern(patterns.password).required(),
    confirmPassword: Joi.ref('newPassword')
  }).with('newPassword', 'confirmPassword'),

  verifyEmail: Joi.object({
    token: Joi.string().required()
  }),

  resendVerification: Joi.object({
    email: Joi.string().email().required()
  }),

  refreshToken: Joi.object({
    refreshToken: Joi.string().required()
  }),

  class: Joi.object({
    name: Joi.string().min(3).max(100).required(),
    description: Joi.string().allow(''),
    instructor: Joi.string().pattern(patterns.objectId).required(),
    gym: Joi.string().pattern(patterns.objectId).required(),
    schedule: Joi.object({
      days: Joi.array().items(Joi.string().valid('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')).min(1).required(),
      startTime: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
      endTime: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
      startDate: Joi.date().required(),
      endDate: Joi.date().min(Joi.ref('startDate')),
      timezone: Joi.string().default('UTC')
    }).required(),
    capacity: Joi.number().integer().min(1).default(20),
    price: Joi.number().min(0).default(0),
    tokenCost: Joi.number().integer().min(0).default(0),
    category: Joi.string().valid('yoga', 'pilates', 'hiit', 'strength', 'cardio', 'dance', 'martial_arts', 'other').required(),
    level: Joi.string().valid('beginner', 'intermediate', 'advanced', 'all').default('all'),
    isActive: Joi.boolean().default(true)
  }),

  classUpdate: Joi.object({
    name: Joi.string().min(3).max(100),
    description: Joi.string().allow(''),
    instructor: Joi.string().pattern(patterns.objectId),
    schedule: Joi.object({
      days: Joi.array().items(Joi.string().valid('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')).min(1),
      startTime: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
      endTime: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
      startDate: Joi.date(),
      endDate: Joi.date().min(Joi.ref('startDate')),
      timezone: Joi.string()
    }),
    capacity: Joi.number().integer().min(1),
    price: Joi.number().min(0),
    tokenCost: Joi.number().integer().min(0),
    category: Joi.string().valid('yoga', 'pilates', 'hiit', 'strength', 'cardio', 'dance', 'martial_arts', 'other'),
    level: Joi.string().valid('beginner', 'intermediate', 'advanced', 'all'),
    isActive: Joi.boolean()
  }),

  markAttendance: Joi.object({
    memberId: Joi.string().pattern(patterns.objectId).required(),
    status: Joi.string().valid('present', 'absent', 'late', 'excused').required(),
    notes: Joi.string().allow('')
  }),

  checkIn: Joi.object({
    gymId: Joi.string().pattern(patterns.objectId).required(),
    checkInTime: Joi.date().default(Date.now),
    notes: Joi.string().allow('')
  }),

  checkOut: Joi.object({
    attendanceId: Joi.string().pattern(patterns.objectId).required(),
    checkOutTime: Joi.date().default(Date.now),
    notes: Joi.string().allow('')
  }),

  updateAttendance: Joi.object({
    status: Joi.string().valid('present', 'absent', 'late', 'excused'),
    checkInTime: Joi.date(),
    checkOutTime: Joi.date(),
    notes: Joi.string().allow(''),
    verified: Joi.boolean()
  }),

  bulkAttendanceUpdate: Joi.object({
    date: Joi.date().required(),
    classId: Joi.string().pattern(patterns.objectId),
    gymId: Joi.string().pattern(patterns.objectId).required(),
    attendees: Joi.array().items(
      Joi.object({
        memberId: Joi.string().pattern(patterns.objectId).required(),
        status: Joi.string().valid('present', 'absent', 'late', 'excused').required(),
        notes: Joi.string().allow('')
      })
    ).min(1).required()
  }),

  attendanceStats: Joi.object({
    startDate: Joi.date().required(),
    endDate: Joi.date().min(Joi.ref('startDate')).default(Date.now),
    gymId: Joi.string().pattern(patterns.objectId),
    classId: Joi.string().pattern(patterns.objectId),
    groupBy: Joi.string().valid('day', 'week', 'month', 'class', 'member')
  }),

  exportAttendance: Joi.object({
    startDate: Joi.date().required(),
    endDate: Joi.date().min(Joi.ref('startDate')).default(Date.now),
    format: Joi.string().valid('csv', 'excel', 'pdf', 'json').default('csv'),
    include: Joi.array().items(Joi.string().valid('member', 'class', 'gym', 'notes'))
  }),

  dateParam: Joi.object({
    date: Joi.date().required()
  }),

  initiatePayment: Joi.object({
    amount: Joi.number().positive().required(),
    currency: Joi.string().length(3).uppercase().default('USD'),
    description: Joi.string().required(),
    paymentMethod: Joi.string().valid('card', 'bank_transfer', 'wallet', 'cash').required(),
    metadata: Joi.object({
      memberId: Joi.string().pattern(patterns.objectId).required(),
      membershipId: Joi.string().pattern(patterns.objectId),
      classId: Joi.string().pattern(patterns.objectId),
      gymId: Joi.string().pattern(patterns.objectId).required()
    }).required(),
    receiptEmail: Joi.string().email()
  }),

  verifyPayment: Joi.object({
    paymentId: Joi.string().required(),
    paymentMethod: Joi.string().valid('card', 'bank_transfer', 'wallet', 'cash').required(),
    transactionId: Joi.string().required()
  }),

  createPayment: Joi.object({
    member: Joi.string().pattern(patterns.objectId).required(),
    gym: Joi.string().pattern(patterns.objectId).required(),
    amount: Joi.number().positive().required(),
    currency: Joi.string().length(3).uppercase().default('USD'),
    paymentMethod: Joi.string().valid('card', 'bank_transfer', 'wallet', 'cash').required(),
    status: Joi.string().valid('pending', 'completed', 'failed', 'refunded', 'partially_refunded').default('pending'),
    type: Joi.string().valid('membership', 'class', 'personal_training', 'merchandise', 'other').required(),
    referenceId: Joi.string().pattern(patterns.objectId),
    referenceType: Joi.string().valid('membership', 'class', 'training', 'product').when('referenceId', {
      is: Joi.exist(),
      then: Joi.required(),
      otherwise: Joi.optional()
    }),
    notes: Joi.string().allow(''),
    paymentDate: Joi.date().default(Date.now)
  }),

  updatePayment: Joi.object({
    status: Joi.string().valid('pending', 'completed', 'failed', 'refunded', 'partially_refunded'),
    amount: Joi.number().positive(),
    currency: Joi.string().length(3).uppercase(),
    notes: Joi.string().allow(''),
    receiptNumber: Joi.string(),
    paymentProof: Joi.string().uri()
  }),

  processRefund: Joi.object({
    amount: Joi.number().positive().required(),
    reason: Joi.string().required(),
    notes: Joi.string().allow(''),
    refundMethod: Joi.string().valid('original', 'credit', 'other').default('original')
  }),

  paymentList: Joi.object({
    member: Joi.string().pattern(patterns.objectId),
    gym: Joi.string().pattern(patterns.objectId),
    status: Joi.string().valid('pending', 'completed', 'failed', 'refunded', 'partially_refunded'),
    type: Joi.string().valid('membership', 'class', 'personal_training', 'merchandise', 'other'),
    startDate: Joi.date(),
    endDate: Joi.when('startDate', {
      is: Joi.exist(),
      then: Joi.date().min(Joi.ref('startDate')).required(),
      otherwise: Joi.date()
    }),
    sort: Joi.string().valid('date', 'amount', 'status').default('-date'),
    limit: Joi.number().integer().min(1).max(100).default(10),
    page: Joi.number().integer().min(1).default(1)
  }),

  paymentHistory: Joi.object({
    startDate: Joi.date(),
    endDate: Joi.when('startDate', {
      is: Joi.exist(),
      then: Joi.date().min(Joi.ref('startDate')).required(),
      otherwise: Joi.date()
    }),
    type: Joi.string().valid('all', 'incoming', 'outgoing').default('all'),
    limit: Joi.number().integer().min(1).max(50).default(10)
  }),

  paymentStats: Joi.object({
    period: Joi.string().valid('day', 'week', 'month', 'year', 'custom').default('month'),
    startDate: Joi.when('period', {
      is: 'custom',
      then: Joi.date().required(),
      otherwise: Joi.date()
    }),
    endDate: Joi.when('startDate', {
      is: Joi.exist(),
      then: Joi.date().min(Joi.ref('startDate')).required(),
      otherwise: Joi.date()
    }),
    groupBy: Joi.string().valid('day', 'week', 'month', 'year', 'gym', 'type').default('day'),
    gymId: Joi.string().pattern(patterns.objectId)
  }),

  exportPayments: Joi.object({
    startDate: Joi.date().required(),
    endDate: Joi.date().min(Joi.ref('startDate')).default(Date.now),
    format: Joi.string().valid('csv', 'excel', 'pdf', 'json').default('csv'),
    include: Joi.array().items(Joi.string().valid('member', 'gym', 'transactions', 'refunds'))
  }),

  addTokens: Joi.object({
    memberId: Joi.string().pattern(patterns.objectId).required(),
    amount: Joi.number().integer().min(1).required(),
    reason: Joi.string().required(),
    notes: Joi.string().allow(''),
    expiresAt: Joi.date().min('now')
  }),

  transferTokens: Joi.object({
    recipientId: Joi.string().pattern(patterns.objectId).required(),
    amount: Joi.number().integer().min(1).required(),
    notes: Joi.string().allow('')
  }),

  purchaseTokens: Joi.object({
    amount: Joi.number().integer().min(1).required(),
    paymentMethod: Joi.string().valid('card', 'bank_transfer', 'wallet').required(),
    paymentDetails: Joi.object({
      cardNumber: Joi.when('paymentMethod', {
        is: 'card',
        then: Joi.string().creditCard().required(),
        otherwise: Joi.forbidden()
      }),
      bankAccount: Joi.when('paymentMethod', {
        is: 'bank_transfer',
        then: Joi.string().required(),
        otherwise: Joi.forbidden()
      })
    })
  }),

  verifyTokenPurchase: Joi.object({
    transactionId: Joi.string().required(),
    paymentId: Joi.string().required(),
    verificationCode: Joi.string().required()
  }),

  tokenTransactionList: Joi.object({
    memberId: Joi.string().pattern(patterns.objectId),
    type: Joi.string().valid('all', 'earn', 'spend', 'transfer', 'purchase').default('all'),
    startDate: Joi.date(),
    endDate: Joi.when('startDate', {
      is: Joi.exist(),
      then: Joi.date().min(Joi.ref('startDate')).required(),
      otherwise: Joi.date()
    }),
    sort: Joi.string().valid('date', 'amount').default('-date'),
    limit: Joi.number().integer().min(1).max(100).default(10),
    page: Joi.number().integer().min(1).default(1)
  }),

  tokenStats: Joi.object({
    period: Joi.string().valid('day', 'week', 'month', 'year', 'custom').default('month'),
    startDate: Joi.when('period', {
      is: 'custom',
      then: Joi.date().required(),
      otherwise: Joi.date()
    }),
    endDate: Joi.when('startDate', {
      is: Joi.exist(),
      then: Joi.date().min(Joi.ref('startDate')).required(),
      otherwise: Joi.date()
    }),
    groupBy: Joi.string().valid('day', 'week', 'month', 'year', 'type').default('day')
  }),

  updateTokenRate: Joi.object({
    rate: Joi.number().positive().required(),
    currency: Joi.string().length(3).uppercase().default('USD'),
    effectiveFrom: Joi.date().default(Date.now),
    notes: Joi.string().allow('')
  }),

  exportTokenTransactions: Joi.object({
    startDate: Joi.date().required(),
    endDate: Joi.date().min(Joi.ref('startDate')).default(Date.now),
    format: Joi.string().valid('csv', 'excel', 'pdf', 'json').default('csv'),
    include: Joi.array().items(Joi.string().valid('member', 'gym', 'transactions'))
  })
};

export const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      allowUnknown: false
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message.replace(/['"]/g, '')
      }));
      throw new BadRequestError('Validation failed', { details: errors });
    }

    req.validatedData = value;
    next();
  };
};
