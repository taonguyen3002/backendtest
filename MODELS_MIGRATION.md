# 🔄 Models Migration - Multi-Domain Handling

## 📌 Current Model Pattern (Multi-Domain)

### **Old Structure**

```javascript
// app/models/user.models.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  // ...
});

// ✅ Multi-domain pattern:
export function getUserModel(connection) {
  return connection.model("User", userSchema);
}
```

**Why this pattern?**

- Each domain has separate MongoDB connection
- Each connection needs separate model instances
- Single model can't work across different connections

---

## ✅ Recommended Approach: Hybrid Pattern

### **Step 1: Create BASE model file** (compatible with old & new)

**File: `models/User.js`** (NEW)

```javascript
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "user",
      enum: ["user", "admin", "moderator"],
    },
    bio: { type: String, default: "" },
    avatar: { type: String, default: "" },
    phone: { type: String, default: "" },
    fullname: { type: String, default: "" },
    isVerified: { type: Boolean, default: false },
    balance: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  },
);

// Pre-save hooks
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

// ✅ OLD PATTERN - For backward compatibility
export function getUserModel(connection) {
  return connection.model("User", userSchema);
}

// ✅ NEW PATTERN - Direct export
export default userSchema;

// ✅ NEW PATTERN - Get model with connection
export function getUserModelWithConnection(connection) {
  // Ensure model is registered on this connection
  if (!connection.models.User) {
    connection.model("User", userSchema);
  }
  return connection.model("User");
}
```

**Key Points:**

- Schema definition: `userSchema`
- Old export: `getUserModel(connection)` ✅ **Still works**
- New export: default export (can use with different connection)

---

### **Step 2: Use in Repository** (Adapter Pattern)

**File: `repositories/user.repository.js`** (NEW)

```javascript
import BaseRepository from "./base.repository.js";
import { getUserModelWithConnection } from "../models/User.js";

class UserRepository extends BaseRepository {
  constructor(db) {
    // Get model bound to this database connection
    const User = getUserModelWithConnection(db);
    super(User);
    this.User = User;
  }

  // ✅ Custom repository methods
  async findByEmail(email) {
    return await this.User.findOne({ email });
  }

  async findByUsername(username) {
    return await this.User.findOne({ username });
  }

  async findActiveUsers(filters = {}) {
    return await this.User.find({ ...filters, isActive: true });
  }
}

export default UserRepository;
```

---

### **Step 3: Use Repository in Service**

**File: `services/user.service.js`** (NEW)

```javascript
import UserRepository from "../repositories/user.repository.js";
import logger from "../helpers/logger.js";

class UserService {
  constructor(db) {
    // Repository initialized with database connection
    this.userRepo = new UserRepository(db);
  }

  async getUserById(userId) {
    try {
      const user = await this.userRepo.findById(userId);
      if (!user) throw new Error("User not found");
      return user;
    } catch (error) {
      logger.error("Get user failed", error);
      throw error;
    }
  }

  async createUser(userData) {
    try {
      // Check existing
      const existing = await this.userRepo.findByEmail(userData.email);
      if (existing) throw new Error("Email already exists");

      // Create
      const user = await this.userRepo.create(userData);
      logger.info("User created", { userId: user._id });

      return user;
    } catch (error) {
      logger.error("Create user failed", error);
      throw error;
    }
  }
}

export default UserService;
```

---

### **Step 4: Use Service in Controller**

**File: `controllers/user.controller.js`** (NEW)

```javascript
import UserService from "../services/user.service.js";
import UserValidator from "../validators/user.validator.js";
import logger from "../helpers/logger.js";

class UserController {
  constructor(db) {
    // Service initialized with database connection
    this.userService = new UserService(db);
  }

  async getUserById(req, res, next) {
    try {
      const { id } = req.params;
      logger.info("Getting user", { userId: id });

      const user = await this.userService.getUserById(id);

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async createUser(req, res, next) {
    try {
      // Validate
      const validation = UserValidator.validateCreateUser(req.body);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          errors: validation.errors,
        });
      }

      const user = await this.userService.createUser(req.body);

      res.status(201).json({
        success: true,
        message: "User created",
        data: user,
      });
    } catch (error) {
      if (error.message === "Email already exists") {
        return res.status(409).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  }
}

export default UserController;
```

---

### **Step 5: Use Controller in Routes**

**File: `routes/v1/user.route.js`** (NEW)

```javascript
import express from "express";
import UserController from "../../controllers/user.controller.js";

export default function createUserRoutes(req, res, next) {
  const router = express.Router();

  // ✅ Access req.db from middleware (set by domainMiddleware)
  const userController = new UserController(req.db);

  // Bind 'this' context
  const getUserById = userController.getUserById.bind(userController);
  const createUser = userController.createUser.bind(userController);

  router.get("/:id", getUserById);
  router.post("/", createUser);

  return router;
}
```

---

### **Step 6: Setup Routes in Index**

**File: `routes/v1/index.js`** (UPDATE)

```javascript
import express from "express";
import createUserRoutes from "./user.route.js";
import createPostRoutes from "./post.route.js";
// import more routes...

export default function setupV1Routes(app) {
  // ✅ Create routes inside middleware to access req.db
  app.use("/api/v1/users", (req, res, next) => {
    const router = createUserRoutes(req, res, next);
    router(req, res, next);
  });

  app.use("/api/v1/posts", (req, res, next) => {
    const router = createPostRoutes(req, res, next);
    router(req, res, next);
  });

  // More routes...
}
```

---

## 🔄 Complete Model Files to Migrate

### **File Mapping**

