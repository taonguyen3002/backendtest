/**
 * @file Token Model
 * @description Session/Refresh token storage for authentication
 */

import mongoose from "mongoose";

const tokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    refreshToken: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    expires: 31536000, // 365 days in seconds
  },
);

/**
 * Old pattern - for backward compatibility
 * @param {Connection} connection - MongoDB connection instance
 * @returns {Model} Token model bound to the connection
 */
export function getTokenModel(connection) {
  if (!connection.models.session) {
    connection.model("session", tokenSchema);
  }
  return connection.model("session");
}

/**
 * New pattern
 * @param {Connection} connection - MongoDB connection instance
 * @returns {Model} Token model bound to the connection
 */
export function getTokenModelWithConnection(connection) {
  if (!connection.models.session) {
    connection.model("session", tokenSchema);
  }
  return connection.model("session");
}

export default tokenSchema;
