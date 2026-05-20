# 🏗️ MVC Architecture - Visual Guide

## Request Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        HTTP Request                              │
│                     (GET /api/v1/users)                         │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      MIDDLEWARE LAYER                            │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 1. CORS Middleware      - Check origin (cors.middleware) │   │
│  │ 2. Logger Middleware    - Log request (logger.middleware) │   │
│  │ 3. Domain Middleware    - Load config (domain.middleware) │   │
│  │ 4. Auth Middleware      - Check JWT token (auth.middleware) │   │
│  │ 5. Validation Middleware - Validate input (validation.mw) │   │
│  └─────────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ROUTING LAYER                                │
│              (routes/v1/user.route.js)                         │
│         Match route: GET /api/v1/users/:id                     │
│           ↓                                                      │
│    Dispatch to: UserController.getUserById()                   │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                 CONTROLLER LAYER                                │
│          (controllers/user.controller.js)                       │
│                                                                 │
│  1. Parse request parameters & body                            │
│  2. Validate input (UserValidator.validateGetUser())           │
│  3. Call service method                                         │
│  4. Format response                                             │
│  5. Send HTTP response                                          │
│                                                                 │
│  async getUserById(req, res, next) {                           │
│    const { id } = req.params;                                  │
│    const user = await userService.getUserById(id);             │
│    res.json({ success: true, data: user });                    │
│  }                                                              │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                  SERVICE LAYER                                  │
│          (services/user.service.js)                            │
│                                                                 │
│  1. Business logic                                              │
│  2. Data transformation                                         │
│  3. Call external services (email, payment, etc.)              │
│  4. Call repositories for data access                          │
│  5. Error handling & logging                                    │
│                                                                 │
│  async getUserById(userId) {                                   │
│    const user = await userRepo.findById(userId);               │
│    if (!user) throw new Error("User not found");               │
│    return this.formatUser(user);                               │
│  }                                                              │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                REPOSITORY LAYER                                 │
│         (repositories/user.repository.js)                       │
│                                                                 │
│  1. Query building                                              │
│  2. Database operations                                         │
│  3. Raw data retrieval                                          │
│                                                                 │
│  async findById(id) {                                           │
│    return await this.User.findById(id);                        │
│  }                                                              │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   MODEL LAYER                                   │
│              (models/User.js)                                   │
│                                                                 │
│  1. Mongoose Schema definition                                  │
│  2. Validation rules                                            │
│  3. Pre/Post hooks                                              │
│  4. Database interaction                                        │
│                                                                 │
│  const userSchema = new Schema({                               │
│    email: { type: String, required: true, unique: true },     │
│    password: String,                                           │
│    ...                                                          │
│  });                                                            │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                 DATABASE LAYER                                  │
│            (MongoDB / Mongoose)                                │
│                                                                 │
│  SELECT * FROM users WHERE _id = ?                             │
│                                                                 │
│  Returns: { _id: "...", email: "...", name: "..." }           │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼ (Data flows back up)
┌─────────────────────────────────────────────────────────────────┐
│  Repository returns raw data                                    │
│         ↑                                                        │
│  Service transforms data                                        │
│         ↑                                                        │
│  Controller formats response                                    │
│         ↑                                                        │
│  Middleware (Error Handler)                                     │
│         ↑                                                        │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   HTTP Response                                 │
│                                                                 │
│  HTTP/1.1 200 OK                                               │
│  Content-Type: application/json                                │
│                                                                 │
│  {                                                              │
│    "success": true,                                            │
│    "data": {                                                    │
│      "_id": "...",                                             │
│      "email": "user@example.com",                              │
│      "name": "John Doe",                                       │
│      "role": "user"                                            │
│    }                                                            │
│  }                                                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## Folder Structure Diagram

