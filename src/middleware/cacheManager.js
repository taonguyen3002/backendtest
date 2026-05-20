/**
 * Caching Strategy
 * In-memory cache with TTL support
 */
export default class CacheManager {
  constructor(ttl = 300000) {
    this.cache = new Map();
    this.ttl = ttl; // Default 5 minutes in milliseconds
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Get cached value
   * @param {String} key - Cache key
   * @returns {*} Cached value or null
   */
  get(key) {
    const entry = this.cache.get(key);

    if (!entry) {
      this.misses++;
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    this.hits++;
    return entry.value;
  }

  /**
   * Set cached value
   * @param {String} key - Cache key
   * @param {*} value - Value to cache
   * @param {Number} ttl - Optional TTL in milliseconds
   */
  set(key, value, ttl = null) {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + (ttl || this.ttl),
    });
  }

  /**
   * Delete cache entry
   * @param {String} key - Cache key
   */
  delete(key) {
    this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clear() {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache stats
   */
  getStats() {
    const total = this.hits + this.misses;
    return {
      hits: this.hits,
      misses: this.misses,
      total,
      hitRate: total > 0 ? ((this.hits / total) * 100).toFixed(2) + "%" : "N/A",
      size: this.cache.size,
      memory: {
        approximate: `${Math.round(JSON.stringify(Array.from(this.cache)).length / 1024)}KB`,
      },
    };
  }

  /**
   * Clean expired entries
   */
  cleanExpired() {
    const now = Date.now();
    let removed = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        removed++;
      }
    }

    return removed;
  }

  /**
   * Invalidate cache pattern
   * @param {String} pattern - Regex pattern for keys to invalidate
   */
  invalidatePattern(pattern) {
    const regex = new RegExp(pattern);
    let removed = 0;

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        removed++;
      }
    }

    return removed;
  }
}

/**
 * Global cache instance
 */
export const globalCache = new CacheManager(300000); // 5 minutes default
