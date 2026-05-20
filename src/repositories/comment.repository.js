import BaseRepository from "./base.repository.js";
import { getCommentModel } from "../models/Comment.js";

/**
 * Comment Repository
 * Handles all data access for comments
 */
export default class CommentRepository extends BaseRepository {
  /**
   * Constructor
   * @param {Connection} db - MongoDB connection
   */
  constructor(db) {
    const Model = getCommentModel(db);
    super(Model);
    this.db = db;
  }

  /**
   * Find all comments for a post
   * @param {String} postId - Post ID
   * @param {Object} options - Query options
   * @returns {Array} Comments for post
   */
  async findByPostId(postId, options = {}) {
    const { limit = 50, skip = 0, sort = { date: -1 } } = options;
    return this.Model.find({ postId, isApproved: true })
      .populate("authorId", "username avatar")
      .sort(sort)
      .limit(limit)
      .skip(skip);
  }

  /**
   * Find top-level comments for a post
   * @param {String} postId - Post ID
   * @param {Object} options - Query options
   * @returns {Array} Top-level comments
   */
  async findTopLevelComments(postId, options = {}) {
    const { limit = 20, skip = 0 } = options;
    return this.Model.find({ postId, parentId: null, isApproved: true })
      .populate("authorId", "username avatar")
      .sort({ date: -1 })
      .limit(limit)
      .skip(skip);
  }

  /**
   * Find replies to a comment
   * @param {String} parentId - Parent comment ID
   * @returns {Array} Reply comments
   */
  async findReplies(parentId) {
    return this.Model.find({ parentId, isApproved: true }).populate("authorId", "username avatar").sort({ date: 1 });
  }

  /**
   * Find comments by author
   * @param {String} authorId - Author/User ID
   * @param {Object} options - Query options
   * @returns {Array} Author's comments
   */
  async findByAuthorId(authorId, options = {}) {
    const { limit = 50, skip = 0 } = options;
    return this.Model.find({ authorId, isApproved: true }).sort({ date: -1 }).limit(limit).skip(skip);
  }

  /**
   * Get pending comments (not approved)
   * @returns {Array} Unapproved comments
   */
  async findPendingComments() {
    return this.Model.find({ isApproved: false })
      .populate("postId", "title slug")
      .populate("authorId", "username email")
      .sort({ date: -1 });
  }

  /**
   * Approve a comment
   * @param {String} commentId - Comment ID
   * @returns {Object} Updated comment
   */
  async approveComment(commentId) {
    return this.Model.findByIdAndUpdate(commentId, { isApproved: true }, { new: true });
  }

  /**
   * Reject/delete a comment
   * @param {String} commentId - Comment ID
   * @returns {Object} Deleted comment
   */
  async rejectComment(commentId) {
    return this.Model.findByIdAndDelete(commentId);
  }

  /**
   * Like a comment
   * @param {String} commentId - Comment ID
   * @returns {Object} Updated comment
   */
  async likeComment(commentId) {
    return this.Model.findByIdAndUpdate(commentId, { $inc: { likes: 1 } }, { new: true });
  }

  /**
   * Get comment count for a post
   * @param {String} postId - Post ID
   * @returns {Number} Comment count
   */
  async countByPostId(postId) {
    return this.Model.countDocuments({ postId, isApproved: true });
  }

  /**
   * Get statistics for comments
   * @returns {Object} Comment statistics
   */
  async getStatistics() {
    const result = await this.Model.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          approved: {
            $sum: { $cond: [{ $eq: ["$isApproved", true] }, 1, 0] },
          },
          pending: {
            $sum: { $cond: [{ $eq: ["$isApproved", false] }, 1, 0] },
          },
        },
      },
    ]);
    return result[0] || { total: 0, approved: 0, pending: 0 };
  }

  /**
   * Delete all comments for a post (e.g., when post is deleted)
   * @param {String} postId - Post ID
   * @returns {Object} Delete result
   */
  async deleteByPostId(postId) {
    return this.Model.deleteMany({ postId });
  }

  /**
   * Delete all comments by author
   * @param {String} authorId - Author ID
   * @returns {Object} Delete result
   */
  async deleteByAuthorId(authorId) {
    return this.Model.deleteMany({ authorId });
  }
}
