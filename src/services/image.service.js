import ImageRepository from "../repositories/image.repository.js";

/**
 * Image Service
 * Business logic for image management
 */
export default class ImageService {
  /**
   * Constructor
   * @param {Connection} db - MongoDB connection
   */
  constructor(db) {
    this.db = db;
    this.repo = new ImageRepository(db);
  }

  /**
   * Register/create new image
   * @param {Object} imageData - Image data
   * @returns {Object} Created image
   */
  async createImage(imageData) {
    try {
      const { filePath, publicId, fileName, url, uploader } = imageData;

      // Validate required fields
      if (!filePath) {
        throw {
          statusCode: 400,
          message: "filePath is required",
        };
      }

      const image = await this.repo.create({
        filePath,
        publicId: publicId || null,
        fileName: fileName || null,
        url: url || null,
        uploader: uploader || null,
        mimeType: imageData.mimeType || "image/jpeg",
        size: imageData.size || 0,
        metadata: imageData.metadata || {},
        isPublic: imageData.isPublic !== false,
      });

      return {
        success: true,
        message: "Image created successfully",
        data: image,
      };
    } catch (error) {
      console.error("Create image error:", error);
      throw {
        statusCode: error.statusCode || 500,
        message: error.message || "Error creating image",
        errors: error.errors,
      };
    }
  }

  /**
   * Get image by ID
   * @param {String} imageId - Image ID
   * @returns {Object} Image
   */
  async getImageById(imageId) {
    try {
      const image = await this.repo.findById(imageId);

      if (!image) {
        throw {
          statusCode: 404,
          message: "Image not found",
        };
      }

      return {
        success: true,
        message: "Image retrieved",
        data: image,
      };
    } catch (error) {
      throw {
        statusCode: error.statusCode || 500,
        message: error.message || "Error retrieving image",
      };
    }
  }

  /**
   * Get image by Cloudinary public ID
   * @param {String} publicId - Cloudinary public ID
   * @returns {Object} Image
   */
  async getImageByPublicId(publicId) {
    try {
      const image = await this.repo.findByPublicId(publicId);

      if (!image) {
        throw {
          statusCode: 404,
          message: "Image not found",
        };
      }

      return {
        success: true,
        message: "Image retrieved",
        data: image,
      };
    } catch (error) {
      throw {
        statusCode: error.statusCode || 500,
        message: error.message || "Error retrieving image",
      };
    }
  }

  /**
   * Get user's images
   * @param {String} uploaderId - Uploader ID
   * @param {Object} options - Query options
   * @returns {Array} User's images
   */
  async getUserImages(uploaderId, options = {}) {
    try {
      const { page = 1, limit = 20 } = options;
      const skip = (page - 1) * limit;

      const images = await this.repo.findByUploader(uploaderId, {
        skip,
        limit,
      });
      const total = await this.repo.countByUploader(uploaderId);

      return {
        success: true,
        message: "User images retrieved",
        data: images,
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
        message: "Error retrieving user images",
      };
    }
  }

  /**
   * Get all public images
   * @param {Object} options - Query options
   * @returns {Array} Public images
   */
  async getPublicImages(options = {}) {
    try {
      const { page = 1, limit = 50 } = options;
      const skip = (page - 1) * limit;

      const images = await this.repo.findPublicImages({ skip, limit });

      return {
        success: true,
        message: "Public images retrieved",
        data: images,
      };
    } catch (error) {
      throw {
        statusCode: 500,
        message: "Error retrieving public images",
      };
    }
  }

  /**
   * Update image
   * @param {String} imageId - Image ID
   * @param {Object} updateData - Update data
   * @returns {Object} Updated image
   */
  async updateImage(imageId, updateData) {
    try {
      // Allow limited fields to be updated
      const allowedFields = ["fileName", "isPublic", "metadata"];
      const sanitized = {};

      for (const key of allowedFields) {
        if (key in updateData) {
          sanitized[key] = updateData[key];
        }
      }

      const image = await this.repo.findByIdAndUpdate(imageId, sanitized);

      if (!image) {
        throw {
          statusCode: 404,
          message: "Image not found",
        };
      }

      return {
        success: true,
        message: "Image updated",
        data: image,
      };
    } catch (error) {
      throw {
        statusCode: error.statusCode || 500,
        message: error.message || "Error updating image",
      };
    }
  }

