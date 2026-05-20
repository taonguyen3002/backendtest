/**
 * @file Auth Model (OTP)
 * @description OTP storage for email verification during registration
 */

import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 3600 }, // Auto-delete after 1 hour
    },
  },
  {
    timestamps: true,
  },
);

/**
 * Old pattern - for backward compatibility
 * @param {Connection} connection - MongoDB connection instance
 * @returns {Model} OTP model bound to the connection
 */
export function getOtpModel(connection) {
  if (!connection.models.Otp) {
    connection.model("Otp", otpSchema);
  }
  return connection.model("Otp");
}

/**
 * New pattern
 * @param {Connection} connection - MongoDB connection instance
 * @returns {Model} OTP model bound to the connection
 */
export function getOtpModelWithConnection(connection) {
  if (!connection.models.Otp) {
    connection.model("Otp", otpSchema);
  }
  return connection.model("Otp");
}

export default otpSchema;
