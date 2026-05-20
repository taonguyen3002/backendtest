/**
 * @file User Repository
 * @description Data access layer for User operations
 * Handles all database queries and returns pure data
 */

import BaseRepository from "./base.repository.js";
import { getUserModelWithConnection } from "../models/User.js";

/**
 * User Repository - Extends base repository with user-specific queries
 */
class UserRepository extends BaseRepository {
  /**
   * Constructor
   * @param {Connection} db - MongoDB connection instance
   */
  constructor(db) {
    const User = getUserModelWithConnection(db);
    super(User);
    this.User = User;
  }

  /**
   * Find user by email
   * @param {string} email - User email
   * @returns {Promise<User|null>} User document or null
   */
  async findByEmail(email) {
    return await this.User.findOne({ email });
  }

  /**
   * Find user by username
   * @param {string} username - Username
   * @returns {Promise<User|null>} User document or null
   */
  async findByUsername(username) {
    return await this.User.findOne({ username });
  }

  /**
   * Find all active users
   * @param {object} filters - Additional filters
   * @param {number} skip - Skip count
   * @param {number} limit - Limit count
   * @returns {Promise<Array>} Array of user documents
   */
  async findActiveUsers(filters = {}, skip = 0, limit = 10) {
    return await this.User.find({ ...filters, isActive: true })
      .skip(skip)
      .limit(limit);
  }

  /**
   * Find users by role
   * @param {string} role - User role
   * @param {number} skip - Skip count
   * @param {number} limit - Limit count
   * @returns {Promise<Array>} Array of user documents
   */
  async findByRole(role, skip = 0, limit = 10) {
    return await this.User.find({ role }).skip(skip).limit(limit);
  }

  /**
   * Check if email already exists
   * @param {string} email - Email to check
   * @returns {Promise<boolean>} True if email exists
   */
  async emailExists(email) {
    return !!(await this.User.findOne({ email }));
  }

  /**
   * Check if username already exists
   * @param {string} username - Username to check
   * @returns {Promise<boolean>} True if username exists
   */
  async usernameExists(username) {
    return !!(await this.User.findOne({ username }));
  }

  /**
   * Update user balance
   * @param {string} userId - User ID
   * @param {number} amount - Amount to add (can be negative)
   * @returns {Promise<User>} Updated user document
   */
  async updateBalance(userId, amount) {
    return await this.User.findByIdAndUpdate(userId, { $inc: { balance: amount } }, { new: true });
  }

  /**
   * Update user verification status
   * @param {string} userId - User ID
   * @param {boolean} status - Verification status
   * @returns {Promise<User>} Updated user document
   */
  async updateVerification(userId, status) {
    return await this.User.findByIdAndUpdate(userId, { isVerified: status }, { new: true });
  }

  /**
   * Get user without password field
   * @param {string} userId - User ID
   * @returns {Promise<User|null>} User document without password
   */
  async findByIdWithoutPassword(userId) {
    return await this.User.findById(userId).select("-password");
  }

  /**
   * Get user by email without password
   * @param {string} email - User email
   * @returns {Promise<User|null>} User document without password
   */
  async findByEmailWithoutPassword(email) {
    return await this.User.findOne({ email }).select("-password");
  }
}

export default UserRepository;
