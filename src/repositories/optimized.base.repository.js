/**
 * Optimized Base Repository with Caching
 * Enhanced with performance improvements
 */
import { globalCache } from "../middleware/cacheManager.js";
import QueryOptimizer from "../middleware/queryOptimizer.js";

export default class OptimizedBaseRepository {
  constructor(Model, cachePrefix = "entity", cacheTTL = 300000) {
    this.Model = Model;
    this.cachePrefix = cachePrefix;
    this.cacheTTL = cacheTTL;
  }

  /**
   * Find by ID with caching
   * @param {String} id - Document ID
   * @param {Object} options - Query options
   * @returns {Object} Document
   */
  async findById(id, options = {}) {
    const { useCache = true, select = "" } = options;

    if (useCache) {
      const cacheKey = `${this.cachePrefix}:${id}`;
      const cached = globalCache.get(cacheKey);
      if (cached) return cached;
    }

    const query = this.Model.findById(id);
    if (select) query.select(select);
    if (options.lean) query.lean();

    const result = await query.exec();

    if (useCache && result) {
      const cacheKey = `${this.cachePrefix}:${id}`;
      globalCache.set(cacheKey, result, this.cacheTTL);
    }

    return result;
  }

  /**
   * Find one with optimizations
   * @param {Object} filter - Query filter
   * @param {Object} options - Query options
   * @returns {Object} Document
   */
  async findOne(filter, options = {}) {
    const { select = "", lean = true } = options;

    const query = this.Model.findOne(filter);
    if (select) query.select(select);
    if (lean) query.lean();

    return await query.exec();
  }

  /**
   * Find with pagination and caching
   * @param {Object} filter - Query filter
   * @param {Object} options - Query options
   * @returns {Array} Documents
   */
  async find(filter = {}, options = {}) {
    const {
      skip = 0,
      limit = 20,
      sort = { createdAt: -1 },
      select = "",
      lean = true,
      useCache = false,
      cacheName = null,
    } = options;

    // Check cache if enabled
    if (useCache && cacheName) {
      const cacheKey = `${this.cachePrefix}:${cacheName}`;
      const cached = globalCache.get(cacheKey);
      if (cached) return cached;
    }

    const query = this.Model.find(filter).skip(skip).limit(limit).sort(sort);

    if (select) query.select(select);
    if (lean) query.lean();

    const results = await query.exec();

    // Cache results if enabled
    if (useCache && cacheName) {
      const cacheKey = `${this.cachePrefix}:${cacheName}`;
      globalCache.set(cacheKey, results, this.cacheTTL);
    }

    return results;
  }

  /**
   * Count with caching
   * @param {Object} filter - Query filter
   * @returns {Number} Count
   */
  async count(filter = {}) {
    return await this.Model.countDocuments(filter);
  }

  /**
   * Create document
   * @param {Object} data - Document data
   * @returns {Object} Created document
   */
  async create(data) {
    const result = await this.Model.create(data);

    // Invalidate related caches
    this._invalidateCache();

    return result;
  }

  /**
   * Update by ID and invalidate cache
   * @param {String} id - Document ID
   * @param {Object} update - Update data
   * @returns {Object} Updated document
   */
  async findByIdAndUpdate(id, update) {
    const result = await this.Model.findByIdAndUpdate(id, update, { new: true }).lean();

    // Invalidate cache
    globalCache.delete(`${this.cachePrefix}:${id}`);
    this._invalidateCache();

    return result;
  }

  /**
   * Delete by ID
   * @param {String} id - Document ID
   * @returns {Object} Deleted document
   */
  async delete(id) {
    const result = await this.Model.findByIdAndDelete(id);

    // Invalidate cache
    globalCache.delete(`${this.cachePrefix}:${id}`);
    this._invalidateCache();

    return result;
  }

  /**
   * Aggregate with optimization
   * @param {Array} pipeline - Aggregation pipeline
   * @returns {Array} Results
   */
  async aggregate(pipeline = []) {
    const optimized = QueryOptimizer.buildAggregationPipeline(pipeline);
    return await this.Model.aggregate(optimized);
  }

  /**
   * Bulk write operation
   * @param {Array} operations - Bulk operations
   * @returns {Object} Result
   */
  async bulkWrite(operations = []) {
    if (operations.length === 0) return null;

    const result = await this.Model.bulkWrite(operations);

    // Invalidate all caches
    this._invalidateCache(true);

    return result;
  }

  /**
   * Update many with cache invalidation
   * @param {Object} filter - Query filter
   * @param {Object} update - Update data
   * @returns {Object} Result
   */
  async updateMany(filter, update) {
    const result = await this.Model.updateMany(filter, update);

    // Invalidate cache
    this._invalidateCache();

    return result;
  }

  /**
   * Delete many with cache invalidation
   * @param {Object} filter - Query filter
   * @returns {Object} Result
   */
  async deleteMany(filter) {
    const result = await this.Model.deleteMany(filter);

    // Invalidate cache
    this._invalidateCache(true);

    return result;
  }

  /**
   * Check if document exists
   * @param {Object} filter - Query filter
   * @returns {Boolean} True if exists
   */
  async exists(filter) {
    const result = await this.Model.exists(filter);
    return result !== null;
  }

  /**
   * Get distinct values
   * @param {String} field - Field name
   * @param {Object} filter - Query filter
   * @returns {Array} Distinct values
   */
  async distinct(field, filter = {}) {
    return await this.Model.distinct(field, filter);
  }

  /**
   * Invalidate cache
   * @private
   * @param {Boolean} full - Full cache clear
   */
  _invalidateCache(full = false) {
    if (full) {
      globalCache.invalidatePattern(`${this.cachePrefix}:`);
    } else {
      globalCache.invalidatePattern(`${this.cachePrefix}:*`);
    }
  }

  /**
   * Clear all related cache
   */
  clearCache() {
    globalCache.invalidatePattern(`${this.cachePrefix}:`);
  }
}
