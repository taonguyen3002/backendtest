/**
 * @file Base Controller Class
 * @description Abstract controller for standardized request/response handling
 */

/**
 * Base Controller Class
 * Provides standardized response formatting and error handling
 */
export class BaseController {
  /**
   * Constructor
   * @param {Object} service - Business logic service
   * @param {string} controllerName - Controller name for logging
   */
  constructor(service, controllerName = "Controller") {
    this.service = service;
    this.controllerName = controllerName;
  }

  /**
   * Send success response
   * @param {Object} res - Express response
   * @param {Object} data - Response data
   * @param {number} status - HTTP status code
   * @param {string} message - Success message
   */
  sendSuccess(res, data = null, status = 200, message = "Success") {
    res.status(status).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Send paginated response
   * @param {Object} res - Express response
   * @param {Array} items - Data items
   * @param {Object} pagination - Pagination info
   * @param {string} message - Success message
   */
  sendPaginated(res, items = [], pagination = {}, message = "Success") {
    res.status(200).json({
      success: true,
      message,
      data: items,
      pagination: {
        page: pagination.page || 1,
        limit: pagination.limit || 20,
        total: pagination.total || items.length,
        pages: pagination.pages || 1,
        hasNext: pagination.hasNext || false,
        hasPrev: pagination.hasPrev || false,
      },
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Send error response
   * @param {Object} res - Express response
   * @param {Error} error - Error object
   * @param {number} status - HTTP status code
   */
  sendError(res, error, status = 500) {
    const isDevelopment = process.env.NODE_ENV === "development";

    res.status(status).json({
      success: false,
      error: {
        message: error.message || "An error occurred",
        code: `ERR_${status}`,
        ...(error.data && { ...error.data }),
      },
      ...(isDevelopment && error.stack && { debug: error.stack }),
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Send validation error response
   * @param {Object} res - Express response
   * @param {Array} errors - Validation errors
   * @param {string} message - Error message
   */
  sendValidationError(res, errors = [], message = "Validation failed") {
    res.status(400).json({
      success: false,
      error: {
        message,
        code: "ERR_VALIDATION",
        validationErrors: errors.map((err) => ({
          field: err.field,
          message: err.message,
        })),
      },
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Send not found response
   * @param {Object} res - Express response
   * @param {string} resource - Resource name
   */
  sendNotFound(res, resource = "Resource") {
    res.status(404).json({
      success: false,
      error: {
        message: `${resource} not found`,
        code: "ERR_NOT_FOUND",
      },
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Send unauthorized response
   * @param {Object} res - Express response
   * @param {string} message - Error message
   */
  sendUnauthorized(res, message = "Unauthorized access") {
    res.status(401).json({
      success: false,
      error: {
        message,
        code: "ERR_UNAUTHORIZED",
      },
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Send forbidden response
   * @param {Object} res - Express response
   * @param {string} message - Error message
   */
  sendForbidden(res, message = "Access forbidden") {
    res.status(403).json({
      success: false,
      error: {
        message,
        code: "ERR_FORBIDDEN",
      },
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Send conflict response (duplicate)
   * @param {Object} res - Express response
   * @param {string} field - Conflicting field
   * @param {string} message - Error message
   */
  sendConflict(res, field, message = "Resource already exists") {
    res.status(409).json({
      success: false,
      error: {
        message,
        code: "ERR_CONFLICT",
        field,
      },
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Get pagination params from request
   * @param {Object} req - Express request
   * @returns {Object} Pagination params
   */
  getPaginationParams(req) {
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 20;

    page = Math.max(1, page);
    limit = Math.min(Math.max(1, limit), 100);

    return { page, limit, skip: (page - 1) * limit };
  }

  /**
   * Get sort params from request
   * @param {Object} req - Express request
   * @param {string} defaultField - Default sort field
   * @returns {Object} Sort object
   */
  getSortParams(req, defaultField = "createdAt") {
    const sortBy = req.query.sortBy || defaultField;
    const order = req.query.order === "asc" ? 1 : -1;

    return { [sortBy]: order };
  }

  /**
   * Get filter params from request
   * @param {Object} req - Express request
   * @param {Array} allowedFields - Allowed filter fields
   * @returns {Object} Filter query
   */
  getFilterParams(req, allowedFields = []) {
    const filter = {};

    for (const field of allowedFields) {
      if (req.query[field] !== undefined) {
        filter[field] = req.query[field];
      }
    }

    return filter;
  }

  /**
   * Async wrapper for
 error handling
   * @param {Function} fn - Async function
   * @returns {Function} Express handler
   */
  async asyncHandler(fn) {
    return async (req, res) => {
      try {
        await fn(req, res);
      } catch (error) {
        console.error(`[${this.controllerName}] Error:`, error);

        if (error.status === 400) {
          return this.sendValidationError(res, error.data?.errors || [], error.message);
        }

        if (error.status === 401) {
          return this.sendUnauthorized(res, error.message);
        }

        if (error.status === 403) {
          return this.sendForbidden(res, error.message);
        }

        if (error.status === 404) {
          return this.sendNotFound(res, error.message);
        }

        if (error.status === 409) {
          return this.sendConflict(res, error.data?.field, error.message);
        }

        this.sendError(res, error, error.status || 500);
      }
    };
  }

  /**
   * Validate permission
   * @param {Object} req - Express request
   * @param {Object} permission - Permission config
   */
  validatePermission(req, permission) {
    if (!req.user) {
      throw new Error("Unauthorized");
    }

    const { action, resourceOwner, requiredRole } = permission;

    if (requiredRole && req.user.role !== requiredRole) {
      throw new Error("Access denied");
    }

    if (resourceOwner && req.user.userId !== resourceOwner) {
      throw new Error("Only owner can perform this action");
    }
  }
}

export default BaseController;
