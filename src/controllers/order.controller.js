import OrderService from "../services/order.service.js";
import mongoose from "mongoose";

/**
 * Order Controller
 * HTTP handlers for order/booking endpoints
 */
export default class OrderController {
  /**
   * Constructor
   * @param {Connection} db - MongoDB connection
   */
  constructor(db) {
    this.db = db;
    this.service = new OrderService(db);
  }

  /**
   * Create new order [POST] /api/v1/orders
   * @param {Express.Request} req - Express request
   * @param {Express.Response} res - Express response
   */
  createOrder = async (req, res) => {
    try {
      const config = req.app.locals.config || {};
      const result = await this.service.createOrder(req.body, config);

      return res.status(201).json(result);
    } catch (error) {
      const statusCode = error.statusCode || 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message,
        errors: error.errors,
      });
    }
  };

  /**
   * Get order by ID [GET] /api/v1/orders/:id
   * @param {Express.Request} req - Express request
   * @param {Express.Response} res - Express response
   */
  getOrderById = async (req, res) => {
    try {
      const { id } = req.params;

      // Validate ID format
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid order ID format",
        });
      }

      const result = await this.service.getOrderById(id);
      return res.status(200).json(result);
    } catch (error) {
      const statusCode = error.statusCode || 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message,
      });
    }
  };

  /**
   * Get order history [GET] /api/v1/orders/history
   * @param {Express.Request} req - Express request
   * @param {Express.Response} res - Express response
   */
  getOrderHistory = async (req, res) => {
    try {
      const { userId, visitorId } = req.body || req.query;

      if (!userId && !visitorId) {
        return res.status(400).json({
          success: false,
          message: "Either userId or visitorId is required",
        });
      }

      const result = await this.service.getOrderHistory(userId, visitorId);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error retrieving order history",
      });
    }
  };

  /**
   * Get all orders (admin) [GET] /api/v1/orders?page=&limit=
   * @param {Express.Request} req - Express request
   * @param {Express.Response} res - Express response
   */
  getAllOrders = async (req, res) => {
    try {
      const { page = 1, limit = 50 } = req.query;

      const result = await this.service.getAllOrders({
        page: parseInt(page),
        limit: parseInt(limit),
      });

      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error retrieving orders",
      });
    }
  };

  /**
   * Update order status [PUT] /api/v1/orders/:id/status
   * @param {Express.Request} req - Express request
   * @param {Express.Response} res - Express response
   */
  updateOrderStatus = async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid order ID format",
        });
      }

      if (!status) {
        return res.status(400).json({
          success: false,
          message: "Status is required",
        });
      }

      const result = await this.service.updateOrderStatus(id, status);
      return res.status(200).json(result);
    } catch (error) {
      const statusCode = error.statusCode || 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message,
      });
    }
  };

  /**
   * Cancel order [POST] /api/v1/orders/:id/cancel
   * @param {Express.Request} req - Express request
   * @param {Express.Response} res - Express response
   */
  cancelOrder = async (req, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid order ID format",
        });
      }

      if (!reason) {
        return res.status(400).json({
          success: false,
          message: "Cancellation reason is required",
        });
      }

      const result = await this.service.cancelOrder(id, reason);
      return res.status(200).json(result);
    } catch (error) {
      const statusCode = error.statusCode || 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message,
      });
    }
  };

  /**
   * Rate order [POST] /api/v1/orders/:id/rate
   * @param {Express.Request} req - Express request
   * @param {Express.Response} res - Express response
   */
  rateOrder = async (req, res) => {
    try {
      const { id } = req.params;
      const { rating } = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid order ID format",
        });
      }

      if (rating === undefined) {
        return res.status(400).json({
          success: false,
          message: "Rating is required",
        });
      }

      const result = await this.service.rateOrder(id, rating);
      return res.status(200).json(result);
    } catch (error) {
      const statusCode = error.statusCode || 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message,
      });
    }
  };

  /**
   * Get pending orders [GET] /api/v1/orders/pending
   * @param {Express.Request} req - Express request
   * @param {Express.Response} res - Express response
   */
  getPendingOrders = async (req, res) => {
    try {
      const result = await this.service.getPendingOrders();
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error retrieving pending orders",
      });
    }
  };

  /**
   * Delete order [DELETE] /api/v1/orders/:id
   * @param {Express.Request} req - Express request
   * @param {Express.Response} res - Express response
   */
  deleteOrder = async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid order ID format",
        });
      }

      const result = await this.service.deleteOrder(id);
      return res.status(200).json(result);
    } catch (error) {
      const statusCode = error.statusCode || 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message,
      });
    }
  };

  /**
   * Get order statistics [GET] /api/v1/orders/stats
   * @param {Express.Request} req - Express request
   * @param {Express.Response} res - Express response
   */
  getOrderStatistics = async (req, res) => {
    try {
      const result = await this.service.getOrderStatistics();
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error retrieving statistics",
      });
    }
  };
}
