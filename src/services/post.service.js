/**
 * @file Post Service
 * @description Business logic for post management (CRUD, search, filtering)
 */

import PostRepository from "../repositories/post.repository.js";
import logger from "../helpers/logger.js";
import dotenv from "dotenv";

dotenv.config();

/**
 * PostService - Handles all post business logic
 */
class PostService {
  /**
   * Constructor
   * @param {Connection} db - MongoDB connection instance
   * @param {Object} config - Domain config (DOMAIN URL, etc.)
   */
  constructor(db, config) {
    this.postRepo = new PostRepository(db);
    this.config = config;
  }

  /**
   * Create new post
   * @param {Object} postData - Post data
   * @returns {Promise<Object>} Created post
   */
  async createPost(postData) {
    try {
      logger.info("PostService: Creating post", { title: postData.title });

      // Validate required fields
      const required = ["title", "description", "content", "authorName", "image"];
      for (const field of required) {
        if (!postData[field]) {
          const error = new Error(`${field} is required`);
          error.statusCode = 400;
          throw error;
        }
      }

      // Generate unique slug
      let slug = postData.slug || this.generateSlugFromTitle(postData.title);
      slug = await this.postRepo.generateUniqueSlug(slug);

      // Create post with unique slug
      const post = await this.postRepo.create({
        ...postData,
        slug,
      });

      // Trigger revalidation
      await this.triggerRevalidation(slug);

      logger.info("PostService: Post created successfully", {
        postId: post._id,
        slug,
      });

      return post.toObject();
    } catch (error) {
      logger.error("PostService: Create post failed", error, {
        title: postData.title,
      });
      throw error;
    }
  }

  /**
   * Get post by ID
   * @param {string} postId - Post ID
   * @returns {Promise<Object>} Post data
   */
  async getPostById(postId) {
    try {
      const post = await this.postRepo.findById(postId);
      if (!post) {
        const error = new Error("Post not found");
        error.statusCode = 404;
        throw error;
      }

      // Increment views
      await this.postRepo.incrementViews(postId);

      return post.toObject();
    } catch (error) {
      logger.error("PostService: Get post failed", error, { postId });
      throw error;
    }
  }

  /**
   * Get post by slug
   * @param {string} slug - Post slug
   * @returns {Promise<Object>} Post data
   */
  async getPostBySlug(slug) {
    try {
      logger.info("PostService: Getting post by slug", { slug });

      const post = await this.postRepo.findBySlug(slug);
      if (!post) {
        const error = new Error("Post not found");
        error.statusCode = 404;
        throw error;
      }

      // Increment views
      await this.postRepo.incrementViews(post._id);

      return post.toObject();
    } catch (error) {
      logger.error("PostService: Get post by slug failed", error, { slug });
      throw error;
    }
  }

  /**
   * Get all posts with pagination
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise<Object>} { posts, pagination }
   */
  async getAllPosts(page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      const [posts, total] = await Promise.all([this.postRepo.findAllBasics(skip, limit), this.postRepo.count()]);

      return {
        posts: posts.map((p) => p.toObject()),
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error("PostService: Get all posts failed", error);
      throw error;
    }
  }

  /**
   * Get recent posts
   * @param {number} limit - Number of posts
   * @returns {Promise<Array>} Array of recent posts
   */
  async getRecentPosts(limit = 10) {
    try {
      const posts = await this.postRepo.findRecent(limit);
      return posts.map((p) => p.toObject());
    } catch (error) {
      logger.error("PostService: Get recent posts failed", error);
      throw error;
    }
  }

  /**
   * Search posts by query
   * @param {string} query - Search query
   * @param {number} limit - Limit
   * @returns {Promise<Object>} { data, total, query }
   */
  async searchPosts(query, limit = 10) {
    try {
      logger.info("PostService: Searching posts", { query });

      if (!query || query.trim() === "") {
        const error = new Error("Query is required");
        error.statusCode = 400;
        throw error;
      }

      const posts = await this.postRepo.searchByQuery(query, limit);

      if (posts.length === 0) {
        return {
          data: [],
          total: 0,
          query,
          message: "No posts found",
        };
      }

      return {
        data: posts.map((p) => p.toObject()),
        total: posts.length,
        query,
      };
    } catch (error) {
      logger.error("PostService: Search posts failed", error, { query });
      throw error;
    }
  }

