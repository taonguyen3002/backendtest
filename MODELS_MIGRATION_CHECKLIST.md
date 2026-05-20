# ✅ Complete Models Migration Checklist

## 🎯 Phase 1: Preparation & Analysis

### **Step 1: Review Current Models**

- [ ] Read `app/models/user.models.js` - Check schema, hooks, methods
- [ ] Read `app/models/post.models.js` - Check uniqueness, validation
- [ ] Read `app/models/order.models.js` - Check embedded docs, relationships
- [ ] Read `app/models/comment.model.js` - Check references
- [ ] Read other 6 models - Document patterns and dependencies

**Checklist:**

```javascript
// For each model, verify:
- [ ] Schema fields documented
- [ ] All hooks working (pre/post)
- [ ] All custom methods defined
- [ ] All static methods defined
- [ ] Indexes configured
- [ ] Timestamps enabled
- [ ] Unique fields marked
- [ ] Required fields enforced
- [ ] Default values set
- [ ] Export function exists
```

### **Step 2: Dependency Analysis**

- [ ] Which models reference other models?
  - Post references User (author)
  - Order references User + Post
  - Comment references Post + User
  - etc.
- [ ] Which helpers use models?
  - openAi helpers
  - traffic helpers
  - etc.
- [ ] Which controllers depend on models?
  - All controllers in `app/controllers/`

**Create dependency map:**

```
Models:
├─ User (no dependencies) - MIGRATE FIRST
├─ Post (depends on User) - MIGRATE SECOND
├─ Order (depends on User, Post) - MIGRATE THIRD
├─ Comment (depends on User, Post) - MIGRATE with Post
├─ Token (depends on User) - MIGRATE with User
├─ Traffic - MIGRATE FOURTH
└─ etc.

Controllers:
├─ user.controller.js → depends on User
├─ post.controller.js → depends on Post
├─ order.controller.js → depends on Order, User, Post
└─ etc.
```

---

## 🚀 Phase 2: Copy & Standardize Models (Sequential)

### **Step 3: Copy User Model** (Foundation - Must be first)

- [ ] Create `models/User.js`
- [ ] Copy content from `app/models/user.models.js`
- [ ] Add JSDoc comments
- [ ] Verify all fields present:
  - username, email, password
  - role, bio, avatar, phone, fullname
  - isVerified, balance, isActive
  - createdAt, updatedAt (timestamps)
- [ ] Verify hooks present:
  - pre-save password hashing hook
  - pre-save validation
- [ ] Add both export patterns:
  ```javascript
  export function getUserModel(connection) { ... }
  export function getUserModelWithConnection(connection) { ... }
  export default userSchema;
  ```
- [ ] Test: `node -e "import('./models/User.js').then(m => console.log(m.default))"`

**Status:** ✅ / ❌

---

### **Step 4: Copy Post Model** (Depends on User)

- [ ] Create `models/Post.js`
- [ ] Copy from `app/models/post.models.js`
- [ ] Verify fields: title, slug, content, description, author (ref: User), etc.
- [ ] Verify slug uniqueness constraint:
  ```javascript
  slug: { type: String, unique: true }
  ```
- [ ] Verify hooks:
  - pre-save slug generation
  - pre-save content validation
- [ ] Add export patterns (same as User)
- [ ] Verify reference to User model is correctly set

**Status:** ✅ / ❌

---

### **Step 5: Copy Order Model** (Depends on User, Post)

- [ ] Create `models/Order.js`
- [ ] Copy from `app/models/order.models.js`
- [ ] Verify fields include:
  - userId or visitorId
  - postId or tripDetails
  - status (enum: pending, confirmed, cancelled, completed)
  - prices, duration, etc.
- [ ] Add export patterns
- [ ] Verify all relationships correct

**Status:** ✅ / ❌

---

### **Step 6-12: Copy Remaining Models**

