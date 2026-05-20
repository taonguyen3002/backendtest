import BaseRepository from "./base.repository.js";
import { getOrderModel } from "../models/Order.js";

/**
 * Order Repository
 * Handles all data access for orders/bookings
 */
export default class OrderRepository extends BaseRepository {
  /**
   * Constructor
   * @param {Connection} db - MongoDB connection
   */
  constructor(db) {
    const Model = getOrderModel(db);
    super(Model);
    this.db = db;
  }

  /**
   * Find orders by user ID (authenticated guests)
   * @param {String} userId - User ID
   * @param {Object} options - Query options
   * @returns {Array} Orders for user
   */
  async findByUserId(userId, options = {}) {
    const { sort = { createdAt: -1 }, select = "" } = options;
    return this.Model.find({ userId }).sort(sort).select(select);
  }

  /**
   * Find orders by visitor ID (unauthenticated guests)
   * @param {String} visitorId - Visitor ID
   * @param {Object} options - Query options
   * @returns {Array} Orders for visitor
   */
  async findByVisitorId(visitorId, options = {}) {
    const { sort = { createdAt: -1 }, select = "" } = options;
    return this.Model.find({ visitorId }).sort(sort).select(select);
  }

  /**
   * Find orders by user OR visitor ID
   * @param {String} userId - User ID
   * @param {String} visitorId - Visitor ID
   * @returns {Array} Combined orders
   */
  async findByUserOrVisitorId(userId, visitorId) {
    const query = { $or: [] };
    if (userId) query.$or.push({ userId });
    if (visitorId) query.$or.push({ visitorId });

    return this.Model.find(query.$or.length > 0 ? query : {})
      .sort({ createdAt: -1 })
      .populate("userId", "username email phone");
  }

  /**
   * Find orders by status
   * @param {String} status - Order status
   * @param {Object} options - Query options
   * @returns {Array} Orders with given status
   */
  async findByStatus(status, options = {}) {
    const { limit = 50, skip = 0 } = options;
    return this.Model.find({ status }).sort({ createdAt: -1 }).limit(limit).skip(skip);
  }

  /**
   * Find pending orders (not completed/cancelled)
   * @param {Object} options - Query options
   * @returns {Array} Pending orders
   */
  async findPendingOrders(options = {}) {
    const { limit = 50, skip = 0 } = options;
    return this.Model.find({
      status: { $in: ["đang xử lí", "đã đặt"] },
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);
  }

  /**
   * Find orders by driver ID
   * @param {String} driverId - Driver ID
   * @returns {Array} Driver's orders
   */
  async findByDriverId(driverId) {
    return this.Model.find({ driverId }).sort({ createdAt: -1 }).populate("userId", "username phone");
  }

  /**
   * Find orders by service type
   * @param {String} serviceType - Service type
   * @returns {Array} Orders for service type
   */
  async findByServiceType(serviceType) {
    return this.Model.find({ serviceType }).sort({ createdAt: -1 });
  }

  /**
   * Find orders within date range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Array} Orders in date range
   */
  async findByDateRange(startDate, endDate) {
    return this.Model.find({
      createdAt: { $gte: startDate, $lte: endDate },
    }).sort({ createdAt: -1 });
  }

  /**
   * Count orders by status
   * @param {String} status - Order status
   * @returns {Number} Order count
   */
  async countByStatus(status) {
    return this.Model.countDocuments({ status });
  }

  /**
   * Get order statistics
   * @returns {Object} Statistics object
   */
  async getStatistics() {
    const result = await this.Model.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalPrice: { $sum: "$price" },
          avgPrice: { $avg: "$price" },
        },
      },
    ]);
    return result;
  }

  /**
   * Update order status
   * @param {String} orderId - Order ID
   * @param {String} newStatus - New status
   * @param {Object} updateData - Additional data to update
   * @returns {Object} Updated order
   */
  async updateStatus(orderId, newStatus, updateData = {}) {
    const query = { _id: orderId };
    const update = { status: newStatus, ...updateData };

    if (newStatus === "hoàn thành") {
      update.completedAt = new Date();
    }

    return this.Model.findByIdAndUpdate(query, update, { new: true });
  }

  /**
   * Cancel order with reason
   * @param {String} orderId - Order ID
   * @param {String} reason - Cancellation reason
   * @returns {Object} Updated order
   */
  async cancelOrder(orderId, reason) {
    return this.Model.findByIdAndUpdate(orderId, { status: "đã hủy", cancelReason: reason }, { new: true });
  }

  /**
   * Add rating to order
   * @param {String} orderId - Order ID
   * @param {Number} rating - Rating (1-5)
   * @returns {Object} Updated order
   */
  async addRating(orderId, rating) {
    if (rating < 1 || rating > 5) {
      throw new Error("Rating must be between 1 and 5");
    }
    return this.Model.findByIdAndUpdate(orderId, { rating, status: "hoàn thành" }, { new: true });
  }

  /**
   * Migrate visitor booking to user
   * @param {String} visitorId - Visitor ID
   * @param {String} userId - User ID
   * @returns {Object} Updated orders
   */
  async migrateVisitorToUser(visitorId, userId) {
    return this.Model.updateMany({ visitorId }, { userId, visitorId: null }, { new: true });
  }
}
