# 🏗️ MVC Project Structure - Complete Refactoring Guide

## 📋 Tổng quan Cấu trúc MVC

Backend đã được refactor theo chuẩn MVC cơ cấp với phân chia rõ ràng tangu:

```
src/
├── config/                    # ⚙️ Configuration
│   ├── database/
│   │   ├── index.js
│   │   └── mongoConnectionPool.js
│   ├── domain/
│   │   └── index.js
│   └── apiKeys.js
│
├── middleware/                # 🔄 Express Middleware
│   ├── auth.middleware.js     # (auth logic, từ checkToken.js)
│   ├── cors.middleware.js     # (CORS setup, tách từ index.js)
│   ├── domain.middleware.js   # (từ configPerDomain.js)
│   ├── error.middleware.js    # (NEW - error handling)
│   ├── logger.middleware.js   # (NEW - request logging)
│   └── validation.middleware.js # (NEW - request validation)
│
├── routes/                    # 🛣️ API Routes
│   ├── v1/                    # API versioning
│   │   ├── index.js
│   │   ├── auth.route.js
│   │   ├── user.route.js
│   │   ├── post.route.js
│   │   ├── order.route.js
│   │   └── ...
│   └── index.js
│
├── controllers/               # 🎮 Request Handlers
│   ├── auth/                  # Group by domain
│   │   ├── login.controller.js
│   │   ├── register.controller.js
│   │   ├── logout.controller.js
│   │   └── index.js
│   ├── user.controller.js
│   ├── post.controller.js
│   ├── order.controller.js
│   ├── comment.controller.js
│   ├── image.controller.js
│   ├── traffic.controller.js
│   ├── dashboard.controller.js
│   └── ...
│
├── services/                  # 💼 Business Logic
│   ├── auth.service.js
│   ├── user.service.js
│   ├── post.service.js
│   ├── order.service.js
│   ├── email.service.js
│   ├── openAi.service.js
│   ├── gemini.service.js
│   ├── discord.service.js
│   └── ...
│
├── repositories/              # 🗂️ Data Access Layer
│   ├── base.repository.js     # Abstract class
│   ├── user.repository.js
│   ├── post.repository.js
│   ├── order.repository.js
│   └── ...
│
├── models/                    # 🗄️ Database Schemas
│   ├── User.js
│   ├── Post.js
│   ├── Order.js
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
├── validators/                # ✅ Request Validation
│   ├── auth.validator.js
│   ├── user.validator.js
│   ├── post.validator.js
│   ├── order.validator.js
│   └── ...
│
├── helpers/                   # 🔧 Utilities & Helpers
│   ├── logger.js              # Logging system
│   ├── generators/
│   │   ├── content.generator.js    # (builders)
│   │   ├── prompt.generator.js
│   │   ├── tag.generator.js
│   │   └── index.js
│   ├── external/
│   │   ├── openAi.helper.js
│   │   ├── gemini.helper.js
│   │   ├── discord.helper.js
│   │   ├── telegram.helper.js
│   │   └── index.js
│   ├── common/
│   │   ├── string.helper.js       # Utils
│   │   ├── email.helper.js
│   │   ├── slug.helper.js
│   │   └── index.js
│   ├── security/
│   │   └── encryption.helper.js
│   └── (cũ) buildPrompt/    # Keep old structure tạm thời
│       geminiAi/
│       openAi/
│       discord/
│       telegram/
│
├── constants/                 # 📌 App Constants
│   ├── app.constants.js       # HTTP status, error messages, roles
│   ├── regex.constants.js     # Regex patterns
│   └── config.constants.js    # Configuration constants
│
├── types/                     # 📝 Type Definitions (JSDoc)
│   ├── app.types.js
│   ├── user.types.js
│   ├── post.types.js
│   └── ...
│
├── utils/                     # 🧹 Utilities (từ cũ - keep compatibility)
│   ├── cleanContent.js        # Keep for now
│   ├── convertSlug.js
│   ├── crawlHelper.js
│   └── sendOtpEmail.js
│
├── uploads/                   # 📁 Upload directory
│
└── index.js                   # Application entry point
```

---

## 🔄 MVC Layer Flow

```
HTTP Request
    ↓
[Middleware (CORS, Auth, Logger)]
    ↓
[Routes] - Route matching
    ↓
[Controller] - Parse input, validate
    ↓
[Service] - Business logic
    ↓
[Repository] - Data access
    ↓
[Model] - Database operation
    ↓
[Response] - Format & send back
```

---

## 📚 Chi tiết mỗi Layer

### **1️⃣ Controllers** - Request/Response Handler

**Trách vụ:**

