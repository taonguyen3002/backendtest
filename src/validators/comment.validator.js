/**
 * Comment Validator
 * Validates comment data
 */
export default class CommentValidator {
  /**
   * Validate create comment
   * @param {Object} data - Comment data
   * @returns {Object} Validation result
   */
  static validateCreateComment(data) {
    const errors = [];

    if (!data || typeof data !== "object") {
      return { valid: false, errors: ["Invalid data format"] };
    }

    if (!data.postId) {
      errors.push("Post ID is required");
    } else if (typeof data.postId !== "string" || data.postId.length === 0) {
      errors.push("Invalid post ID");
    }

    if (!data.authorId) {
      errors.push("Author ID is required");
    } else if (typeof data.authorId !== "string" || data.authorId.length === 0) {
      errors.push("Invalid author ID");
    }

    if (!data.authorName) {
      errors.push("Author name is required");
    } else if (typeof data.authorName !== "string") {
      errors.push("Author name must be a string");
    } else if (data.authorName.length < 2) {
      errors.push("Author name must be at least 2 characters");
    } else if (data.authorName.length > 100) {
      errors.push("Author name must not exceed 100 characters");
    }

    if (!data.content) {
      errors.push("Content is required");
    } else if (typeof data.content !== "string") {
      errors.push("Content must be a string");
    } else if (data.content.trim().length === 0) {
      errors.push("Content cannot be empty");
    } else if (data.content.length < 1) {
      errors.push("Content must be at least 1 character");
    } else if (data.content.length > 2000) {
      errors.push("Content must not exceed 2000 characters");
    }

    // Optional parent ID for replies
    if (data.parentId !== undefined) {
      if (data.parentId && typeof data.parentId !== "string") {
        errors.push("Parent ID must be a string or null");
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate comment update
   * @param {Object} data - Update data
   * @returns {Object} Validation result
   */
  static validateUpdateComment(data) {
    const errors = [];

    if (!data || typeof data !== "object") {
      return { valid: false, errors: ["Invalid data format"] };
    }

    if (data.content !== undefined) {
      if (typeof data.content !== "string") {
        errors.push("Content must be a string");
      } else if (data.content.trim().length === 0) {
        errors.push("Content cannot be empty");
      } else if (data.content.length > 2000) {
        errors.push("Content must not exceed 2000 characters");
      }
    }

    if (data.authorName !== undefined) {
      if (typeof data.authorName !== "string") {
        errors.push("Author name must be a string");
      } else if (data.authorName.length < 2) {
        errors.push("Author name must be at least 2 characters");
      } else if (data.authorName.length > 100) {
        errors.push("Author name must not exceed 100 characters");
      }
    }

    // At least one field must be provided for update
    if (!data.content && !data.authorName) {
      errors.push("At least one field must be provided for update");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
