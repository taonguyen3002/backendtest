/**
 * Post Validator
 * Validates post/article data
 */
export default class PostValidator {
  /**
   * Validate create post
   * @param {Object} data - Post data
   * @returns {Object} Validation result
   */
  static validateCreatePost(data) {
    const errors = [];

    if (!data || typeof data !== "object") {
      return { valid: false, errors: ["Invalid data format"] };
    }

    if (!data.title) {
      errors.push("Title is required");
    } else if (typeof data.title !== "string") {
      errors.push("Title must be a string");
    } else if (data.title.length < 5) {
      errors.push("Title must be at least 5 characters");
    } else if (data.title.length > 200) {
      errors.push("Title must not exceed 200 characters");
    }

    if (!data.description) {
      errors.push("Description is required");
    } else if (typeof data.description !== "string") {
      errors.push("Description must be a string");
    } else if (data.description.length < 20) {
      errors.push("Description must be at least 20 characters");
    } else if (data.description.length > 500) {
      errors.push("Description must not exceed 500 characters");
    }

    if (!data.content) {
      errors.push("Content is required");
    } else if (typeof data.content !== "string") {
      errors.push("Content must be a string");
    } else if (data.content.length < 100) {
      errors.push("Content must be at least 100 characters");
    } else if (data.content.length > 50000) {
      errors.push("Content must not exceed 50000 characters");
    }

    if (!data.category) {
      errors.push("Category is required");
    } else if (typeof data.category !== "string" || data.category.trim().length === 0) {
      errors.push("Category must be a non-empty string");
    }

    if (data.tags !== undefined) {
      if (!Array.isArray(data.tags)) {
        errors.push("Tags must be an array");
      } else if (data.tags.length > 10) {
        errors.push("Maximum 10 tags allowed");
      } else if (!data.tags.every((tag) => typeof tag === "string")) {
        errors.push("All tags must be strings");
      }
    }

    if (data.image !== undefined && data.image) {
      if (typeof data.image !== "string" || !this.isValidUrl(data.image)) {
        errors.push("Invalid image URL");
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate post update
   * @param {Object} data - Update data
   * @returns {Object} Validation result
   */
  static validateUpdatePost(data) {
    const errors = [];

    if (!data || typeof data !== "object") {
      return { valid: false, errors: ["Invalid data format"] };
    }

    // All fields are optional for update, but validate if provided
    if (data.title !== undefined) {
      if (typeof data.title !== "string") {
        errors.push("Title must be a string");
      } else if (data.title.length < 5) {
        errors.push("Title must be at least 5 characters");
      } else if (data.title.length > 200) {
        errors.push("Title must not exceed 200 characters");
      }
    }

    if (data.description !== undefined) {
      if (typeof data.description !== "string") {
        errors.push("Description must be a string");
      } else if (data.description.length < 20) {
        errors.push("Description must be at least 20 characters");
      } else if (data.description.length > 500) {
        errors.push("Description must not exceed 500 characters");
      }
    }

    if (data.content !== undefined) {
      if (typeof data.content !== "string") {
        errors.push("Content must be a string");
      } else if (data.content.length < 100) {
        errors.push("Content must be at least 100 characters");
      } else if (data.content.length > 50000) {
        errors.push("Content must not exceed 50000 characters");
      }
    }

    if (data.category !== undefined) {
      if (typeof data.category !== "string" || data.category.trim().length === 0) {
        errors.push("Category must be a non-empty string");
      }
    }

    if (data.tags !== undefined) {
      if (!Array.isArray(data.tags)) {
        errors.push("Tags must be an array");
      } else if (data.tags.length > 10) {
        errors.push("Maximum 10 tags allowed");
      }
    }

    if (data.image !== undefined && data.image) {
      if (!this.isValidUrl(data.image)) {
        errors.push("Invalid image URL");
      }
    }

    if (data.isIndexed !== undefined && typeof data.isIndexed !== "boolean") {
      errors.push("isIndexed must be a boolean");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate slug change
   * @param {Object} data - Slug data
   * @returns {Object} Validation result
   */
  static validateChangeSlug(data) {
    const errors = [];

    if (!data || typeof data !== "object") {
      return { valid: false, errors: ["Invalid data format"] };
    }

    if (!data.slug) {
      errors.push("Slug is required");
    } else if (typeof data.slug !== "string") {
      errors.push("Slug must be a string");
    } else if (!this.isValidSlug(data.slug)) {
      errors.push("Slug must contain only lowercase letters, numbers, and hyphens");
    } else if (data.slug.length < 3) {
      errors.push("Slug must be at least 3 characters");
    } else if (data.slug.length > 100) {
      errors.push("Slug must not exceed 100 characters");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Check if slug is valid
   * @private
   * @param {String} slug - Slug
   * @returns {Boolean} True if valid
   */
  static isValidSlug(slug) {
    return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
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
