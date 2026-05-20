import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

let cachedConnection = null;

export async function connectToDatabase() {
  if (cachedConnection) {
    return cachedConnection;
  }

  try {
    const databaseUri = process.env.MONGODB_URI;
    if (!databaseUri) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }

    const connection = await mongoose.connect(databaseUri);
    cachedConnection = connection;
    console.log("MongoDB connected successfully");
    return connection;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}