```
src/
│
├── config/                    # Configuration
│   ├── database/
│   │   ├── index.js
│   │   └── mongoConnectionPool.js
│   ├── domain/
│   │   └── index.js
│   └── apiKeys.js
│
├── middleware/                # Express Middleware
│   ├── auth.middleware.js        ✅ NEW
│   ├── cors.middleware.js        ✅ NEW
│   ├── domain.middleware.js      ✅ NEW
│   ├── error.middleware.js       ✅ NEW
│   ├── logger.middleware.js      ✅ NEW
│   ├── validation.middleware.js  ✅ NEW
│   ├── checkToken.js            (deprecated - use auth.middleware.js)
│   ├── configPerDomain.js       (deprecated - use domain.middleware.js)
│   └── index.js
│
├── routes/                    # API Routes
│   ├── v1/                       ✅ NEW
│   │   ├── index.js
│   │   ├── auth.route.js
│   │   ├── user.route.js
│   │   ├── post.route.js
│   │   └── ...
│   └── index.js
│
├── controllers/               # HTTP Request Handlers
│   ├── auth/                     ✅ NEW
│   │   ├── login.controller.js
│   │   ├── register.controller.js
│   │   └── index.js
│   ├── user.controller.js        ✅ NEW (refactored)
│   ├── post.controller.js        (to refactor)
│   ├── order.controller.js       (to refactor)
│   └── ...
│
├── services/                  # Business Logic
│   ├── auth.service.js           ✅ NEW (template)
│   ├── user.service.js           ✅ NEW (template)
│   ├── post.service.js           (to create)
│   ├── order.service.js          (to create)
│   ├── email.service.js          (to create)
│   ├── openAi.service.js         (to create)
│   └── ...
│
├── repositories/              # Data Access Layer
│   ├── base.repository.js        ✅ NEW (abstract class)
│   ├── user.repository.js        ✅ NEW (template)
│   ├── post.repository.js        (to create)
│   ├── order.repository.js       (to create)
│   └── ...
│
├── models/                    # Database Schemas
│   ├── User.js               (from app/models/user.models.js)
│   ├── Post.js               (rename: post.models.js → Post.js)
│   ├── Order.js              (rename: order.models.js → Order.js)
│   ├── Comment.js
│   ├── Image.js
│   ├── Traffic.js
│   ├── Auth.js
│   ├── Token.js
│   ├── Transaction.js
│   ├── Setting.js
│   ├── ToastMessage.js
│   └── ...
│
├── validators/                # Request Validation
│   ├── user.validator.js         ✅ NEW (template)
│   ├── auth.validator.js         (to create)
│   ├── post.validator.js         (to create)
│   ├── order.validator.js        (to create)
│   └── ...
│
├── helpers/                   # Utilities & Integrations
│   ├── logger.js                 (existing logging system)
│   │
│   ├── generators/               ✅ NEW
│   │   ├── content.generator.js  (integrate: buildPrompt/)
│   │   ├── prompt.generator.js
│   │   ├── tag.generator.js
│   │   └── index.js
│   │
│   ├── external/                 ✅ NEW
│   │   ├── openAi.helper.js      (wrap: openAi/ helpers)
│   │   ├── gemini.helper.js      (wrap: geminiAi/ helpers)
│   │   ├── discord.helper.js     (wrap: discord/ helpers)
│   │   ├── telegram.helper.js    (wrap: telegram/ helpers)
│   │   └── index.js
│   │
│   ├── common/                   ✅ NEW
│   │   ├── string.helper.js      (integrate: convertSlug.js)
│   │   ├── email.helper.js       (integrate: sendOtpEmail.js)
│   │   ├── slug.helper.js
│   │   └── index.js
│   │
│   ├── security/                 (existing)
│   │   └── encryption.helper.js  (integrate: maskSecret.js)
│   │
│   ├── buildPrompt/              (old - keep for now, gradually migrate)
│   ├── geminiAi/
│   ├── openAi/
│   ├── discord/
│   └── telegram/
│
├── constants/                 # App-wide Constants
│   ├── app.constants.js          ✅ NEW
│   ├── http-status.js            (optional)
│   ├── error-messages.js         (optional)
│   └── ...
│
├── types/                     # Type Definitions (JSDoc)
│   ├── app.types.js              ✅ NEW
│   ├── user.types.js             (to create)
│   ├── post.types.js             (to create)
│   ├── order.types.js            (to create)
│   └── ...
│
├── utils/                     # Legacy Utilities (Keep for now)
│   ├── cleanContent.js           (migrate to helpers/common/)
│   ├── convertSlug.js            (migrate to helpers/common/)
│   ├── crawlHelper.js            (migrate to helpers/)
│   └── sendOtpEmail.js           (migrate to helpers/common/)
│
├── app/                       # Old Structure (Deprecate gradually)
│   ├── controllers/              (migrate to /controllers)
│   └── models/                   (migrate to /models)
│
├── uploads/                   # File Storage
│
└── index.js                   # Application Entry Point
```

---

## Module Refactoring Order

```
Priority 1: Core Modules
├── Auth Module
│   ├── Controller: login, register, logout
│   ├── Service: credential check, token generation
│   ├── Repository: user lookup
│   └── Validator: email, password format
│
├── User Module
│   ├── Controller: CRUD operations
│   ├── Service: user management logic
│   ├── Repository: database queries
│   └── Validator: user data validation
│
└── Post Module
    ├── Controller: post CRUD
    ├── Service: slug generation, SEO, content processing
    ├── Repository: post queries
    └── Validator: post data validation
│
Priority 2: Business Modules
├── Order Module (complex workflow)
├── Payment Module (if exists)
├── Notification Module
│
Priority 3: Feature Modules
├── Image Module
├── Comment Module
├── Traffic Module
├── Dashboard Module
├── Setting Module
│
Priority 4: Integration Modules
├── OpenAI Integration
├── Gemini Integration
├── Discord Integration
└── Telegram Integration
```

