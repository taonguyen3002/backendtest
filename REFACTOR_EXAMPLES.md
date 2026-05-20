# 🔄 MVC Refactoring Step-by-Step Examples

## 📌 Ví dụ 1: User Module (Complete)

### **Từ:**

```
app/
  ├── controllers/user.controller.js
  ├── models/user.models.js
routes/user.route.js
```

### **Sang:**

```
controllers/user.controller.js
services/user.service.js
repositories/user.repository.js
validators/user.validator.js
models/User.js
routes/v1/user.route.js
types/user.types.js
```

---

### **1. Models** (Mongoose Schema)

**File: `models/User.js`** (từ `app/models/user.models.js`)

```javascript
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false, // Không select by default
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    avatar: String,
    role: {
      type: String,
      enum: ["user", "admin", "moderator"],
      default: "user",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: Date,
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

// Pre-save hook: Hash password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method: Compare password
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Static: Get by email
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email });
};

export default mongoose.model("User", userSchema);
```

---

### **2. Validators**

**File: `validators/user.validator.js`** (NEW)

```javascript
class UserValidator {
  static validateCreateUser(data) {
    const errors = [];

    if (!data.email || data.email.trim() === "") {
      errors.push({ field: "email", message: "Email is required" });
    } else if (!this.isValidEmail(data.email)) {
      errors.push({ field: "email", message: "Invalid email format" });
    }

    if (!data.password || data.password.trim() === "") {
      errors.push({ field: "password", message: "Password is required" });
    } else if (data.password.length < 6) {
      errors.push({ field: "password", message: "Min 6 characters" });
    }

    if (!data.name || data.name.trim() === "") {
      errors.push({ field: "name", message: "Name is required" });
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  static validateUpdateUser(data) {
    const errors = [];

    if (data.email && !this.isValidEmail(data.email)) {
      errors.push({ field: "email", message: "Invalid email format" });
    }

    if (data.password && data.password.length < 6) {
      errors.push({ field: "password", message: "Min 6 characters" });
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  static isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }
}

export default UserValidator;
```

---

### **3. Repositories**

**File: `repositories/user.repository.js`** (NEW)

```javascript
import BaseRepository from "./base.repository.js";
import logger from "../helpers/logger.js";

class UserRepository extends BaseRepository {
  constructor(User) {
    super(User);
    this.User = User;
  }

  // ✅ Find by email
  async findByEmail(email) {
    return await this.User.findOne({ email });
  }

  // ✅ Find by ID with select fields
  async findById(id, selectFields = "") {
    return await this.User.findById(id).select(selectFields);
  }

  // ✅ Find with pagination
  async findAndCount(filters = {}, skip = 0, limit = 10) {
    const [items, total] = await Promise.all([
      this.User.find(filters).skip(skip).limit(limit),
      this.User.countDocuments(filters),
    ]);
    return { items, total };
  }

  // ✅ Create user
  async create(userData) {
    const user = new this.User(userData);
    return await user.save();
  }

  // ✅ Update user
  async findByIdAndUpdate(id, updateData) {
    return await this.User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  }

  // ✅ Delete user
  async delete(id) {
    return await this.User.findByIdAndDelete(id);
  }

  // ✅ Update last login
  async updateLastLogin(id) {
    return await this.User.findByIdAndUpdate(
      id,
      { lastLogin: new Date() },
      {
        new: true,
      },
    );
  }

  // ✅ Find active users
  async findActive(filters = {}) {
    return await this.User.find({ ...filters, isActive: true });
  }

  // ✅ Count users by role
  async countByRole(role) {
    return await this.User.countDocuments({ role });
  }
}

export default UserRepository;
```

---

### **4. Services**

**File: `services/user.service.js`** (NEW)

