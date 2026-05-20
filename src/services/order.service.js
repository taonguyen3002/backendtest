import OrderRepository from "../repositories/order.repository.js";
import { sendOrderToDiscord } from "../helpers/discord/index.js";

/**
 * Order Service
 * Business logic for orders/bookings management
 */
export default class OrderService {
  /**
   * Constructor
   * @param {Connection} db - MongoDB connection
   */
  constructor(db) {
    this.db = db;
    this.repo = new OrderRepository(db);
  }

  /**
   * Create new order
   * @param {Object} orderData - Order data
   * @param {String} config - App configuration with DISCORD_WEBHOOK
   * @returns {Object} Created order
   */
  async createOrder(orderData, config = {}) {
    try {
      const { userId, visitorId, addressFrom, phoneNumber } = orderData;

      // Validate required fields
      if (!addressFrom || !phoneNumber) {
        throw {
          statusCode: 400,
          message: "Missing required fields: addressFrom, phoneNumber",
        };
      }

      // Validate user/visitor
      if (!userId && !visitorId) {
        throw {
          statusCode: 400,
          message: "Either userId or visitorId is required",
        };
      }

      // Send Discord notification
      const discordData = {
        ...orderData,
        DISCORD_WEBHOOK_URL: config.DISCORD_WEBHOOK,
      };

      await this._sendDiscordNotification(discordData);

      // Handle visitor migration to user
      let finalData = { ...orderData };
      if (userId && visitorId) {
        const existing = await this.repo.findByVisitorId(visitorId);
        if (existing && existing.length > 0) {
          // Migrate existing visitor bookings to user
          await this.repo.migrateVisitorToUser(visitorId, userId);
          finalData = { ...orderData, visitorId: null };
        }
      }

      // Create order
      const order = await this.repo.create(finalData);
      return {
        success: true,
        message: "Order created successfully",
        data: order,
      };
    } catch (error) {
      console.error("Create order error:", error);
      throw {
        statusCode: error.statusCode || 500,
        message: error.message || "Error creating order",
        errors: error.errors,
      };
    }
  }

  /**
   * Get order by ID
   * @param {String} orderId - Order ID
   * @returns {Object} Order with populated references
   */
  async getOrderById(orderId) {
    try {
      const order = await this.repo.findById(orderId);
      if (!order) {
        throw {
          statusCode: 404,
          message: "Order not found",
        };
      }
      return {
        success: true,
        message: "Order retrieved",
        data: order,
      };
    } catch (error) {
      throw {
        statusCode: error.statusCode || 500,
        message: error.message || "Error retrieving order",
      };
    }
  }

  /**
   * Get user's order history
   * @param {String} userId - User ID
   * @param {String} visitorId - Visitor ID (optional)
   * @param {Object} options - Query options
   * @returns {Array} User orders
   */
  async getOrderHistory(userId, visitorId = null, options = {}) {
    try {
      const orders = await this.repo.findByUserOrVisitorId(userId, visitorId);

      return {
        success: true,
        message: "Order history retrieved",
        data: orders,
        count: orders.length,
      };
    } catch (error) {
      throw {
        statusCode: 500,
        message: "Error retrieving order history",
      };
    }
  }

