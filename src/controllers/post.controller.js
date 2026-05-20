/**
 * @file Post Controller
 * @description HTTP handler for post management endpoints
 */

import PostService from "../services/post.service.js";
import PostValidator from "../validators/post.validator.js";
import logger from "../helpers/logger.js";

/**
 * PostController - Handles post management HTTP requests
 */
class PostController {
  /**
   * Constructor
   * @param {Connection} db - MongoDB connection instance
   * @param {Object} config - Domain config
   */
  constructor(db, config) {
    this.postService = new PostService(db, config);
  }

  /**
   * Create new post
   * POST /api/v1/posts
   */
  async createPost(req, res, next) {
    try {
      logger.info("PostController: Create post", { title: req.body.title });

      const validation = PostValidator.validateCreatePost(req.body);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          errors: validation.errors,
        });
      }

      const post = await this.postService.createPost(req.body);

      res.status(201).json({
        success: true,
        message: "Post created successfully",
        data: post,
      });
    } catch (error) {
      if (error.statusCode === 400) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  }

  /**
   * Get post by ID
   * GET /api/v1/posts/:id
   */
  async getPostById(req, res, next) {
    try {
      const { id } = req.params;

      logger.info("PostController: Get post by ID", { postId: id });

      const post = await this.postService.getPostById(id);

      res.status(200).json({
        success: true,
        data: post,
      });
    } catch (error) {
      if (error.statusCode === 404) {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  }

  /**
   * Get post by slug
   * GET /api/v1/posts/slug/:slug
   */
  async getPostBySlug(req, res, next) {
    try {
      const { slug } = req.params;

      logger.info("PostController: Get post by slug", { slug });

      const post = await this.postService.getPostBySlug(slug);

      res.status(200).json({
        success: true,
        data: post,
      });
    } catch (error) {
      if (error.statusCode === 404) {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  }

  /**
   * Get all posts with pagination
   * GET /api/v1/posts?page=1&limit=10
   */
  async getAllPosts(req, res, next) {
    try {
      const { page = 1, limit = 10 } = req.query;

      logger.info("PostController: Get all posts", { page, limit });

      const result = await this.postService.getAllPosts(parseInt(page), parseInt(limit));

      res.status(200).json({
        success: true,
        data: result.posts,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get recent posts
   * GET /api/v1/posts/recent?limit=10
   */
  async getRecentPosts(req, res, next) {
    try {
      const { limit = 10 } = req.query;

      logger.info("PostController: Get recent posts", { limit });

      const posts = await this.postService.getRecentPosts(parseInt(limit));

      res.status(200).json({
        success: true,
        data: posts,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Search posts
   * GET /api/v1/posts/search?q=query&limit=10
   */
  async searchPosts(req, res, next) {
    try {
      const { q: query, limit = 10 } = req.query;

      logger.info("PostController: Search posts", { query });

      if (!query) {
        return res.status(400).json({
          success: false,
          message: "Query parameter is required",
        });
      }

      const result = await this.postService.searchPosts(query, parseInt(limit));

      if (result.data.length === 0) {
        return res.status(404).json({
          success: false,
          message: result.message,
          query,
        });
      }

      res.status(200).json({
        success: true,
        data: result.data,
        total: result.total,
        query,
      });
    } catch (error) {
      if (error.statusCode === 400) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  }

  /**
   * Filter posts by tags or get random
   * POST /api/v1/posts/filter
   */
  async filterPosts(req, res, next) {
    try {
      const { tags, limit = 10 } = req.body;

      logger.info("PostController: Filter posts", { tags, limit });

      const posts = await this.postService.filterPostsByTagsOrRandom(tags, parseInt(limit));

      res.status(200).json({
        success: true,
        data: posts,
      });
    } catch (error) {
      if (error.statusCode === 404) {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  }

  /**
   * Update post
   * PUT /api/v1/posts/:id
   */
  async updatePost(req, res, next) {
    try {
      const { id } = req.params;

      logger.info("PostController: Update post", { postId: id });

      const validation = PostValidator.validateUpdatePost(req.body);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          errors: validation.errors,
        });
      }

      const post = await this.postService.updatePost(id, req.body);

      res.status(200).json({
        success: true,
        message: "Post updated successfully",
        data: post,
      });
    } catch (error) {
      if (error.statusCode === 404) {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  }

  /**
   * Change post slug
   * PUT /api/v1/posts/:id/slug
   */
  async changeSlug(req, res, next) {
    try {
      const { id } = req.params;
      const { slug } = req.body;

      logger.info("PostController: Change post slug", { postId: id, slug });

      if (!slug) {
        return res.status(400).json({
          success: false,
          message: "Slug is required",
        });
      }

      const post = await this.postService.changeSlug(id, slug);

      res.status(200).json({
        success: true,
        message: "Slug updated successfully",
        data: post,
      });
    } catch (error) {
      if (error.statusCode === 404 || error.statusCode === 409) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  }

  /**
   * Publish post
   * POST /api/v1/posts/:id/publish
   */
  async publishPost(req, res, next) {
    try {
      const { id } = req.params;

      logger.info("PostController: Publish post", { postId: id });

      const post = await this.postService.publishPost(id);

      res.status(200).json({
        success: true,
        message: "Post published successfully",
        data: post,
      });
    } catch (error) {
      if (error.statusCode === 404) {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  }

  /**
   * Delete post
   * DELETE /api/v1/posts/:id
   */
  async deletePost(req, res, next) {
    try {
      const { id } = req.params;

      logger.info("PostController: Delete post", { postId: id });

      await this.postService.deletePost(id);

      res.status(200).json({
        success: true,
        message: "Post deleted successfully",
      });
    } catch (error) {
      if (error.statusCode === 404) {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  }

  /**
   * Get posts by author
   * GET /api/v1/posts/author/:authorName?page=1&limit=10
   */
  async getPostsByAuthor(req, res, next) {
    try {
      const { authorName } = req.params;
      const { page = 1, limit = 10 } = req.query;

      logger.info("PostController: Get posts by author", { authorName });

      const result = await this.postService.getPostsByAuthor(authorName, parseInt(page), parseInt(limit));

      res.status(200).json({
        success: true,
        data: result.posts,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default PostController;