  /**
   * Delete image
   * @param {String} imageId - Image ID
   * @returns {Object} Deletion result
   */
  async deleteImage(imageId) {
    try {
      const image = await this.repo.deleteImage(imageId);

      if (!image) {
        throw {
          statusCode: 404,
          message: "Image not found",
        };
      }

      return {
        success: true,
        message: "Image deleted",
        data: image,
      };
    } catch (error) {
      throw {
        statusCode: error.statusCode || 500,
        message: error.message || "Error deleting image",
      };
    }
  }

  /**
   * Change image visibility
   * @param {String} imageId - Image ID
   * @param {Boolean} isPublic - Public status
   * @returns {Object} Updated image
   */
  async changeVisibility(imageId, isPublic) {
    try {
      const image = await this.repo.updateVisibility(imageId, isPublic);

      if (!image) {
        throw {
          statusCode: 404,
          message: "Image not found",
        };
      }

      return {
        success: true,
        message: "Image visibility updated",
        data: image,
      };
    } catch (error) {
      throw {
        statusCode: error.statusCode || 500,
        message: error.message || "Error updating visibility",
      };
    }
  }

  /**
   * Search images by file name
   * @param {String} query - Search query
   * @returns {Array} Matching images
   */
  async searchImages(query) {
    try {
      if (!query || query.trim().length === 0) {
        throw {
          statusCode: 400,
          message: "Search query is required",
        };
      }

      const images = await this.repo.searchByFileName(query);

      return {
        success: true,
        message: "Images found",
        data: images,
        count: images.length,
      };
    } catch (error) {
      throw {
        statusCode: error.statusCode || 500,
        message: error.message || "Error searching images",
      };
    }
  }

  /**
   * Get image statistics
   * @returns {Object} Statistics
   */
  async getImageStatistics() {
    try {
      const stats = await this.repo.getStatistics();
      const totalStorage = await this.repo.getTotalStorageUsed();

      return {
        success: true,
        message: "Statistics retrieved",
        data: {
          byType: stats,
          totalStorageBytes: totalStorage,
          totalStorageMB: Math.round((totalStorage / (1024 * 1024)) * 100) / 100,
        },
      };
    } catch (error) {
      throw {
        statusCode: 500,
        message: "Error retrieving statistics",
      };
    }
  }

  /**
   * Get storage info for user
   * @param {String} uploaderId - Uploader ID
   * @returns {Object} Storage info
   */
  async getUserStorageInfo(uploaderId) {
    try {
      const count = await this.repo.countByUploader(uploaderId);
      const images = await this.repo.findByUploader(uploaderId, { limit: 1000 });

      const totalSize = images.reduce((sum, img) => sum + (img.size || 0), 0);
      const totalSizeMB = Math.round((totalSize / (1024 * 1024)) * 100) / 100;

      return {
        success: true,
        message: "Storage info retrieved",
        data: {
          imageCount: count,
          totalStorageBytes: totalSize,
          totalStorageMB: totalSizeMB,
        },
      };
    } catch (error) {
      throw {
        statusCode: 500,
        message: "Error retrieving storage info",
      };
    }
  }

  /**
   * Bulk delete images
   * @param {Array} imageIds - Array of image IDs
   * @returns {Object} Deletion result
   */
  async bulkDeleteImages(imageIds) {
    try {
      if (!Array.isArray(imageIds) || imageIds.length === 0) {
        throw {
          statusCode: 400,
          message: "Image IDs array is required",
        };
      }

      let deleted = 0;
      for (const imageId of imageIds) {
        try {
          await this.repo.deleteImage(imageId);
          deleted++;
        } catch (error) {
          console.error(`Failed to delete image ${imageId}:`, error);
        }
      }

      return {
        success: true,
        message: `Deleted ${deleted} out of ${imageIds.length} images`,
        data: { deleted, total: imageIds.length },
      };
    } catch (error) {
      throw {
        statusCode: error.statusCode || 500,
        message: error.message || "Error deleting images",
      };
    }
  }
}
