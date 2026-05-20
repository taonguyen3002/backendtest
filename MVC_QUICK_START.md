# 🚀 MVC Refactoring Quick Start

## 📌 Tiếp theo là gì?

Cấu trúc MVC đã được setup. Dưới đây là các bước tiếp theo:

---

## ✅ Step 1: Kiểm tra cấu trúc đã tạo

### Folders mới:

```bash
src/
  ├── services/          ✅ NEW
  ├── repositories/      ✅ NEW
  ├── validators/        ✅ NEW
  ├── constants/         ✅ NEW
  ├── types/             ✅ NEW
  ├── helpers/
  │   ├── generators/    ✅ NEW
  │   ├── external/      ✅ NEW
  │   └── common/        ✅ NEW
  ├── middleware/        ✅ UPDATED
  └── controllers/       ✅ UPDATED
```

### Files template tạo sẵn:

- ✅ `services/user.service.js` - Template service
- ✅ `repositories/user.repository.js` - Template repository
- ✅ `repositories/base.repository.js` - Base class for all repos
- ✅ `controllers/user.controller.js` - Refactored controller
- ✅ `validators/user.validator.js` - Template validator
- ✅ `constants/app.constants.js` - App-wide constants
- ✅ `types/app.types.js` - JSDoc type definitions
- ✅ `helpers/common/string.helper.js` - String utilities
- ✅ `helpers/common/email.helper.js` - Email utilities
- ✅ `helpers/external/` - AI & notification integrations
- ✅ `helpers/generators/` - Content generators
- ✅ `middleware/auth.middleware.js` - JWT auth
- ✅ `middleware/cors.middleware.js` - CORS handler
- ✅ `middleware/error.middleware.js` - Error handling
- ✅ `middleware/validation.middleware.js` - Request validation
- ✅ `middleware/domain.middleware.js` - Domain config
- ✅ `middleware/logger.middleware.js` - Request logging

---

## ✅ Step 2: Refactor Existing Modules

### Module refactor priority:

1. **Auth Module** (Most critical)
   - Extract login/register into `controllers/auth/`
   - Create `services/auth.service.js`
   - Create `validators/auth.validator.js`

2. **User Module** (Already have template)
   - Use template as reference
   - Move logic from `app/controllers/user.controller.js`

3. **Post Module**
   - Follow User module pattern
   - Handle slug generation, tagging

4. **Order Module**
   - Complex business logic
   - Integration with payment, notifications

5. **Other modules**
   - Image, Comment, Traffic, Dashboard, etc.

---

## 👉 Action Items

### 1️⃣ Create Auth Module (Priority)

**File: `services/auth.service.js`** (NEW)

```javascript
import UserRepository from "../repositories/user.repository.js";
import jwt from "jsonwebtoken";

class AuthService {
  constructor() {
    this.userRepo = new UserRepository();
  }

  async login(email, password) {
    const user = await this.userRepo.findByEmail(email);
    if (!user) throw new Error("Invalid credentials");

    const isValid = await user.comparePassword(password);
    if (!isValid) throw new Error("Invalid credentials");

    const token = this.generateToken(user);
    return { user, token };
  }

  async register(userData) {
    const existing = await this.userRepo.findByEmail(userData.email);
    if (existing) throw new Error("Email already exists");

    const user = await this.userRepo.create(userData);
    const token = this.generateToken(user);

    return { user, token };
  }

  generateToken(user) {
    return jwt.sign({ userId: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });
  }
}
export default AuthService;
```

**File: `controllers/auth/login.controller.js`** (NEW)

```javascript
import AuthService from "../../services/auth.service.js";

class LoginController {
  constructor() {
    this.authService = new AuthService();
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await this.authService.login(email, password);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
export default LoginController;
```

**File: `routes/v1/auth.route.js`** (NEW)