- Nhận HTTP request
- Validate request (gọi Validator)
- Gọi Service để xử lý
- Format response với HTTP status code

**Không nên:**

- Xử lý business logic phức tạp
- Access database trực tiếp
- Xử lý error details

**Ví dụ:**

```javascript
class UserController {
  async createUser(req, res, next) {
    try {
      const { email, password, name } = req.body;

      // Validate
      const validation = UserValidator.validateCreateUser(req.body);
      if (!validation.valid) {
        return res.status(400).json({ success: false, errors: validation.errors });
      }

      // Call service
      const user = await this.userService.createUser({ email, password, name });

      // Response
      res.status(201).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }
}
```

---

### **2️⃣ Services** - Business Logic

**Trách vụ:**

- Xử lý logic nghiệp vụ
- Gọi Repository để lấy/lưu data
- Transform data nếu cần
- Gọi external services (email, payment, etc.)

**Không nên:**

- Xử lý HTTP requests/responses
- Access model trực tiếp

**Ví dụ:**

```javascript
class UserService {
  async createUser(userData) {
    // Check if user exists
    const existing = await this.userRepo.findByEmail(userData.email);
    if (existing) throw new Error("Email already exists");

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Create user
    const user = await this.userRepo.create({
      ...userData,
      password: hashedPassword,
    });

    // Send welcome email
    await EmailService.sendWelcome(user.email);

    return user;
  }
}
```

---

### **3️⃣ Repositories** - Data Access

**Trách vụ:**

- Tất cả thao tác database
- Query building
- Raw data từ database

**Không nên:**

- Xử lý business logic
- Format data cho response

**Ví dụ:**

```javascript
class UserRepository extends BaseRepository {
  async findByEmail(email) {
    return await this.User.findOne({ email });
  }

  async find(filters = {}, skip = 0, limit = 10) {
    return await this.User.find(filters).skip(skip).limit(limit);
  }
}
```

---

### **4️⃣ Models** - Database Schemas

**Trách vụ:**

- Define MongoDB schemas
- Mongoose validation rules
- Database relationships
- Hooks (pre, post)

**Ví dụ:**

```javascript
const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
});
```

---

### **5️⃣ Validators** - Request Validation

**Trách vụ:**

- Validate request data
- Check data types
- Check required fields
- Return validation errors

**Ví dụ:**

```javascript
class UserValidator {
  static validateCreateUser(data) {
    const errors = [];

    if (!data.email) errors.push({ field: "email", message: "Email required" });
    if (!data.password || data.password.length < 6) errors.push({ field: "password", message: "Min 6 chars" });

    return { valid: errors.length === 0, errors };
  }
}
```

---

### **6️⃣ Routes** - API Endpoints

**Trách vụ:**

- Define API paths
- Map to controllers
- Apply middleware
- API versioning

**Ví dụ:**

```javascript
// routes/v1/user.route.js
const router = express.Router();

router.get("/:id", auth, UserController.getUserById);
router.post("/", UserController.createUser);
router.put("/:id", auth, UserController.updateUser);
router.delete("/:id", auth, UserController.deleteUser);

export default router;
```

---

### **7️⃣ Middleware** - Request/Response Processing

**Trách vụ:**

- Authentication
- Authorization
- CORS
- Request logging
- Error handling
- Request validation

---

### **8️⃣ Helpers** - Utilities

**Organized in subfolders:**

**`helpers/generators/`** - Content Builders

```javascript
ContentGenerator.buildPrompt(data);
ContentGenerator.buildContent(data);
ContentGenerator.buildDescription(data);
ContentGenerator.buildTags(data);
```

**`helpers/external/`** - External Integrations

```javascript
OpenAiHelper.callOpenAi(prompt);
GeminiHelper.callGeminiAi(prompt);
DiscordHelper.sendMessage(message);
TelegramHelper.sendMessage(chatId, message);
```

**`helpers/common/`** - Common Utilities

```javascript
StringHelper.toSlug(str);
StringHelper.stripHtml(html);
EmailHelper.sendOtpEmail(email, otp);
EmailHelper.sendWelcomeEmail(email, name);
```

---

### **9️⃣ Constants** - App-wide Constants

```javascript
// app.constants.js
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

export const ERROR_MESSAGES = {
  USER_NOT_FOUND: "User not found",
  USER_EXISTS: "User already exists",
};

export const USER_ROLES = {
  ADMIN: "admin",
  USER: "user",
};
```

---

### **🔟 Types** - Data Structure Definitions

```javascript
/**
 * @typedef {Object} User
 * @property {string} _id - User ID
 * @property {string} email - User email
 * @property {string} name - User name
 * @property {string} role - User role
 */
```

