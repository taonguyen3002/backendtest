/**
 * V1 API Router
 * Main router for all v1 endpoints
 */
import express from "express";
import AuthController from "../../controllers/auth.controller.js";
import UserController from "../../controllers/user.controller.js";
import PostController from "../../controllers/post.controller.js";
import OrderController from "../../controllers/order.controller.js";
import CommentController from "../../controllers/comment.controller.js";
import ImageController from "../../controllers/image.controller.js";

const router = express.Router();

/**
 * Middleware to inject database connection
 * This middleware should be added in the main app before using these routes
 */
const injectControllers = (req, res, next) => {
  req.db = req.db || req.app.locals.connection; // Use db passed via middleware
  next();
};

router.use(injectControllers);

/**
 * Auth Routes
 * POST /api/v1/auth/request-otp
 * POST /api/v1/auth/register
 * POST /api/v1/auth/login
 * POST /api/v1/auth/refresh-token
 * POST /api/v1/auth/logout
 * GET /api/v1/auth/verify
 * GET /api/v1/auth/me
 * POST /api/v1/auth/request-password-reset
 * POST /api/v1/auth/reset-password
 */
const createAuthRoutes = () => {
  const authRouter = express.Router();

  authRouter.post("/request-otp", (req, res) => {
    const controller = new AuthController(req.db);
    controller.requestOtp(req, res);
  });

  authRouter.post("/register", (req, res) => {
    const controller = new AuthController(req.db);
    controller.register(req, res);
  });

  authRouter.post("/login", (req, res) => {
    const controller = new AuthController(req.db);
    controller.login(req, res);
  });

  authRouter.post("/refresh-token", (req, res) => {
    const controller = new AuthController(req.db);
    controller.refreshToken(req, res);
  });

  authRouter.post("/logout", (req, res) => {
    const controller = new AuthController(req.db);
    controller.logout(req, res);
  });

  authRouter.get("/verify", (req, res) => {
    const controller = new AuthController(req.db);
    controller.verifyToken(req, res);
  });

  authRouter.get("/me", (req, res) => {
    const controller = new AuthController(req.db);
    controller.getCurrentUser(req, res);
  });

  authRouter.post("/request-password-reset", (req, res) => {
    const controller = new AuthController(req.db);
    controller.requestPasswordReset(req, res);
  });

  authRouter.post("/reset-password", (req, res) => {
    const controller = new AuthController(req.db);
    controller.resetPassword(req, res);
  });

  return authRouter;
};

/**
 * User Routes
 * GET /api/v1/users
 * GET /api/v1/users/:id
 * GET /api/v1/users/:id/profile
 * PUT /api/v1/users/:id
 * PUT /api/v1/users/:id/balance
 * PUT /api/v1/users/:id/role
 * POST /api/v1/users/:id/verify
 * POST /api/v1/users/:id/activate
 * POST /api/v1/users/:id/deactivate
 * DELETE /api/v1/users/:id
 */
const createUserRoutes = () => {
  const userRouter = express.Router();

  userRouter.get("/", (req, res) => {
    const controller = new UserController(req.db);
    controller.getAllUsers(req, res);
  });

  userRouter.get("/filter/active", (req, res) => {
    const controller = new UserController(req.db);
    controller.getActiveUsers(req, res);
  });

  userRouter.get("/role/:role", (req, res) => {
    const controller = new UserController(req.db);
    controller.getUsersByRole(req, res);
  });

  userRouter.get("/:id", (req, res) => {
    const controller = new UserController(req.db);
    controller.getUserProfile(req, res);
  });

  userRouter.get("/:id/profile", (req, res) => {
    const controller = new UserController(req.db);
    controller.getPublicProfile(req, res);
  });

  userRouter.put("/:id", (req, res) => {
    const controller = new UserController(req.db);
    controller.updateProfile(req, res);
  });

  userRouter.put("/:id/balance", (req, res) => {
    const controller = new UserController(req.db);
    controller.updateBalance(req, res);
  });

  userRouter.put("/:id/role", (req, res) => {
    const controller = new UserController(req.db);
    controller.changeRole(req, res);
  });

  userRouter.post("/:id/verify", (req, res) => {
    const controller = new UserController(req.db);
    controller.verifyUser(req, res);
  });

  userRouter.post("/:id/activate", (req, res) => {
    const controller = new UserController(req.db);
    controller.activateUser(req, res);
  });

  userRouter.post("/:id/deactivate", (req, res) => {
    const controller = new UserController(req.db);
    controller.deactivateUser(req, res);
  });

  userRouter.delete("/:id", (req, res) => {
    const controller = new UserController(req.db);
    controller.deleteUser(req, res);
  });

  return userRouter;
};

