/**
 * @file Token Repository
 * @description Data access layer for Token (Session) operations
 */

import BaseRepository from "./base.repository.js";
import { getTokenModelWithConnection } from "../models/Token.js";

/**
 * Token Repository - Manage refresh tokens/sessions
 */
class TokenRepository extends BaseRepository {
  /**
   * Constructor
   * @param {Connection} db - MongoDB connection instance
   */
  constructor(db) {
    const Token = getTokenModelWithConnection(db);
    super(Token);
    this.Token = Token;
  }

  /**
   * Find token by userId
   * @param {string} userId - User ID
   * @returns {Promise<Token|null>} Token document
   */
  async findByUserId(userId) {
    return await this.Token.findOne({ userId });
  }

  /**
   * Find token by refresh token
   * @param {string} refreshToken - Refresh token string
   * @returns {Promise<Token|null>} Token document
   */
  async findByRefreshToken(refreshToken) {
    return await this.Token.findOne({ refreshToken });
  }

  /**
   * Delete token by userId
   * @param {string} userId - User ID
   * @returns {Promise<DeleteResult>} Deletion result
   */
  async deleteByUserId(userId) {
    return await this.Token.deleteOne({ userId });
  }

  /**
   * Delete token by refresh token
   * @param {string} refreshToken - Refresh token string
   * @returns {Promise<DeleteResult>} Deletion result
   */
  async deleteByRefreshToken(refreshToken) {
    return await this.Token.deleteOne({ refreshToken });
  }

  /**
   * Update refresh token for user
   * @param {string} userId - User ID
   * @param {string} refreshToken - New refresh token
   * @returns {Promise<Token>} Updated token document
   */
  async updateRefreshToken(userId, refreshToken) {
    return await this.Token.findOneAndUpdate({ userId }, { refreshToken }, { new: true, upsert: true });
  }
}

export default TokenRepository;
