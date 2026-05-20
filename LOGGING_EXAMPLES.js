// QUICK START - Cách sử dụng Logger trong Controllers & Services

// ============================================
// 1. Import logger ở đầu file
// ============================================
import logger from "../helpers/logger.js";

// ============================================
// 2. VÍ DỤ 1: User Controller
// ============================================
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const userId = "user_123"; // Sau khi verify

    logger.info("User login attempt", {
      email,
      ip: req.ip,
      timestamp: new Date().toISOString(),
    });

    // ... xử lý login logic ...

    if (!user) {
      logger.auth("LOGIN", email, false, {
        reason: "Invalid credentials",
        ip: req.ip,
      });
      return res.status(401).json({ message: "Invalid credentials" });
    }

    logger.auth("LOGIN", email, true, {
      userId,
      ip: req.ip,
    });

    res.json({ message: "Login successful", userId });
  } catch (error) {
    logger.error("Login failed", error, {
      email: req.body.email,
      ip: req.ip,
      path: req.path,
    });
    next(error);
  }
};

// ============================================
// 3. VÍ DỤ 2: Post Controller (Create)
// ============================================
export const createPost = async (req, res, next) => {
  try {
    const { title, content } = req.body;
    const userId = req.user.id;
    const domain = req.app.locals.config?.DOMAIN;

    logger.info("Creating post", {
      userId,
      title: title.substring(0, 50),
      domain,
    });

    // ... xử lý tạo post ...
    const post = { id: "post_456", title, content };

    logger.info("Post created successfully", {
      postId: post.id,
      userId,
      domain,
    });

    res.status(201).json(post);
  } catch (error) {
    logger.error("Failed to create post", error, {
      userId: req.user?.id,
      domain: req.app.locals.config?.DOMAIN,
      ip: req.ip,
    });
    next(error);
  }
};

// ============================================
// 4. VÍ DỤ 3: Order/Booking Controller
// ============================================
export const createOrder = async (req, res, next) => {
  try {
    const { pickupLocation, dropoffLocation, carType } = req.body;
    const userId = req.user.id;
    const domain = req.app.locals.config?.DOMAIN;

    logger.info("Order created", {
      userId,
      carType,
      domain,
      pickupCity: pickupLocation.city,
    });

    // ... xử lý tạo order ...
    const order = { id: "order_789", status: "pending" };

    logger.info("Order confirmed", {
      orderId: order.id,
      userId,
      status: order.status,
    });

    res.json(order);
  } catch (error) {
    logger.error("Order creation failed", error, {
      userId: req.user?.id,
      carType: req.body.carType,
      domain: req.app.locals.config?.DOMAIN,
    });
    next(error);
  }
};

// ============================================
// 5. VÍ DỤ 4: Database Operation
// ============================================
export const getUserById = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const db = req.db;

    const startTime = Date.now();
    logger.info("Fetching user from database", { userId });

    const user = await db.User.findById(userId);
    const duration = Date.now() - startTime;

    if (!user) {
      logger.warn("User not found", {
        userId,
        duration: `${duration}ms`,
        ip: req.ip,
      });
      return res.status(404).json({ message: "User not found" });
    }

    logger.database("QUERY_SUCCESS", {
      operation: "findById",
      collection: "User",
      duration: `${duration}ms`,
      result: "found",
    });

    res.json(user);
  } catch (error) {
    logger.error("Database query failed", error, {
      userId: req.params.userId,
      operation: "User.findById",
      db: req.app.locals.config?.DATABASE_URI?.split("@")[1],
    });
    next(error);
  }
};

// ============================================
// 6. VÍ DỤ 5: External API Call (OpenAI, Gemini)
// ============================================
export const generateContent = async (req, res, next) => {
  try {
    const { prompt } = req.body;
    const domain = req.app.locals.config?.DOMAIN;

    logger.info("Starting content generation", {
      domain,
      promptLength: prompt.length,
    });

    const startTime = Date.now();
    const result = await callOpenAi(prompt);
    const duration = Date.now() - startTime;

    logger.info("Content generated successfully", {
      domain,
      duration: `${duration}ms`,
      outputLength: result.content?.length,
      model: "gpt-3.5-turbo",
    });

    res.json(result);
  } catch (error) {
    logger.error("Content generation failed", error, {
      domain: req.app.locals.config?.DOMAIN,
      apiProvider: "OpenAI",
      promptLength: req.body.prompt?.length,
      errorType: error.name,
    });
    next(error);
  }
};

