import mongoose from "mongoose";

/**
 * Order/Booking Schema
 * Represents taxi booking orders with user/visitor tracking
 * Supports both authenticated users and guest visitors
 */
const orderSchema = new mongoose.Schema(
  {
    addressFrom: {
      type: String,
      required: true,
      trim: true,
      description: "Pickup address",
    },
    addressTo: {
      type: String,
      required: true,
      trim: true,
      description: "Destination address",
    },
    serviceType: {
      type: String,
      required: true,
      enum: ["Grap Bike", "Grap Express", "Grap 4 Chỗ", "Grap 7 Chỗ", "Grap 16 Chỗ", "Grap 29 Chỗ"],
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    additionalInfo: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    visitorId: {
      type: String,
      index: true,
      description: "For guest bookings without userId",
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",
      default: null,
    },
    status: {
      type: String,
      enum: ["đang xử lí", "đã đặt", "hoàn thành", "đã hủy"],
      default: "đang xử lí",
      index: true,
    },
    cancelReason: {
      type: String,
      trim: true,
      maxlength: 300,
      default: null,
    },
    price: {
      type: Number,
      min: 0,
    },
    estimatedDistanceKm: {
      type: Number,
      min: 0,
    },
    estimatedTimeMin: {
      type: Number,
      min: 0,
    },
    pickupTime: {
      type: Date,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    autoCancelAt: {
      type: Date,
      default: null,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
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
    discordNotified: {
      type: Boolean,
      default: false,
      description: "Track if Discord notification was sent",
    },
  },
  {
    timestamps: true,
    collection: "bookings",
  },
);

/**
 * Get Order Model for specific connection
 * @param {Connection} connection - MongoDB connection
 * @returns {Model} Order model
 */
export function getOrderModel(connection) {
  return connection.model("Order", orderSchema);
}

/**
 * New pattern: explicit connection passing
 * @param {Connection} connection - MongoDB connection
 * @returns {Model} Order model
 */
export function getOrderModelWithConnection(connection) {
  return connection.model("Order", orderSchema);
}