/**
 * Post Routes
 */
const createPostRoutes = () => {
  const postRouter = express.Router();

  postRouter.get("/", (req, res) => {
    const controller = new PostController(req.db);
    controller.getAllPosts(req, res);
  });

  postRouter.get("/recent", (req, res) => {
    const controller = new PostController(req.db);
    controller.getRecentPosts(req, res);
  });

  postRouter.get("/search", (req, res) => {
    const controller = new PostController(req.db);
    controller.searchPosts(req, res);
  });

  postRouter.post("/filter", (req, res) => {
    const controller = new PostController(req.db);
    controller.filterPosts(req, res);
  });

  postRouter.get("/author/:authorName", (req, res) => {
    const controller = new PostController(req.db);
    controller.getPostsByAuthor(req, res);
  });

  postRouter.post("/", (req, res) => {
    const controller = new PostController(req.db);
    controller.createPost(req, res);
  });

  postRouter.get("/:id", (req, res) => {
    const controller = new PostController(req.db);
    controller.getPostById(req, res);
  });

  postRouter.get("/slug/:slug", (req, res) => {
    const controller = new PostController(req.db);
    controller.getPostBySlug(req, res);
  });

  postRouter.put("/:id", (req, res) => {
    const controller = new PostController(req.db);
    controller.updatePost(req, res);
  });

  postRouter.put("/:id/slug", (req, res) => {
    const controller = new PostController(req.db);
    controller.changeSlug(req, res);
  });

  postRouter.post("/:id/publish", (req, res) => {
    const controller = new PostController(req.db);
    controller.publishPost(req, res);
  });

  postRouter.delete("/:id", (req, res) => {
    const controller = new PostController(req.db);
    controller.deletePost(req, res);
  });

  return postRouter;
};

/**
 * Order Routes
 */
const createOrderRoutes = () => {
  const orderRouter = express.Router();

  orderRouter.get("/", (req, res) => {
    const controller = new OrderController(req.db);
    controller.getAllOrders(req, res);
  });

  orderRouter.get("/pending", (req, res) => {
    const controller = new OrderController(req.db);
    controller.getPendingOrders(req, res);
  });

  orderRouter.get("/stats", (req, res) => {
    const controller = new OrderController(req.db);
    controller.getOrderStatistics(req, res);
  });

  orderRouter.post("/", (req, res) => {
    const controller = new OrderController(req.db);
    controller.createOrder(req, res);
  });

  orderRouter.get("/history", (req, res) => {
    const controller = new OrderController(req.db);
    controller.getOrderHistory(req, res);
  });

  orderRouter.get("/:id", (req, res) => {
    const controller = new OrderController(req.db);
    controller.getOrderById(req, res);
  });

  orderRouter.put("/:id/status", (req, res) => {
    const controller = new OrderController(req.db);
    controller.updateOrderStatus(req, res);
  });

  orderRouter.post("/:id/cancel", (req, res) => {
    const controller = new OrderController(req.db);
    controller.cancelOrder(req, res);
  });

  orderRouter.post("/:id/rate", (req, res) => {
    const controller = new OrderController(req.db);
    controller.rateOrder(req, res);
  });

  orderRouter.delete("/:id", (req, res) => {
    const controller = new OrderController(req.db);
    controller.deleteOrder(req, res);
  });

  return orderRouter;
};

