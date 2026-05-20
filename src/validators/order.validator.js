/**
 * Order Validator
 * Validates order/booking data
 */
export default class OrderValidator {
  /**
   * Validate create order
   * @param {Object} data - Order data
   * @returns {Object} Validation result
   */
  static validateCreateOrder(data) {
    const errors = [];
    const validServiceTypes = ["Grap Bike", "Grap Express", "Grap 4 Chỗ", "Grap 7 Chỗ", "Grap 16 Chỗ", "Grap 29 Chỗ"];

    if (!data || typeof data !== "object") {
      return { valid: false, errors: ["Invalid data format"] };
    }

    if (!data.addressFrom) {
      errors.push("Pickup address is required");
    } else if (typeof data.addressFrom !== "string" || data.addressFrom.trim().length === 0) {
      errors.push("Pickup address must be a non-empty string");
    } else if (data.addressFrom.length > 500) {
      errors.push("Pickup address must not exceed 500 characters");
    }

    if (!data.addressTo) {
      errors.push("Destination address is required");
    } else if (typeof data.addressTo !== "string" || data.addressTo.trim().length === 0) {
      errors.push("Destination address must be a non-empty string");
    } else if (data.addressTo.length > 500) {
      errors.push("Destination address must not exceed 500 characters");
    }

    if (!data.serviceType) {
      errors.push("Service type is required");
    } else if (!validServiceTypes.includes(data.serviceType)) {
      errors.push(`Service type must be one of: ${validServiceTypes.join(", ")}`);
    }

    if (!data.phoneNumber) {
      errors.push("Phone number is required");
    } else if (!this.isValidPhone(data.phoneNumber)) {
      errors.push("Invalid phone number format");
    }

    if (data.additionalInfo !== undefined) {
      if (data.additionalInfo && data.additionalInfo.length > 500) {
        errors.push("Additional info must not exceed 500 characters");
      }
    }

    if (!data.userId && !data.visitorId) {
      errors.push("Either userId or visitorId is required");
    }

    if (data.paymentMethod !== undefined) {
      const validMethods = ["tiền mặt", "momo", "zaloPay", "bank_transfer"];
      if (!validMethods.includes(data.paymentMethod)) {
        errors.push(`Payment method must be one of: ${validMethods.join(", ")}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate status update
   * @param {Object} data - Status data
   * @returns {Object} Validation result
   */
  static validateUpdateStatus(data) {
    const errors = [];
    const validStatuses = ["đang xử lí", "đã đặt", "hoàn thành", "đã hủy"];

    if (!data || typeof data !== "object") {
      return { valid: false, errors: ["Invalid data format"] };
    }

    if (!data.status) {
      errors.push("Status is required");
    } else if (!validStatuses.includes(data.status)) {
      errors.push(`Status must be one of: ${validStatuses.join(", ")}`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate order cancellation
   * @param {Object} data - Cancellation data
   * @returns {Object} Validation result
   */
  static validateCancelOrder(data) {
    const errors = [];

    if (!data || typeof data !== "object") {
      return { valid: false, errors: ["Invalid data format"] };
    }

    if (!data.reason) {
      errors.push("Cancellation reason is required");
    } else if (typeof data.reason !== "string" || data.reason.trim().length === 0) {
      errors.push("Reason must be a non-empty string");
    } else if (data.reason.length > 300) {
      errors.push("Reason must not exceed 300 characters");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate order rating
   * @param {Object} data - Rating data
   * @returns {Object} Validation result
   */
  static validateRateOrder(data) {
    const errors = [];

    if (!data || typeof data !== "object") {
      return { valid: false, errors: ["Invalid data format"] };
    }

    if (data.rating === undefined || data.rating === null) {
      errors.push("Rating is required");
    } else if (!Number.isInteger(data.rating)) {
      errors.push("Rating must be an integer");
    } else if (data.rating < 1 || data.rating > 5) {
      errors.push("Rating must be between 1 and 5");
    }

    if (data.comment !== undefined && data.comment) {
      if (typeof data.comment !== "string") {
        errors.push("Comment must be a string");
      } else if (data.comment.length > 500) {
        errors.push("Comment must not exceed 500 characters");
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Check if phone is valid
   * @private
   * @param {String} phone - Phone number
   * @returns {Boolean} True if valid
   */
  static isValidPhone(phone) {
    const regex = /^(\+\d{1,3})?(\d{9,15})$/;
    return regex.test(phone.replace(/\D/g, ""));
  }
}
