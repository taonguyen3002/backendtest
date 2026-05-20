/**
 * @file Post Repository
 * @description Data access layer for Post operations
 */

import BaseRepository from "./base.repository.js";
import { getPostModelWithConnection } from "../models/Post.js";

/**
 * Post Repository - Extends base repository with post-specific queries
 */
class PostRepository extends BaseRepository {
  /**
   * Constructor
   * @param {Connection} db - MongoDB connection instance
   */
  constructor(db) {
    const Post = getPostModelWithConnection(db);
    super(Post);
    this.Post = Post;
  }

  /**
   * Find post by slug
   * @param {string} slug - Post slug
   * @returns {Promise<Post|null>} Post document
   */
  async findBySlug(slug) {
    return await this.Post.findOne({ slug });
  }

  /**
   * Check if slug already exists
   * @param {string} slug - Slug to check
   * @param {string} excludeId - ID to exclude from check (optional)
   * @returns {Promise<boolean>} True if slug exists
   */
  async slugExists(slug, excludeId = null) {
    const query = { slug };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    return !!(await this.Post.findOne(query));
  }

  /**
   * Generate unique slug
   * @param {string} baseSlug - Base slug
   * @returns {Promise<string>} Unique slug
   */
  async generateUniqueSlug(baseSlug) {
    let counter = 1;
    let uniqueSlug = baseSlug;

    while (await this.slugExists(uniqueSlug)) {
      uniqueSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    return uniqueSlug;
  }

  /**
   * Find posts by author
   * @param {string} authorName - Author name
   * @param {number} skip - Skip count
   * @param {number} limit - Limit count
   * @returns {Promise<Array>} Array of posts
   */
  async findByAuthor(authorName, skip = 0, limit = 10) {
    return await this.Post.find({ authorName }).skip(skip).limit(limit).sort({ publishedDate: -1 });
  }

  /**
   * Find posts by tags
   * @param {Array} tags - Array of tags
   * @param {number} limit - Limit count
   * @returns {Promise<Array>} Array of posts
   */
  async findByTags(tags, limit = 10) {
    return await this.Post.find({ tags: { $in: tags } })
      .select("createdAt image.url title description authorName slug _id")
      .limit(limit)
      .sort({ createdAt: -1 });
  }

  /**
   * Find recent posts
   * @param {number} limit - Limit count
   * @returns {Promise<Array>} Array of posts
   */
  async findRecent(limit = 10) {
    return await this.Post.find().limit(limit).sort({ publishedDate: -1 });
  }

  /**
   * Find posts by status (indexed or not)
   * @param {boolean} isIndexed - Indexed status
   * @param {number} skip - Skip count
   * @param {number} limit - Limit count
   * @returns {Promise<Array>} Array of posts
   */
  async findByStatus(isIndexed, skip = 0, limit = 10) {
    return await this.Post.find({ isIndexed }).skip(skip).limit(limit).sort({ createdAt: -1 });
  }

  /**
   * Search posts by title or content
   * @param {string} query - Search query
   * @param {number} limit - Limit count
   * @returns {Promise<Array>} Array of matching posts
   */
  async searchByQuery(query, limit = 10) {
    const sanitizedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    return await this.Post.find({
      $or: [
        { title: { $regex: sanitizedQuery, $options: "i" } },
        { description: { $regex: sanitizedQuery, $options: "i" } },
      ],
    })
      .select("title slug description")
      .limit(limit)
      .sort({ createdAt: -1 });
  }

  /**
   * Find random posts
   * @param {number} limit - Number of posts
   * @param {Array} excludeSlugs - Slugs to exclude
   * @returns {Promise<Array>} Array of random posts
   */
  async findRandom(limit = 10, excludeSlugs = []) {
    return await this.Post.aggregate([
      { $match: { slug: { $nin: excludeSlugs } } },
      { $sample: { size: limit } },
      {
        $project: {
          createdAt: 1,
          "image.url": 1,
          title: 1,
          description: 1,
          authorName: 1,
          slug: 1,
        },
      },
    ]);
  }

  /**
   * Increment post views
   * @param {string} postId - Post ID
   * @returns {Promise<Post>} Updated post
   */
  async incrementViews(postId) {
    return await this.Post.findByIdAndUpdate(postId, { $inc: { views: 1 } }, { new: true });
  }

  /**
   * Get all posts with basic info (for listing)
   * @param {number} skip - Skip count
   * @param {number} limit - Limit count
   * @returns {Promise<Array>} Array of posts
   */
  async findAllBasics(skip = 0, limit = 10) {
    return await this.Post.find()
      .select("title slug createdAt isIndexed")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
  }

  /**
   * Update post slug
   * @param {string} postId - Post ID
   * @param {string} newSlug - New slug
   * @returns {Promise<Post>} Updated post
   */
  async updateSlug(postId, newSlug) {
    return await this.Post.findByIdAndUpdate(postId, { slug: newSlug }, { new: true });
  }

  /**
   * Publish post (set current date as publishedDate)
   * @param {string} postId - Post ID
   * @returns {Promise<Post>} Updated post
   */
  async publishPost(postId) {
    return await this.Post.findByIdAndUpdate(
      postId,
      {
        publishedDate: new Date(),
        isIndexed: true,
      },
      { new: true },
    );
  }
}

export default PostRepository;