```javascript
import UserRepository from "../repositories/user.repository.js";
import logger from "../helpers/logger.js";
import { sendWelcomeEmail } from "../utils/sendOtpEmail.js";

class UserService {
  constructor(User) {
    this.userRepo = new UserRepository(User);
  }

  // ✅ Get user by ID
  async getUserById(userId) {
    try {
      logger.info("UserService: Getting user", { userId });

      const user = await this.userRepo.findById(userId, "-password");
      if (!user) {
        throw new Error("User not found");
      }

      return this.formatUser(user);
    } catch (error) {
      logger.error("UserService: Get user failed", error, { userId });
      throw error;
    }
  }

  // ✅ Get all users
  async getUsers(page = 1, limit = 10, filters = {}) {
    try {
      logger.info("UserService: Getting users", { page, limit });

      const skip = (page - 1) * limit;
      const { items, total } = await this.userRepo.findAndCount(filters, skip, limit);

      return {
        users: items.map((user) => this.formatUser(user)),
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error("UserService: Get users failed", error);
      throw error;
    }
  }

  // ✅ Create user
  async createUser(userData) {
    try {
      logger.info("UserService: Creating user", { email: userData.email });

      // Check existing
      const existing = await this.userRepo.findByEmail(userData.email);
      if (existing) {
        throw new Error("Email already exists");
      }

      // Create
      const user = await this.userRepo.create(userData);

      // Send welcome email (async, don't wait)
      sendWelcomeEmail(user.email, user.name).catch((err) => {
        logger.warn("Failed to send welcome email", { email: user.email });
      });

      logger.info("UserService: User created", { userId: user._id });

      return this.formatUser(user);
    } catch (error) {
      logger.error("UserService: Create user failed", error);
      throw error;
    }
  }

  // ✅ Update user
  async updateUser(userId, updateData) {
    try {
      logger.info("UserService: Updating user", { userId });

      // Don't allow password change via this method
      delete updateData.password;

      const user = await this.userRepo.findByIdAndUpdate(userId, updateData);
      if (!user) {
        throw new Error("User not found");
      }

      logger.info("UserService: User updated", { userId });

      return this.formatUser(user);
    } catch (error) {
      logger.error("UserService: Update user failed", error, { userId });
      throw error;
    }
  }

  // ✅ Delete user
  async deleteUser(userId) {
    try {
      logger.info("UserService: Deleting user", { userId });

      await this.userRepo.delete(userId);

      logger.info("UserService: User deleted", { userId });
      return { message: "User deleted successfully" };
    } catch (error) {
      logger.error("UserService: Delete user failed", error, { userId });
      throw error;
    }
  }

  // ✅ Format user response
  formatUser(user) {
    const userObj = user.toObject ? user.toObject() : user;
    delete userObj.password;
    return userObj;
  }
}

export default UserService;
```

---

### **5. Controllers**

**File: `controllers/user.controller.js`** (refactored from `app/controllers/user.controller.js`)

```javascript
import UserService from "../services/user.service.js";
import UserValidator from "../validators/user.validator.js";
import logger from "../helpers/logger.js";
import User from "../models/User.js";

class UserController {
  constructor() {
    this.userService = new UserService(User);
  }

  // ✅ Get user by ID
  async getUserById(req, res, next) {
    try {
      const { id } = req.params;
      logger.info("UserController: Get user by ID", { userId: id });

      const user = await this.userService.getUserById(id);

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      if (error.message === "User not found") {
        return res.status(404).json({ success: false, message: error.message });
      }
      next(error);
    }
  }

  // ✅ Get all users
  async getUsers(req, res, next) {
    try {
      const { page = 1, limit = 10, role } = req.query;

      logger.info("UserController: Get users", { page, limit, role });

      const filters = role ? { role } : {};
      const result = await this.userService.getUsers(parseInt(page), parseInt(limit), filters);

      res.status(200).json({
        success: true,
        data: result.users,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  // ✅ Create user
  async createUser(req, res, next) {
    try {
      logger.info("UserController: Create user", { email: req.body.email });

      // Validate
      const validation = UserValidator.validateCreateUser(req.body);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: validation.errors,
        });
      }

      const user = await this.userService.createUser(req.body);

      res.status(201).json({
        success: true,
        message: "User created successfully",
        data: user,
      });
    } catch (error) {
      if (error.message === "Email already exists") {
        return res.status(409).json({ success: false, message: error.message });
      }
      next(error);
    }
  }

  // ✅ Update user
  async updateUser(req, res, next) {
    try {
      const { id } = req.params;

      logger.info("UserController: Update user", { userId: id });

      // Validate
      const validation = UserValidator.validateUpdateUser(req.body);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: validation.errors,
        });
      }

      const user = await this.userService.updateUser(id, req.body);

      res.status(200).json({
        success: true,
        message: "User updated successfully",
        data: user,
      });
    } catch (error) {
      if (error.message === "User not found") {
        return res.status(404).json({ success: false, message: error.message });
      }
      next(error);
    }
  }

  // ✅ Delete user
  async deleteUser(req, res, next) {
    try {
      const { id } = req.params;

      logger.info("UserController: Delete user", { userId: id });

      await this.userService.deleteUser(id);

      res.status(200).json({
        success: true,
        message: "User deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}

export default UserController;
```

