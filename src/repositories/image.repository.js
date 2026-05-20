import BaseRepository from "./base.repository.js";
import { getImageModel } from "../models/Image.js";

/**
 * Image Repository
 * Handles all data access for images
 */
export default class ImageRepository extends BaseRepository {
  /**
   * Constructor
   * @param {Connection} db - MongoDB connection
   */
  constructor(db) {
    const Model = getImageModel(db);
    super(Model);
    this.db = db;
  }

  /**
   * Find image by Cloudinary public ID
   * @param {String} publicId - Cloudinary public ID
   * @returns {Object} Image document
   */
  async findByPublicId(publicId) {
    return this.Model.findOne({ publicId });
  }

  /**
   * Find image by file path
   * @param {String} filePath - File path
   * @returns {Object} Image document
   */
  async findByFilePath(filePath) {
    return this.Model.findOne({ filePath });
  }

  /**
   * Find images by uploader
   * @param {String} uploaderId - Uploader user ID
   * @param {Object} options - Query options
   * @returns {Array} User's images
   */
  async findByUploader(uploaderId, options = {}) {
    const { limit = 50, skip = 0, sort = { createdAt: -1 } } = options;
    return this.Model.find({ uploader: uploaderId }).sort(sort).limit(limit).skip(skip);
  }

  /**
   * Find all public images
   * @param {Object} options - Query options
   * @returns {Array} Public images
   */
  async findPublicImages(options = {}) {
    const { limit = 50, skip = 0, sort = { createdAt: -1 } } = options;
    return this.Model.find({ isPublic: true }).sort(sort).limit(limit).skip(skip);
  }

  /**
   * Find images by MIME type
   * @param {String} mimeType - MIME type (e.g., 'image/jpeg')
   * @returns {Array} Images of given type
   */
  async findByMimeType(mimeType) {
    return this.Model.find({ mimeType }).sort({ createdAt: -1 });
  }

  /**
   * Find images by size range
   * @param {Number} minSize - Minimum size in bytes
   * @param {Number} maxSize - Maximum size in bytes
   * @returns {Array} Images in size range
   */
  async findBySize(minSize, maxSize) {
    return this.Model.find({
      size: { $gte: minSize, $lte: maxSize },
    }).sort({ createdAt: -1 });
  }

  /**
   * Search images by file name
   * @param {String} query - Search query
   * @returns {Array} Matching images
   */
  async searchByFileName(query) {
    const regex = new RegExp(query, "i");
    return this.Model.find({ fileName: { $regex: regex } }).sort({ createdAt: -1 });
  }

  /**
   * Get image statistics
   * @returns {Object} Image statistics
   */
  async getStatistics() {
    const result = await this.Model.aggregate([
      {
        $group: {
          _id: "$mimeType",
          count: { $sum: 1 },
          totalSize: { $sum: "$size" },
          avgSize: { $avg: "$size" },
        },
      },
    ]);
    return result;
  }

  /**
   * Delete image and related data
   * @param {String} imageId - Image ID
   * @returns {Object} Deleted image
   */
  async deleteImage(imageId) {
    return this.Model.findByIdAndDelete(imageId);
  }

  /**
   * Delete images by uploader
   * @param {String} uploaderId - Uploader ID
   * @returns {Object} Delete result
   */
  async deleteByUploader(uploaderId) {
    return this.Model.deleteMany({ uploader: uploaderId });
  }

  /**
   * Update image visibility
   * @param {String} imageId - Image ID
   * @param {Boolean} isPublic - Public status
   * @returns {Object} Updated image
   */
  async updateVisibility(imageId, isPublic) {
    return this.Model.findByIdAndUpdate(imageId, { isPublic }, { new: true });
  }

  /**
   * Update image metadata
   * @param {String} imageId - Image ID
   * @param {Object} metadata - Metadata to update
   * @returns {Object} Updated image
   */
  async updateMetadata(imageId, metadata) {
    return this.Model.findByIdAndUpdate(imageId, { metadata }, { new: true });
  }

  /**
   * Count images by uploader
   * @param {String} uploaderId - Uploader ID
   * @returns {Number} Image count
   */
  async countByUploader(uploaderId) {
    return this.Model.countDocuments({ uploader: uploaderId });
  }

  /**
   * Get total storage used
   * @returns {Number} Total size in bytes
   */
  async getTotalStorageUsed() {
    const result = await this.Model.aggregate([{ $group: { _id: null, totalSize: { $sum: "$size" } } }]);
    return result[0]?.totalSize || 0;
  }
}