  /**
   * Filter posts by tags or get random
   * @param {Array} tags - Tags to filter
   * @param {number} limit - Number of posts
   * @returns {Promise<Array>} Filtered or random posts
   */
  async filterPostsByTagsOrRandom(tags, limit = 10) {
    try {
      logger.info("PostService: Filtering posts", { tags, limit });

      let postList = [];

      // Find by tags if provided
      if (Array.isArray(tags) && tags.length > 0) {
        const sanitizedTags = tags.filter((tag) => typeof tag === "string" && tag.trim());

        if (sanitizedTags.length > 0) {
          postList = await this.postRepo.findByTags(sanitizedTags, limit);
        }
      }

      // Fill remaining with random posts
      if (postList.length < limit) {
        const missing = limit - postList.length;
        const excludeSlugs = postList.map((p) => p.slug);
        const randomPosts = await this.postRepo.findRandom(missing, excludeSlugs);
        postList = [...postList, ...randomPosts];
      }

      if (postList.length === 0) {
        const error = new Error("No posts found");
        error.statusCode = 404;
        throw error;
      }

      return postList;
    } catch (error) {
      logger.error("PostService: Filter posts failed", error);
      throw error;
    }
  }

  /**
   * Update post
   * @param {string} postId - Post ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated post
   */
  async updatePost(postId, updateData) {
    try {
      logger.info("PostService: Updating post", { postId });

      // Don't allow direct slug changes (should use changeSlug method)
      delete updateData.slug;

      const post = await this.postRepo.findByIdAndUpdate(postId, {
        ...updateData,
        modifiedDate: new Date(),
      });

      if (!post) {
        const error = new Error("Post not found");
        error.statusCode = 404;
        throw error;
      }

      // Trigger revalidation
      await this.triggerRevalidation(post.slug);

      logger.info("PostService: Post updated successfully", { postId });

      return post.toObject();
    } catch (error) {
      logger.error("PostService: Update post failed", error, { postId });
      throw error;
    }
  }

  /**
   * Change post slug
   * @param {string} postId - Post ID
   * @param {string} newSlug - New slug
   * @returns {Promise<Object>} Updated post
   */
  async changeSlug(postId, newSlug) {
    try {
      logger.info("PostService: Changing post slug", { postId, newSlug });

      // Check if new slug already exists
      if (await this.postRepo.slugExists(newSlug, postId)) {
        const error = new Error("Slug already exists");
        error.statusCode = 409;
        throw error;
      }

      const post = await this.postRepo.updateSlug(postId, newSlug);

      if (!post) {
        const error = new Error("Post not found");
        error.statusCode = 404;
        throw error;
      }

      // Trigger revalidation for both old and new slug
      await this.triggerRevalidation(newSlug);

      logger.info("PostService: Post slug changed", { postId, newSlug });

      return post.toObject();
    } catch (error) {
      logger.error("PostService: Change slug failed", error, { postId });
      throw error;
    }
  }

  /**
   * Publish post
   * @param {string} postId - Post ID
   * @returns {Promise<Object>} Updated post
   */
  async publishPost(postId) {
    try {
      logger.info("PostService: Publishing post", { postId });

      const post = await this.postRepo.publishPost(postId);

      if (!post) {
        const error = new Error("Post not found");
        error.statusCode = 404;
        throw error;
      }

      // Trigger revalidation
      await this.triggerRevalidation(post.slug);

      logger.info("PostService: Post published", { postId });

      return post.toObject();
    } catch (error) {
      logger.error("PostService: Publish post failed", error, { postId });
      throw error;
    }
  }

  /**
   * Delete post
   * @param {string} postId - Post ID
   * @returns {Promise<Object>} { success: boolean }
   */
  async deletePost(postId) {
    try {
      logger.info("PostService: Deleting post", { postId });

      const post = await this.postRepo.findById(postId);
      if (!post) {
        const error = new Error("Post not found");
        error.statusCode = 404;
        throw error;
      }

      await this.postRepo.delete(postId);

      logger.info("PostService: Post deleted", { postId });

      return { success: true };
    } catch (error) {
      logger.error("PostService: Delete post failed", error, { postId });
      throw error;
    }
  }

  /**
   * Get posts by author
   * @param {string} authorName - Author name
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise<Object>} { posts, pagination }
   */
  async getPostsByAuthor(authorName, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      const [posts, total] = await Promise.all([
        this.postRepo.findByAuthor(authorName, skip, limit),
        this.postRepo.count({ authorName }),
      ]);

      return {
        posts: posts.map((p) => p.toObject()),
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error("PostService: Get posts by author failed", error);
      throw error;
    }
  }

  /**
   * Generate slug from title
   * @param {string} title - Post title
   * @returns {string} Generated slug
   */
  generateSlugFromTitle(title) {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  /**
   * Trigger revalidation for ISR
   * @param {string} slug - Post slug
   */
  async triggerRevalidation(slug) {
    try {
      if (!this.config.DOMAIN) {
        logger.warn("PostService: Domain config not set, skipping revalidation");
        return;
      }

      const url = `${this.config.DOMAIN}/api/revalidate/post/getall?secret=${process.env.REVALIDATE_SECRET}`;

      // Use async fetch (don't await)
      fetch(url).catch((err) => {
        logger.error("PostService: Revalidation request failed", err, { url });
      });

      logger.info("PostService: Revalidation triggered", { slug });
    } catch (error) {
      logger.error("PostService: Trigger revalidation error", error);
    }
  }
}

export default PostService;
