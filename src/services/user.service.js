/**
 * @file User Service
 * @description Business logic for user management (profile, settings, etc.)
 */

import UserRepository from "../repositories/user.repository.js";
import logger from "../helpers/logger.js";

/**
 * UserService - Handles user profile and management operations
 */
class UserService {
  /**
   * Constructor
   * @param {Connection} db - MongoDB connection instance
   */
  constructor(db) {
    this.userRepo = new UserRepository(db);
  }

  /**
   * Get user by ID (with sensitive fields filtered)
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User data without password
   */
  async getUserById(userId) {
    try {
      logger.info("UserService: Getting user", { userId });

      const user = await this.userRepo.findByIdWithoutPassword(userId);
      if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
      }

      return user.toObject();
    } catch (error) {
      logger.error("UserService: Get user failed", error, { userId });
      throw error;
    }
  }

  /**
   * Get public user profile
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Limited user info for public view
   */
  async getPublicProfile(userId) {
    try {
      const user = await this.userRepo.findById(userId);
      if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
      }

      // Return only public-facing fields
      return {
        _id: user._id,
        username: user.username,
        fullname: user.fullname,
        avatar: user.avatar,
        bio: user.bio,
        createdAt: user.createdAt,
      };
    } catch (error) {
      logger.error("UserService: Get public profile failed", error, { userId });
      throw error;
    }
  }

  /**
   * Get all users with pagination
   * @param {number} page - Page number (1-indexed)
   * @param {number} limit - Items per page
   * @param {Object} filters - Query filters
   * @returns {Promise<Object>} { users, pagination }
   */
  async getUsers(page = 1, limit = 10, filters = {}) {
    try {
      logger.info("UserService: Getting users", { page, limit, filters });

      const skip = (page - 1) * limit;
      const [users, total] = await Promise.all([
        this.userRepo.find(filters, skip, limit),
        this.userRepo.count(filters),
      ]);

      return {
        users: users.map((user) => ({
          _id: user._id,
          username: user.username,
          email: user.email,
          fullname: user.fullname,
          role: user.role,
          avatar: user.avatar,
          isVerified: user.isVerified,
          isActive: user.isActive,
          createdAt: user.createdAt,
        })),
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error("UserService: Get users failed", error, { page, limit });
      throw error;
    }
  }

  /**
   * Get active users only
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise<Object>} { users, pagination }
   */
  async getActiveUsers(page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      const [users, total] = await Promise.all([
        this.userRepo.findActiveUsers({}, skip, limit),
        this.userRepo.count({ isActive: true }),
      ]);

      return {
        users: users.map((user) => this.formatUser(user)),
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error("UserService: Get active users failed", error);
      throw error;
    }
  }

  /**
   * Get users by role
   * @param {string} role - User role
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise<Object>} { users, pagination }
   */
  async getUsersByRole(role, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      const [users, total] = await Promise.all([
        this.userRepo.findByRole(role, skip, limit),
        this.userRepo.count({ role }),
      ]);

      return {
        users: users.map((user) => this.formatUser(user)),
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error("UserService: Get users by role failed", error, { role });
      throw error;
    }
  }

  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated user data
   */
  async updateProfile(userId, updateData) {
    try {
      logger.info("UserService: Updating user profile", { userId });

      // Don't allow certain fields to be updated
      const forbiddenFields = ["password", "role", "isAppAdmin"];
      forbiddenFields.forEach((field) => {
        delete updateData[field];
      });

      const user = await this.userRepo.findByIdAndUpdate(userId, updateData);
      if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
      }

      logger.info("UserService: Profile updated successfully", { userId });

      return this.formatUser(user);
    } catch (error) {
      logger.error("UserService: Update profile failed", error, { userId });
      throw error;
    }
  }

  /**
   * Update user balance
   * @param {string} userId - User ID
   * @param {number} amount - Amount to add/subtract
   * @returns {Promise<Object>} Updated user balance
   */
  async updateBalance(userId, amount) {
    try {
      logger.info("UserService: Updating user balance", { userId, amount });

      const user = await this.userRepo.updateBalance(userId, amount);
      if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
      }

      logger.info("UserService: Balance updated", { userId, newBalance: user.balance });

      return {
        _id: user._id,
        balance: user.balance,
      };
    } catch (error) {
      logger.error("UserService: Update balance failed", error, { userId });
      throw error;
    }
  }

  /**
   * Verify user email
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Updated user data
   */
  async verifyUser(userId) {
    try {
      logger.info("UserService: Verifying user", { userId });

      const user = await this.userRepo.updateVerification(userId, true);
      if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
      }

      logger.info("UserService: User verified", { userId });

      return this.formatUser(user);
    } catch (error) {
      logger.error("UserService: Verify user failed", error, { userId });
      throw error;
    }
  }

  /**
   * Deactivate user account
   * @param {string} userId - User ID
   * @returns {Promise<Object>} { success: boolean }
   */
  async deactivateUser(userId) {
    try {
      logger.info("UserService: Deactivating user", { userId });

      await this.userRepo.findByIdAndUpdate(userId, { isActive: false });

      logger.info("UserService: User deactivated", { userId });

      return { success: true };
    } catch (error) {
      logger.error("UserService: Deactivate user failed", error, { userId });
      throw error;
    }
  }

  /**
   * Activate user account
   * @param {string} userId - User ID
   * @returns {Promise<Object>} { success: boolean }
   */
  async activateUser(userId) {
    try {
      logger.info("UserService: Activating user", { userId });

      await this.userRepo.findByIdAndUpdate(userId, { isActive: true });

      logger.info("UserService: User activated", { userId });

      return { success: true };
    } catch (error) {
      logger.error("UserService: Activate user failed", error, { userId });
      throw error;
    }
  }

  /**
   * Delete user account
   * @param {string} userId - User ID
   * @returns {Promise<Object>} { success: boolean }
   */
  async deleteUser(userId) {
    try {
      logger.info("UserService: Deleting user", { userId });

      await this.userRepo.delete(userId);

      logger.info("UserService: User deleted", { userId });

      return { success: true };
    } catch (error) {
      logger.error("UserService: Delete user failed", error, { userId });
      throw error;
    }
  }

  /**
   * Change user role (admin only)
   * @param {string} userId - User ID
   * @param {string} newRole - New role (user, admin, moderator)
   * @returns {Promise<Object>} Updated user data
   */
  async changeRole(userId, newRole) {
    try {
      logger.info("UserService: Changing user role", { userId, newRole });

      const validRoles = ["user", "admin", "moderator"];
      if (!validRoles.includes(newRole)) {
        const error = new Error("Invalid role");
        error.statusCode = 400;
        throw error;
      }

      const user = await this.userRepo.findByIdAndUpdate(userId, {
        role: newRole,
      });

      if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
      }

      logger.info("UserService: Role changed successfully", { userId, newRole });

      return this.formatUser(user);
    } catch (error) {
      logger.error("UserService: Change role failed", error, { userId });
      throw error;
    }
  }

  /**
   * Format user for response (without sensitive fields)
   * @param {Object} user - User document
   * @returns {Object} Formatted user
   */
  formatUser(user) {
    const { password, ...userWithoutPassword } = user.toObject();
    return userWithoutPassword;
  }
  // ✅ Update user
  async updateUser(userId, updateData) {
    try {
      logger.info("UserService: Updating user", { userId });

      const user = await this.userRepo.findByIdAndUpdate(userId, updateData);
      if (!user) {
        throw new Error("User not found");
      }

      logger.info("UserService: User updated", { userId });

      return {
        id: user._id,
        email: user.email,
        name: user.name,
      };
    } catch (error) {
      logger.error("UserService: Update user failed", error, { userId });
      throw error;
    }
  }

  // ✅ Delete user
  async deleteUser(userId) {
    try {
      logger.info("UserService: Deleting user", { userId });

      await this.userRepo.delete(userId);

      logger.info("UserService: User deleted", { userId });
      return { message: "User deleted successfully" };
    } catch (error) {
      logger.error("UserService: Delete user failed", error, { userId });
      throw error;
    }
  }

  // ✅ Get user by email
  async getUserByEmail(email) {
    try {
      const user = await this.userRepo.findByEmail(email);
      return user;
    } catch (error) {
      logger.error("UserService: Get user by email failed", error, { email });
      throw error;
    }
  }
}

export default UserService;
