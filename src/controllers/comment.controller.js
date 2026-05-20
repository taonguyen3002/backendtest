import CommentService from "../services/comment.service.js";
import mongoose from "mongoose";

/**
 * Comment Controller
 * HTTP handlers for comment endpoints
 */
export default class CommentController {
  /**
   * Constructor
   * @param {Connection} db - MongoDB connection
   */
  constructor(db) {
    this.db = db;
    this.service = new CommentService(db);
  }

  /**
   * Create comment [POST] /api/v1/comments
   * @param {Express.Request} req - Express request
   * @param {Express.Response} res - Express response
   */
  createComment = async (req, res) => {
    try {
      const result = await this.service.createComment(req.body);
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
   * Get post comments [GET] /api/v1/comments/post/:postId?page=&limit=
   * @param {Express.Request} req - Express request
   * @param {Express.Response} res - Express response
   */
  getPostComments = async (req, res) => {
    try {
      const { postId } = req.params;
      const { page = 1, limit = 20 } = req.query;

      if (!mongoose.Types.ObjectId.isValid(postId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid post ID format",
        });
      }

      const result = await this.service.getPostComments(postId, {
        page: parseInt(page),
        limit: parseInt(limit),
      });

      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error retrieving comments",
      });
    }
  };

  /**
   * Get comment thread [GET] /api/v1/comments/:id/thread
   * @param {Express.Request} req - Express request
   * @param {Express.Response} res - Express response
   */
  getCommentThread = async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid comment ID format",
        });
      }

      const result = await this.service.getCommentThread(id);
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
   * Update comment [PUT] /api/v1/comments/:id
   * @param {Express.Request} req - Express request
   * @param {Express.Response} res - Express response
   */
  updateComment = async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid comment ID format",
        });
      }

      const result = await this.service.updateComment(id, req.body);
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
   * Delete comment [DELETE] /api/v1/comments/:id
   * @param {Express.Request} req - Express request
   * @param {Express.Response} res - Express response
   */
  deleteComment = async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid comment ID format",
        });
      }

      const result = await this.service.deleteComment(id);
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
   * Like comment [POST] /api/v1/comments/:id/like
   * @param {Express.Request} req - Express request
   * @param {Express.Response} res - Express response
   */
  likeComment = async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid comment ID format",
        });
      }

      const result = await this.service.likeComment(id);
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
   * Get pending comments (admin) [GET] /api/v1/comments/pending
   * @param {Express.Request} req - Express request
   * @param {Express.Response} res - Express response
   */
  getPendingComments = async (req, res) => {
    try {
      const result = await this.service.getPendingComments();
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error retrieving pending comments",
      });
    }
  };

  /**
   * Approve comment (admin) [POST] /api/v1/comments/:id/approve
   * @param {Express.Request} req - Express request
   * @param {Express.Response} res - Express response
   */
  approveComment = async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid comment ID format",
        });
      }

      const result = await this.service.approveComment(id);
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
   * Reject comment (admin) [DELETE] /api/v1/comments/:id/reject
   * @param {Express.Request} req - Express request
   * @param {Express.Response} res - Express response
   */
  rejectComment = async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid comment ID format",
        });
      }

      const result = await this.service.rejectComment(id);
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
   * Get statistics [GET] /api/v1/comments/stats
   * @param {Express.Request} req - Express request
   * @param {Express.Response} res - Express response
   */
  getCommentStatistics = async (req, res) => {
    try {
      const result = await this.service.getCommentStatistics();
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error retrieving statistics",
      });
    }
  };
}