---

## Data Flow Example: Create User

```
┌─────────────────────────────────────────────────────────────────┐
│  USER REQUEST                                                   │
│  POST /api/v1/users                                             │
│  { email: "john@example.com", password: "secret", name: "John" }
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  MIDDLEWARE                                                     │
│  ✓ CORS: Origin allowed                                        │
│  ✓ Logger: Incoming request logged                             │
│  ✓ Domain: Config loaded                                       │
│  ✓ Validation: Input structure validated                       │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  ROUTING                                                        │
│  Match: POST /api/v1/users                                      │
│  → UserController.createUser()                                  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  CONTROLLER                                                     │
│  async createUser(req, res, next) {                            │
│    1. Extract: { email, password, name }                       │
│    2. Validate: UserValidator.validateCreateUser()             │
│       → { valid: true, errors: [] }                            │
│    3. Call: userService.createUser()                           │
│    4. Response: res.json(201, user)                            │
│  }                                                              │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  SERVICE                                                        │
│  async createUser(userData) {                                  │
│    1. Check: userRepo.findByEmail(email)                       │
│       → User exists? Throw Error                               │
│    2. Hash: bcrypt.hash(password)                              │
│    3. Create: userRepo.create(userData)                        │
│       → Call Repository                                        │
│    4. Email: sendWelcomeEmail(email)                           │
│    5. Return: Formatted user object                            │
│  }                                                              │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  REPOSITORY                                                     │
│  async findByEmail(email) {                                    │
│    return await User.findOne({ email });                       │
│  }                                                              │
│                                                                 │
│  async create(userData) {                                      │
│    const user = new User(userData);                            │
│    return await user.save();                                   │
│  }                                                              │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  MODEL                                                          │
│  User.create() → Pre-save hook runs → Hash password            │
│  → MongoDB: INSERT INTO users (...) VALUES (...)               │
│  ← MongoDB returns: { _id, email, name, password, ... }        │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼ (Data flows back up)
┌─────────────────────────────────────────────────────────────────┐
│  Response Builder                                               │
│  Repository → { _id, email, name, ... }                        │
│  Service → Remove sensitive fields → { id, email, name }       │
│  Controller → Format JSON → { success, data }                  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  HTTP RESPONSE (201 Created)                                    │
│  {                                                              │
│    "success": true,                                            │
│    "message": "User created successfully",                     │
│    "data": {                                                    │
│      "_id": "507f1f77bcf86cd799439011",                       │
│      "email": "john@example.com",                              │
│      "name": "John"                                            │
│    }                                                            │
│  }                                                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## Error Handling Flow

```
┌──────────────────────────────────────┐
│   Error occurs (any layer)           │
│   throw new Error("message")         │
└────────────┬─────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────────┐
│   Caught by next(error)                      │
│   Passed to Error Handler Middleware         │
└────────────┬─────────────────────────────────┘
             │
             ▼
        logger.error()  ← Logged to file
             │
             ▼
┌──────────────────────────────────────────────┐
│   Error Handler Middleware                   │
│   1. Determine status code                   │
│   2. Format error response                   │
│   3. Log error details                       │
└────────────┬─────────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────────┐
│   HTTP Response (400/404/500)                │
│   {                                          │
│     "success": false,                        │
│     "message": "Error description"           │
│   }                                          │
└──────────────────────────────────────────────┘
```

---

## Dependency Injection Pattern

```javascript
// ❌ Bad: Tight coupling
class UserController {
  constructor() {
    this.userService = new UserService(); // Hard-coded
  }
}

// ✅ Good: Dependency injection
class UserController {
  constructor(userService) {
    this.userService = userService; // Injected
  }
}

// Usage:
const userService = new UserService(User);
const userController = new UserController(userService);

// Benefits:
// - Easy to test (mock service)
// - Flexible (can swap implementation)
// - Reusable (single instance for multiple controllers)
```

---

## Best Practices

### ✅ DO:

1. Controllers handle HTTP only
2. Services handle business logic
3. Repositories handle database
4. Validators handle input checking
5. Middleware handle cross-cutting concerns
6. Helpers handle utilities
7. Constants for fixed values
8. Types for documentation

### ❌ DON'T:

1. Database queries in controllers
2. HTTP handling in services
3. Business logic in repositories
4. Circular imports
5. Global state
6. Mixing concerns

---

Generated: 2026-03-08
