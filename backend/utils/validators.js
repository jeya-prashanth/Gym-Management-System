import validator from 'validator';
import { z } from 'zod';
import { isValidObjectId } from 'mongoose';

export const emailValidator = (email) => {
  if (!email) return 'Email is required';
  if (!validator.isEmail(email)) return 'Please enter a valid email';
  return '';
};

export const passwordValidator = (password) => {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Z]/.test(password)) return 'Must contain at least one uppercase letter';
  if (!/[a-z]/.test(password)) return 'Must contain at least one lowercase letter';
  if (!/[0-9]/.test(password)) return 'Must contain at least one number';
  if (!/[!@#$%^&*]/.test(password)) return 'Must contain at least one special character';
  return '';
};

export const nameValidator = (name) => {
  if (!name) return 'Name is required';
  if (name.length < 2) return 'Name must be at least 2 characters';
  if (name.length > 50) return 'Name cannot exceed 50 characters';
  if (!/^[a-zA-Z\s'-]+$/.test(name)) return 'Name contains invalid characters';
  return '';
};

export const phoneValidator = (phone) => {
  if (!phone) return 'Phone number is required';
  if (!/^[0-9]{10,15}$/.test(phone)) return 'Please enter a valid phone number';
  return '';
};

export const dateOfBirthValidator = (dob) => {
  if (!dob) return 'Date of birth is required';
  const today = new Date();
  const birthDate = new Date(dob);
  const age = today.getFullYear() - birthDate.getFullYear();
  
  if (isNaN(birthDate.getTime())) return 'Invalid date format';
  if (age < 13) return 'You must be at least 13 years old';
  if (age > 120) return 'Please enter a valid date of birth';
  return '';
};

export const addressValidator = (address) => {
  if (!address) return 'Address is required';
  if (address.length < 5) return 'Address is too short';
  if (address.length > 200) return 'Address cannot exceed 200 characters';
  return '';
};

export const validateObjectId = (id) => {
  if (!id) return 'ID is required';
  if (!isValidObjectId(id)) return 'Invalid ID format';
  return '';
};

export const validateTokenAmount = (amount) => {
  if (amount === undefined || amount === null) return 'Amount is required';
  if (isNaN(amount)) return 'Amount must be a number';
  if (amount <= 0) return 'Amount must be greater than 0';
  if (amount > 1000) return 'Amount cannot exceed 1000 tokens';
  return '';
};

export const validatePrice = (price) => {
  if (price === undefined || price === null) return 'Price is required';
  if (isNaN(price)) return 'Price must be a number';
  if (price < 0) return 'Price cannot be negative';
  if (price > 10000) return 'Price is too high';
  return '';
};

export const validateDescription = (description) => {
  if (!description) return 'Description is required';
  if (description.length < 10) return 'Description is too short';
  if (description.length > 1000) return 'Description cannot exceed 1000 characters';
  return '';
};

export const validateImageUrl = (url) => {
  if (!url) return 'Image URL is required';
  try {
    new URL(url);
    return '';
  } catch {
    return 'Please enter a valid URL';
  }
};

export const validateTimeSlot = (startTime, endTime) => {
  if (!startTime || !endTime) return 'Both start and end time are required';
  if (new Date(startTime) >= new Date(endTime)) return 'End time must be after start time';
  return '';
};

export const validateTags = (tags) => {
  if (!Array.isArray(tags)) return 'Tags must be an array';
  if (tags.length > 10) return 'Cannot have more than 10 tags';
  for (const tag of tags) {
    if (typeof tag !== 'string') return 'All tags must be strings';
    if (tag.length > 20) return 'Tag cannot exceed 20 characters';
  }
  return '';
};

export const userRegistrationSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/),
  phone: z.string().regex(/^[0-9]{10,15}$/),
  dateOfBirth: z.date().refine(dob => {
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear();
    return age >= 13 && age <= 120;
  }),
  address: z.object({
    street: z.string().min(5).max(100),
    city: z.string().min(2).max(50),
    state: z.string().min(2).max(50),
    country: z.string().min(2).max(50),
    zipCode: z.string().regex(/^[0-9]{5,10}$/)
  })
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export const tokenPurchaseSchema = z.object({
  packageId: z.string().refine(id => isValidObjectId(id), {
    message: 'Invalid package ID'
  }),
  paymentMethod: z.enum(['credit_card', 'debit_card', 'net_banking', 'upi', 'wallet']),
  paymentDetails: z.record(z.any())
});

export const classBookingSchema = z.object({
  classId: z.string().refine(id => isValidObjectId(id), {
    message: 'Invalid class ID'
  }),
  tokenAmount: z.number().int().positive().max(1000)
});

export const validateWithSchema = (schema, data) => {
  try {
    schema.parse(data);
    return { isValid: true, errors: null };
  } catch (error) {
    const errors = {};
    error.errors.forEach(err => {
      const path = err.path.join('.');
      errors[path] = err.message;
    });
    return { isValid: false, errors };
  }
};

export const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return validator.escape(validator.trim(input));
  }
  if (Array.isArray(input)) {
    return input.map(item => sanitizeInput(item));
  }
  if (typeof input === 'object' && input !== null) {
    return Object.keys(input).reduce((obj, key) => {
      obj[key] = sanitizeInput(input[key]);
      return obj;
    }, {});
  }
  return input;
};

export const validateFileUpload = (file, options = {}) => {
  const { maxSize = 5 * 1024 * 1024, allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'] } = options;
  
  if (!file) return 'No file provided';
  if (file.size > maxSize) return `File size must be less than ${maxSize / (1024 * 1024)}MB`;
  if (!allowedTypes.includes(file.type)) {
    return `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`;
  }
  return '';
};

export const validateCoordinates = (lat, lng) => {
  if (lat === undefined || lng === undefined) return 'Both latitude and longitude are required';
  if (isNaN(lat) || isNaN(lng)) return 'Coordinates must be numbers';
  if (lat < -90 || lat > 90) return 'Latitude must be between -90 and 90';
  if (lng < -180 || lng > 180) return 'Longitude must be between -180 and 180';
  return '';
};

export default {
  emailValidator,
  passwordValidator,
  nameValidator,
  phoneValidator,
  dateOfBirthValidator,
  addressValidator,
  validateObjectId,
  validateTokenAmount,
  validatePrice,
  validateDescription,
  validateImageUrl,
  validateTimeSlot,
  validateTags,
  userRegistrationSchema,
  loginSchema,
  tokenPurchaseSchema,
  classBookingSchema,
  validateWithSchema,
  sanitizeInput,
  validateFileUpload,
  validateCoordinates
};