/**
 * Comment Routes
 */
const createCommentRoutes = () => {
  const commentRouter = express.Router();

  commentRouter.get("/post/:postId", (req, res) => {
    const controller = new CommentController(req.db);
    controller.getPostComments(req, res);
  });

  commentRouter.get("/:id/thread", (req, res) => {
    const controller = new CommentController(req.db);
    controller.getCommentThread(req, res);
  });

  commentRouter.get("/pending", (req, res) => {
    const controller = new CommentController(req.db);
    controller.getPendingComments(req, res);
  });

  commentRouter.get("/stats", (req, res) => {
    const controller = new CommentController(req.db);
    controller.getCommentStatistics(req, res);
  });

  commentRouter.post("/", (req, res) => {
    const controller = new CommentController(req.db);
    controller.createComment(req, res);
  });

  commentRouter.put("/:id", (req, res) => {
    const controller = new CommentController(req.db);
    controller.updateComment(req, res);
  });

  commentRouter.post("/:id/like", (req, res) => {
    const controller = new CommentController(req.db);
    controller.likeComment(req, res);
  });

  commentRouter.post("/:id/approve", (req, res) => {
    const controller = new CommentController(req.db);
    controller.approveComment(req, res);
  });

  commentRouter.delete("/:id/reject", (req, res) => {
    const controller = new CommentController(req.db);
    controller.rejectComment(req, res);
  });

  commentRouter.delete("/:id", (req, res) => {
    const controller = new CommentController(req.db);
    controller.deleteComment(req, res);
  });

  return commentRouter;
};

/**
 * Image Routes
 */
const createImageRoutes = () => {
  const imageRouter = express.Router();

  imageRouter.get("/public", (req, res) => {
    const controller = new ImageController(req.db);
    controller.getPublicImages(req, res);
  });

  imageRouter.get("/stats", (req, res) => {
    const controller = new ImageController(req.db);
    controller.getImageStatistics(req, res);
  });

  imageRouter.get("/user/:uploaderId", (req, res) => {
    const controller = new ImageController(req.db);
    controller.getUserImages(req, res);
  });

  imageRouter.get("/storage/:uploaderId", (req, res) => {
    const controller = new ImageController(req.db);
    controller.getUserStorageInfo(req, res);
  });

  imageRouter.post("/", (req, res) => {
    const controller = new ImageController(req.db);
    controller.createImage(req, res);
  });

  imageRouter.post("/search", (req, res) => {
    const controller = new ImageController(req.db);
    controller.searchImages(req, res);
  });

  imageRouter.post("/bulk-delete", (req, res) => {
    const controller = new ImageController(req.db);
    controller.bulkDeleteImages(req, res);
  });

  imageRouter.get("/:id", (req, res) => {
    const controller = new ImageController(req.db);
    controller.getImageById(req, res);
  });

  imageRouter.get("/public/:publicId", (req, res) => {
    const controller = new ImageController(req.db);
    controller.getImageByPublicId(req, res);
  });

  imageRouter.put("/:id", (req, res) => {
    const controller = new ImageController(req.db);
    controller.updateImage(req, res);
  });

  imageRouter.put("/:id/visibility", (req, res) => {
    const controller = new ImageController(req.db);
    controller.changeVisibility(req, res);
  });

  imageRouter.delete("/:id", (req, res) => {
    const controller = new ImageController(req.db);
    controller.deleteImage(req, res);
  });

  return imageRouter;
};

// Mount all v1 routes
router.use("/auth", createAuthRoutes());
router.use("/users", createUserRoutes());
router.use("/posts", createPostRoutes());
router.use("/orders", createOrderRoutes());
router.use("/comments", createCommentRoutes());
router.use("/images", createImageRoutes());

export default router;
