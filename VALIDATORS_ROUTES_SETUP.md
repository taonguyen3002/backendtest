# 🛣️ Validators & Routes Setup Guide

## Bước Tiếp Theo: Tạo Validators và Routes

Sau Phase 2, cần tạo validators và routes để hoàn chỉnh API integration.

---

## 📋 Part 1: Validators

### Tạo các files validators

```
src/validators/
├── auth.validator.js
├── user.validator.js
├── post.validator.js
├── order.validator.js
├── comment.validator.js
└── image.validator.js
```

### Template Pattern (auth.validator.js)

```javascript
export default class AuthValidator {
  static validateRequestOtp(data) {
    const errors = [];
    if (!data.email) errors.push("Email is required");
    if (!this.isValidEmail(data.email)) errors.push("Invalid email format");

    return { valid: errors.length === 0, errors };
  }

  static validateRegister(data) {
    const errors = [];
    if (!data.email) errors.push("Email required");
    if (!data.password) errors.push("Password required");
    if (!data.username) errors.push("Username required");
    if (!data.otp) errors.push("OTP required");

    if (data.password && data.password.length < 8) {
      errors.push("Password must be at least 8 characters");
    }

    return { valid: errors.length === 0, errors };
  }

  static isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }
}
```

### Validators needed for each module

**auth.validator.js:**

- validateRequestOtp(data)
- validateRegister(data)
- validateLogin(data)
- validateRefreshToken(data)
- validateResetPassword(data)

**user.validator.js:**

- validateUpdateProfile(data)
- validateUpdateBalance(data)
- validateChangeRole(data)

**post.validator.js:**

- validateCreatePost(data)
- validateUpdatePost(data)
- validateChangeSlug(data)

**order.validator.js:**

- validateCreateOrder(data)
- validateUpdateStatus(data)
- validateCancelOrder(data)
- validateRateOrder(data)

**comment.validator.js:**

- validateCreateComment(data)
- validateUpdateComment(data)

**image.validator.js:**

- validateCreateImage(data)
- validateUpdateVisibility(data)

---

## 📋 Part 2: Routes

### Create routes folder structure

```
src/routes/v1/
├── index.js (main router)
├── auth.route.js
├── user.route.js
├── post.route.js
├── order.route.js
├── comment.route.js
└── image.route.js
```

### Main Router (src/routes/v1/index.js)

```javascript
import express from "express";
import authRoute from "./auth.route.js";
import userRoute from "./user.route.js";
import postRoute from "./post.route.js";
import orderRoute from "./order.route.js";
import commentRoute from "./comment.route.js";
import imageRoute from "./image.route.js";

const router = express.Router();

// Mount all v1 routes
router.use("/auth", authRoute);
router.use("/users", userRoute);
router.use("/posts", postRoute);
router.use("/orders", orderRoute);
router.use("/comments", commentRoute);
router.use("/images", imageRoute);

export default router;
```

### Auth Routes (src/routes/v1/auth.route.js)

```javascript
import express from "express";
import AuthController from "../../controllers/auth.controller.js";
import AuthValidator from "../../validators/auth.validator.js";

const router = express.Router();

const authController = new AuthController(req.db); // middleware passes db

// Public endpoints
router.post("/request-otp", (req, res) => {
  const errors = AuthValidator.validateRequestOtp(req.body).errors;
  if (errors.length) return res.status(400).json({ success: false, errors });
  authController.requestOtp(req, res);
});

router.post("/register", (req, res) => {
  const errors = AuthValidator.validateRegister(req.body).errors;
  if (errors.length) return res.status(400).json({ success: false, errors });
  authController.register(req, res);
});

router.post("/login", (req, res) => {
  const errors = AuthValidator.validateLogin(req.body).errors;
  if (errors.length) return res.status(400).json({ success: false, errors });
  authController.login(req, res);
});

router.post("/refresh-token", authController.refreshToken);
router.post("/logout", authController.logout);
router.get("/verify", authController.verifyToken);
router.get("/me", authController.getCurrentUser);

export default router;
```

### User Routes (src/routes/v1/user.route.js)