---

### **6. Routes**

**File: `routes/v1/user.route.js`** (NEW)

```javascript
import express from "express";
import UserController from "../../controllers/user.controller.js";
import auth from "../../middleware/auth.middleware.js";

const router = express.Router();
const userController = new UserController();

// Bind methods to maintain 'this' context
const getUserById = userController.getUserById.bind(userController);
const getUsers = userController.getUsers.bind(userController);
const createUser = userController.createUser.bind(userController);
const updateUser = userController.updateUser.bind(userController);
const deleteUser = userController.deleteUser.bind(userController);

// Public routes
router.post("/", createUser);
router.get("/", getUsers);

// Protected routes
router.get("/:id", auth, getUserById);
router.put("/:id", auth, updateUser);
router.delete("/:id", auth, deleteUser);

export default router;
```

---

### **7. Routes Index**

**File: `routes/v1/index.js`** (NEW)

```javascript
import express from "express";
import userRoutes from "./user.route.js";
import authRoutes from "./auth.route.js";
import postRoutes from "./post.route.js";
// import more routes...

const router = express.Router();

router.use("/users", userRoutes);
router.use("/auth", authRoutes);
router.use("/posts", postRoutes);
// use more routes...

export default router;
```

---

### **8. Main Routes Index**

**File: `routes/index.js`** (update)

```javascript
import v1Routes from "./v1/index.js";

function setupRoutes(app) {
  app.use("/api/v1", v1Routes);

  // Legacy support (optional, gradually deprecate)
  // app.use("/api", legacyRoutes);
}

export default setupRoutes;
```

---

### **9. Types (JSDoc)**

**File: `types/user.types.js`** (NEW)

```javascript
/**
 * @typedef {Object} User
 * @property {string} _id - User ID
 * @property {string} email - User email
 * @property {string} name - User name
 * @property {string} [avatar] - Avatar URL
 * @property {string} role - Role (user, admin, moderator)
 * @property {boolean} isActive - Active status
 * @property {Date} createdAt - Created date
 * @property {Date} updatedAt - Updated date
 */

/**
 * @typedef {Object} CreateUserPayload
 * @property {string} email - Email
 * @property {string} password - Password
 * @property {string} name - Name
 * @property {string} [avatar] - Avatar URL
 */

export {};
```

---

## 📌 Ví dụ 2: Post Module (Brief)

### **Structure:**

```
models/Post.js
repositories/post.repository.js
services/post.service.js
validators/post.validator.js
controllers/post.controller.js
routes/v1/post.route.js
```

### **Key Files:**

**`services/post.service.js`**

```javascript
class PostService {
  async createPost(userId, postData) {
    // Check author
    // Generate slug
    // Extract tags
    // Call OpenAI for SEO
    // Save to database
  }

  async updatePost(postId, updateData) {
    // Check ownership
    // Generate new slug if title changed
    // Update draft/published status
  }

  async getPublishedPosts(page, limit) {
    // Get published posts
    // Include author details
    // Count views
  }
}
```

---

## 📌 Ví dụ 3: Order Module (Brief)

### **Structure:**

```
models/Order.js
repositories/order.repository.js
services/order.service.js
validators/order.validator.js
controllers/order.controller.js
routes/v1/order.route.js
types/order.types.js
```

### **Key Features:**

```javascript
async createOrder(userId, orderData) {
  // Validate input
  // Calculate fees
  // Create order record
  // Send confirmation email
  // Log to Discord
}

async updateOrderStatus(orderId, newStatus) {
  // Check valid transitions
  // Update DB
  // Notify driver
  // Notify customer
}

async cancelOrder(orderId, reason) {
  // Check if cancellable
  // Refund (if needed)
  // Update status
  // Send notification
}
```

---

## 🚀 Migration Strategy

### **Phase 1: Setup** (1-2 weeks)

- Create new folder structure
- Create template files
- Create base classes
- Setup routing v1

### **Phase 2: Refactor** (2-3 weeks)

- Refactor controllers
- Create repositories
- Create services
- Create validators

### **Phase 3: Testing** (1 week)

- Unit tests
- Integration tests
- E2E tests

### **Phase 4: Cutover** (1 week)

- Run both in parallel
- Gradual traffic migration
- Deprecate old code

### **Phase 5: Cleanup** (1 week)

- Remove old structure
- Cleanup code
- Update documentation

---

Generated: 2026-03-08
