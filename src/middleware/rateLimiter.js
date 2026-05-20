/**
 * Rate Limiting Middleware
 * Prevents abuse by limiting requests per IP
 */
import express from "express";

export default class RateLimiter {
  constructor(windowMs = 60000, maxRequests = 100) {
    this.windowMs = windowMs; // Time window in milliseconds (default 1 minute)
    this.maxRequests = maxRequests; // Max requests per window
    this.requests = new Map(); // Store request counts by IP
  }

  /**
   * Express middleware for rate limiting
   * @returns {Function} Express middleware
   */
  middleware() {
    return (req, res, next) => {
      const ip = req.ip || req.connection.remoteAddress;
      const now = Date.now();

      if (!this.requests.has(ip)) {
        this.requests.set(ip, []);
      }

      const timestamps = this.requests.get(ip);

      // Remove old requests outside the window
      const validTimestamps = timestamps.filter((timestamp) => now - timestamp < this.windowMs);

      if (validTimestamps.length >= this.maxRequests) {
        return res.status(429).json({
          success: false,
          message: "Too many requests, please try again later",
          retryAfter: Math.ceil((validTimestamps[0] + this.windowMs - now) / 1000),
        });
      }

      validTimestamps.push(now);
      this.requests.set(ip, validTimestamps);

      // Set rate limit headers
      res.set("X-RateLimit-Limit", this.maxRequests);
      res.set("X-RateLimit-Remaining", this.maxRequests - validTimestamps.length);
      res.set("X-RateLimit-Reset", new Date(now + this.windowMs).toISOString());

      next();
    };
  }

  /**
   * Reset rate limit for specific IP
   * @param {String} ip - IP address
   */
  reset(ip) {
    this.requests.delete(ip);
  }

  /**
   * Clear all rate limit data
   */
  clear() {
    this.requests.clear();
  }

  /**
   * Get rate limit statistics
   * @returns {Object} Stats
   */
  getStats() {
    const now = Date.now();
    const stats = {};

    for (const [ip, timestamps] of this.requests.entries()) {
      const validTimestamps = timestamps.filter((ts) => now - ts < this.windowMs);
      stats[ip] = {
        requests: validTimestamps.length,
        limit: this.maxRequests,
        remaining: this.maxRequests - validTimestamps.length,
      };
    }

    return stats;
  }
}

/**
 * Stricter rate limiter for sensitive endpoints
 */
export class StrictRateLimiter extends RateLimiter {
  constructor() {
    super(3600000, 5); // 1 hour, 5 requests
  }
}

/**
 * Lenient rate limiter for public endpoints
 */
export class LenientRateLimiter extends RateLimiter {
  constructor() {
    super(60000, 100); // 1 minute, 100 requests
  }
}
