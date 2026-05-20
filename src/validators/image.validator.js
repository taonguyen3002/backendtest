/**
 * Image Validator
 * Validates image data
 */
export default class ImageValidator {
  /**
   * Validate create image
   * @param {Object} data - Image data
   * @returns {Object} Validation result
   */
  static validateCreateImage(data) {
    const errors = [];
    const validMimeTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];

    if (!data || typeof data !== "object") {
      return { valid: false, errors: ["Invalid data format"] };
    }

    if (!data.filePath) {
      errors.push("File path is required");
    } else if (typeof data.filePath !== "string" || data.filePath.trim().length === 0) {
      errors.push("File path must be a non-empty string");
    } else if (data.filePath.length > 1000) {
      errors.push("File path must not exceed 1000 characters");
    }

    if (data.publicId !== undefined && data.publicId) {
      if (typeof data.publicId !== "string") {
        errors.push("Public ID must be a string");
      } else if (data.publicId.length > 300) {
        errors.push("Public ID must not exceed 300 characters");
      }
    }

    if (data.fileName !== undefined && data.fileName) {
      if (typeof data.fileName !== "string") {
        errors.push("File name must be a string");
      } else if (data.fileName.length > 255) {
        errors.push("File name must not exceed 255 characters");
      }
    }

    if (data.mimeType !== undefined && data.mimeType) {
      if (!validMimeTypes.includes(data.mimeType)) {
        errors.push(`MIME type must be one of: ${validMimeTypes.join(", ")}`);
      }
    }

    if (data.size !== undefined) {
      if (typeof data.size !== "number") {
        errors.push("Size must be a number");
      } else if (data.size < 0) {
        errors.push("Size must be non-negative");
      } else if (data.size > 50 * 1024 * 1024) {
        errors.push("File size must not exceed 50MB");
      }
    }

    if (data.url !== undefined && data.url) {
      if (typeof data.url !== "string" || !this.isValidUrl(data.url)) {
        errors.push("Invalid URL format");
      }
    }

    if (data.isPublic !== undefined && typeof data.isPublic !== "boolean") {
      errors.push("isPublic must be a boolean");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate update image
   * @param {Object} data - Update data
   * @returns {Object} Validation result
   */
  static validateUpdateImage(data) {
    const errors = [];

    if (!data || typeof data !== "object") {
      return { valid: false, errors: ["Invalid data format"] };
    }

    if (data.fileName !== undefined && data.fileName) {
      if (typeof data.fileName !== "string") {
        errors.push("File name must be a string");
      } else if (data.fileName.length > 255) {
        errors.push("File name must not exceed 255 characters");
      }
    }

    if (data.metadata !== undefined && data.metadata) {
      if (typeof data.metadata !== "object") {
        errors.push("Metadata must be an object");
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate visibility change
   * @param {Object} data - Visibility data
   * @returns {Object} Validation result
   */
  static validateUpdateVisibility(data) {
    const errors = [];

    if (!data || typeof data !== "object") {
      return { valid: false, errors: ["Invalid data format"] };
    }

    if (data.isPublic === undefined || data.isPublic === null) {
      errors.push("isPublic is required");
    } else if (typeof data.isPublic !== "boolean") {
      errors.push("isPublic must be a boolean");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Check if URL is valid
   * @private
   * @param {String} url - URL
   * @returns {Boolean} True if valid
   */
  static isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}