- [ ] `models/Comment.js` from `app/models/comment.model.js`
- [ ] `models/Image.js` from `app/models/image.models.js`
- [ ] `models/Token.js` from `app/models/token.models.js`
- [ ] `models/Auth.js` from `app/models/auth.models.js` (if exists)
- [ ] `models/Traffic.js` from `app/models/traffic.models.js`
- [ ] `models/Transaction.js` from `app/models/transaction.model.js`
- [ ] `models/Setting.js` from `app/models/setting.models.js`
- [ ] `models/ToastMessage.js` from `app/models/toastMessage.models.js`

For each:

- [ ] Create file in `models/`
- [ ] Copy & clean content
- [ ] Add export functions
- [ ] Add JSDoc comments
- [ ] Verify all methods present

**Status:** ✅ / ❌ (All models)

---

## 📦 Phase 3: Create Base Repository

### **Step 13: Create BaseRepository**

- [ ] Create `repositories/base.repository.js`
- [ ] Include CRUD methods:
  ```javascript
  -constructor(Model) -
    findById(id) -
    findAll(filter, options) -
    create(data) -
    update(id, data) -
    delete id -
    findOne(filter) -
    findAndUpdate(id, data) -
    count(filter) -
    paginate(filter, page, limit);
  ```
- [ ] Add error handling
- [ ] Add JSDoc comments

**Verify by running:**

```javascript
import BaseRepository from "./repositories/base.repository.js";
const repo = new BaseRepository({}); // Should not error
```

**Status:** ✅ / ❌

---

## 🎮 Phase 4: Create Repositories (Per Model)

### **Step 14: Create User Repository**

- [ ] Create `repositories/user.repository.js`
- [ ] Extend BaseRepository
  ```javascript
  class UserRepository extends BaseRepository {
    constructor(db) {
      const User = getUserModelWithConnection(db);
      super(User);
    }
  }
  ```
- [ ] Add custom methods:
  - findByEmail(email)
  - findByUsername(username)
  - findActiveUsers(filters)
  - findByRole(role)
  - updateBalance(userId, amount)
  - updateVerification(userId, status)

**Status:** ✅ / ❌

---

### **Step 15: Create Post Repository**

- [ ] Create `repositories/post.repository.js`
- [ ] Add custom methods:
  - findBySlug(slug)
  - findByAuthor(authorId)
  - findRecent(limit)
  - findByStatus(status)
  - incrementViews(postId)
  - updateSlug(postId, slug)

**Status:** ✅ / ❌

---

### **Step 16: Create Order Repository**

- [ ] Create `repositories/order.repository.js`
- [ ] Add custom methods:
  - findByUserId(userId)
  - findByStatus(status)
  - findByPostId(postId)
  - findRecent(limit)
  - findByDateRange(startDate, endDate)
  - updateStatus(orderId, status)

**Status:** ✅ / ❌

---

### **Step 17-23: Create Remaining Repositories**

For Comment, Image, Token, Traffic, Transaction, Setting, ToastMessage:

- [ ] Create `repositories/{Model}.repository.js`
- [ ] Extend BaseRepository
- [ ] Add custom query methods specific to each model

**Status:** ✅ / ❌ (All repos)

---

## 🧠 Phase 5: Create Services (Per Module)

### **Step 24: Create User Service**

- [ ] Create `services/user.service.js`
- [ ] Constructor receives db connection:
  ```javascript
  constructor(db) {
    this.userRepo = new UserRepository(db);
  }
  ```
- [ ] Add methods:
  - getUserById(userId)
  - getUserByEmail(email, excludePassword)
  - createUser(userData)
  - updateUser(userId, updateData)
  - deleteUser(userId)
  - verifyUser(userId)
  - updateBalance(userId, amount)
  - getPublicProfile(userId)

**Status:** ✅ / ❌

---

### **Step 25: Create Auth Service**

- [ ] Create `services/auth.service.js`
- [ ] Methods:
  - registerUser(userData)
  - loginUser(email, password)
  - verifyToken(token)
  - refreshToken(refreshToken)
  - logoutUser(userId)
  - requestPasswordReset(email)
  - resetPassword(token, newPassword)
  - verifyOTP(email, otp)

