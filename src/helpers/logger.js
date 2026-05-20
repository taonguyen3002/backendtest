import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Tạo logs directory nếu không tồn tại
const logsDir = path.join(__dirname, "../../logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Format timestamp
const getTimestamp = () => {
  return new Date().toISOString();
};

// Format log message
const formatLog = (level, message, data = {}) => {
  return {
    timestamp: getTimestamp(),
    level,
    message,
    data,
    env: process.env.NODE_ENV || "development",
    pid: process.pid,
  };
};

// Ghi log vào file
const writeToFile = (filename, logData) => {
  const filePath = path.join(logsDir, filename);
  const logLine = JSON.stringify(logData) + "\n";

  fs.appendFile(filePath, logLine, (err) => {
    if (err) {
      console.error("Failed to write log file:", err);
    }
  });
};

// Logger object
const logger = {
  // Info log
  info: (message, data = {}) => {
    const logData = formatLog("INFO", message, data);
    console.log(`📘 [INFO] ${message}`, data);
    if (process.env.NODE_ENV === "production") {
      writeToFile("info.log", logData);
    }
  },

  // Warning log
  warn: (message, data = {}) => {
    const logData = formatLog("WARN", message, data);
    console.warn(`⚠️  [WARN] ${message}`, data);
    if (process.env.NODE_ENV === "production") {
      writeToFile("warn.log", logData);
    }
  },

  // Error log
  error: (message, error, data = {}) => {
    const errorData = {
      ...data,
      error: {
        message: error?.message || String(error),
        stack: error?.stack || undefined,
        code: error?.code || undefined,
      },
    };
    const logData = formatLog("ERROR", message, errorData);
    console.error(`❌ [ERROR] ${message}`, errorData);
    if (process.env.NODE_ENV === "production") {
      writeToFile("error.log", logData);
    }
  },

  // CORS specific log
  cors: (action, origin, allowed) => {
    const message = allowed ? "CORS ALLOWED" : "CORS BLOCKED";
    const level = allowed ? "INFO" : "WARN";
    const logData = formatLog(level, message, {
      action,
      origin,
      allowed,
      timestamp: getTimestamp(),
    });
    if (allowed) {
      console.log(`✅ [CORS] ${message} from ${origin}`);
    } else {
      console.warn(`🚫 [CORS] ${message} from ${origin}`);
    }
    if (process.env.NODE_ENV === "production") {
      writeToFile("cors.log", logData);
    }
  },

  // Domain config log

  domain: (action, domainInfo) => {
    const logData = formatLog("INFO", `Domain Config: ${action}`, domainInfo);
    console.log(`🌐 [DOMAIN] ${action}`, domainInfo);
    if (process.env.NODE_ENV === "production") {
      writeToFile("domain.log", logData);
    }
  },

  //   // Database log

  database: (action, dbInfo) => {
    const logData = formatLog("INFO", `Database: ${action}`, dbInfo);
    console.log(`🗄️  [DB] ${action}`, dbInfo);
    if (process.env.NODE_ENV === "production") {
      writeToFile("database.log", logData);
    }
  },

  // Request log

  request: (method, path, statusCode, duration, data = {}) => {
    const status = statusCode >= 400 ? "ERROR" : "SUCCESS";
    const logData = formatLog("INFO", `${method} ${path}`, {
      method,
      path,
      statusCode,
      duration: `${duration}ms`,
      ...data,
    });
    const emoji = statusCode >= 400 ? "❌" : statusCode >= 300 ? "🟡" : "✅";
    console.log(`${emoji} [${statusCode}] ${method} ${path} (${duration}ms)`);
    if (process.env.NODE_ENV === "production") {
      writeToFile("request.log", logData);
    }
  },

  // Authentication log
  auth: (action, userId, success, data = {}) => {
    const level = success ? "INFO" : "WARN";
    const logData = formatLog(level, `Auth: ${action}`, {
      action,
      userId,
      success,
      ...data,
    });
    const emoji = success ? "🔓" : "🔒";
    console.log(`${emoji} [AUTH] ${action} - User: ${userId} (${success ? "Success" : "Failed"})`);
    if (process.env.NODE_ENV === "production") {
      writeToFile("auth.log", logData);
    }
  },

  // Server lifecycle log
  server: (action, message, data = {}) => {
    const logData = formatLog("INFO", `Server: ${action}`, { message, ...data });
    console.log(`🚀 [SERVER] ${action}: ${message}`, data);
    if (process.env.NODE_ENV === "production") {
      writeToFile("server.log", logData);
    }
  },
};

export default logger;
