/**
 * Auth Validator
 * Validates authentication-related data
 */
export default class AuthValidator {
  /**
   * Validate request OTP
   * @param {Object} data - Request data
   * @returns {Object} Validation result
   */
  static validateRequestOtp(data) {
    const errors = [];

    if (!data || typeof data !== "object") {
      return { valid: false, errors: ["Invalid data format"] };
    }

    if (!data.email) {
      errors.push("Email is required");
    } else if (!this.isValidEmail(data.email)) {
      errors.push("Invalid email format");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate registration
   * @param {Object} data - Registration data
   * @returns {Object} Validation result
   */
  static validateRegister(data) {
    const errors = [];

    if (!data || typeof data !== "object") {
      return { valid: false, errors: ["Invalid data format"] };
    }

    if (!data.email) {
      errors.push("Email is required");
    } else if (!this.isValidEmail(data.email)) {
      errors.push("Invalid email format");
    }

    if (!data.username) {
      errors.push("Username is required");
    } else if (data.username.length < 3) {
      errors.push("Username must be at least 3 characters");
    } else if (!/^[a-zA-Z0-9_-]+$/.test(data.username)) {
      errors.push("Username can only contain alphanumeric, underscore, and hyphen");
    }

    if (!data.password) {
      errors.push("Password is required");
    } else if (data.password.length < 8) {
      errors.push("Password must be at least 8 characters");
    } else if (!this.isStrongPassword(data.password)) {
      errors.push("Password must contain uppercase, lowercase, number, and special character");
    }

    if (!data.otp) {
      errors.push("OTP is required");
    } else if (!/^\d{6}$/.test(data.otp)) {
      errors.push("OTP must be 6 digits");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate login
   * @param {Object} data - Login data
   * @returns {Object} Validation result
   */
  static validateLogin(data) {
    const errors = [];

    if (!data || typeof data !== "object") {
      return { valid: false, errors: ["Invalid data format"] };
    }

    if (!data.email) {
      errors.push("Email is required");
    } else if (!this.isValidEmail(data.email)) {
      errors.push("Invalid email format");
    }

    if (!data.password) {
      errors.push("Password is required");
    } else if (data.password.length < 8) {
      errors.push("Password is incorrect");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate refresh token
   * @param {Object} data - Token data
   * @returns {Object} Validation result
   */
  static validateRefreshToken(data) {
    const errors = [];

    if (!data || typeof data !== "object") {
      return { valid: false, errors: ["Invalid data format"] };
    }

    if (!data.refreshToken) {
      errors.push("Refresh token is required");
    } else if (typeof data.refreshToken !== "string") {
      errors.push("Refresh token must be a string");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate password reset request
   * @param {Object} data - Reset request data
   * @returns {Object} Validation result
   */
  static validatePasswordReset(data) {
    const errors = [];

    if (!data || typeof data !== "object") {
      return { valid: false, errors: ["Invalid data format"] };
    }

    if (!data.email) {
      errors.push("Email is required");
    } else if (!this.isValidEmail(data.email)) {
      errors.push("Invalid email format");
    }

    if (!data.newPassword) {
      errors.push("New password is required");
    } else if (data.newPassword.length < 8) {
      errors.push("Password must be at least 8 characters");
    } else if (!this.isStrongPassword(data.newPassword)) {
      errors.push("Password must contain uppercase, lowercase, number, and special character");
    }

    if (!data.resetToken) {
      errors.push("Reset token is required");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Check if email is valid
   * @private
   * @param {String} email - Email address
   * @returns {Boolean} True if valid
   */
  static isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email) && email.length <= 255;
  }

  /**
   * Check if password is strong
   * @private
   * @param {String} password - Password
   * @returns {Boolean} True if strong
   */
  static isStrongPassword(password) {
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    return hasUppercase && hasLowercase && hasNumber && hasSpecial;
  }
}