**Status:** ✅ / ❌

---

### **Step 26: Create Post Service**

- [ ] Create `services/post.service.js`
- [ ] Methods:
  - getPostById(postId)
  - getPostBySlug(slug)
  - createPost(postData, authorId)
  - updatePost(postId, authorId, updateData)
  - deletePost(postId, authorId)
  - publishPost(postId)
  - revalidatePost(postId)
  - generateSlug(title)
  - incrementViews(postId)
  - searchPosts(query, filters)

**Note:** Handle slug uniqueness, revalidation logic here (not in controller)

**Status:** ✅ / ❌

---

### **Step 27: Create Order Service**

- [ ] Create `services/order.service.js`
- [ ] Methods:
  - getOrderById(orderId)
  - createOrder(orderData, userId)
  - updateOrderStatus(orderId, newStatus)
  - cancelOrder(orderId, userId)
  - completeOrder(orderId)
  - getUserOrders(userId, filters)
  - getOrderStats(dateRange)
  - notifyOrderStatusChange(orderId, newStatus)

**Note:** Include Discord notification logic (call external helper)

**Status:** ✅ / ❌

---

### **Step 28-33: Create Remaining Services**

For Comment, Image, Traffic, and others:

- [ ] Create `services/{Model}.service.js`
- [ ] Add business logic specific to each module
- [ ] Reference repositories for data access
- [ ] Call helpers for external integrations

**Status:** ✅ / ❌ (All services)

---

## 🎨 Phase 6: Create Validators (Per Module)

### **Step 34: Create User Validator**

- [ ] Create `validators/user.validator.js`
- [ ] Methods (return `{ valid, errors }` format):
  - validateCreateUser(data)
  - validateUpdateUser(data)
  - validateEmail(email)
  - validatePassword(password)
  - validateUsername(username)
  - isValidEmail(email) - returns boolean

**Status:** ✅ / ❌

---

### **Step 35: Create Other Validators**

- [ ] `validators/auth.validator.js` - validateLogin, validateRegister
- [ ] `validators/post.validator.js` - validateCreatePost, validateUpdatePost
- [ ] `validators/order.validator.js` - validateCreateOrder, validateUpdateOrder
- [ ] `validators/{Model}.validator.js` - for other modules

**Status:** ✅ / ❌ (All validators)

---

## 🎯 Phase 7: Create Controllers (Per Module)

### **Step 36: Create User Controller**

- [ ] Create `controllers/user.controller.js`
- [ ] Constructor receives db connection:
  ```javascript
  constructor(db) {
    this.userService = new UserService(db);
  }
  ```
- [ ] Methods:
  - getUserById(req, res, next)
  - getUserByEmail(req, res, next)
  - createUser(req, res, next)
  - updateUser(req, res, next)
  - deleteUser(req, res, next)
  - verifyUser(req, res, next)
  - getPublicProfile(req, res, next)

- [ ] Each method should:
  - Validate input (using validator)
  - Call service method
  - Handle errors (next(error))
  - Return consistent JSON format

**Status:** ✅ / ❌

---

### **Step 37: Create Auth Controller**

- [ ] Create `controllers/auth.controller.js`
- [ ] Methods:
  - register(req, res, next)
  - login(req, res, next)
  - refreshToken(req, res, next)
  - logout(req, res, next)
  - verifyOTP(req, res, next)
  - requestPasswordReset(req, res, next)
  - resetPassword(req, res, next)

**Status:** ✅ / ❌

---

### **Step 38: Create Post Controller**

- [ ] Create `controllers/post.controller.js`
- [ ] Methods for CRUD operations
- [ ] Methods: getPosts, getPostById, getPostBySlug, createPost, updatePost, deletePost, publishPost, searchPosts

**Status:** ✅ / ❌

---

### **Step 39: Create Order Controller**

- [ ] Create `controllers/order.controller.js`
- [ ] Methods: getOrders, getOrderById, createOrder, updateOrderStatus, cancelOrder, completeOrder

