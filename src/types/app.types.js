/**
 * Types / JSDoc Definitions
 * Define data structures for better code documentation
 * (TypeScript-like types using JSDoc comments)
 */

/**
 * @typedef {Object} User
 * @property {string} _id - User ID (MongoDB ObjectId)
 * @property {string} email - User email
 * @property {string} password - Hashed password
 * @property {string} name - User name
 * @property {string} [avatar] - User avatar URL
 * @property {string} role - User role (admin, user, etc)
 * @property {boolean} isActive - Is user active
 * @property {Date} createdAt - Created date
 * @property {Date} updatedAt - Updated date
 */

/**
 * @typedef {Object} Post
 * @property {string} _id - Post ID
 * @property {string} title - Post title
 * @property {string} content - Post content
 * @property {string} slug - URL slug
 * @property {string} authorId - Author user ID
 * @property {string} status - Post status (draft, published, etc)
 * @property {string[]} tags - Post tags
 * @property {number} views - View count
 * @property {Date} publishedAt - Published date
 * @property {Date} createdAt - Created date
 * @property {Date} updatedAt - Updated date
 */

/**
 * @typedef {Object} CreateUserPayload
 * @property {string} email - User email
 * @property {string} password - User password
 * @property {string} name - User name
 * @property {string} [avatar] - User avatar URL
 */

/**
 * @typedef {Object} UpdateUserPayload
 * @property {string} [email] - User email
 * @property {string} [password] - User password
 * @property {string} [name] - User name
 * @property {string} [avatar] - User avatar URL
 * @property {boolean} [isActive] - Is user active
 */

/**
 * @typedef {Object} ApiResponse
 * @property {boolean} success - Response success status
 * @property {*} data - Response data
 * @property {string} [message] - Response message
 * @property {Object} [pagination] - Pagination info
 * @property {number} pagination.total - Total items
 * @property {number} pagination.page - Current page
 * @property {number} pagination.limit - Limit per page
 * @property {number} pagination.pages - Total pages
 */

/**
 * @typedef {Object} ValidationError
 * @property {string} field - Field name with error
 * @property {string} message - Error message
 */

/**
 * @typedef {Object} ApiError
 * @property {boolean} success - Always false
 * @property {string} message - Error message
 * @property {ValidationError[]} [errors] - Validation errors
 */

export {};
