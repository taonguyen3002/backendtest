// models/User.js
import mongoose from "mongoose";

const imageSchema = new mongoose.Schema(
  {
    filePath: { type: String },
    publicId: { type: String },
  },
  { timestamps: true }
);

export function getImageModel(connection) {
  return connection.model("Image", imageSchema);
}