**Status:** ✅ / ❌

---

### **Step 40-43: Create Remaining Controllers**

- [ ] `controllers/comment.controller.js`
- [ ] `controllers/image.controller.js`
- [ ] `controllers/traffic.controller.js`
- [ ] Others

**Status:** ✅ / ❌ (All controllers)

---

## 🛤️ Phase 8: Create Routes

### **Step 44: Create User Routes**

- [ ] Create `routes/v1/user.route.js`
- [ ] Export function that creates router with db binding:
  ```javascript
  export default function createUserRoutes(req, res, next) {
    const router = express.Router();
    const userController = new UserController(req.db);

    router.get("/:id", userController.getUserById.bind(userController));
    // ... more routes
    return router;
  }
  ```

**Status:** ✅ / ❌

---

### **Step 45: Create Auth Routes**

- [ ] Create `routes/v1/auth.route.js`
- [ ] Routes: POST /register, POST /login, POST /refresh, POST /logout, POST /verify-otp

**Status:** ✅ / ❌

---

### **Step 46: Create Post Routes**

- [ ] Create `routes/v1/post.route.js`
- [ ] Routes: GET /, GET /:id, POST /, PUT /:id, DELETE /:id, GET /slug/:slug

**Status:** ✅ / ❌

---

### **Step 47: Create Order Routes**

- [ ] Create `routes/v1/order.route.js`
- [ ] Routes: GET /, GET /:id, POST /, PUT /:id, DELETE /:id

**Status:** ✅ / ❌

---

### **Step 48-51: Create Remaining Routes**

- [ ] `routes/v1/comment.route.js`
- [ ] `routes/v1/image.route.js`
- [ ] `routes/v1/traffic.route.js`
- [ ] Others

**Status:** ✅ / ❌ (All routes)

---

## 🔌 Phase 9: Update Main Routes Configuration

### **Step 52: Create v1 Routes Index**

- [ ] Create `routes/v1/index.js`
- [ ] Import all route creators
- [ ] Setup with db binding middleware:
  ```javascript
  export default function setupV1Routes(app) {
    app.use("/api/v1/auth", (req, res, next) => {
      const router = createAuthRoutes(req, res, next);
      router(req, res, next);
    });
    // ... more routes
  }
  ```

**Status:** ✅ / ❌

---

### **Step 53: Update Main App Routes**

- [ ] Update `src/index.js` to include v1 routes:

  ```javascript
  import setupV1Routes from "./routes/v1/index.js";

  // In Express setup:
  setupV1Routes(app);
  setupLegacyRoutes(app); // Keep old routes for fallback
  ```

**Status:** ✅ / ❌

---

## 🧪 Phase 10: Testing & Verification

### **Step 54: Test User Module**

- [ ] POST /api/v1/auth/register - Create new user
- [ ] POST /api/v1/auth/login - Login with credentials
- [ ] GET /api/v1/users/:id - Get user by ID
- [ ] PUT /api/v1/users/:id - Update user
- [ ] GET /api/v1/users/:id/profile - Get public profile

**Verify:**

- [ ] Response format matches old API
- [ ] Error messages are consistent
- [ ] Database operations work
- [ ] Multi-domain routing works
- [ ] Logging is captured

**Status:** ✅ / ❌

---

### **Step 55: Test Post Module**

- [ ] GET /api/v1/posts - List posts
- [ ] POST /api/v1/posts - Create post
- [ ] GET /api/v1/posts/:id - Get post by ID
- [ ] GET /api/v1/posts/slug/:slug - Get by slug
- [ ] PUT /api/v1/posts/:id - Update post
- [ ] DELETE /api/v1/posts/:id - Delete post

**Verify:**

- [ ] Slug generation works
- [ ] Uniqueness enforced
- [ ] Revalidation works
- [ ] View counting works

**Status:** ✅ / ❌

---

### **Step 56: Test Order Module**

- [ ] POST /api/v1/orders - Create order
- [ ] GET /api/v1/orders/:id - Get order
- [ ] PUT /api/v1/orders/:id - Update order status
- [ ] GET /api/v1/orders - List user orders

