import Joi from 'joi';
import { Types } from 'mongoose';
import { ErrorResponse } from '../../utils/errorResponse.js';
import Class from '../../models/classModel.js';
import { validateRequest } from '../validate.js';

const validateObjectId = (value, helpers) => {
  if (!Types.ObjectId.isValid(value)) {
    return helpers.error('any.invalid');
  }
  return value;
};

const timePattern = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;

const classStatuses = ['scheduled', 'ongoing', 'completed', 'cancelled'];
const classTypes = ['yoga', 'hiit', 'strength', 'cardio', 'pilates', 'spinning', 'crossfit', 'zumba'];
const difficultyLevels = ['beginner', 'intermediate', 'advanced', 'all-levels'];

const scheduleSchema = Joi.object({
  date: Joi.date().iso().required(),
  startTime: Joi.string().pattern(timePattern).required(),
  endTime: Joi.string().pattern(timePattern).required(),
  recurrence: Joi.string().valid('none', 'daily', 'weekly', 'monthly').default('none'),
  endDate: Joi.when('recurrence', {
    is: Joi.not('none'),
    then: Joi.date().iso().min(Joi.ref('date')).required(),
    otherwise: Joi.forbidden()
  })
});

export const createClassSchema = Joi.object({
  title: Joi.string().min(5).max(100).required(),
  description: Joi.string().min(10).max(1000).required(),
  classType: Joi.string().valid(...classTypes).required(),
  difficulty: Joi.string().valid(...difficultyLevels).required(),
  trainer: Joi.string().custom(validateObjectId).required(),
  capacity: Joi.number().integer().min(1).max(100).required(),
  schedule: scheduleSchema.required(),
  location: Joi.object({
    room: Joi.string().required(),
    building: Joi.string().required(),
    address: Joi.string().required(),
    onlineLink: Joi.string().uri().allow('')
  }),
  price: Joi.number().min(0).required(),
  equipment: Joi.array().items(Joi.string()),
  requirements: Joi.array().items(Joi.string()),
  image: Joi.string().uri().allow(''),
  isActive: Joi.boolean().default(true)
});

export const updateClassSchema = Joi.object({
  title: Joi.string().min(5).max(100),
  description: Joi.string().min(10).max(1000),
  classType: Joi.string().valid(...classTypes),
  difficulty: Joi.string().valid(...difficultyLevels),
  trainer: Joi.string().custom(validateObjectId),
  capacity: Joi.number().integer().min(1).max(100),
  schedule: scheduleSchema,
  location: Joi.object({
    room: Joi.string(),
    building: Joi.string(),
    address: Joi.string(),
    onlineLink: Joi.string().uri().allow('')
  }),
  price: Joi.number().min(0),
  equipment: Joi.array().items(Joi.string()),
  requirements: Joi.array().items(Joi.string()),
  image: Joi.string().uri().allow(''),
  isActive: Joi.boolean(),
  status: Joi.string().valid(...classStatuses)
}).min(1);

export const classBookingSchema = Joi.object({
  userId: Joi.string().custom(validateObjectId).required(),
  classId: Joi.string().custom(validateObjectId).required(),
  bookingDate: Joi.date().iso().required(),
  paymentMethod: Joi.string().valid('card', 'wallet', 'free').required(),
  paymentId: Joi.when('paymentMethod', {
    is: 'card',
    then: Joi.string().required(),
    otherwise: Joi.string().allow('')
  }),
  useCredits: Joi.boolean().default(false)
});

export const classWaitlistSchema = Joi.object({
  userId: Joi.string().custom(validateObjectId).required(),
  classId: Joi.string().custom(validateObjectId).required(),
  joinDate: Joi.date().default(Date.now)
});

export const classAttendanceSchema = Joi.object({
  userId: Joi.string().custom(validateObjectId).required(),
  status: Joi.string().valid('present', 'absent', 'late', 'excused').required(),
  notes: Joi.string().allow('')
});

export const classReviewSchema = Joi.object({
  rating: Joi.number().min(1).max(5).required(),
  comment: Joi.string().max(500).allow('')
});

export const validateCreateClass = validateRequest(createClassSchema);
export const validateUpdateClass = validateRequest(updateClassSchema);
export const validateClassBooking = validateRequest(classBookingSchema);
export const validateWaitlist = validateRequest(classWaitlistSchema);
export const validateAttendance = validateRequest(classAttendanceSchema);
export const validateReview = validateRequest(classReviewSchema);

export const checkClassExists = async (req, res, next) => {
  const classId = req.params.classId || req.body.classId;
  if (!classId) {
    return next(new ErrorResponse('Class ID is required', 400));
  }
  
  const classItem = await Class.findById(classId);
  if (!classItem) {
    return next(new ErrorResponse('Class not found', 404));
  }
  
  req.classItem = classItem;
  next();
};

export const checkClassCapacity = async (req, res, next) => {
  const classItem = req.classItem;
  const currentBookings = classItem.participants?.length || 0;
  
  if (currentBookings >= classItem.capacity) {
    return next(new ErrorResponse('Class is at full capacity', 400));
  }
  
  next();
};

export const checkClassSchedule = (req, res, next) => {
  const { startTime, endTime } = req.body.schedule || {};
  
  if (startTime && endTime) {
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    
    if (start >= end) {
      return next(new ErrorResponse('End time must be after start time', 400));
    }
    
    const duration = (end - start) / (1000 * 60);
    if (duration < 15 || duration > 180) {
      return next(new ErrorResponse('Class duration must be between 15 minutes and 3 hours', 400));
    }
  }
  
  next();
};

export const checkClassNotStarted = (req, res, next) => {
  const classItem = req.classItem;
  const now = new Date();
  const classTime = new Date(`${classItem.schedule.date}T${classItem.schedule.startTime}`);
  
  if (now > classTime) {
    return next(new ErrorResponse('Cannot modify class that has already started', 400));
  }
  
  next();
};

export const checkUserNotEnrolled = async (req, res, next) => {
  const classItem = req.classItem;
  const userId = req.user.id || req.body.userId;
  
  if (classItem.participants?.includes(userId)) {
    return next(new ErrorResponse('User is already enrolled in this class', 400));
  }
  
  next();
};

export const checkUserEnrolled = async (req, res, next) => {
  const classItem = req.classItem;
  const userId = req.user.id || req.body.userId;
  
  if (!classItem.participants?.includes(userId)) {
    return next(new ErrorResponse('User is not enrolled in this class', 400));
  }
  
  next();
};