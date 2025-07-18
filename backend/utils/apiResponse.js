class ApiError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ApiResponse {
  constructor(statusCode, data, message = 'Success') {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }

  static success(data, message = 'Operation successful') {
    return new ApiResponse(200, data, message);
  }

  static created(data, message = 'Resource created successfully') {
    return new ApiResponse(201, data, message);
  }

  static noContent(message = 'No content') {
    return new ApiResponse(204, null, message);
  }

  static badRequest(message = 'Bad request') {
    return new ApiResponse(400, null, message);
  }

  static unauthorized(message = 'Unauthorized') {
    return new ApiResponse(401, null, message);
  }

  static forbidden(message = 'Forbidden') {
    return new ApiResponse(403, null, message);
  }

  static notFound(message = 'Resource not found') {
    return new ApiResponse(404, null, message);
  }

  static conflict(message = 'Resource already exists') {
    return new ApiResponse(409, null, message);
  }

  static error(message = 'Internal server error', statusCode = 500) {
    return new ApiResponse(statusCode, null, message);
  }

  static validationError(errors, message = 'Validation failed') {
    return new ApiResponse(422, { errors }, message);
  }

  toJSON() {
    return {
      success: this.success,
      message: this.message,
      data: this.data,
      status: this.statusCode
    };
  }
}

export const successResponse = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

export const errorResponse = (res, message = 'Error', statusCode = 500, error = null) => {
  const response = {
    success: false,
    message,
    status: statusCode
  };

  if (error && process.env.NODE_ENV === 'development') {
    response.error = error.message;
    response.stack = error.stack;
  }

  return res.status(statusCode).json(response);
};

export const validationError = (res, errors, message = 'Validation failed') => {
  return res.status(422).json({
    success: false,
    message,
    errors
  });
};

export const paginatedResponse = (res, data, pagination, message = 'Success') => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      total: pagination.total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(pagination.total / pagination.limit)
    }
  });
};

export const notFoundResponse = (res, message = 'Resource not found') => {
  return errorResponse(res, message, 404);
};

export const unauthorizedResponse = (res, message = 'Unauthorized') => {
  return errorResponse(res, message, 401);
};

export const forbiddenResponse = (res, message = 'Forbidden') => {
  return errorResponse(res, message, 403);
};

export const conflictResponse = (res, message = 'Resource already exists') => {
  return errorResponse(res, message, 409);
};

export const badRequestResponse = (res, message = 'Bad request') => {
  return errorResponse(res, message, 400);
};

export const internalServerError = (res, error = null) => {
  return errorResponse(
    res,
    'Internal server error',
    500,
    error
  );
};

export const handleAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();
  
  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  };

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
};

export {
  ApiError,
  ApiResponse,
  successResponse,
  errorResponse,
  validationError,
  paginatedResponse,
  notFoundResponse,
  unauthorizedResponse,
  forbiddenResponse,
  conflictResponse,
  badRequestResponse,
  internalServerError,
  handleAsync,
  sendTokenResponse
};

export default {
  ApiError,
  ApiResponse,
  successResponse,
  errorResponse,
  validationError,
  paginatedResponse,
  notFoundResponse,
  unauthorizedResponse,
  forbiddenResponse,
  conflictResponse,
  badRequestResponse,
  internalServerError,
  handleAsync,
  sendTokenResponse
};
