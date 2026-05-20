/**
 * @file Auth Service
 * @description Business logic for authentication (JWT, registration, login, OTP)
 */

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import UserRepository from "../repositories/user.repository.js";
import TokenRepository from "../repositories/token.repository.js";
import AuthRepository from "../repositories/auth.repository.js";
import logger from "../helpers/logger.js";
import sendOtpEmail from "../utils/sendOtpEmail.js";

/**
 * AuthService - Handles all authentication business logic
 */
class AuthService {
  /**
   * Constructor
   * @param {Connection} db - MongoDB connection instance
   * @param {Object} config - Domain config (JWT_SECRET, JWT_REFRESH_SECRET)
   */
  constructor(db, config) {
    this.userRepo = new UserRepository(db);
    this.tokenRepo = new TokenRepository(db);
    this.authRepo = new AuthRepository(db);
    this.config = config;
  }

  /**
   * Generate access token
   * @param {Object} user - User object with _id and role
   * @returns {string} JWT access token
   */
  generateAccessToken(user) {
    const payload = {
      userId: user._id || user.userId,
      role: user.role,
    };
    return jwt.sign(payload, this.config.JWT_SECRET, {
      expiresIn: "360m",
    });
  }

  /**
   * Generate refresh token
   * @param {Object} user - User object with _id and role
   * @returns {string} JWT refresh token
   */
  generateRefreshToken(user) {
    const payload = {
      userId: user._id || user.userId,
      role: user.role,
    };
    return jwt.sign(payload, this.config.JWT_SECRET_RERESH, {
      expiresIn: "15d",
    });
  }

  /**
   * Request OTP for registration
   * @param {string} email - Email address
   * @returns {Promise<Object>} { success: boolean, message: string }
   */
  async requestOtp(email) {
    try {
      logger.info("AuthService: Requesting OTP", { email });

      // Check if user already exists
      const existingUser = await this.userRepo.findByEmail(email);
      if (existingUser) {
        const error = new Error("Email already registered");
        error.statusCode = 409;
        throw error;
      }

      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      // Delete previous OTP if exists
      await this.authRepo.deleteByEmail(email);

      // Create new OTP
      await this.authRepo.createOtp(email, otp, 10); // 10 minutes expiration

      // Send OTP via email
      await sendOtpEmail(email, otp);

      logger.info("AuthService: OTP sent successfully", { email });

      return {
        success: true,
        message: "OTP sent to your email",
      };
    } catch (error) {
      logger.error("AuthService: Request OTP failed", error, { email });
      throw error;
    }
  }

  /**
   * Register new user with OTP verification
   * @param {Object} data - { username, email, password, otp }
   * @returns {Promise<Object>} User data (without password)
   */
  async register(data) {
    try {
      logger.info("AuthService: Registering user", { email: data.email });

      const { username, email, password, otp } = data;

      // ===== VALIDATION =====
      if (!username || !email || !password || !otp) {
        const error = new Error("Missing required fields");
        error.statusCode = 400;
        throw error;
      }

      // ===== CHECK EMAIL EXISTENCE =====
      const existingEmail = await this.userRepo.findByEmail(email);
      if (existingEmail) {
        const error = new Error("Email already registered");
        error.statusCode = 409;
        throw error;
      }

      // ===== CHECK USERNAME EXISTENCE =====
      const existingUsername = await this.userRepo.findByUsername(username);
      if (existingUsername) {
        const error = new Error("Username already taken");
        error.statusCode = 409;
        throw error;
      }

      // ===== VERIFY OTP =====
      const isValidOtp = await this.authRepo.isValidOtp(email, otp);
      if (!isValidOtp) {
        const error = new Error("Invalid or expired OTP");
        error.statusCode = 400;
        throw error;
      }

      // ===== HASH PASSWORD =====
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // ===== CREATE USER =====
      const user = await this.userRepo.create({
        username,
        email,
        password: hashedPassword,
        isVerified: true, // Mark as verified since email was verified via OTP
      });

      // ===== DELETE OTP =====
      await this.authRepo.deleteByEmail(email);

      logger.info("AuthService: User registered successfully", {
        userId: user._id,
        email,
      });

      // Return user without password
      const { password: _, ...userWithoutPassword } = user.toObject();

      return userWithoutPassword;
    } catch (error) {
      logger.error("AuthService: Registration failed", error, {
        email: data.email,
      });
      throw error;
    }
  }

