import ImageService from "../services/image.service.js";
import mongoose from "mongoose";

/**
 * Image Controller
 * HTTP handlers for image endpoints
 */
export default class ImageController {
  /**
   * Constructor
   * @param {Connection} db - MongoDB connection
   */
  constructor(db) {
    this.db = db;
    this.service = new ImageService(db);
  }

  /**
   * Create/register image [POST] /api/v1/images
   * @param {Express.Request} req - Express request
   * @param {Express.Response} res - Express response
   */
  createImage = async (req, res) => {
    try {
      const result = await this.service.createImage(req.body);
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
   * Get image by ID [GET] /api/v1/images/:id
   * @param {Express.Request} req - Express request
   * @param {Express.Response} res - Express response
   */
  getImageById = async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid image ID format",
        });
      }

      const result = await this.service.getImageById(id);
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
   * Get image by public ID [GET] /api/v1/images/public/:publicId
   * @param {Express.Request} req - Express request
   * @param {Express.Response} res - Express response
   */
  getImageByPublicId = async (req, res) => {
    try {
      const { publicId } = req.params;

      if (!publicId) {
        return res.status(400).json({
          success: false,
          message: "Public ID is required",
        });
      }

      const result = await this.service.getImageByPublicId(publicId);
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
   * Get user's images [GET] /api/v1/images/user/:uploaderId?page=&limit=
   * @param {Express.Request} req - Express request
   * @param {Express.Response} res - Express response
   */
  getUserImages = async (req, res) => {
    try {
      const { uploaderId } = req.params;
      const { page = 1, limit = 20 } = req.query;

      if (!mongoose.Types.ObjectId.isValid(uploaderId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid uploader ID format",
        });
      }

      const result = await this.service.getUserImages(uploaderId, {
        page: parseInt(page),
        limit: parseInt(limit),
      });

      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error retrieving user images",
      });
    }
  };

  /**
   * Get all public images [GET] /api/v1/images/public?page=&limit=
   * @param {Express.Request} req - Express request
   * @param {Express.Response} res - Express response
   */
  getPublicImages = async (req, res) => {
    try {
      const { page = 1, limit = 50 } = req.query;

      const result = await this.service.getPublicImages({
        page: parseInt(page),
        limit: parseInt(limit),
      });

      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error retrieving public images",
      });
    }
  };

  /**
   * Update image [PUT] /api/v1/images/:id
   * @param {Express.Request} req - Express request
   * @param {Express.Response} res - Express response
   */
  updateImage = async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid image ID format",
        });
      }

      const result = await this.service.updateImage(id, req.body);
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
   * Change image visibility [PUT] /api/v1/images/:id/visibility
   * @param {Express.Request} req - Express request
   * @param {Express.Response} res - Express response
   */
  changeVisibility = async (req, res) => {
    try {
      const { id } = req.params;
      const { isPublic } = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid image ID format",
        });
      }

      if (isPublic === undefined) {
        return res.status(400).json({
          success: false,
          message: "isPublic field is required",
        });
      }

      const result = await this.service.changeVisibility(id, isPublic);
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
   * Delete image [DELETE] /api/v1/images/:id
   * @param {Express.Request} req - Express request
   * @param {Express.Response} res - Express response
   */
  deleteImage = async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid image ID format",
        });
      }

      const result = await this.service.deleteImage(id);
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
   * Search images [POST] /api/v1/images/search
   * @param {Express.Request} req - Express request
   * @param {Express.Response} res - Express response
   */
  searchImages = async (req, res) => {
    try {
      const { query } = req.body;

      if (!query) {
        return res.status(400).json({
          success: false,
          message: "Search query is required",
        });
      }

      const result = await this.service.searchImages(query);
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
   * Get user storage info [GET] /api/v1/images/storage/:uploaderId
   * @param {Express.Request} req - Express request
   * @param {Express.Response} res - Express response
   */
  getUserStorageInfo = async (req, res) => {
    try {
      const { uploaderId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(uploaderId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid uploader ID format",
        });
      }

      const result = await this.service.getUserStorageInfo(uploaderId);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error retrieving storage info",
      });
    }
  };

  /**
   * Get image statistics [GET] /api/v1/images/stats
   * @param {Express.Request} req - Express request
   * @param {Express.Response} res - Express response
   */
  getImageStatistics = async (req, res) => {
    try {
      const result = await this.service.getImageStatistics();
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error retrieving statistics",
      });
    }
  };

  /**
   * Bulk delete images [POST] /api/v1/images/bulk-delete
   * @param {Express.Request} req - Express request
   * @param {Express.Response} res - Express response
   */
  bulkDeleteImages = async (req, res) => {
    try {
      const { imageIds } = req.body;

      if (!Array.isArray(imageIds)) {
        return res.status(400).json({
          success: false,
          message: "imageIds must be an array",
        });
      }

      const result = await this.service.bulkDeleteImages(imageIds);
      return res.status(200).json(result);
    } catch (error) {
      const statusCode = error.statusCode || 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message,
      });
    }
  };
}
