// models/transaction.model.js
import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true }, // số tiền (+ hoặc -)
  type: {
    type: String,
    enum: ["ai_write", "deposit", "refund"],
    required: true,
  },
  meta: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
});

export function getTransaction(connection) {
  return connection.model("Transaction", transactionSchema);
}
