import mongoose from "mongoose";
const otpSchema = new mongoose.Schema({
  email: String,
  code: String,
  expiresAt: Date,
});
export function getOtpModel(connection) {
  return connection.model("Otp", otpSchema);
}
