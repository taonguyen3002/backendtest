/**
 * @file Post Model
 * @description Post/Article schema and model factory function
 */

import mongoose from "mongoose";

const PostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    authorName: {
      type: String,
      required: true,
      trim: true,
    },
    authorUrl: {
      type: String,
      trim: true,
    },
    publishedDate: {
      type: Date,
      default: Date.now,
    },
    modifiedDate: {
      type: Date,
    },
    image: {
      url: {
        type: String,
        required: true,
      },
      alt: {
        type: String,
      },
    },
    tags: [
      {
        type: String,
      },
    ],
    category: {
      name: {
        type: String,
      },
      url: {
        type: String,
      },
    },
    breadcrumbs: [
      {
        name: {
          type: String,
        },
        url: {
          type: String,
        },
      },
    ],
    comments: [
      {
        author: { type: String },
        content: { type: String },
        date: { type: Date, default: Date.now },
      },
    ],
    likes: [{ type: String, default: "" }],
    isIndexed: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

/**
 * Old pattern - for backward compatibility
 * @param {Connection} connection - MongoDB connection instance
 * @returns {Model} Post model bound to the connection
 */
export function getPostModel(connection) {
  if (!connection.models.Post) {
    connection.model("Post", PostSchema);
  }
  return connection.model("Post");
}

/**
 * New pattern
 * @param {Connection} connection - MongoDB connection instance
 * @returns {Model} Post model bound to the connection
 */
export function getPostModelWithConnection(connection) {
  if (!connection.models.Post) {
    connection.model("Post", PostSchema);
  }
  return connection.model("Post");
}

export default PostSchema;
