/**
 * @file Base Service Class
 * @description Abstract service layer for business logic
 */

/**
 * Base Service Class
 * Provides common service methods and patterns
 */
export class BaseService {
  /**
   * Constructor
   * @param {Object} model - Mongoose model or repository
   * @param {string} serviceName - Service name for logging
   */
  constructor(model, serviceName = "Service") {
    this.model = model;
    this.serviceName = serviceName;
    this.logger = console; // Replace with actual logger
  }

  /**
   * Log info
   * @param {string} message - Log message
   * @param {Object} data - Additional data
   */
  logInfo(message, data = {}) {
    this.logger.log(`[${this.serviceName}] INFO: ${message}`, data);
  }

  /**
   * Log error
   * @param {string} message - Error message
   * @param {Object} data - Additional data
   */
  logError(message, data = {}) {
    this.logger.error(`[${this.serviceName}] ERROR: ${message}`, data);
  }

  /**
   * Validate input data
   * @param {Object} data - Data to validate
   * @param {Array} rules - Validation rules
   * @returns {Object} Validation result
   */
  validate(data, rules = []) {
    const errors = [];

    for (const rule of rules) {
      const { field, required, type, min, max, pattern, custom } = rule;

      if (required && (data[field] === undefined || data[field] === null)) {
        errors.push({ field, message: `${field} is required` });
        continue;
      }

      if (data[field] !== undefined && data[field] !== null) {
        // Type check
        if (type && typeof data[field] !== type) {
          errors.push({
            field,
            message: `${field} must be of type ${type}`,
          });
          continue;
        }

        // Length check
        if (type === "string") {
          if (min && data[field].length < min) {
            errors.push({
              field,
              message: `${field} must be at least ${min} characters`,
            });
          }

          if (max && data[field].length > max) {
            errors.push({
              field,
              message: `${field} must be at most ${max} characters`,
            });
          }

          // Pattern check
          if (pattern && !pattern.test(data[field])) {
            errors.push({
              field,
              message: `${field} format is invalid`,
            });
          }
        }

        // Array length check
        if (Array.isArray(data[field])) {
          if (min && data[field].length < min) {
            errors.push({
              field,
              message: `${field} must have at least ${min} items`,
            });
          }

          if (max && data[field].length > max) {
            errors.push({
              field,
              message: `${field} must have at most ${max} items`,
            });
          }
        }

        // Custom validation
        if (custom && typeof custom === "function") {
          const customError = custom(data[field], data);
          if (customError) {
            errors.push({ field, message: customError });
          }
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Format response object
   * @param {Object} data - Data to format
   * @returns {Object} Formatted response
   */
  formatResponse(data) {
    return {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Throw formatted error
   * @param {string} message - Error message
   * @param {number} status - HTTP status code
   * @param {Object} data - Additional error data
   */
  throwError(message, status = 500, data = null) {
    const error = new Error(message);
    error.status = status;
    error.data = data;
    throw error;
  }

  /**
   * Handle pagination parameters
   * @param {Object} query - Query parameters
   * @returns {Object} Pagination params
   */
  getPaginationParams(query = {}) {
    let page = parseInt(query.page) || 1;
    let limit = parseInt(query.limit) || 20;

    // Validate
    page = Math.max(1, page);
    limit = Math.min(Math.max(1, limit), 100);

    return {
      page,
      limit,
      skip: (page - 1) * limit,
    };
  }

  /**
   * Get sort parameters
   * @param {string} sortBy - Sort field
   * @param {string} order - Sort order (asc|desc)
   * @returns {Object} Sort object
   */
  getSortParams(sortBy = "createdAt", order = "desc") {
    const validOrder = ["asc", "desc"].includes(order) ? order : "desc";
    return {
      [sortBy]: validOrder === "asc" ? 1 : -1,
    };
  }

  /**
   * Build query filter
   * @param {Object} filters - Filter object
   * @param {Array} allowedFields - Allowed filter fields
   * @returns {Object} MongoDB filter query
   */
  buildFilter(filters = {}, allowedFields = []) {
    const query = {};

    for (const field of allowedFields) {
      if (filters[field] !== undefined && filters[field] !== null) {
        query[field] = filters[field];
      }
    }

    return query;
  }

  /**
   * Build search query
   * @param {string} searchText - Search text
   * @param {Array} searchFields - Fields to search
   * @returns {Object} MongoDB search query
   */
  buildSearchQuery(searchText, searchFields = []) {
    if (!searchText || searchFields.length === 0) {
      return {};
    }

    return {
      $or: searchFields.map((field) => ({
        [field]: { $regex: searchText, $options: "i" },
      })),
    };
  }

  /**
   * Sanitize sensitive data
   * @param {Object} data - Data to sanitize
   * @param {Array} sensitiveFields - Fields to remove
   * @returns {Object} Sanitized data
   */
  sanitize(data, sensitiveFields = ["password", "token", "refreshToken"]) {
    const sanitized = { ...data };

    for (const field of sensitiveFields) {
      delete sanitized[field];
    }

    return sanitized;
  }

  /**
   * Transform to plain object
   * @param {Object} data - Data to transform
   * @returns {Object} Plain object
   */
  toPlain(data) {
    if (!data) return data;

    if (typeof data.toObject === "function") {
      return data.toObject();
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.toPlain(item));
    }

    return { ...data };
  }

  /**
   * Batch process items
   * @param {Array} items - Items to process
   * @param {Function} processor - Processing function
   * @param {number} batchSize - Batch size
   * @returns {Promise<Array>} Results
   */
  async processBatch(items, processor, batchSize = 50) {
    const results = [];

    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch.map(processor));
      results.push(...batchResults);
    }

    return results;
  }
}

export default BaseService;
