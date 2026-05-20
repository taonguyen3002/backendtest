import express from "express";
import morgan from "morgan";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "url";

import route from "./routes/index.route.js";
import { configPerDomain } from "./middleware/configPerDomain.js";
import logger from "./helpers/logger.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3002;

// Log server startup
logger.server("STARTUP", `Node environment: ${process.env.NODE_ENV || "development"}`);
logger.server("STARTUP", `Server port: ${port}`);

// Lấy __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Trust proxy (nếu dùng nginx / proxy)
app.set("trust proxy", true);

// ⏱ Timeout cho toàn bộ request (5 phút)
app.use((req, res, next) => {
  res.setTimeout(18000000, () => {
    console.error("⏱ Request timeout.");
    if (!res.headersSent) {
      res.status(408).json({ message: "Request Timeout" });
    }
  });
  next();
});

// Middleware parse body trước tiên
app.use(express.json({ limit: "50mb" }));
app.use(
  express.urlencoded({
    extended: true,
    limit: "50mb",
  }),
);
//CORS
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // Cho phép Postman/cURL

      const allowedOrigins = [
        // localhost
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:5173", // Vite development
        "http://localhost:5174",

        // datxetietkiem.com
        "https://datxetietkiem.com",
        "https://www.datxetietkiem.com",

        // taxinhanh247.pro.vn
        "https://taxinhanh247.pro.vn",
        "https://www.taxinhanh247.pro.vn",

        // datxenhanh-24h.pro.vn
        "https://datxenhanh-24h.pro.vn",
        "https://www.datxenhanh-24h.pro.vn",

        // taxisieure.com
        "https://taxisieure.com",
        "https://www.taxisieure.com",

        // hotrodatxesieure.com
        "https://hotrodatxesieure.com",
        "https://www.hotrodatxesieure.com",

        // tongdatdatxe24gio.top
        "https://tongdatdatxe24gio.top",
        "https://www.tongdatdatxe24gio.top",
      ];

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        logger.cors("BLOCKED", origin, false);
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "Authorization"],
    exposedHeaders: ["X-Total-Count", "X-Page-Count"], // Nếu API trả về headers này
    maxAge: 86400, // 24 hours
  }),
);
// Cookie parser
app.use(cookieParser());

// Static file
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Middleware config domain (sau khi đã parse JSON & cors)
app.use(configPerDomain);

// Logging (Morgan)
const morganFormat =
  ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" - :response-time ms';
app.use(morgan(morganFormat));
// Routes
route(app);

// Middleware bắt lỗi đặt CUỐI CÙNG
app.use((err, req, res, next) => {
  const error = {
    message: err.message || "Unknown error",
    status: err.status || 500,
    path: req.path,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString(),
  };

  // Log chi tiết error
  logger.error(`${err.status || 500} - ${req.method} ${req.path}`, err, {
    path: req.path,
    method: req.method,
    ip: req.ip,
    headers: {
      origin: req.headers.origin,
      referer: req.headers.referer,
    },
  });

  res.status(error.status).json({
    message: err.message || "Lỗi server",
    error: process.env.NODE_ENV === "production" ? undefined : err.message,
  });
});

// Start server
app.listen(port, () => {
  logger.server("STARTED", `Server is running`, {
    port,
    env: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});