---

## 🔄 Cách Refactor từ Cũ sang Mới

### **Step 1: Tổ chức Controllers**

**Cũ (app/controllers/):**

```
user.controller.js  (login, register, getUser, updateUser, etc.)
```

**Mới (controllers/):**

```
controllers/
  ├── auth/
  │   ├── login.controller.js    (tách auth logic)
  │   ├── register.controller.js
  │   └── index.js
  └── user.controller.js          (user management logic)
```

**Cách làm:**

1. Tách auth logic (login, register, logout) sang file riêng
2. Keep user management (getUser, updateUser, deleteUser) ở user.controller.js
3. Create index.js để export tất cả

---

### **Step 2: Tạo Services**

**Làm việc:**

1. Tạo `services/user.service.js`
2. Move logic từ controller qua service
3. Service gọi Repository để lấy data

**Ví dụ:**

```javascript
// controller
async createUser(req, res) {
  const user = await userService.createUser(req.body);
  res.json(user);
}

// service
async createUser(userData) {
  if (await userRepo.findByEmail(userData.email)) {
    throw new Error("Email exists");
  }
  return await userRepo.create(userData);
}
```

---

### **Step 3: Tạo Repositories**

**Làm việc:**

1. Tạo `repositories/user.repository.js`
2. Move tất cả database queries từ models/services
3. Extend BaseRepository cho common methods

```javascript
class UserRepository extends BaseRepository {
  setModel(User) {
    this.User = User;
  }

  async findByEmail(email) {
    return await this.User.findOne({ email });
  }
}
```

---

### **Step 4: Tạo Routes v1**

**Structure:**

```
routes/
  ├── v1/
  │   ├── index.js
  │   ├── auth.route.js
  │   ├── user.route.js
  │   └── ...
  └── index.js
```

**v1/index.js:**

```javascript
import authRoutes from "./auth.route.js";
import userRoutes from "./user.route.js";

export default { auth: authRoutes, user: userRoutes };
```

---

### **Step 5: Tạo Validators**

```javascript
// validators/user.validator.js
export class UserValidator {
  static validateCreateUser(data) {
    const errors = [];
    if (!data.email) errors.push({ field: "email", message: "Required" });
    return { valid: errors.length === 0, errors };
  }
}
```

**Sử dụng:**

```javascript
async createUser(req, res) {
  const validation = UserValidator.validateCreateUser(req.body);
  if (!validation.valid) {
    return res.status(400).json({ errors: validation.errors });
  }
  // ...
}
```

---

### **Step 6: Reorganize Helpers**

**Từ:**

```
helpers/
  ├── buildPrompt/
  ├── geminiAi/
  ├── openAi/
  ├── discord/
  └── telegram/
```

**Thành:**

```
helpers/
  ├── generators/
  │   ├── content.generator.js    (tích hợp buildPrompt/)
  │   └── prompt.generator.js
  ├── external/
  │   ├── openAi.helper.js        (wrap openAi/)
  │   ├── gemini.helper.js        (wrap geminiAi/)
  │   ├── discord.helper.js       (wrap discord/)
  │   └── telegram.helper.js      (wrap telegram/)
  └── common/
      ├── string.helper.js        (tích hợp utils/)
      └── email.helper.js
```

---

## ✨ Best Practices

### **✅ DO:**

1. Controllers - HTTP handling only
2. Services - Business logic
3. Repositories - Database queries
4. Validators - Input validation
5. Helpers - Reusable utilities
6. Keep concerns separated
7. Use dependency injection
8. Log operations
9. Handle errors properly
10. Use consistent naming

### **❌ DON'T:**

1. Database access in controllers
2. Business logic in repositories
3. HTTP handling in services
4. Circular dependencies
5. Global variables
6. Mixing concerns
7. Hardcode values
8. Ignore errors
9. Skip validation
10. Duplicate code

---

## 🔧 Refactor Checklist

- [ ] Create new folder structure
- [ ] Create template files for each layer
- [ ]批量 move existing controllers
- [ ] Create services from controller logic
- [ ] Create repositories from model queries
- [ ] Create validators for requests
- [ ] Create routes v1 structure
- [ ] Update middleware imports
- [ ] Create constants file
- [ ] Reorganize helpers
- [ ] Test all endpoints
- [ ] Update documentation
- [ ] Remove old structure gradualmente

---

## 📝 Examples (See REFACTOR_EXAMPLES.md)

For concrete refactoring examples, see:

- User module refactoring
- Post module refactoring
- Order module refactoring
- Auth module refactoring

---

Generated: 2026-03-08