**Verify:**

- [ ] User/Visitor ID handling works
- [ ] Status transitions work
- [ ] Discord notifications sent
- [ ] Edge cases handled

**Status:** ✅ / ❌

---

### **Step 57-60: Test Remaining Modules**

- [ ] Test all other modules similarly
- [ ] Test error scenarios
- [ ] Test edge cases
- [ ] Test multi-domain scenarios

**Status:** ✅ / ❌

---

### **Step 61: Integration Testing**

- [ ] Run old and new endpoints in parallel
- [ ] Compare responses
- [ ] Test database consistency
- [ ] Test across all domains

**Status:** ✅ / ❌

---

### **Step 62: Performance Testing**

- [ ] Measure response times (old vs new)
- [ ] Check database query efficiency
- [ ] Monitor memory usage
- [ ] Check logging overhead

**Status:** ✅ / ❌

---

## 🔀 Phase 11: Gradual Traffic Migration

### **Step 63: Monitor Error Rates**

- [ ] Setup error rate tracking
- [ ] Compare old vs new endpoint errors
- [ ] Log discrepancies
- [ ] Fix identified issues

**Status:** ✅ / ❌

---

### **Step 64: Gradual Traffic Switch**

- [ ] Direct 10% traffic to new endpoints
- [ ] Monitor for 1 hour
- [ ] Increase to 25% traffic
- [ ] Monitor for 1 hour
- [ ] Increase to 50% traffic
- [ ] Monitor for 1 hour
- [ ] Switch 100% traffic

**Status:** ✅ / ❌

---

## 🧹 Phase 12: Cleanup

### **Step 65: Archive Old Code**

- [ ] Create backup: `app_old_backup_[date]/`
- [ ] Copy `app/` folder to backup
- [ ] Keep in git history

**Status:** ✅ / ❌

---

### **Step 66: Remove Old Code**

- [ ] Delete `app/controllers/`
- [ ] Delete `app/models/`
- [ ] Keep only what's deprecated/unused for now
- [ ] Update imports across project

**Status:** ✅ / ❌

---

### **Step 67: Update Documentation**

- [ ] Update README.md with new structure
- [ ] Update deployment guide
- [ ] Document database migration (if any)
- [ ] Update API documentation

**Status:** ✅ / ❌

---

### **Step 68: Final Verification**

- [ ] All tests passing
- [ ] All routes working
- [ ] Logging functional
- [ ] Error handling robust
- [ ] Performance acceptable
- [ ] Multi-domain support verified

**Status:** ✅ / ❌

---

## 📊 Migration Progress Summary

```
Phase                          Status       Count    Notes
─────────────────────────────────────────────────────────────
1. Preparation                 ⏳ Pending    2/2
2. Models                       ⏳ Pending    11/11
3. BaseRepository               ⏳ Pending    1/1
4. Repositories                 ⏳ Pending    11/11
5. Services                     ⏳ Pending    10+
6. Validators                   ⏳ Pending    10+
7. Controllers                  ⏳ Pending    10+
8. Routes                       ⏳ Pending    10+
9. Routes Config                ⏳ Pending    2/2
10. Testing                     ⏳ Pending    9/9
11. Traffic Migration           ⏳ Pending    3/3
12. Cleanup                     ⏳ Pending    4/4
─────────────────────────────────────────────────────────────
TOTAL ITEMS                                 ~80+

Estimated Time: 2-3 weeks (depending on code complexity)
Effort: Medium to High
Risk Level: Medium (if testing comprehensive)
```

---

## 🎯 Quick Start Command

When ready to begin, run:

```bash
# 1. Copy models
cp app/models/user.models.js models/User.js
# ... copy others

# 2. Create structure
mkdir -p repositories services validators controllers/auth routes/v1

# 3. Begin with User model (foundation)
# Follow steps 14-22 from checklist above
```

---

**Last Updated:** 2026-03-08
**Status:** Ready for Migration Phase 1
