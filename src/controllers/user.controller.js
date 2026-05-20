/**
 * @file User Controller
 * @description HTTP handler for user management endpoints
 */

import UserService from "../services/user.service.js";
import UserValidator from "../validators/user.validator.js";
import logger from "../helpers/logger.js";

/**
 * UserController - Handles user management HTTP requests
 */
class UserController {
  /**
   * Constructor
   * @param {Connection} db - MongoDB connection instance
   */
  constructor(db) {
    this.userService = new UserService(db);
  }

  /**
   * Get user profile by ID
   * GET /api/v1/users/:id
   */
  async getUserProfile(req, res, next) {
    try {
      const { id } = req.params;

      logger.info("UserController: Get user profile", { userId: id });

      // ===== VALIDATION =====
      if (!id || id.length !== 24) {
        return res.status(400).json({
          success: false,
          message: "Invalid user ID",
        });
      }

      // ===== CALL SERVICE =====
      const user = await this.userService.getUserById(id);

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      if (error.statusCode === 404) {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  }

  /**
   * Get public user profile
   * GET /api/v1/users/:id/profile
   */
  async getPublicProfile(req, res, next) {
    try {
      const { id } = req.params;

      logger.info("UserController: Get public profile", { userId: id });

      if (!id || id.length !== 24) {
        return res.status(400).json({
          success: false,
          message: "Invalid user ID",
        });
      }

      // ===== CALL SERVICE =====
      const user = await this.userService.getPublicProfile(id);

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      if (error.statusCode === 404) {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  }

  /**
   * Get all users (paginated)
   * GET /api/v1/users?page=1&limit=10&role=user
   */
  async getAllUsers(req, res, next) {
    try {
      const { page = 1, limit = 10, role, isActive, isVerified } = req.query;

      logger.info("UserController: Get all users", { page, limit });

      // ===== PREPARE FILTERS =====
      const filters = {};
      if (role) filters.role = role;
      if (isActive !== undefined) filters.isActive = isActive === "true";
      if (isVerified !== undefined) filters.isVerified = isVerified === "true";

      // ===== CALL SERVICE =====
      const result = await this.userService.getUsers(parseInt(page), parseInt(limit), filters);

      res.status(200).json({
        success: true,
        data: result.users,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get active users only
   * GET /api/v1/users/active?page=1&limit=10
   */
  async getActiveUsers(req, res, next) {
    try {
      const { page = 1, limit = 10 } = req.query;

      logger.info("UserController: Get active users", { page, limit });

      // ===== CALL SERVICE =====
      const result = await this.userService.getActiveUsers(parseInt(page), parseInt(limit));

      res.status(200).json({
        success: true,
        data: result.users,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get users by role
   * GET /api/v1/users/role/:role?page=1&limit=10
   */
  async getUsersByRole(req, res, next) {
    try {
      const { role } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const validRoles = ["user", "admin", "moderator"];
      if (!validRoles.includes(role)) {
        return res.status(400).json({
          success: false,
          message: "Invalid role",
        });
      }

      logger.info("UserController: Get users by role", { role, page, limit });

      // ===== CALL SERVICE =====
      const result = await this.userService.getUsersByRole(role, parseInt(page), parseInt(limit));

      res.status(200).json({
        success: true,
        data: result.users,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user profile
   * PUT /api/v1/users/:id
   */
  async updateProfile(req, res, next) {
    try {
      const { id } = req.params;
      const { username, email, fullname, bio, avatar, phone, address } = req.body;

      logger.info("UserController: Update profile", { userId: id });

      // ===== VALIDATION =====
      if (!id || id.length !== 24) {
        return res.status(400).json({
          success: false,
          message: "Invalid user ID",
        });
      }

      // Build update object (only allowed fields)
      const updateData = {};
      if (username) updateData.username = username;
      if (email) updateData.email = email;
      if (fullname) updateData.fullname = fullname;
      if (bio !== undefined) updateData.bio = bio;
      if (avatar) updateData.avatar = avatar;
      if (phone !== undefined) updateData.phone = phone;
      if (address !== undefined) updateData.address = address;

      // ===== CALL SERVICE =====
      const user = await this.userService.updateProfile(id, updateData);

      res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: user,
      });
    } catch (error) {
      if (error.statusCode === 404) {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  }

  /**
   * Update user balance
   * PUT /api/v1/users/:id/balance
   */
  async updateBalance(req, res, next) {
    try {
      const { id } = req.params;
      const { amount } = req.body;

      logger.info("UserController: Update balance", { userId: id, amount });

      // ===== VALIDATION =====
      if (!id || id.length !== 24) {
        return res.status(400).json({
          success: false,
          message: "Invalid user ID",
        });
      }

      if (typeof amount !== "number") {
        return res.status(400).json({
          success: false,
          message: "Amount must be a number",
        });
      }

      // ===== CALL SERVICE =====
      const result = await this.userService.updateBalance(id, amount);

      res.status(200).json({
        success: true,
        message: "Balance updated",
        data: result,
      });
    } catch (error) {
      if (error.statusCode === 404) {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  }

  /**
   * Verify user email
   * POST /api/v1/users/:id/verify
   */
  async verifyUser(req, res, next) {
    try {
      const { id } = req.params;

      logger.info("UserController: Verify user", { userId: id });

      if (!id || id.length !== 24) {
        return res.status(400).json({
          success: false,
          message: "Invalid user ID",
        });
      }

      // ===== CALL SERVICE =====
      const user = await this.userService.verifyUser(id);

      res.status(200).json({
        success: true,
        message: "User verified",
        data: user,
      });
    } catch (error) {
      if (error.statusCode === 404) {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  }

  /**
   * Deactivate user account
   * POST /api/v1/users/:id/deactivate
   */
  async deactivateUser(req, res, next) {
    try {
      const { id } = req.params;

      logger.info("UserController: Deactivate user", { userId: id });

      if (!id || id.length !== 24) {
        return res.status(400).json({
          success: false,
          message: "Invalid user ID",
        });
      }

      // ===== CALL SERVICE =====
      await this.userService.deactivateUser(id);

      res.status(200).json({
        success: true,
        message: "User deactivated",
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Activate user account
   * POST /api/v1/users/:id/activate
   */
  async activateUser(req, res, next) {
    try {
      const { id } = req.params;

      logger.info("UserController: Activate user", { userId: id });

      if (!id || id.length !== 24) {
        return res.status(400).json({
          success: false,
          message: "Invalid user ID",
        });
      }

      // ===== CALL SERVICE =====
      await this.userService.activateUser(id);

      res.status(200).json({
        success: true,
        message: "User activated",
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete user account
   * DELETE /api/v1/users/:id
   */
  async deleteUser(req, res, next) {
    try {
      const { id } = req.params;

      logger.info("UserController: Delete user", { userId: id });

      if (!id || id.length !== 24) {
        return res.status(400).json({
          success: false,
          message: "Invalid user ID",
        });
      }

      // ===== CALL SERVICE =====
      await this.userService.deleteUser(id);

      res.status(200).json({
        success: true,
        message: "User deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Change user role (Admin only)
   * PUT /api/v1/users/:id/role
   */
  async changeRole(req, res, next) {
    try {
      const { id } = req.params;
      const { role } = req.body;

      logger.info("UserController: Change user role", { userId: id, role });

      if (!id || id.length !== 24) {
        return res.status(400).json({
          success: false,
          message: "Invalid user ID",
        });
      }

      if (!role) {
        return res.status(400).json({
          success: false,
          message: "Role is required",
        });
      }

      // ===== CALL SERVICE =====
      const user = await this.userService.changeRole(id, role);

      res.status(200).json({
        success: true,
        message: "User role updated",
        data: user,
      });
    } catch (error) {
      if (error.statusCode === 400 || error.statusCode === 404) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  }
}

export default UserController;
