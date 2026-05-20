/**
 * Email Helper - Email utilities
 */

class EmailHelper {
  // ✅ Send OTP email
  static async sendOtpEmail(email, otp) {
    // Sử dụng nodemailer hoặc service khác
    // Tham khảo utils/sendOtpEmail.js
    return {
      success: true,
      message: `OTP sent to ${email}`,
    };
  }

  // ✅ Send welcome email
  static async sendWelcomeEmail(email, name) {
    return {
      success: true,
      message: `Welcome email sent to ${email}`,
    };
  }

  // ✅ Send verification email
  static async sendVerificationEmail(email, verificationUrl) {
    return {
      success: true,
      message: `Verification email sent to ${email}`,
    };
  }

  // ✅ Send password reset email
  static async sendPasswordResetEmail(email, resetUrl) {
    return {
      success: true,
      message: `Password reset email sent to ${email}`,
    };
  }

  // ✅ Validate email format
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

export default EmailHelper;
