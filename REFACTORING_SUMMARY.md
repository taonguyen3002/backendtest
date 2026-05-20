# ✅ MVC Refactoring - Phase 1 Complete

## 📊 Completion Status

### ✅ COMPLETED MODULES

#### **1. User Module** (Auth + User Management)

- ✅ `models/User.js` - User schema with backward compatibility exports
- ✅ `repositories/user.repository.js` - CRUD + user-specific queries
- ✅ `services/user.service.js` - User profile, balance, verification operations
- ✅ `services/auth.service.js` - JWT, registration, login, token refresh
- ✅ `controllers/user.controller.js` - User profile, settings (12 endpoints)
- ✅ `controllers/auth.controller.js` - Auth endpoints (9 endpoints)
- ✅ Supporting models: `models/Token.js`, `models/Auth.js`
- ✅ Supporting repos: `repositories/token.repository.js`, `repositories/auth.repository.js`

**Total Files Created: 10**

#### **2. Post Module** (Articles/Content)

- ✅ `models/Post.js` - Post schema with backward compatibility
- ✅ `repositories/post.repository.js` - Search, filter, slug management
- ✅ `services/post.service.js` - CRUD, search, filtering, slug generation
- ✅ `controllers/post.controller.js` - Post endpoints (10 endpoints)

**Total Files Created: 4**

---

### ⏳ PENDING MODULES

#### **3. Order Module** (TODO - High Priority)

- [ ] Migrate `app/models/order.models.js` → `models/Order.js`
- [ ] Create `repositories/order.repository.js`
- [ ] Create `services/order.service.js`
- [ ] Create `controllers/order.controller.js`

#### **4. Comment Module** (TODO - Medium Priority)

- [ ] Migrate `app/models/comment.model.js` → `models/Comment.js`
- [ ] Create `repositories/comment.repository.js`
- [ ] Create `services/comment.service.js`
- [ ] Create `controllers/comment.controller.js`

#### **5. Image Module** (TODO - Medium Priority)

- [ ] Migrate `app/models/image.models.js` → `models/Image.js`
- [ ] Create `repositories/image.repository.js`
- [ ] Create `services/image.service.js`
- [ ] Create `controllers/image.controller.js`

#### **6. Traffic Module** (TODO - Low Priority)

- [ ] Migrate `app/models/traffic.models.js` → `models/Traffic.js`
- [ ] Create repositories, services, controllers

#### **7. Other Modules** (TODO - Low Priority)

- [ ] Transaction, Setting, ToastMessage, etc.

---

## 🔧 How to Continue Refactoring

### **Step 1: Migrate Order Module** (Next Priority)

This is the most complex module. Follow this pattern:

**1A. Create Order Model**

```javascript
// src/models/Order.js
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
    status: { type: String, enum: ["pending", "confirmed", "cancelled", "completed"] },
    // ... other fields from app/models/order.models.js
  },
  { timestamps: true },
);

export function getOrderModel(connection) {
  if (!connection.models.Order) {
    connection.model("Order", orderSchema);
  }
  return connection.model("Order");
}

export function getOrderModelWithConnection(connection) {
  if (!connection.models.Order) {
    connection.model("Order", orderSchema);
  }
  return connection.model("Order");
}

export default orderSchema;
```

**1B. Create Order Repository**

```javascript
// src/repositories/order.repository.js
import BaseRepository from "./base.repository.js";
import { getOrderModelWithConnection } from "../models/Order.js";

class OrderRepository extends BaseRepository {
  constructor(db) {
    const Order = getOrderModelWithConnection(db);
    super(Order);
    this.Order = Order;
  }

  // Add custom methods:
  // - findByUserId(userId)
  // - findByStatus(status)
  // - findByPostId(postId)
  // - updateStatus(orderId, status)
  // - findByDateRange(startDate, endDate)
}

export default OrderRepository;
```

**1C. Create Order Service**

```javascript
// src/services/order.service.js
import OrderRepository from "../repositories/order.repository.js";
import logger from "../helpers/logger.js";

class OrderService {
  constructor(db, config) {
    this.orderRepo = new OrderRepository(db);
    this.config = config;
  }

  // Add methods:
  // - createOrder(orderData)
  // - getOrderById(orderId)
  // - updateOrderStatus(orderId, newStatus)
  // - cancelOrder(orderId) - with Discord notification
  // - completeOrder(orderId)
  // - getUserOrders(userId)
  // - getOrderStats(dateRange)
}

export default OrderService;
```

**1D. Create Order Controller**

```javascript
// src/controllers/order.controller.js
import OrderService from "../services/order.service.js";
import logger from "../helpers/logger.js";

class OrderController {
  constructor(db, config) {
    this.orderService = new OrderService(db, config);
  }

  // Add endpoints:
  // - POST /api/v1/orders (create)
  // - GET /api/v1/orders (list)
  // - GET /api/v1/orders/:id (get)
  // - PUT /api/v1/orders/:id (update)
  // - DELETE /api/v1/orders/:id (cancel)
}

export default OrderController;
```

### **Step 2: Repeat for Comment, Image, Traffic, etc.**

Use the same pattern:

1. Migrate Model → `models/{Name}.js`
2. Create Repository → `repositories/{name}.repository.js`
3. Create Service → `services/{name}.service.js`
4. Create Controller → `controllers/{name}.controller.js`

### **Step 3: Create Routes** (After all controllers done)

