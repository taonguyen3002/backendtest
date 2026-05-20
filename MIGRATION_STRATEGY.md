# 🔄 Migration Strategy - Old vs New Architecture

## 📊 Current State Analysis

### **Old Structure** (`app/`)

```
app/
├── controllers/
│   ├── user.controller.js       (Auth + User management mixed)
│   ├── post.controller.js       (Post CRUD + filtering)
│   ├── order.controller.js      (Booking logic)
│   ├── comment.controller.js
│   ├── image.controller.js
│   ├── traffic.controller.js
│   └── ...
│
└── models/
    ├── user.models.js           (export getUserModel(connection))
    ├── post.models.js
    ├── order.models.js
    └── ...
```

### **Issues with Old Structure**

```javascript
// ❌ Problem 1: Business logic mixed with HTTP handling
createOrder = async (req, res) => {
  const dataSend = { ...dataBooking, DISCORD_WEBHOOK_URL };
  await sendToDiscord(dataSend); // ← Business logic here
  // HTTP handling here
  res.status(201).json({ message: "success", booking });
};

// ❌ Problem 2: No separation of concerns
// Controller does: validation, DB access, business logic, response

// ❌ Problem 3: Difficult to test
// Can't test business logic without HTTP mocking

// ❌ Problem 4: Code duplication
// Email validation, error handling repeated in multiple controllers

// ❌ Problem 5: No logging/monitoring
// Errors not tracked, hard to debug in production
```

---

## ✅ New Architecture

### **New Structure** (`src/`)

```
src/
├── controllers/          (HTTP handling only)
├── services/            (Business logic)
├── repositories/        (Database access)
├── validators/          (Input validation)
├── models/              (Mongoose schemas)
├── middleware/          (Cross-cutting concerns)
└── helpers/             (Utilities)
```

---

## 🚀 Migration Strategy

### **Phase 1: Parallel Run (Week 1-2)**

Keep old code running, build new code alongside

```
Users: old/controllers/user.controller.js
            ↓ (routes/user.route.js)
            → endpoints return data

New:   controllers/user.controller.js
       services/user.service.js        (under development)
       repositories/user.repository.js
```

### **Phase 2: Gradual Replacement (Week 3-4)**

Start routing new requests to new architecture

```
Routes:
  POST /api/users → NEW UserController
  GET  /api/users → OLD (until tested)

Gradually switch endpoints one by one
```

### **Phase 3: Testing & Validation (Week 5-6)**

Run parallel tests, compare results

```
Old Endpoint: POST /api/users → OLD controller
New Endpoint: POST /api/v1/users → NEW controller

Compare responses, performance, edge cases
```

### **Phase 4: Cutover (Week 7)**

Switch all traffic to new architecture

```
All routes → /api/v1/* (new architecture)
Keep old /api/* for fallback (optional)
```

### **Phase 5: Cleanup (Week 8)**

Remove old code

```
Delete app/controllers/
Delete old routes
Archive old code
Update documentation
```

---

## 🎯 Per-Module Refactoring

### **Module: User (Priority 1)**

#### **From:**

```javascript
// app/controllers/user.controller.js
const authUser = {
  registerUser: async (req, res) => {
    const User = getUserModel(req.db);
    const { username, email, password, otp } = req.body;

    // ❌ Validation logic
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json(...);

    // ❌ Business logic
    const hashed = await bcrypt.hash(password, 10);

    // ❌ Database access
    const newUser = new User({ username, email, password: hashed });
    const savedUser = await newUser.save();

    // ❌ Response
    return res.status(201).json(savedUser);
  }
}
```

#### **To:**

```
# Controllers (HTTP only)
controllers/user.controller.js
│
├─ Services (Business logic)
│  ├─ services/user.service.js
│  └─ services/auth.service.js
│
├─ Repositories (DB access)
│  └─ repositories/user.repository.js
│
├─ Validators (Input validation)
│  └─ validators/user.validator.js
│
└─ Models (Mongoose)
   └─ models/User.js
```

**Step 1: Move Model to new location**

```
From: app/models/user.models.js
      export function getUserModel(connection) { ... }

To:   models/User.js
      export default mongoose.model("User", userSchema);
```

**Step 2: Create Repository**

```javascript
// repositories/user.repository.js
class UserRepository extends BaseRepository {
  constructor(db) {
    super();
    this.User = getModelWithConnection(db, "User");
  }

  async findByEmail(email) {
    return await this.User.findOne({ email });
  }

  async create(userData) {
    const user = new this.User(userData);
    return await user.save();
  }
}
```

**Step 3: Create Service**

