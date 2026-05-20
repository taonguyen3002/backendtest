/**
 * @file Auth Controller
 * @description HTTP handler for authentication endpoints
 */

import AuthService from "../services/auth.service.js";
import AuthValidator from "../validators/auth.validator.js";
import logger from "../helpers/logger.js";

/**
 * AuthController - Handles authentication HTTP requests
 */
class AuthController {
  /**
   * Constructor
   * @param {Connection} db - MongoDB connection instance
   * @param {Object} config - Domain config
   */
  constructor(db, config) {
    this.authService = new AuthService(db, config);
  }

  /**
   * Request OTP for registration
   * POST /api/v1/auth/request-otp
   */
  async requestOtp(req, res, next) {
    try {
      const { email } = req.body;

      logger.info("AuthController: Request OTP", { email });

      // ===== VALIDATION =====
      const validation = AuthValidator.validateRequestOtp({ email });
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          errors: validation.errors,
        });
      }

      // ===== CALL SERVICE =====
      const result = await this.authService.requestOtp(email);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Register new user
   * POST /api/v1/auth/register
   */
  async register(req, res, next) {
    try {
      const { username, email, password, otp } = req.body;

      logger.info("AuthController: Register", { email });

      // ===== VALIDATION =====
      const validation = AuthValidator.validateRegister({
        username,
        email,
        password,
        otp,
      });
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          errors: validation.errors,
        });
      }

      // ===== CALL SERVICE =====
      const user = await this.authService.register({
        username,
        email,
        password,
        otp,
      });

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: user,
      });
    } catch (error) {
      // Handle specific errors
      if (error.statusCode === 409) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  }

  /**
   * Login user
   * POST /api/v1/auth/login
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      logger.info("AuthController: Login", { email });

      // ===== VALIDATION =====
      const validation = AuthValidator.validateLogin({ email, password });
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          errors: validation.errors,
        });
      }

      // ===== CALL SERVICE =====
      const { user, accessToken, refreshToken } = await this.authService.login({
        email,
        password,
      });

      // ===== SET COOKIES =====
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        path: "/",
        sameSite: "None",
        maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
      });

      res.status(200).json({
        success: true,
        message: "Login successful",
        data: {
          user,
          accessToken,
        },
      });
    } catch (error) {
      if (error.statusCode === 401 || error.statusCode === 400) {
        return res.status(error.statusCode || 400).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  }

  /**
   * Refresh access token
   * POST /api/v1/auth/refresh-token
   */
  async refreshToken(req, res, next) {
    try {
      logger.info("AuthController: Refresh token");

      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: "Refresh token required",
        });
      }

      // ===== CALL SERVICE =====
      const tokens = await this.authService.refreshAccessToken(refreshToken);

      // ===== SET COOKIES =====
      res.cookie("refreshToken", tokens.refreshToken, {
        httpOnly: true,
        secure: true,
        path: "/",
        sameSite: "None",
        maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
      });

      res.status(200).json({
        success: true,
        data: {
          accessToken: tokens.accessToken,
        },
      });
    } catch (error) {
      if (error.statusCode === 401 || error.statusCode === 400) {
        return res.status(error.statusCode || 400).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  }

  /**
   * Logout user
   * POST /api/v1/auth/logout
   */
  async logout(req, res, next) {
    try {
      const userId = req.user?.userId || req.body.userId;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "User ID required",
        });
      }

      logger.info("AuthController: Logout", { userId });

      // ===== CALL SERVICE =====
      await this.authService.logout(userId);

      // ===== CLEAR COOKIES =====
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true,
        path: "/",
        sameSite: "None",
      });

      res.status(200).json({
        success: true,
        message: "Logout successful",
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Request password reset
   * POST /api/v1/auth/request-password-reset
   */
  async requestPasswordReset(req, res, next) {
    try {
      const { email } = req.body;

      logger.info("AuthController: Request password reset", { email });

      // ===== VALIDATION =====
      const validation = AuthValidator.validateEmail({ email });
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          errors: validation.errors,
        });
      }

      // ===== CALL SERVICE =====
      const result = await this.authService.requestPasswordReset(email);

      res.status(200).json({
        success: result.success,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reset password with token
   * POST /api/v1/auth/reset-password
   */
  async resetPassword(req, res, next) {
    try {
      const { token, newPassword } = req.body;

      logger.info("AuthController: Reset password");

      // ===== VALIDATION =====
      const validation = AuthValidator.validatePassword({ password: newPassword });
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          errors: validation.errors,
        });
      }

      if (!token) {
        return res.status(400).json({
          success: false,
          message: "Reset token required",
        });
      }

      // ===== CALL SERVICE =====
      const result = await this.authService.resetPassword(token, newPassword);

      res.status(200).json({
        success: result.success,
        message: result.message,
      });
    } catch (error) {
      if (error.message.includes("Invalid") || error.message.includes("expired")) {
        return res.status(400).json({
          success: false,
          message: "Invalid or expired reset token",
        });
      }
      next(error);
    }
  }

  /**
   * Verify token (check if token is valid)
   * GET /api/v1/auth/verify
   */
  async verifyToken(req, res, next) {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;

      if (!token) {
        return res.status(400).json({
          success: false,
          message: "Token required",
        });
      }

      // ===== CALL SERVICE =====
      const decoded = await this.authService.verifyToken(token);

      res.status(200).json({
        success: true,
        data: decoded,
      });
    } catch (error) {
      if (error.statusCode === 401) {
        return res.status(401).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  }

  /**
   * Get current user info (from JWT)
   * GET /api/v1/auth/me
   */
  async getCurrentUser(req, res, next) {
    try {
      // req.user should be set by auth middleware
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Not authenticated",
        });
      }

      logger.info("AuthController: Get current user", { userId: req.user.userId });

      res.status(200).json({
        success: true,
        data: req.user,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default AuthController;
