import mongoose from "mongoose";

/**
 * Image Schema
 * Stores image metadata including file path and Cloudinary ID
 */
const imageSchema = new mongoose.Schema(
  {
    filePath: {
      type: String,
      required: true,
      trim: true,
      description: "Local or CDN file path",
    },
    publicId: {
      type: String,
      trim: true,
      description: "Cloudinary public ID for remote management",
    },
    fileName: {
      type: String,
      trim: true,
      description: "Original file name",
    },
    mimeType: {
      type: String,
      default: "image/jpeg",
      description: "File MIME type for validation",
    },
    size: {
      type: Number,
      min: 0,
      description: "File size in bytes",
    },
    url: {
      type: String,
      trim: true,
      description: "Accessible image URL",
    },
    uploader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      description: "User who uploaded the image",
    },
    isPublic: {
      type: Boolean,
      default: true,
      description: "Whether image is publicly accessible",
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
      description: "Additional metadata (width, height, etc.)",
    },
  },
  {
    timestamps: true,
    collection: "images",
  },
);

/**
 * Get Image Model for specific connection
 * @param {Connection} connection - MongoDB connection
 * @returns {Model} Image model
 */
export function getImageModel(connection) {
  return connection.model("Image", imageSchema);
}

/**
 * New pattern: explicit connection passing
 * @param {Connection} connection - MongoDB connection
 * @returns {Model} Image model
 */
export function getImageModelWithConnection(connection) {
  return connection.model("Image", imageSchema);
}
