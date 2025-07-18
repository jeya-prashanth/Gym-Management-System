import Joi from 'joi';
import { Types } from 'mongoose';
import { ErrorResponse } from '../../utils/errorResponse.js';
import User from '../../models/userModel.js';
import { roles } from '../../config/roles.js';
import { validateRequest } from '../validate.js';

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const phonePattern = /^[0-9]{10}$/;

const validateObjectId = (value, helpers) => {
  if (!Types.ObjectId.isValid(value)) {
    return helpers.error('any.invalid');
  }
  return value;
};

export const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().pattern(passwordPattern).required().messages({
    'string.pattern.base': 'Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character',
  }),
  role: Joi.string().valid(...Object.values(roles)).default(roles.MEMBER),
  phone: Joi.string().pattern(phonePattern).required(),
  dateOfBirth: Joi.date().max('now').iso().required(),
  gender: Joi.string().valid('male', 'female', 'other').required(),
  address: Joi.object({
    street: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    country: Joi.string().required(),
    postalCode: Joi.string().required(),
  }),
  emergencyContact: Joi.object({
    name: Joi.string().required(),
    relationship: Joi.string().required(),
    phone: Joi.string().pattern(phonePattern).required(),
  }),
  healthInfo: Joi.object({
    bloodGroup: Joi.string().valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
    medicalConditions: Joi.array().items(Joi.string()),
    allergies: Joi.array().items(Joi.string()),
    injuries: Joi.array().items(Joi.string()),
  }),
  termsAccepted: Joi.boolean().valid(true).required(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  rememberMe: Joi.boolean().default(false),
});

export const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(50),
  phone: Joi.string().pattern(phonePattern),
  dateOfBirth: Joi.date().max('now').iso(),
  gender: Joi.string().valid('male', 'female', 'other'),
  address: Joi.object({
    street: Joi.string(),
    city: Joi.string(),
    state: Joi.string(),
    country: Joi.string(),
    postalCode: Joi.string(),
  }),
  emergencyContact: Joi.object({
    name: Joi.string(),
    relationship: Joi.string(),
    phone: Joi.string().pattern(phonePattern),
  }),
  healthInfo: Joi.object({
    bloodGroup: Joi.string().valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
    medicalConditions: Joi.array().items(Joi.string()),
    allergies: Joi.array().items(Joi.string()),
    injuries: Joi.array().items(Joi.string()),
  }),
  profileImage: Joi.string().uri(),
}).min(1);

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().pattern(passwordPattern).required().invalid(Joi.ref('currentPassword')).messages({
    'string.pattern.base': 'Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character',
    'any.invalid': 'New password must be different from current password',
  }),
  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
    'any.only': 'Passwords do not match',
  }),
});

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

export const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  password: Joi.string().pattern(passwordPattern).required().messages({
    'string.pattern.base': 'Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character',
  }),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only': 'Passwords do not match',
  }),
});

export const updateUserSchema = Joi.object({
  name: Joi.string().min(2).max(50),
  email: Joi.string().email(),
  phone: Joi.string().pattern(phonePattern),
  role: Joi.string().valid(...Object.values(roles)),
  status: Joi.string().valid('active', 'inactive', 'suspended'),
  membership: Joi.object({
    type: Joi.string().valid('basic', 'premium', 'elite'),
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso().min(Joi.ref('startDate')),
    status: Joi.string().valid('active', 'expired', 'cancelled'),
  }),
  assignedTrainer: Joi.string().custom(validateObjectId),
  gym: Joi.string().custom(validateObjectId),
}).min(1);

export const validateRegistration = validateRequest(registerSchema);
export const validateLogin = validateRequest(loginSchema);
export const validateProfileUpdate = validateRequest(updateProfileSchema);
export const validatePasswordChange = validateRequest(changePasswordSchema);
export const validateForgotPassword = validateRequest(forgotPasswordSchema);
export const validateResetPassword = validateRequest(resetPasswordSchema);
export const validateUserUpdate = validateRequest(updateUserSchema);

export const checkEmailExists = async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (user) {
    return next(new ErrorResponse('Email already in use', 400));
  }
  next();
};

export const checkUserExists = async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }
  req.user = user;
  next();
};

export const checkUserRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(`User role ${req.user.role} is not authorized to access this route`, 403)
      );
    }
    next();
  };
};

export const checkMembershipStatus = async (req, res, next) => {
  if (req.user.role === roles.MEMBER && !req.user.membership?.isActive) {
    return next(new ErrorResponse('Active membership required', 403));
  }
  next();
};