/**
 * @file Error Handler Middleware
 * @description Centralized error handling for all API responses
 */

/**
 * Custom API Error class
 */
export class APIError extends Error {
  constructor(message, status = 500, data = null) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = "APIError";
  }
}

/**
 * Validation Error
 */
export class ValidationError extends APIError {
  constructor(message, errors = []) {
    super(message, 400, { validationErrors: errors });
    this.name = "ValidationError";
  }
}

/**
 * Not Found Error
 */
export class NotFoundError extends APIError {
  constructor(resource = "Resource") {
    super(`${resource} not found`, 404);
    this.name = "NotFoundError";
  }
}

/**
 * Unauthorized Error
 */
export class UnauthorizedError extends APIError {
  constructor(message = "Unauthorized access") {
    super(message, 401);
    this.name = "UnauthorizedError";
  }
}

/**
 * Forbidden Error
 */
export class ForbiddenError extends APIError {
  constructor(message = "Access forbidden") {
    super(message, 403);
    this.name = "ForbiddenError";
  }
}

/**
 * Conflict Error
 */
export class ConflictError extends APIError {
  constructor(message, field = null) {
    super(message, 409, field ? { field } : null);
    this.name = "ConflictError";
  }
}

/**
 * Global error handler middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next
 */
export const errorHandler = (err, req, res, next) => {
  // Log error for debugging
  const isDevelopment = process.env.NODE_ENV === "development";

  if (isDevelopment) {
    console.error("Error:", {
      name: err.name,
      message: err.message,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
      timestamp: new Date().toISOString(),
    });
  }

  // Determine error status and message
  let status = 500;
  let message = "Internal Server Error";
  let errors = null;
  let data = null;

  if (err instanceof APIError) {
    status = err.status;
    message = err.message;
    data = err.data;
  } else if (err.name === "ValidationError") {
    // Mongoose validation error
    status = 400;
    message = "Validation failed";
    errors = Object.keys(err.errors).map((field) => ({
      field,
      message: err.errors[field].message,
    }));
  } else if (err.name === "CastError") {
    // MongoDB casting error
    status = 400;
    message = "Invalid ID format";
  } else if (err.name === "MongoServerError" && err.code === 11000) {
    // Duplicate key error
    const field = Object.keys(err.keyPattern)[0];
    status = 409;
    message = `${field} already exists`;
    data = { field };
  } else if (err.name === "TokenExpiredError") {
    status = 401;
    message = "Token has expired";
  } else if (err.name === "JsonWebTokenError") {
    status = 401;
    message = "Invalid token";
  } else if (err.message) {
    // Generic error with message
    message = err.message;
  }

  // Build response
  const response = {
    success: false,
    error: {
      message,
      code: `ERR_${status}`,
      ...(errors && { validationErrors: errors }),
      ...(data && { ...data }),
    },
    ...(isDevelopment && { debug: err.message }),
  };

  // Add request ID if available
  if (req.id) {
    response.requestId = req.id;
  }

  // Send error response
  res.status(status).json(response);
};

/**
 * 404 handler middleware
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Route ${req.originalUrl} not found`,
      code: "ERR_404",
    },
    ...(req.id && { requestId: req.id }),
  });
};

/**
 * Async handler wrapper - catches async errors
 * @param {Function} fn - Async function
 * @returns {Function} Express middleware
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default {
  APIError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  errorHandler,
  notFoundHandler,
  asyncHandler,
};
