/**
 * Query Optimization Helpers
 * Provides utility functions for optimized database queries
 */
export default class QueryOptimizer {
  /**
   * Build optimized find query with projection
   * @param {Object} query - Query filter
   * @param {String} select - Fields to select (string format for Mongoose)
   * @param {Object} options - Query options
   * @returns {Object} Optimized query object
   */
  static buildFindQuery(query = {}, select = "", options = {}) {
    const { skip = 0, limit = 20, sort = { createdAt: -1 }, lean = true } = options;

    return {
      filter: query,
      select,
      skip,
      limit,
      sort,
      lean,
    };
  }

  /**
   * Build aggregation pipeline for performance
   * @param {Array} stages - Aggregation stages
   * @returns {Array} Optimized pipeline
   */
  static buildAggregationPipeline(stages = []) {
    // Add $match at the beginning to filter early
    // Add $project to limit fields
    // Add $sort before $skip and $limit
    const optimized = [];

    // Reorder stages for efficiency
    const matchStages = stages.filter((s) => s.$match);
    const projectStages = stages.filter((s) => s.$project);
    const sortStages = stages.filter((s) => s.$sort);
    const otherStages = stages.filter((s) => !s.$match && !s.$project && !s.$sort);

    // Optimal order: $match → $project → others → $sort
    optimized.push(...matchStages);
    optimized.push(...projectStages);
    optimized.push(...otherStages);
    optimized.push(...sortStages);

    return optimized;
  }

  /**
   * Create indexed query hint
   * @param {String} indexName - Index name
   * @returns {Object} Mongoose hint object
   */
  static hintIndex(indexName) {
    return { hint: indexName };
  }

  /**
   * Batch process documents
   * @param {Array} documents - Documents to batch
   * @param {Number} batchSize - Size of each batch
   * @generator
   */
  static *batch(documents, batchSize = 100) {
    for (let i = 0; i < documents.length; i += batchSize) {
      yield documents.slice(i, i + batchSize);
    }
  }

  /**
   * Calculate optimal pagination
   * @param {Number} total - Total items
   * @param {Number} page - Current page
   * @param {Number} limit - Items per page
   * @returns {Object} Pagination info
   */
  static calculatePagination(total, page = 1, limit = 20) {
    const pages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;

    return {
      page: Math.min(page, pages),
      limit,
      skip,
      total,
      pages,
      hasNext: page < pages,
      hasPrev: page > 1,
    };
  }

  /**
   * Build select string from array
   * @param {Array} fields - Field names
   * @returns {String} Select string for Mongoose
   */
  static buildSelect(fields = []) {
    if (!Array.isArray(fields) || fields.length === 0) {
      return "";
    }

    return fields.map((f) => (f.startsWith("-") ? f : f)).join(" ");
  }

  /**
   * Exclude sensitive fields
   * @param {Array} fields - Fields to include
   * @returns {String} Select string excluding sensitive fields
   */
  static excludeSensitive(fields = []) {
    const sensitive = ["-password", "-token", "-refreshToken", "-otp", "-resetToken"];
    const select = this.buildSelect(fields);

    return select ? `${select} ${sensitive.join(" ")}` : sensitive.join(" ");
  }

  /**
   * Check if query has full table scan risk
   * @param {Object} query - MongoDB query
   * @returns {Boolean} True if risky
   */
  static isFullTableScan(query) {
    const empty = Object.keys(query).length === 0;
    return empty;
  }

  /**
   * Suggest index for query
   * @param {Object} query - MongoDB query
   * @returns {Array} Suggested index fields
   */
  static suggestIndex(query) {
    return Object.keys(query);
  }
}

/**
 * Connection Pool Manager
 * Manages and optimizes database connections
 */
export class ConnectionPoolManager {
  constructor(maxPoolSize = 10, minPoolSize = 2) {
    this.maxPoolSize = maxPoolSize;
    this.minPoolSize = minPoolSize;
    this.activeConnections = 0;
    this.pooledConnections = [];
  }

  /**
   * Get connection with pooling
   * @returns {Object} Database connection
   */
  getConnection() {
    if (this.pooledConnections.length > 0) {
      this.activeConnections++;
      return this.pooledConnections.pop();
    }

    if (this.activeConnections < this.maxPoolSize) {
      this.activeConnections++;
      return this._createConnection();
    }

    // Wait for connection to be available
    return this._waitForConnection();
  }

  /**
   * Release connection back to pool
   * @param {Object} connection - Connection to release
   */
  releaseConnection(connection) {
    if (this.pooledConnections.length < this.minPoolSize) {
      this.pooledConnections.push(connection);
    } else {
      connection.close();
    }
    this.activeConnections--;
  }

  /**
   * Create new connection
   * @private
   */
  _createConnection() {
    // Implementation specific to your DB driver
    return {};
  }

  /**
   * Wait for available connection
   * @private
   */
  async _waitForConnection() {
    // Implement backoff strategy
    await new Promise((resolve) => setTimeout(resolve, 100));
    return this.getConnection();
  }

  /**
   * Get pool statistics
   * @returns {Object} Pool stats
   */
  getStats() {
    return {
      active: this.activeConnections,
      pooled: this.pooledConnections.length,
      max: this.maxPoolSize,
      min: this.minPoolSize,
    };
  }
}
