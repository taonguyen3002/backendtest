/**
 * @file Auth (OTP) Repository
 * @description Data access layer for OTP (One-Time Password) operations
 */

import BaseRepository from "./base.repository.js";
import { getOtpModelWithConnection } from "../models/Auth.js";

/**
 * Auth (OTP) Repository - Manage one-time passwords
 */
class AuthRepository extends BaseRepository {
  /**
   * Constructor
   * @param {Connection} db - MongoDB connection instance
   */
  constructor(db) {
    const Otp = getOtpModelWithConnection(db);
    super(Otp);
    this.Otp = Otp;
  }

  /**
   * Find OTP by email
   * @param {string} email - Email address
   * @returns {Promise<OTP|null>} OTP document
   */
  async findByEmail(email) {
    return await this.Otp.findOne({ email });
  }

  /**
   * Find valid OTP (not expired) by email
   * @param {string} email - Email address
   * @returns {Promise<OTP|null>} Valid OTP document or null
   */
  async findValidOtpByEmail(email) {
    return await this.Otp.findOne({
      email,
      expiresAt: { $gt: new Date() },
    });
  }

  /**
   * Create new OTP
   * @param {string} email - Email address
   * @param {string} code - OTP code
   * @param {number} expiresInMinutes - Minutes until expiration (default: 10)
   * @returns {Promise<OTP>} Created OTP document
   */
  async createOtp(email, code, expiresInMinutes = 10) {
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);
    return await this.Otp.create({ email, code, expiresAt });
  }

  /**
   * Delete OTP by email
   * @param {string} email - Email address
   * @returns {Promise<DeleteResult>} Deletion result
   */
  async deleteByEmail(email) {
    return await this.Otp.deleteOne({ email });
  }

  /**
   * Delete expired OTPs
   * @returns {Promise<DeleteResult>} Deletion result
   */
  async deleteExpiredOtps() {
    return await this.Otp.deleteMany({
      expiresAt: { $lt: new Date() },
    });
  }

  /**
   * Check if OTP is valid
   * @param {string} email - Email address
   * @param {string} code - OTP code
   * @returns {Promise<boolean>} True if OTP is valid
   */
  async isValidOtp(email, code) {
    const otp = await this.findValidOtpByEmail(email);
    return otp && otp.code === code;
  }
}

export default AuthRepository;
