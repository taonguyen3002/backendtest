/**
 * @file User Model
 * @description User schema and model factory function for multi-domain support
 */

import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "user",
      enum: ["user", "admin", "moderator"],
    },
    bio: {
      type: String,
      default: "",
    },
    address: {
      type: String,
      default: "",
    },
    avatar: {
      type: String,
      default: "http://localhost:3000/uploads/logo.png",
    },
    phone: {
      type: String,
      default: "",
    },
    fullname: {
      type: String,
      default: "",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    balance: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

/**
 * Old pattern - for backward compatibility during migration
 * @param {Connection} connection - MongoDB connection instance
 * @returns {Model} User model bound to the connection
 */
export function getUserModel(connection) {
  if (!connection.models.User) {
    connection.model("User", userSchema);
  }
  return connection.model("User");
}

/**
 * New pattern - get model with connection
 * @param {Connection} connection - MongoDB connection instance
 * @returns {Model} User model bound to the connection
 */
export function getUserModelWithConnection(connection) {
  if (!connection.models.User) {
    connection.model("User", userSchema);
  }
  return connection.model("User");
}

export default userSchema;
