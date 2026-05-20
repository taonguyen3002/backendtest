/**
 * Error Handling Middleware
 * Centralized error handling
 */

import logger from "../helpers/logger.js";
import { HTTP_STATUS, ERROR_MESSAGES } from "../constants/app.constants.js";

const errorHandler = (err, req, res, next) => {
  const errorData = {
    message: err.message || ERROR_MESSAGES.SERVER_ERROR,
    path: req.path,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString(),
  };

  let statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;

  // Handle specific error types
  if (err.name === "ValidationError") {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    errorData.message = ERROR_MESSAGES.VALIDATION_ERROR;
  } else if (err.name === "CastError") {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    errorData.message = "Invalid ID format";
  } else if (err.code === 11000) {
    statusCode = HTTP_STATUS.CONFLICT;
    errorData.message = "Duplicate field value entered";
  }

  // Log error
  logger.error(`${statusCode} - ${req.method} ${req.path}`, err, errorData);

  // Response
  res.status(statusCode).json({
    success: false,
    message: errorData.message,
    ...(process.env.NODE_ENV !== "production" && { error: err.message }),
  });
};

export default errorHandler;