```javascript
import express from "express";
import UserController from "../../controllers/user.controller.js";
import UserValidator from "../../validators/user.validator.js";

const router = express.Router();

const userController = new UserController(req.db);

// List endpoints - no validation needed
router.get("/", userController.getAllUsers);
router.get("/filter/active", userController.getActiveUsers);
router.get("/role/:role", userController.getUsersByRole);

// Get single user
router.get("/:id", userController.getUserProfile);
router.get("/:id/profile", userController.getPublicProfile);

// Update endpoints with validation
router.put("/:id", (req, res) => {
  const errors = UserValidator.validateUpdateProfile(req.body).errors;
  if (errors.length) return res.status(400).json({ success: false, errors });
  userController.updateProfile(req, res);
});

router.put("/:id/balance", (req, res) => {
  const errors = UserValidator.validateUpdateBalance(req.body).errors;
  if (errors.length) return res.status(400).json({ success: false, errors });
  userController.updateBalance(req, res);
});

router.put("/:id/role", (req, res) => {
  const errors = UserValidator.validateChangeRole(req.body).errors;
  if (errors.length) return res.status(400).json({ success: false, errors });
  userController.changeRole(req, res);
});

// Action endpoints
router.post("/:id/verify", userController.verifyUser);
router.post("/:id/activate", userController.activateUser);
router.post("/:id/deactivate", userController.deactivateUser);
router.delete("/:id", userController.deleteUser);

export default router;
```

### Post Routes (src/routes/v1/post.route.js)

```javascript
import express from "express";
import PostController from "../../controllers/post.controller.js";
import PostValidator from "../../validators/post.validator.js";

const router = express.Router();

const postController = new PostController(req.db);

// List endpoints
router.get("/", postController.getAllPosts);
router.get("/recent", postController.getRecentPosts);
router.get("/author/:authorName", postController.getPostsByAuthor);

// Search endpoints
router.get("/search", postController.searchPosts);
router.post("/filter", postController.filterPosts);

// Get single post
router.get("/:id", postController.getPostById);
router.get("/slug/:slug", postController.getPostBySlug);

// Create with validation
router.post("/", (req, res) => {
  const errors = PostValidator.validateCreatePost(req.body).errors;
  if (errors.length) return res.status(400).json({ success: false, errors });
  postController.createPost(req, res);
});

// Update with validation
router.put("/:id", (req, res) => {
  const errors = PostValidator.validateUpdatePost(req.body).errors;
  if (errors.length) return res.status(400).json({ success: false, errors });
  postController.updatePost(req, res);
});

// Slug management
router.put("/:id/slug", (req, res) => {
  const errors = PostValidator.validateChangeSlug(req.body).errors;
  if (errors.length) return res.status(400).json({ success: false, errors });
  postController.changeSlug(req, res);
});

// Publish/actions
router.post("/:id/publish", postController.publishPost);
router.delete("/:id", postController.deletePost);

export default router;
```

### Order Routes (src/routes/v1/order.route.js)

```javascript
import express from "express";
import OrderController from "../../controllers/order.controller.js";
import OrderValidator from "../../validators/order.validator.js";

const router = express.Router();

const orderController = new OrderController(req.db);

// List endpoints
router.get("/", orderController.getAllOrders);
router.get("/pending", orderController.getPendingOrders);
router.get("/stats", orderController.getOrderStatistics);

// Get by ID
router.get("/:id", orderController.getOrderById);

// Get history
router.get("/history", orderController.getOrderHistory);

// Create with validation
router.post("/", (req, res) => {
  const errors = OrderValidator.validateCreateOrder(req.body).errors;
  if (errors.length) return res.status(400).json({ success: false, errors });
  orderController.createOrder(req, res);
});

// Update status
router.put("/:id/status", (req, res) => {
  const errors = OrderValidator.validateUpdateStatus(req.body).errors;
  if (errors.length) return res.status(400).json({ success: false, errors });
  orderController.updateOrderStatus(req, res);
});

// Cancel
router.post("/:id/cancel", (req, res) => {
  const errors = OrderValidator.validateCancelOrder(req.body).errors;
  if (errors.length) return res.status(400).json({ success: false, errors });
  orderController.cancelOrder(req, res);
});

// Rate
router.post("/:id/rate", (req, res) => {
  const errors = OrderValidator.validateRateOrder(req.body).errors;
  if (errors.length) return res.status(400).json({ success: false, errors });
  orderController.rateOrder(req, res);
});

// Delete
router.delete("/:id", orderController.deleteOrder);

export default router;
```