```javascript
// services/user.service.js
class UserService {
  constructor(userRepo) {
    this.userRepo = userRepo;
  }

  async register(userData) {
    // Validation
    const validation = UserValidator.validate(userData);

    // Check existing
    const existing = await this.userRepo.findByEmail(userData.email);
    if (existing) throw new Error("Email exists");

    // Hash password
    const hashed = await bcrypt.hash(userData.password, 10);

    // Create
    return await this.userRepo.create({
      ...userData,
      password: hashed,
    });
  }
}
```

**Step 4: Create Validator**

```javascript
// validators/user.validator.js
class UserValidator {
  static validate(data) {
    const errors = [];

    if (!data.email) errors.push("Email required");
    if (!data.password) errors.push("Password required");
    // ... more validation

    return { valid: errors.length === 0, errors };
  }
}
```

**Step 5: Create New Controller**

```javascript
// controllers/user.controller.js
class UserController {
  constructor(db) {
    const userRepo = new UserRepository(db);
    this.userService = new UserService(userRepo);
  }

  async register(req, res, next) {
    try {
      const user = await this.userService.register(req.body);
      res.status(201).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }
}
```

**Step 6: Create New Route**

```javascript
// routes/v1/user.route.js
const router = express.Router();
const userController = new UserController(db);

router.post("/register", userController.register.bind(userController));
```

---

### **Module: Post (Priority 2)**

#### **Key Refactoring Points**

```javascript
// ❌ OLD - Slug generation + validation + DB access + response
createPosts = async (req, res) => {
  const Post = getPostModel(req.db);
  let uniqueSlug = slug;
  while (await Post.findOne({ slug: uniqueSlug })) {
    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }
  // ...
};

// ✅ NEW - Separated by layer
// Controller: Parse input
// Validator: Check required fields
// Service: Generate unique slug, prepare data
// Repository: Save to DB
// Response: Format JSON
```

**New Structure:**

```javascript
// services/post.service.js
async createPost(postData) {
  // Validation
  const validation = PostValidator.validateCreate(postData);

  // Generate unique slug
  let uniqueSlug = await this.generateUniqueSlug(postData.slug);

  // Prepare post
  const post = {
    ...postData,
    slug: uniqueSlug
  };

  // Call repository
  const savedPost = await this.postRepo.create(post);

  // Trigger revalidation (async)
  this.triggerRevalidate(savedPost.slug).catch(err =>
    logger.warn("Revalidation failed", { slug: savedPost.slug })
  );

  return savedPost;
}

private async generateUniqueSlug(baseSlug) {
  let counter = 1;
  let uniqueSlug = baseSlug;

  while (await this.postRepo.findBySlug(uniqueSlug)) {
    uniqueSlug = `${baseSlug}-${counter}`;
    counter++;
  }

  return uniqueSlug;
}
```

---

### **Module: Order/Booking (Priority 3)**

#### **Key Refactoring Points**

```javascript
// ❌ OLD - Complex logic scattered
createOrder = async (req, res) => {
  const { userId, visitorId } = req.body;

  // Mix of Discord notification, validation, DB access
  await sendToDiscord(dataSend);

  if (!userId && visitorId) {
    existingBooking = await Booking.findOne({ visitorId });
    if (existingBooking) {
      existingBooking.userId = userId;
      await existingBooking.save();
    }
  }
}

// ✅ NEW - Clear workflow
async createOrder(orderData) {
  // 1. Validate
  const validation = OrderValidator.validate(orderData);

  // 2. Process (handle userId/visitorId logic)
  const processed = await this.processOrder(orderData);

  // 3. Save to DB
  const order = await this.orderRepo.create(processed);

  // 4. Notify (Discord)
  await this.notifyDiscord(order);

  // 5. Return
  return order;
}
```

**New Structure:**

```javascript
// services/order.service.js
class OrderService {
  async createOrder(orderData) {
    // Validation
    const validation = OrderValidator.validate(orderData);
    if (!validation.valid) throw new Error("Invalid order data");

    // Process order (logic for userId/visitorId)
    const processedOrder = this.processOrderData(orderData);

    // Save
    const savedOrder = await this.orderRepo.create(processedOrder);

    // Notify (fire and forget)
    this.notifyOrderChannels(savedOrder).catch(err =>
      logger.warn("Notification failed", { orderId: savedOrder._id })
    );

    logger.info("Order created", { orderId: savedOrder._id });

    return savedOrder;
  }

  private processOrderData(data) {
    const { userId, visitorId, ...orderData } = data;

    // Logic: determine order owner
    if (userId) {
      return { ...orderData, userId };
    } else if (visitorId) {
      return { ...orderData, visitorId };
    } else {
      throw new Error("User ID or Visitor ID required");
    }
  }

  private async notifyOrderChannels(order) {
    // Discord notification
    await DiscordHelper.sendOrderNotification(order);

    // Email notification
    await EmailHelper.sendOrderConfirmation(order);
  }
}
```