  /**
   * Login user
   * @param {Object} data - { email, password }
   * @returns {Promise<Object>} { user, accessToken, refreshToken }
   */
  async login(data) {
    try {
      logger.info("AuthService: User login attempt", { email: data.email });

      const { email, password } = data;

      // ===== VALIDATION =====
      if (!email || !password) {
        const error = new Error("Email and password required");
        error.statusCode = 400;
        throw error;
      }

      // ===== FIND USER =====
      const user = await this.userRepo.findByEmail(email);
      if (!user) {
        const error = new Error("Email not registered");
        error.statusCode = 401;
        throw error;
      }

      // ===== VERIFY PASSWORD =====
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        logger.warn("AuthService: Invalid password attempt", { email });
        const error = new Error("Invalid password");
        error.statusCode = 401;
        throw error;
      }

      // ===== GENERATE TOKENS =====
      const accessToken = this.generateAccessToken(user);
      const refreshToken = this.generateRefreshToken(user);

      // ===== SAVE REFRESH TOKEN TO DB =====
      await this.tokenRepo.updateRefreshToken(user._id, refreshToken);

      logger.info("AuthService: Login successful", { userId: user._id });

      // Return user without password
      const { password: _, ...userWithoutPassword } = user.toObject();

      return {
        user: userWithoutPassword,
        accessToken: `Bearer ${accessToken}`,
        refreshToken,
      };
    } catch (error) {
      logger.error("AuthService: Login failed", error, { email: data.email });
      throw error;
    }
  }

  /**
   * Refresh access token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<Object>} { accessToken, refreshToken }
   */
  async refreshAccessToken(refreshToken) {
    try {
      logger.info("AuthService: Refreshing access token");

      if (!refreshToken) {
        const error = new Error("Refresh token required");
        error.statusCode = 400;
        throw error;
      }

      // ===== VERIFY REFRESH TOKEN VALIDITY IN DB =====
      const tokenDoc = await this.tokenRepo.findByRefreshToken(refreshToken);
      if (!tokenDoc) {
        const error = new Error("Invalid refresh token");
        error.statusCode = 401;
        throw error;
      }

      // ===== VERIFY JWT SIGNATURE =====
      let decoded;
      try {
        decoded = jwt.verify(refreshToken, this.config.JWT_SECRET_RERESH);
      } catch (err) {
        logger.error("AuthService: JWT verification failed", err);
        const error = new Error("Invalid or expired refresh token");
        error.statusCode = 401;
        throw error;
      }

      // ===== GET UPDATED USER INFO =====
      const user = await this.userRepo.findById(decoded.userId);
      if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
      }

      // ===== GENERATE NEW TOKENS =====
      const newAccessToken = this.generateAccessToken(user);
      const newRefreshToken = this.generateRefreshToken(user);

      // ===== UPDATE REFRESH TOKEN IN DB =====
      await this.tokenRepo.updateRefreshToken(user._id, newRefreshToken);

      logger.info("AuthService: Token refreshed successfully", {
        userId: user._id,
      });

      return {
        accessToken: `Bearer ${newAccessToken}`,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      logger.error("AuthService: Refresh token failed", error);
      throw error;
    }
  }

  /**
   * Logout user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} { success: boolean }
   */
  async logout(userId) {
    try {
      logger.info("AuthService: User logout", { userId });

      // Delete refresh token from DB
      await this.tokenRepo.deleteByUserId(userId);

      return { success: true };
    } catch (error) {
      logger.error("AuthService: Logout failed", error, { userId });
      throw error;
    }
  }

  /**
   * Verify token and get user info
   * @param {string} token - JWT token (without Bearer prefix)
   * @returns {Promise<Object>} Decoded token payload
   */
  async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, this.config.JWT_SECRET);
      return decoded;
    } catch (error) {
      logger.error("AuthService: Token verification failed", error);
      const err = new Error("Invalid or expired token");
      err.statusCode = 401;
      throw err;
    }
  }

  /**
   * Password reset request
   * @param {string} email - User email
   * @returns {Promise<Object>} { success: boolean, message: string }
   */
  async requestPasswordReset(email) {
    try {
      logger.info("AuthService: Password reset requested", { email });

      // Check if user exists
      const user = await this.userRepo.findByEmail(email);
      if (!user) {
        // Don't reveal if email exists (security)
        return {
          success: true,
          message: "If email exists, password reset link sent",
        };
      }

      // Generate reset token (in real app, save to DB with expiration)
      const resetToken = jwt.sign({ userId: user._id }, this.config.JWT_SECRET, {
        expiresIn: "1h",
      });

      // TODO: Send email with reset link
      // await sendPasswordResetEmail(email, resetToken);

      logger.info("AuthService: Password reset email sent", { email });

      return {
        success: true,
        message: "If email exists, password reset link sent",
      };
    } catch (error) {
      logger.error("AuthService: Password reset request failed", error);
      throw error;
    }
  }

  /**
   * Reset password with token
   * @param {string} token - Reset token
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} { success: boolean, message: string}
   */
  async resetPassword(token, newPassword) {
    try {
      logger.info("AuthService: Resetting password");

      // Verify token
      const decoded = jwt.verify(token, this.config.JWT_SECRET);

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Update user password
      await this.userRepo.findByIdAndUpdate(decoded.userId, {
        password: hashedPassword,
      });

      // Delete all refresh tokens for this user (force re-login)
      await this.tokenRepo.deleteByUserId(decoded.userId);

      logger.info("AuthService: Password reset successful", {
        userId: decoded.userId,
      });

      return {
        success: true,
        message: "Password reset successful",
      };
    } catch (error) {
      logger.error("AuthService: Password reset failed", error);
      throw error;
    }
  }
}

export default AuthService;
