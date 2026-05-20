import CommentRepository from "../repositories/comment.repository.js";

/**
 * Comment Service
 * Business logic for comments management
 */
export default class CommentService {
  /**
   * Constructor
   * @param {Connection} db - MongoDB connection
   */
  constructor(db) {
    this.db = db;
    this.repo = new CommentRepository(db);
  }

  /**
   * Create new comment
   * @param {Object} commentData - Comment data
   * @returns {Object} Created comment
   */
  async createComment(commentData) {
    try {
      const { postId, authorId, authorName, content, parentId } = commentData;

      // Validate required fields
      if (!postId || !authorId || !authorName || !content) {
        throw {
          statusCode: 400,
          message: "Missing required fields: postId, authorId, authorName, content",
        };
      }

      // Validate content length
      if (content.length > 2000) {
        throw {
          statusCode: 400,
          message: "Comment content exceeds maximum length of 2000 characters",
        };
      }

      const comment = await this.repo.create({
        postId,
        authorId,
        authorName,
        content,
        parentId: parentId || null,
        isApproved: !this._requiresModeration(content),
      });

      return {
        success: true,
        message: "Comment created successfully",
        data: comment,
      };
    } catch (error) {
      console.error("Create comment error:", error);
      throw {
        statusCode: error.statusCode || 500,
        message: error.message || "Error creating comment",
        errors: error.errors,
      };
    }
  }

  /**
   * Get comments for a post
   * @param {String} postId - Post ID
   * @param {Object} options - Query options
   * @returns {Array} Post comments
   */
  async getPostComments(postId, options = {}) {
    try {
      const { page = 1, limit = 20 } = options;
      const skip = (page - 1) * limit;

      const comments = await this.repo.findByPostId(postId, {
        skip,
        limit,
      });
      const total = await this.repo.countByPostId(postId);

      return {
        success: true,
        message: "Comments retrieved",
        data: comments,
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
        message: "Error retrieving comments",
      };
    }
  }

  /**
   * Get thread (top-level comment with replies)
   * @param {String} commentId - Comment ID
   * @returns {Object} Comment thread
   */
  async getCommentThread(commentId) {
    try {
      const comment = await this.repo.findById(commentId);

      if (!comment) {
        throw {
          statusCode: 404,
          message: "Comment not found",
        };
      }

      // Get replies if this is a top-level comment
      let replies = [];
      if (!comment.parentId) {
        replies = await this.repo.findReplies(commentId);
      }

      return {
        success: true,
        message: "Comment thread retrieved",
        data: {
          comment,
          replies,
          replyCount: replies.length,
        },
      };
    } catch (error) {
      throw {
        statusCode: error.statusCode || 500,
        message: error.message || "Error retrieving comment thread",
      };
    }
  }

  /**
   * Update comment
   * @param {String} commentId - Comment ID
   * @param {Object} updateData - Update data
   * @returns {Object} Updated comment
   */
  async updateComment(commentId, updateData) {
    try {
      // Only allow content and authorName updates
      const allowedFields = ["content", "authorName"];
      const sanitized = {};

      for (const key of allowedFields) {
        if (key in updateData) {
          sanitized[key] = updateData[key];
        }
      }

      // Validate content length if provided
      if (sanitized.content && sanitized.content.length > 2000) {
        throw {
          statusCode: 400,
          message: "Comment content exceeds maximum length of 2000 characters",
        };
      }

      const comment = await this.repo.findByIdAndUpdate(commentId, sanitized);

      if (!comment) {
        throw {
          statusCode: 404,
          message: "Comment not found",
        };
      }

      return {
        success: true,
        message: "Comment updated",
        data: comment,
      };
    } catch (error) {
      throw {
        statusCode: error.statusCode || 500,
        message: error.message || "Error updating comment",
      };
    }
  }

  /**
   * Delete comment
   * @param {String} commentId - Comment ID
   * @returns {Object} Deletion result
   */
  async deleteComment(commentId) {
    try {
      const comment = await this.repo.delete(commentId);

      if (!comment) {
        throw {
          statusCode: 404,
          message: "Comment not found",
        };
      }

      return {
        success: true,
        message: "Comment deleted",
        data: comment,
      };
    } catch (error) {
      throw {
        statusCode: error.statusCode || 500,
        message: error.message || "Error deleting comment",
      };
    }
  }

  /**
   * Like a comment
   * @param {String} commentId - Comment ID
   * @returns {Object} Updated comment
   */
  async likeComment(commentId) {
    try {
      const comment = await this.repo.likeComment(commentId);

      if (!comment) {
        throw {
          statusCode: 404,
          message: "Comment not found",
        };
      }

      return {
        success: true,
        message: "Comment liked",
        data: comment,
      };
    } catch (error) {
      throw {
        statusCode: error.statusCode || 500,
        message: error.message || "Error liking comment",
      };
    }
  }

  /**
   * Get pending comments (admin)
   * @returns {Array} Unapproved comments
   */
  async getPendingComments() {
    try {
      const comments = await this.repo.findPendingComments();

      return {
        success: true,
        message: "Pending comments retrieved",
        data: comments,
        count: comments.length,
      };
    } catch (error) {
      throw {
        statusCode: 500,
        message: "Error retrieving pending comments",
      };
    }
  }

  /**
   * Approve comment (admin)
   * @param {String} commentId - Comment ID
   * @returns {Object} Updated comment
   */
  async approveComment(commentId) {
    try {
      const comment = await this.repo.approveComment(commentId);

      if (!comment) {
        throw {
          statusCode: 404,
          message: "Comment not found",
        };
      }

      return {
        success: true,
        message: "Comment approved",
        data: comment,
      };
    } catch (error) {
      throw {
        statusCode: error.statusCode || 500,
        message: error.message || "Error approving comment",
      };
    }
  }

  /**
   * Reject comment (admin)
   * @param {String} commentId - Comment ID
   * @returns {Object} Deletion result
   */
  async rejectComment(commentId) {
    try {
      const comment = await this.repo.rejectComment(commentId);

      if (!comment) {
        throw {
          statusCode: 404,
          message: "Comment not found",
        };
      }

      return {
        success: true,
        message: "Comment rejected",
        data: comment,
      };
    } catch (error) {
      throw {
        statusCode: error.statusCode || 500,
        message: error.message || "Error rejecting comment",
      };
    }
  }

  /**
   * Get comments by author
   * @param {String} authorId - Author ID
   * @returns {Array} Author's comments
   */
  async getAuthorComments(authorId) {
    try {
      const comments = await this.repo.findByAuthorId(authorId);

      return {
        success: true,
        message: "Author comments retrieved",
        data: comments,
        count: comments.length,
      };
    } catch (error) {
      throw {
        statusCode: 500,
        message: "Error retrieving author comments",
      };
    }
  }

  /**
   * Check if comment requires moderation
   * @private
   * @param {String} content - Comment content
   * @returns {Boolean} True if moderation required
   */
  _requiresModeration(content) {
    // Simple implementation - can be enhanced with better filters
    const spamPatterns = [
      /viagra|cialis|casino|lottery/i,
      /http:\/\/|https:\/\//i, // URLs
    ];

    return spamPatterns.some((pattern) => pattern.test(content));
  }

  /**
   * Get comment statistics
   * @returns {Object} Statistics
   */
  async getCommentStatistics() {
    try {
      const stats = await this.repo.getStatistics();

      return {
        success: true,
        message: "Statistics retrieved",
        data: stats,
      };
    } catch (error) {
      throw {
        statusCode: 500,
        message: "Error retrieving statistics",
      };
    }
  }
}