```javascript
import express from "express";
import LoginController from "../../controllers/auth/login.controller.js";

const router = express.Router();
const loginController = new LoginController();

router.post("/login", loginController.login.bind(loginController));
// router.post("/register", ...);
// router.post("/logout", ...);

export default router;
```

---

### 2️⃣ Create Post Module

**Follow same pattern as User/Auth:**

1. Create `services/post.service.js`
2. Create `repositories/post.repository.js`
3. Refactor `controllers/post.controller.js`
4. Create `validators/post.validator.js`
5. Create `routes/v1/post.route.js`

**Key considerations:**

- Slug generation
- Tag extraction
- SEO metadata
- OpenAI integration
- Content filtering

---

### 3️⃣ Create Order Module

**Follow same pattern:**

1. Create `services/order.service.js`
   - Handle order workflow (pending → assigned → completed)
   - Calculate fares
   - Handle cancellations
2. Create `repositories/order.repository.js`
   - Find active orders
   - Update status
   - Query by driver/customer
3. Refactor `controllers/order.controller.js`
4. Create `validators/order.validator.js`

---

### 4️⃣ Migrate Helpers

**From:**

```
helpers/
  ├── buildPrompt/
  ├── geminiAi/
  ├── openAi/
  ├── discord/
  └── telegram/
```

**To:**

```
helpers/
  ├── generators/
  │   ├── content.generator.js        (import từ buildPrompt/)
  │   ├── prompt.generator.js
  │   └── index.js
  ├── external/
  │   ├── openAi.helper.js            (wrap openAi/)
  │   ├── gemini.helper.js
  │   ├── discord.helper.js
  │   └── telegram.helper.js
  └── common/
      ├── string.helper.js            (tích hợp từ utils/)
      ├── email.helper.js
      └── index.js
```

---

## 📋 Checklist

- [ ] Create Auth module (service, controller, validator, route)
- [ ] Create Post module (follow same pattern)
- [ ] Create Order module (complex, needs careful planning)
- [ ] Refactor Image module
- [ ] Refactor Comment module
- [ ] Refactor Traffic module
- [ ] Refactor Dashboard module
- [ ] Refactor Setting module
- [ ] Refactor ToastMessage module
- [ ] Migrate all helpers to new structure
- [ ] Create tests for each module
- [ ] Update documentation
- [ ] Test all endpoints
- [ ] Deploy to staging
- [ ] Deploy to production

---

## 🎯 Benefits of MVC Structure

✅ **Clear Separation of Concerns**

- Controllers: HTTP handling
- Services: Business logic
- Repositories: Data access
- Validators: Input validation

✅ **Easy to Test**

- Mock services in controller tests
- Mock repositories in service tests
- Unit tests are simpler

✅ **Easy to Maintain**

- Changes in database don't affect controllers
- Business logic changes don't need route updates
- Validation logic centralized

✅ **Easy to Scale**

- Add new modules following same pattern
- Reuse base classes
- Consistent structure

✅ **Production Ready**

- Error handling standardized
- Logging everywhere
- Input validation required
- Type definitions (JSDoc)

---

## 🔗 Reference Files

- [MVC_STRUCTURE_GUIDE.md](MVC_STRUCTURE_GUIDE.md) - Complete structure guide
- [REFACTOR_EXAMPLES.md](REFACTOR_EXAMPLES.md) - Step-by-step examples
- [LOGGING_GUIDE.md](LOGGING_GUIDE.md) - Logging system
- [LOGGING_EXAMPLES.js](LOGGING_EXAMPLES.js) - Logging code examples

---

## 📞 Questions?

Refer to:

1. Template files created in `services/`, `repositories/`, `controllers/`
2. Documentation files above
3. Examples in `REFACTOR_EXAMPLES.md`

---

**Remember:**

- Start with critical modules (Auth, User)
- Follow the pattern consistently
- Test each module before moving to next
- Keep old code until new one is stable
- Gradually migrate, don't rush

Happy Refactoring! 🚀

---

Generated: 2026-03-08