| Old Location                        | New Location             | Change                       |
| ----------------------------------- | ------------------------ | ---------------------------- |
| `app/models/user.models.js`         | `models/User.js`         | Rename, keep export function |
| `app/models/post.models.js`         | `models/Post.js`         | Rename, keep export function |
| `app/models/order.models.js`        | `models/Order.js`        | Rename, keep export function |
| `app/models/comment.model.js`       | `models/Comment.js`      | Rename                       |
| `app/models/image.models.js`        | `models/Image.js`        | Rename                       |
| `app/models/token.models.js`        | `models/Token.js`        | Rename                       |
| `app/models/auth.models.js`         | `models/Auth.js`         | Rename                       |
| `app/models/traffic.models.js`      | `models/Traffic.js`      | Rename                       |
| `app/models/transaction.model.js`   | `models/Transaction.js`  | Rename                       |
| `app/models/setting.models.js`      | `models/Setting.js`      | Rename                       |
| `app/models/toastMessage.models.js` | `models/ToastMessage.js` | Rename                       |

---

## 🛠️ Template: Model Refactoring

### **Pattern for each model**

```javascript
// models/Post.js

import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    description: String,
    // ... other fields
  },
  { timestamps: true },
);

// Hooks
postSchema.pre("save", function (next) {
  // Pre-processing
  next();
});

postSchema.post("save", function () {
  // Post-processing
});

// Methods
postSchema.methods.toJSON = function () {
  // Custom serialization
  return this.toObject();
};

postSchema.statics.findBySlug = function (slug) {
  return this.findOne({ slug });
};

// ✅ OLD PATTERN - Backward compatibility
export function getPostModel(connection) {
  if (!connection.models.Post) {
    connection.model("Post", postSchema);
  }
  return connection.model("Post");
}

// ✅ NEW PATTERN - Helper
export function getPostModelWithConnection(connection) {
  return connection.model("Post", postSchema);
}

// ✅ Schema export
export default postSchema;
```

---

## 📊 Usage Flow

```
┌─ HTTP Request
│
├─ routes/index.js
│  (Setup routes with req.db bound)
│
├─ controllers/user.controller.js
│  (Receive req with db connection)
│  const userController = new UserController(req.db)
│
├─ services/user.service.js
│  (Pass db to service)
│  const userService = new UserService(db)
│
├─ repositories/user.repository.js
│  (Get model with connection)
│  const User = getUserModelWithConnection(db)
│
├─ models/User.js
│  (Schema definition)
│  export function getUserModelWithConnection(connection) { ... }
│
└─ MongoDB
   (Physical database connection)
```

---

## 🔄 Step-by-Step Refactoring Process

### **For Each Model (User, Post, Order, etc.)**

#### **1. Copy Old Model**

```bash
# From: app/models/user.models.js
# To:   models/User.js
```

#### **2. Clean Up & Standardize**

```javascript
// Remove: - Naming inconsistencies
//         - Unused fields
//         - Old comments

// Add:    - JSDoc comments
//         - Type definitions
//         - Better organization
```

#### **3. Add Export Functions**

```javascript
// Keep old export
export function getUserModel(connection) { ... }

// Add new export
export function getUserModelWithConnection(connection) { ... }
export default userSchema
```

#### **4. Create Repository**

```javascript
// repositories/user.repository.js
class UserRepository extends BaseRepository {
  constructor(db) {
    const User = getUserModelWithConnection(db);
    super(User);
  }
}
```

#### **5. Create Service**

```javascript
// services/user.service.js
class UserService {
  constructor(db) {
    this.userRepo = new UserRepository(db);
  }
}
```

#### **6. Create Controller**

```javascript
// controllers/user.controller.js
class UserController {
  constructor(db) {
    this.userService = new UserService(db);
  }
}
```

#### **7. Create Routes**

```javascript
// routes/v1/user.route.js
export default function createUserRoutes() {
  const router = express.Router();
  // ...
  return router;
}
```

#### **8. Test & Verify**

```javascript
// Compare old vs new:
// - Same response format
// - Same business logic
// - Error handling
// - Edge cases
```

---

## ⚠️ Key Considerations

### **Multi-Domain Requirements**

```javascript
// ✅ Each request gets req.db from domainMiddleware
// ✅ Each layer passes db down
// ✅ Model gets db-specific connection

userController = new UserController(req.db)  // Pass connection
  → userService = new UserService(req.db)
    → userRepo = new UserRepository(req.db)
      → User = getUserModelWithConnection(req.db)
        → MongoDB with per-domain connection
```

### **Model Registration**

```javascript
// ✅ Mongoose model registration is per-connection
// ✅ MongoDB allows same model name on different connections
connection1.model("User", schema); // Connection 1
connection2.model("User", schema); // Connection 2 (separate)

// This works because Mongoose scopes models per connection
```

### **Backward Compatibility**

```javascript
// ✅ Keep old export function for gradual migration
// ✅ Old controllers can call getUserModel(req.db) still
// ✅ New controllers use new pattern

// Parallel operation:
// Old routes: /api/users → old controller → getUserModel(req.db)
// New routes: /api/v1/users → new controller → UserRepository(req.db)
```

---

## 🎯 Summary

### **Data Flow (New Architecture)**

```
HTTP Request
  ↓
domainMiddleware: Attach req.db (per-domain MongoDB connection)
  ↓
Route Handler: Create controller with req.db
  ↓
Controller: Parse input, create service with req.db
  ↓
Service: Business logic, create repository with req.db
  ↓
Repository: Get model bound to req.db, execute queries
  ↓
Model: Mongoose schema operations on per-domain DB connection
  ↓
MongoDB: Database operation (per domain)
```

### **Models Stay the Same**

- Schema definition: **Same**
- Old export pattern: **Keep for compatibility**
- New export pattern: **For new architecture**
- Multi-domain support: **Enhanced, not changed**

---

Generated: 2026-03-08
