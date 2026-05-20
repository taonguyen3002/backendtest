import mongoose from "mongoose";

/**
 * Comment Schema
 * Represents comments on blog posts with nested reply support
 */
const commentSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
      index: true,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
      description: "For nested/reply comments",
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    authorName: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    likes: {
      type: Number,
      default: 0,
      min: 0,
    },
    isApproved: {
      type: Boolean,
      default: true,
      description: "For moderation purposes",
    },
    date: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "comments",
  },
);

/**
 * Get Comment Model for specific connection
 * @param {Connection} connection - MongoDB connection
 * @returns {Model} Comment model
 */
export function getCommentModel(connection) {
  return connection.model("Comment", commentSchema);
}

/**
 * New pattern: explicit connection passing
 * @param {Connection} connection - MongoDB connection
 * @returns {Model} Comment model
 */
export function getCommentModelWithConnection(connection) {
  return connection.model("Comment", commentSchema);
}
