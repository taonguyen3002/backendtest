/**
 * @file Authentication Utilities
 * @description Enhanced JWT and permission utilities
 */

import jwt from "jsonwebtoken";

/**
 * Custom error classes for authentication
 */
export class AuthError extends Error {
  constructor(message, status = 401) {
    super(message);
    this.status = status;
    this.name = "AuthError";
  }
}

/**
 * Create access token with enhanced payload
 * @param {string} userId - User ID
 * @param {Object} userData - User data { role, email, username }
 * @param {string} secret - JWT secret
 * @param {string} expiresIn - Expiration (default 15m)
 * @returns {string} JWT token
 */
export const createAccessToken = (userId, userData = {}, secret, expiresIn = "15m") => {
  const payload = {
    userId,
    role: userData.role || "user",
    email: userData.email,
    username: userData.username,
    type: "access",
    iat: Math.floor(Date.now() / 1000),
  };

  return jwt.sign(payload, secret, { expiresIn });
};

/**
 * Create refresh token
 * @param {string} userId - User ID
 * @param {string} secret - JWT secret
 * @param {string} expiresIn - Expiration (default 15d)
 * @returns {string} JWT token
 */
export const createRefreshToken = (userId, secret, expiresIn = "15d") => {
  const payload = {
    userId,
    type: "refresh",
    iat: Math.floor(Date.now() / 1000),
  };

  return jwt.sign(payload, secret, { expiresIn });
};

/**
 * Verify and decode token
 * @param {string} token - JWT token
 * @param {string} secret - JWT secret
 * @returns {Object} Decoded token
 * @throws {AuthError} If token invalid
 */
export const verifyToken = (token, secret) => {
  try {
    const decoded = jwt.verify(token, secret);
    return decoded;
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new AuthError("Token has expired", 401);
    }

    if (error.name === "JsonWebTokenError") {
      throw new AuthError("Invalid token", 401);
    }

    throw new AuthError(error.message, 401);
  }
};

/**
 * Extract token from authorization header
 * @param {string} authHeader - Authorization header
 * @returns {string|null} Token or null
 */
export const extractToken = (authHeader) => {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  return authHeader.split(" ")[1];
};

/**
 * Check if user has required role
 * @param {Object} user - User object with role
 * @param {...string} roles - Required roles
 * @returns {boolean} Has required role
 */
export const hasRole = (user, ...roles) => {
  if (!user || !user.role) {
    return false;
  }

  return roles.includes(user.role);
};

/**
 * Check if user is admin
 * @param {Object} user - User object
 * @returns {boolean} Is admin
 */
export const isAdmin = (user) => hasRole(user, "admin");

/**
 * Check if user is moderator
 * @param {Object} user - User object
 * @returns {boolean} Is moderator
 */
export const isModerator = (user) => hasRole(user, "admin", "moderator");

/**
 * Check if user owns resource
 * @param {string} userId - User ID
 * @param {string|Object} resourceOwnerId - Resource owner ID
 * @returns {boolean} Owns resource
 */
export const isOwner = (userId, resourceOwnerId) => {
  return userId?.toString() === resourceOwnerId?.toString();
};

/**
 * Check permission with context
 * @param {Object} context - Permission context
 * @returns {boolean} Has permission
 *
 * Example:
 * const can = checkPermission({
 *   user: req.user,
 *   action: 'edit',
 *   resource: 'post',
 *   resourceOwnerId: post.authorId,
 *   allowRoles: ['admin']
 * });
 */
export const checkPermission = (context = {}) => {
  const { user, action, resourceOwnerId, allowRoles = [], requireAuth = true } = context;

  // Check authentication requirement
  if (requireAuth && !user) {
    return false;
  }

  // Admin always has permission
  if (user && isAdmin(user)) {
    return true;
  }

  // Check role permission
  if (allowRoles.length > 0) {
    if (!user || !hasRole(user, ...allowRoles)) {
      return false;
    }
  }

  // Check ownership
  if (resourceOwnerId && user) {
    if (!isOwner(user.userId, resourceOwnerId)) {
      return false;
    }
  }

  return true;
};

export default {
  AuthError,
  createAccessToken,
  createRefreshToken,
  verifyToken,
  extractToken,
  hasRole,
  isAdmin,
  isModerator,
  isOwner,
  checkPermission,
};
