/**
 * Performance Monitoring Middleware
 * Tracks request/response time, memory usage, and logs performance metrics
 */
export default class PerformanceMonitor {
  /**
   * Express middleware for performance monitoring
   * @returns {Function} Express middleware
   */
  static middleware() {
    return (req, res, next) => {
      const startTime = Date.now();
      const startMemory = process.memoryUsage();

      // Intercept response.json
      const originalJson = res.json;
      res.json = function (data) {
        const endTime = Date.now();
        const endMemory = process.memoryUsage();

        const duration = endTime - startTime;
        const memoryDelta = {
          heapUsed: (endMemory.heapUsed - startMemory.heapUsed) / 1024 / 1024,
          external: (endMemory.external - startMemory.external) / 1024 / 1024,
        };

        // Log performance metrics
        PerformanceMonitor.logMetrics({
          method: req.method,
          path: req.path,
          statusCode: res.statusCode,
          duration,
          memoryDelta,
          timestamp: new Date().toISOString(),
        });

        // Attach performance data to response header
        res.set("X-Response-Time", `${duration}ms`);

        return originalJson.call(this, data);
      };

      next();
    };
  }

  /**
   * Log performance metrics
   * @param {Object} metrics - Metrics object
   */
  static logMetrics(metrics) {
    const { method, path, statusCode, duration, memoryDelta } = metrics;

    // Warn if request takes too long
    if (duration > 1000) {
      console.warn(`⚠️  SLOW REQUEST: ${method} ${path} - ${duration}ms`);
    }

    // Warn if memory usage is high
    if (Math.abs(memoryDelta.heapUsed) > 50) {
      console.warn(`⚠️  HIGH MEMORY DELTA: ${method} ${path} - ${memoryDelta.heapUsed.toFixed(2)}MB`);
    }

    // Log normal requests
    if (process.env.LOG_PERFORMANCE === "true") {
      console.log(`📊 [${method}] ${path} - ${statusCode} - ${duration}ms`);
    }
  }

  /**
   * Get memory usage report
   * @returns {Object} Memory stats
   */
  static getMemoryStats() {
    const mem = process.memoryUsage();
    return {
      rss: Math.round(mem.rss / 1024 / 1024),
      heapTotal: Math.round(mem.heapTotal / 1024 / 1024),
      heapUsed: Math.round(mem.heapUsed / 1024 / 1024),
      external: Math.round(mem.external / 1024 / 1024),
      timestamp: new Date().toISOString(),
    };
  }
}