  /**
   * Get all orders (admin)
   * @param {Object} options - Query options
   * @returns {Array} All orders
   */
  async getAllOrders(options = {}) {
    try {
      const { page = 1, limit = 50 } = options;
      const skip = (page - 1) * limit;

      const orders = await this.repo.find({}, { skip, limit });
      const total = await this.repo.count({});

      return {
        success: true,
        message: "All orders retrieved",
        data: orders,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw {
        statusCode: 500,
        message: "Error retrieving orders",
      };
    }
  }

  /**
   * Update order status
   * @param {String} orderId - Order ID
   * @param {String} newStatus - New status
   * @returns {Object} Updated order
   */
  async updateOrderStatus(orderId, newStatus) {
    try {
      const validStatuses = ["đang xử lí", "đã đặt", "hoàn thành", "đã hủy"];

      if (!validStatuses.includes(newStatus)) {
        throw {
          statusCode: 400,
          message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
        };
      }

      const order = await this.repo.updateStatus(orderId, newStatus);

      if (!order) {
        throw {
          statusCode: 404,
          message: "Order not found",
        };
      }

      return {
        success: true,
        message: "Order status updated",
        data: order,
      };
    } catch (error) {
      throw {
        statusCode: error.statusCode || 500,
        message: error.message || "Error updating order status",
      };
    }
  }

  /**
   * Cancel order with reason
   * @param {String} orderId - Order ID
   * @param {String} reason - Cancellation reason
   * @returns {Object} Cancelled order
   */
  async cancelOrder(orderId, reason) {
    try {
      if (!reason) {
        throw {
          statusCode: 400,
          message: "Cancellation reason is required",
        };
      }

      const order = await this.repo.cancelOrder(orderId, reason);

      if (!order) {
        throw {
          statusCode: 404,
          message: "Order not found",
        };
      }

      return {
        success: true,
        message: "Order cancelled",
        data: order,
      };
    } catch (error) {
      throw {
        statusCode: error.statusCode || 500,
        message: error.message || "Error cancelling order",
      };
    }
  }

  /**
   * Add rating to completed order
   * @param {String} orderId - Order ID
   * @param {Number} rating - Rating (1-5)
   * @returns {Object} Updated order
   */
  async rateOrder(orderId, rating) {
    try {
      if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        throw {
          statusCode: 400,
          message: "Rating must be an integer between 1 and 5",
        };
      }

      const order = await this.repo.addRating(orderId, rating);

      if (!order) {
        throw {
          statusCode: 404,
          message: "Order not found",
        };
      }

      return {
        success: true,
        message: "Rating added successfully",
        data: order,
      };
    } catch (error) {
      throw {
        statusCode: error.statusCode || 500,
        message: error.message || "Error adding rating",
      };
    }
  }

  /**
   * Get orders by status
   * @param {String} status - Order status
   * @returns {Array} Orders
   */
  async getOrdersByStatus(status) {
    try {
      const orders = await this.repo.findByStatus(status);

      return {
        success: true,
        message: "Orders retrieved",
        data: orders,
        count: orders.length,
      };
    } catch (error) {
      throw {
        statusCode: 500,
        message: "Error retrieving orders by status",
      };
    }
  }

  /**
   * Get pending orders
   * @returns {Array} Pending orders
   */
  async getPendingOrders() {
    try {
      const orders = await this.repo.findPendingOrders();

      return {
        success: true,
        message: "Pending orders retrieved",
        data: orders,
        count: orders.length,
      };
    } catch (error) {
      throw {
        statusCode: 500,
        message: "Error retrieving pending orders",
      };
    }
  }

  /**
   * Delete order (soft delete or hard delete)
   * @param {String} orderId - Order ID
   * @returns {Object} Deletion result
   */
  async deleteOrder(orderId) {
    try {
      const order = await this.repo.delete(orderId);

      if (!order) {
        throw {
          statusCode: 404,
          message: "Order not found",
        };
      }

      return {
        success: true,
        message: "Order deleted",
        data: order,
      };
    } catch (error) {
      throw {
        statusCode: error.statusCode || 500,
        message: error.message || "Error deleting order",
      };
    }
  }

  /**
   * Send Discord notification for order
   * @private
   * @param {Object} orderData - Order data with Discord webhook URL
   * @returns {void}
   */
  async _sendDiscordNotification(orderData) {
    try {
      if (!orderData.DISCORD_WEBHOOK_URL) {
        console.warn("Discord webhook URL not configured");
        return;
      }

      await sendOrderToDiscord(orderData);
    } catch (error) {
      console.error("Discord notification error:", error);
      // Don't throw, let order creation succeed even if Discord fails
    }
  }

  /**
   * Get order statistics
   * @returns {Object} Statistics
   */
  async getOrderStatistics() {
    try {
      const stats = await this.repo.getStatistics();

      return {
        success: true,
        message: "Statistics retrieved",
        data: stats,
      };
    } catch (error) {
      throw {
        statusCode: 500,
        message: "Error retrieving statistics",
      };
    }
  }
}