```javascript
// src/routes/v1/index.js
import express from "express";
import createAuthRoutes from "./auth.route.js";
import createUserRoutes from "./user.route.js";
import createPostRoutes from "./post.route.js";
import createOrderRoutes from "./order.route.js";
// ... more routes

export default function setupV1Routes(app) {
  // Auth routes
  app.use("/api/v1/auth", (req, res, next) => {
    const router = createAuthRoutes(req, res, next);
    router(req, res, next);
  });

  // User routes
  app.use("/api/v1/users", (req, res, next) => {
    const router = createUserRoutes(req, res, next);
    router(req, res, next);
  });

  // Post routes
  app.use("/api/v1/posts", (req, res, next) => {
    const router = createPostRoutes(req, res, next);
    router(req, res, next);
  });

  // Order routes
  app.use("/api/v1/orders", (req, res, next) => {
    const router = createOrderRoutes(req, res, next);
    router(req, res, next);
  });

  // ... more routes
}
```

---

## 📝 Validators

All modules need validators. Create these:

```javascript
// src/validators/auth.validator.js
export default class AuthValidator {
  static validateRequestOtp(data) {
    const errors = [];
    if (!data.email || !this.isValidEmail(data.email)) {
      errors.push("Valid email is required");
    }
    return { valid: errors.length === 0, errors };
  }

  static validateRegister(data) {
    const errors = [];
    if (!data.username || data.username.trim().length < 3) {
      errors.push("Username must be at least 3 characters");
    }
    if (!data.email || !this.isValidEmail(data.email)) {
      errors.push("Valid email is required");
    }
    if (!data.password || data.password.length < 6) {
      errors.push("Password must be at least 6 characters");
    }
    if (!data.otp) {
      errors.push("OTP is required");
    }
    return { valid: errors.length === 0, errors };
  }

  static isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}
```

---

## 🎯 Key Patterns to Follow

### **Model Pattern** (with backward compatibility)

```javascript
export function getLegacyExportName(connection) {
  if (!connection.models.ModelName) {
    connection.model("ModelName", schema);
  }
  return connection.model("ModelName");
}

export function getNewExportName(connection) {
  if (!connection.models.ModelName) {
    connection.model("ModelName", schema);
  }
  return connection.model("ModelName");
}
```

### **Repository Pattern** (extends BaseRepository)

```javascript
class NameRepository extends BaseRepository {
  constructor(db) {
    const Model = getModelWithConnection(db);
    super(Model);
    this.Model = Model;
  }

  // Custom methods specific to this entity
  async customMethod(param) { ... }
}
```

### **Service Pattern** (contains business logic)

```javascript
class NameService {
  constructor(db, config) {
    this.repo = new NameRepository(db);
    this.config = config; // For domain-specific config
  }

  // Business logic methods
  async publicMethod(data) {
    try {
      // Validate input
      // Call repository
      // Additional processing
      // Log results
      return result;
    } catch (error) {
      logger.error("ServiceName: Method failed", error);
      throw error;
    }
  }
}
```

### **Controller Pattern** (HTTP handlers)

```javascript
class NameController {
  constructor(db, config) {
    this.service = new NameService(db, config);
  }

  async httpMethod(req, res, next) {
    try {
      // Validate input
      // Call service
      // Return formatted response
      res.status(code).json({ success, data });
    } catch (error) {
      next(error);
    }
  }
}
```

---

## 📊 Refactoring Progress Tracker

```
COMPLETED (14 files):
├─ User Module (10 files)
│  ├─ models/User.js
│  ├─ models/Token.js
│  ├─ models/Auth.js
│  ├─ repositories/user.repository.js
│  ├─ repositories/token.repository.js
│  ├─ repositories/auth.repository.js
│  ├─ services/user.service.js
│  ├─ services/auth.service.js
│  ├─ controllers/user.controller.js
│  └─ controllers/auth.controller.js
│
└─ Post Module (4 files)
   ├─ models/Post.js
   ├─ repositories/post.repository.js
   ├─ services/post.service.js
   └─ controllers/post.controller.js

PENDING (Approx 40+ files):
├─ Order Module (4 files)
├─ Comment Module (4 files)
├─ Image Module (4 files)
├─ Traffic Module (4 files)
├─ Other Modules (12+ files)
├─ Validators (10+ files)
├─ Routes (10+ files)
└─ Integration & Testing (5+ files)

TOTAL: ~54+ files
Completion: 26% (14/54)
```

---

## 🚀 Next Immediate Actions

1. **Create Order Module** (most complex, highest priority)
2. **Create Comment Module** (used by Post)
3. **Create Image Module** (file handling)
4. **Create remaining models**
5. **Create all validators**
6. **Create all routes**
7. **Integration testing**
8. **Gradual traffic migration**

---

## 📞 Reference Files

- **Base Repository**: `src/repositories/base.repository.js`
- **User Service Example**: `src/services/user.service.js`
- **Auth Service Example**: `src/services/auth.service.js`
- **Post Service Example**: `src/services/post.service.js`
- **User Controller Example**: `src/controllers/user.controller.js`
- **Post Controller Example**: `src/controllers/post.controller.js`

Use these as templates for remaining modules.

---

**Last Updated**: 2026-03-08
**Phase Complete**: Phase 1 - Foundation (User + Post)
**Next Phase**: Phase 2 - Core Business (Order + Comment + Image)
