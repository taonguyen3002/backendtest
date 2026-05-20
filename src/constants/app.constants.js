/**
 * Constants - App-wide constants
 * Tập trung các giá trị không đổi
 */

const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

const ERROR_MESSAGES = {
  // Auth
  INVALID_CREDENTIALS: "Invalid email or password",
  TOKEN_EXPIRED: "Token has expired",
  TOKEN_INVALID: "Invalid token",
  UNAUTHORIZED: "Unauthorized access",
  FORBIDDEN: "Forbidden",

  // User
  USER_NOT_FOUND: "User not found",
  USER_EXISTS: "User already exists",
  EMAIL_EXISTS: "Email already in use",

  // Post
  POST_NOT_FOUND: "Post not found",
  POST_DELETED: "Post has been deleted",

  // Server
  SERVER_ERROR: "An unexpected error occurred",
  DATABASE_ERROR: "Database connection error",
  EXTERNAL_API_ERROR: "External API error",

  // Validation
  VALIDATION_ERROR: "Validation error",
  INVALID_INPUT: "Invalid input data",
  REQUIRED_FIELD: "Required field is missing",

  // CORS
  CORS_ERROR: "Not allowed by CORS",
  DOMAIN_UNKNOWN: "Domain unknown",
};

const USER_ROLES = {
  ADMIN: "admin",
  USER: "user",
  MODERATOR: "moderator",
  EDITOR: "editor",
};

const POST_STATUS = {
  DRAFT: "draft",
  PUBLISHED: "published",
  SCHEDULED: "scheduled",
  ARCHIVED: "archived",
};

const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};

const ENVIRONMENT = {
  DEVELOPMENT: "development",
  PRODUCTION: "production",
  TESTING: "testing",
};

export { HTTP_STATUS, ERROR_MESSAGES, USER_ROLES, POST_STATUS, PAGINATION, ENVIRONMENT };
