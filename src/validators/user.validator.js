/**
 * Validator - Request Validation
 * Validate request data trước khi xử lý
 * Trả về { valid: boolean, errors: [] }
 */

class UserValidator {
  // ✅ Validate create user
  static validateCreateUser(data) {
    const errors = [];

    if (!data.email || data.email.trim() === "") {
      errors.push({ field: "email", message: "Email is required" });
    } else if (!this.isValidEmail(data.email)) {
      errors.push({ field: "email", message: "Email format is invalid" });
    }

    if (!data.password || data.password.trim() === "") {
      errors.push({ field: "password", message: "Password is required" });
    } else if (data.password.length < 6) {
      errors.push({ field: "password", message: "Password must be at least 6 characters" });
    }

    if (!data.name || data.name.trim() === "") {
      errors.push({ field: "name", message: "Name is required" });
    } else if (data.name.length < 3) {
      errors.push({ field: "name", message: "Name must be at least 3 characters" });
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // ✅ Validate update user
  static validateUpdateUser(data) {
    const errors = [];

    if (data.email && !this.isValidEmail(data.email)) {
      errors.push({ field: "email", message: "Email format is invalid" });
    }

    if (data.password && data.password.length < 6) {
      errors.push({ field: "password", message: "Password must be at least 6 characters" });
    }

    if (data.name && data.name.length < 3) {
      errors.push({ field: "name", message: "Name must be at least 3 characters" });
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // ✅ Validate pagination params
  static validatePagination(page, limit) {
    const errors = [];

    if (page && (isNaN(page) || page < 1)) {
      errors.push({ field: "page", message: "Page must be a positive number" });
    }

    if (limit && (isNaN(limit) || limit < 1 || limit > 100)) {
      errors.push({ field: "limit", message: "Limit must be between 1 and 100" });
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // ✅ Helper: Check valid email
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

export default UserValidator;
