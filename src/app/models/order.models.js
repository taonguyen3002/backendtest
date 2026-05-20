import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    addressFrom: { type: String, required: true, trim: true },
    addressTo: { type: String, required: true, trim: true },
    serviceType: {
      type: String,
      required: true,
      enum: [
        "Grap Bike",
        "Grap Express",
        "Grap 4 Chỗ",
        "Grap 7 Chỗ",
        "Grap 16 Chỗ",
        "Grap 29 Chỗ",
      ], // nếu có enum cụ thể
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    additionalInfo: { type: String, trim: true, maxlength: 500 },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    visitorId: { type: String, index: true }, // Lưu trữ visitorId nếu người dùng chưa đăng nhập
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",
      default: null,
    },
    status: {
      type: String,
      enum: ["đang xử lí", "đã đặt", "hoàn thành", "đã hủy"],
      default: "đang xử lí",
    },
    cancelReason: { type: String, trim: true, maxlength: 300, default: null },
    price: { type: Number, min: 0 },
    estimatedDistanceKm: { type: Number, min: 0 },
    estimatedTimeMin: { type: Number, min: 0 },
    pickupTime: { type: Date },
    completedAt: { type: Date },
    autoCancelAt: { type: Date },
    rating: { type: Number, min: 1, max: 5, default: null },
    paymentMethod: {
      type: String,
      enum: ["tiền mặt", "momo", "zaloPay", "bank_transfer"],
      default: "tiền mặt",
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "failed"],
      default: "unpaid",
    },
  },
  { timestamps: true }
);

export function getOrderModel(connection) {
  return connection.model("Booking", bookingSchema);
}