// ============================================
// 7. VÍ DỤ 6: Email/Notification Service
// ============================================
export const sendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;

    logger.info("Sending OTP", {
      email,
      method: "email",
    });

    const startTime = Date.now();
    await sendOtpEmail(email);
    const duration = Date.now() - startTime;

    logger.info("OTP sent successfully", {
      email,
      duration: `${duration}ms`,
      method: "nodemailer",
    });

    res.json({ message: "OTP sent" });
  } catch (error) {
    logger.error("Failed to send OTP", error, {
      email: req.body.email,
      service: "nodemailer",
      smtpServer: "smtp.gmail.com",
    });
    next(error);
  }
};

// ============================================
// 8. VÍ DỤ 7: Search/Filter Operations
// ============================================
export const searchPosts = async (req, res, next) => {
  try {
    const { keyword, page = 1, limit = 10 } = req.query;
    const domain = req.app.locals.config?.DOMAIN;

    logger.info("Searching posts", {
      keyword,
      page,
      limit,
      domain,
    });

    const startTime = Date.now();
    const posts = await Post.find({ content: new RegExp(keyword, "i") })
      .limit(limit)
      .skip((page - 1) * limit);
    const duration = Date.now() - startTime;

    logger.info("Search completed", {
      keyword,
      resultsCount: posts.length,
      duration: `${duration}ms`,
      domain,
    });

    res.json(posts);
  } catch (error) {
    logger.error("Search failed", error, {
      keyword: req.query.keyword,
      domain: req.app.locals.config?.DOMAIN,
    });
    next(error);
  }
};

// ============================================
// 9. VÍ DỤ 8: File Upload Handling
// ============================================
export const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      logger.warn("No file provided in upload request", {
        ip: req.ip,
        userId: req.user?.id,
      });
      return res.status(400).json({ message: "No file provided" });
    }

    logger.info("Starting file upload", {
      fileName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
    });

    const startTime = Date.now();
    const uploadedUrl = await uploadToCloudinary(req.file);
    const duration = Date.now() - startTime;

    logger.info("File uploaded successfully", {
      fileName: req.file.originalname,
      url: uploadedUrl.substring(0, 50),
      duration: `${duration}ms`,
      fileSize: req.file.size,
    });

    res.json({ url: uploadedUrl });
  } catch (error) {
    logger.error("File upload failed", error, {
      fileName: req.file?.originalname,
      fileSize: req.file?.size,
      service: "cloudinary",
    });
    next(error);
  }
};

// ============================================
// 10. VÍ DỤ 9: Analytics/Traffic Tracking
// ============================================
export const trackPageView = async (req, res, next) => {
  try {
    const { pageId, referrer } = req.body;
    const domain = req.app.locals.config?.DOMAIN;

    logger.info("Tracking page view", {
      pageId,
      domain,
      referrer,
      userAgent: req.headers["user-agent"]?.substring(0, 50),
    });

    await Traffic.create({
      pageId,
      domain,
      referrer,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
      timestamp: new Date(),
    });

    res.json({ success: true });
  } catch (error) {
    logger.warn("Failed to track page view", {
      pageId: req.body.pageId,
      error: error.message,
    });
    // Không fail request, chỉ warning
    res.json({ success: false });
  }
};

// ============================================
// LOG LEVELS GUIDE
// ============================================
// logger.info()    → Normal operations, successful actions
// logger.warn()    → Warnings, unexpected but recoverable
// logger.error()   → Errors, failures that need attention
// logger.cors()    → CORS requests
// logger.domain()  → Domain configuration
// logger.database()→ Database operations
// logger.request() → HTTP request/response
// logger.auth()    → Authentication
// logger.server()  → Server lifecycle

// ============================================
// BEST PRACTICES
// ============================================
// ✅ DO:
// - Log before/after async operations
// - Include request/user context
// - Log operation duration for performance
// - Log both success and error cases
// - Include domain/environment info
// - Use appropriate log levels

// ❌ DON'T:
// - Don't log passwords, tokens, sensitive data
// - Don't overlog - use purposeful messages
// - Don't catch and swallow errors without logging
// - Don't log entire error objects (parse them)
// - Don't include PII without necessity

// ============================================
// MONITORING LOG FILES
// ============================================
// tail -f logs/error.log              → Watch errors
// grep "domain.com" logs/request.log  → Domain-specific requests
// grep '"statusCode":500' logs/request.log → Server errors
// jq '.data.duration' logs/request.log → Extract response times