---

## 🔗 Multi-Domain Compatibility

### **Old Model Access Pattern**

```javascript
const User = getUserModel(req.db); // Connection passed dynamically
```

### **New Pattern**

```javascript
// Option 1: Pass connection in repository constructor
class UserRepository extends BaseRepository {
  constructor(db) {
    const User = require("../models/User")(db);
    super(User);
  }
}

// Option 2: Use middleware to setup models
app.use((req, res, next) => {
  req.models = {
    User: getModel("User", req.db),
    Post: getModel("Post", req.db),
    Order: getModel("Order", req.db),
  };
  next();
});

// Then in controller:
const userRepo = new UserRepository(req.models.User);
```

---

## ✅ Benefits of Migration

| Aspect              | Old                        | New                       |
| ------------------- | -------------------------- | ------------------------- |
| **Testability**     | Hard (HTTP mocking needed) | Easy (mock services)      |
| **Reusability**     | Low (tightly coupled)      | High (services shared)    |
| **Maintainability** | Low (mixed concerns)       | High (clear separation)   |
| **Scalability**     | Low (code duplication)     | High (patterns)           |
| **Debugging**       | Hard (no logging)          | Easy (comprehensive logs) |
| **Error Handling**  | Inconsistent               | Standardized              |

---

## 📋 Migration Checklist

### **User Module**

- [ ] Move model to `models/User.js`
- [ ] Create `repositories/user.repository.js`
- [ ] Create `services/user.service.js`
- [ ] Create `validators/user.validator.js`
- [ ] Create `controllers/user.controller.js`
- [ ] Create `routes/v1/user.route.js`
- [ ] Test all endpoints
- [ ] Keep old code as fallback
- [ ] Document migration

### **Auth Module**

- [ ] Extract from user controller
- [ ] Create `controllers/auth/login.controller.js`
- [ ] Create `controllers/auth/register.controller.js`
- [ ] Create `services/auth.service.js`
- [ ] Create `routes/v1/auth.route.js`
- [ ] Test authentication flow

### **Post Module**

- [ ] Move & refactor model
- [ ] Create repository
- [ ] Create service (slug gen, filtering, etc.)
- [ ] Create controller
- [ ] Create validators
- [ ] Create routes

### **Order Module**

- [ ] Analyze complex logic
- [ ] Create repository
- [ ] Create service (order workflow)
- [ ] Break into smaller services if needed
- [ ] Create controller
- [ ] Create validators
- [ ] Create routes

### **Other Modules**

- [ ] Comment, Image, Traffic, Dashboard, etc.

---

## 🎯 Key Recommendations

### **1. Keep Old Models** (adapt them)

```javascript
// Old export pattern - KEPT
export function getUserModel(connection) {
  return connection.model("User", userSchema);
}

// New pattern - ALSO AVAILABLE
const userSchema = new Schema({ ... });
export default mongoose.model("User", userSchema);
```

### **2. Controllers → Move to Root**

```
OLD: app/controllers/user.controller.js
NEW: controllers/user.controller.js

Routes updated to use new location:
routes/v1/user.route.js → import UserController from "../../controllers/user.controller"
```

### **3. Models → Rename & Reorganize**

```
OLD: app/models/user.models.js              (PascalCase export)
NEW: models/User.js                          (Singular, PascalCase)

OLD: app/models/post.models.js
NEW: models/Post.js
```

### **4. Add New Layers**

```
NEW: services/    (business logic from old controllers)
NEW: repositories/(data access from old controllers)
NEW: validators/  (validation logic, centralized)
```

### **5. Gradual Migration**

```
Don't delete old code until new code is proven
Keep both running in parallel for verification
```

---

## 🚀 Start Here

**To begin migration:**

1. **Copy & Refactor Models** (easiest)
   - Move from `app/models/` to `models/`
   - Keep same export pattern initially

2. **Create Repository Layer** (medium)
   - Wrap model access
   - Keep multi-domain support

3. **Extract Business Logic** (hardest)
   - Move from old controllers to new services
   - Test thoroughly

4. **Create New Controllers** (medium)
   - Simplify to HTTP only
   - Call services

5. **Create New Routes** (easy)
   - Use `/api/v1/*` pattern
   - Route to new controllers

6. **Test & Verify** (critical)
   - Compare old vs new responses
   - Check edge cases

7. **Switch & Monitor** (careful)
   - Gradually move traffic
   - Keep fallbacks

8. **Cleanup** (final)
   - Remove old code
   - Document changes

---

Generated: 2026-03-08