### Comment Routes (src/routes/v1/comment.route.js)

```javascript
import express from "express";
import CommentController from "../../controllers/comment.controller.js";
import CommentValidator from "../../validators/comment.validator.js";

const router = express.Router();

const commentController = new CommentController(req.db);

// Get comments
router.get("/post/:postId", commentController.getPostComments);
router.get("/:id/thread", commentController.getCommentThread);
router.get("/stats", commentController.getCommentStatistics);

// Get pending (admin)
router.get("/pending", commentController.getPendingComments);

// Create with validation
router.post("/", (req, res) => {
  const errors = CommentValidator.validateCreateComment(req.body).errors;
  if (errors.length) return res.status(400).json({ success: false, errors });
  commentController.createComment(req, res);
});

// Update with validation
router.put("/:id", (req, res) => {
  const errors = CommentValidator.validateUpdateComment(req.body).errors;
  if (errors.length) return res.status(400).json({ success: false, errors });
  commentController.updateComment(req, res);
});

// Actions
router.post("/:id/like", commentController.likeComment);
router.post("/:id/approve", commentController.approveComment);
router.delete("/:id/reject", commentController.rejectComment);
router.delete("/:id", commentController.deleteComment);

export default router;
```

### Image Routes (src/routes/v1/image.route.js)

```javascript
import express from "express";
import ImageController from "../../controllers/image.controller.js";
import ImageValidator from "../../validators/image.validator.js";

const router = express.Router();

const imageController = new ImageController(req.db);

// List endpoints
router.get("/public", imageController.getPublicImages);
router.get("/stats", imageController.getImageStatistics);
router.get("/user/:uploaderId", imageController.getUserImages);
router.get("/storage/:uploaderId", imageController.getUserStorageInfo);

// Get single
router.get("/:id", imageController.getImageById);
router.get("/public/:publicId", imageController.getImageByPublicId);

// Create with validation
router.post("/", (req, res) => {
  const errors = ImageValidator.validateCreateImage(req.body).errors;
  if (errors.length) return res.status(400).json({ success: false, errors });
  imageController.createImage(req, res);
});

// Update with validation
router.put("/:id", (req, res) => {
  const errors = ImageValidator.validateUpdateImage(req.body).errors;
  if (errors.length) return res.status(400).json({ success: false, errors });
  imageController.updateImage(req, res);
});

// Visibility
router.put("/:id/visibility", (req, res) => {
  const errors = ImageValidator.validateUpdateVisibility(req.body).errors;
  if (errors.length) return res.status(400).json({ success: false, errors });
  imageController.changeVisibility(req, res);
});

// Actions
router.post("/search", imageController.searchImages);
router.post("/bulk-delete", imageController.bulkDeleteImages);
router.delete("/:id", imageController.deleteImage);

export default router;
```

---

## 🔗 Integration into Main API

### Update src/index.js

```javascript
import apiV1Routes from "./routes/v1/index.js";

// ... existing code ...

// Mount API v1 routes
app.use("/api/v1", configPerDomain, apiV1Routes);

// Keep old routes for backward compatibility
app.use("/api", oldRoutes); // Can be removed after migration
```

---

## ✅ Checklist

- [ ] Create all 6 validator files
- [ ] Create all 7 route files (including v1/index.js)
- [ ] Test each endpoint with Postman/curl
- [ ] Verify multi-domain routing works
- [ ] Run alongside old API
- [ ] Monitor error rates
- [ ] Gradual traffic migration

---

**Status:** Ready for Phase 3 (Validators & Routes)  
**Estimated Time:** 2-3 hours for complete implementation
