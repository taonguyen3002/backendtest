/**
 * @file Base Model Class
 * @description Abstract base model for all data models, providing common functionality
 */

import mongoose from "mongoose";

/**
 * Base Model Class
 * Provides common model methods and patterns for all entities
 */
export class BaseModel {
  /**
   * Constructor - initialize model
   * @param {Model} model - Mongoose model
   * @param {string} modelName - Model name for logging
   */
  constructor(model, modelName = "Model") {
    this.model = model;
    this.modelName = modelName;
  }

  /**
   * Create a new document
   * @param {Object} data - Document data
   * @returns {Promise<Object>} Created document
   * @throws {Error} If creation fails
   */
  async create(data) {
    try {
      if (!data || typeof data !== "object") {
        throw new Error(`Invalid ${this.modelName} data format`);
      }

      const document = new this.model(data);
      await document.validate();
      return await document.save();
    } catch (error) {
      throw new Error(`Failed to create ${this.modelName}: ${error.message}`);
    }
  }

  /**
   * Find document by ID
   * @param {string} id - Document ID
   * @param {Object} options - Query options { select, lean }
   * @returns {Promise<Object|null>} Document or null
   * @throws {Error} If query fails
   */
  async findById(id, options = {}) {
    try {
      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid ID format");
      }

      let query = this.model.findById(id);

      if (options.select) {
        query = query.select(options.select);
      }

      if (options.lean === true) {
        query = query.lean();
      }

      return await query.exec();
    } catch (error) {
      throw new Error(`Failed to find ${this.modelName}: ${error.message}`);
    }
  }

  /**
   * Find single document by filter
   * @param {Object} filter - MongoDB filter
   * @param {Object} options - Query options
   * @returns {Promise<Object|null>} Document or null
   * @throws {Error} If query fails
   */
  async findOne(filter, options = {}) {
    try {
      if (!filter || typeof filter !== "object") {
        throw new Error("Invalid filter object");
      }

      let query = this.model.findOne(filter);

      if (options.select) {
        query = query.select(options.select);
      }

      if (options.lean === true) {
        query = query.lean();
      }

      if (options.sort) {
        query = query.sort(options.sort);
      }

      return await query.exec();
    } catch (error) {
      throw new Error(`Failed to find ${this.modelName}: ${error.message}`);
    }
  }

  /**
   * Find multiple documents
   * @param {Object} filter - MongoDB filter
   * @param {Object} options - Query options { select, sort, limit, skip, lean }
   * @returns {Promise<Array>} Array of documents
   * @throws {Error} If query fails
   */
  async find(filter = {}, options = {}) {
    try {
      let query = this.model.find(filter);

      if (options.select) {
        query = query.select(options.select);
      }

      if (options.sort) {
        query = query.sort(options.sort);
      }

      if (options.limit) {
        query = query.limit(Math.min(options.limit, 100)); // Max 100 per page
      }

      if (options.skip) {
        query = query.skip(options.skip);
      }

      if (options.lean === true) {
        query = query.lean();
      }

      return await query.exec();
    } catch (error) {
      throw new Error(`Failed to find ${this.modelName}s: ${error.message}`);
    }
  }

  /**
   * Count documents
   * @param {Object} filter - MongoDB filter
   * @returns {Promise<number>} Document count
   * @throws {Error} If query fails
   */
  async countDocuments(filter = {}) {
    try {
      return await this.model.countDocuments(filter);
    } catch (error) {
      throw new Error(`Failed to count ${this.modelName}s: ${error.message}`);
    }
  }

  /**
   * Update single document
   * @param {string} id - Document ID
   * @param {Object} updateData - Update data
   * @param {Object} options - Update options
   * @returns {Promise<Object>} Updated document
   * @throws {Error} If update fails
   */
  async findByIdAndUpdate(id, updateData, options = {}) {
    try {
      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid ID format");
      }

      if (!updateData || typeof updateData !== "object") {
        throw new Error("Invalid update data");
      }

      const updatedDoc = await this.model.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
        ...options,
      });

      if (!updatedDoc) {
        throw new Error(`${this.modelName} not found`);
      }

      return updatedDoc;
    } catch (error) {
      throw new Error(`Failed to update ${this.modelName}: ${error.message}`);
    }
  }

  /**
   * Update multiple documents
   * @param {Object} filter - MongoDB filter
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} Update result { modifiedCount, matchedCount }
   * @throws {Error} If update fails
   */
  async updateMany(filter, updateData) {
    try {
      if (!filter || typeof filter !== "object") {
        throw new Error("Invalid filter object");
      }

      if (!updateData || typeof updateData !== "object") {
        throw new Error("Invalid update data");
      }

      const result = await this.model.updateMany(filter, updateData, {
        runValidators: true,
      });

      return {
        modifiedCount: result.modifiedCount,
        matchedCount: result.matchedCount,
      };
    } catch (error) {
      throw new Error(`Failed to update ${this.modelName}s: ${error.message}`);
    }
  }

  /**
   * Delete document by ID
   * @param {string} id - Document ID
   * @returns {Promise<Object>} Deleted document
   * @throws {Error} If delete fails
   */
  async findByIdAndDelete(id) {
    try {
      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid ID format");
      }

      const deletedDoc = await this.model.findByIdAndDelete(id);

      if (!deletedDoc) {
        throw new Error(`${this.modelName} not found`);
      }

      return deletedDoc;
    } catch (error) {
      throw new Error(`Failed to delete ${this.modelName}: ${error.message}`);
    }
  }

  /**
   * Delete multiple documents
   * @param {Object} filter - MongoDB filter
   * @returns {Promise<Object>} Delete result { deletedCount }
   * @throws {Error} If delete fails
   */
  async deleteMany(filter) {
    try {
      if (!filter || typeof filter !== "object") {
        throw new Error("Invalid filter object");
      }

      const result = await this.model.deleteMany(filter);

      return { deletedCount: result.deletedCount };
    } catch (error) {
      throw new Error(`Failed to delete ${this.modelName}s: ${error.message}`);
    }
  }

  /**
   * Pagination helper
   * @param {Object} filter - MongoDB filter
   * @param {number} page - Page number (1-indexed)
   * @param {number} limit - Items per page (max 100)
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Paginated result
   */
  async paginate(filter = {}, page = 1, limit = 20, options = {}) {
    try {
      page = Math.max(1, page);
      limit = Math.min(Math.max(1, limit), 100);

      const skip = (page - 1) * limit;
      const total = await this.countDocuments(filter);
      const documents = await this.find(filter, {
        skip,
        limit,
        ...options,
      });

      return {
        documents,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      throw new Error(`Pagination failed: ${error.message}`);
    }
  }

  /**
   * Bulk write operations
   * @param {Array} operations - MongoDB bulk operations
   * @returns {Promise<Object>} Bulk write result
   * @throws {Error} If operations fail
   */
  async bulkWrite(operations) {
    try {
      if (!Array.isArray(operations) || operations.length === 0) {
        throw new Error("Invalid operations array");
      }

      const result = await this.model.bulkWrite(operations);

      return {
        insertedCount: result.insertedCount,
        modifiedCount: result.modifiedCount,
        deletedCount: result.deletedCount,
      };
    } catch (error) {
      throw new Error(`Bulk write failed: ${error.message}`);
    }
  }

  /**
   * Check if document exists
   * @param {Object} filter - MongoDB filter
   * @returns {Promise<boolean>} True if exists
   */
  async exists(filter) {
    try {
      const result = await this.model.exists(filter);
      return !!result;
    } catch (error) {
      throw new Error(`Existence check failed: ${error.message}`);
    }
  }

  /**
   * Get aggregate results
   * @param {Array} pipeline - MongoDB aggregation pipeline
   * @returns {Promise<Array>} Aggregation results
   */
  async aggregate(pipeline) {
    try {
      if (!Array.isArray(pipeline)) {
        throw new Error("Pipeline must be an array");
      }

      return await this.model.aggregate(pipeline);
    } catch (error) {
      throw new Error(`Aggregation failed: ${error.message}`);
    }
  }
}

export default BaseModel;
