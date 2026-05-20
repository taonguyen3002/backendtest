/**
 * Request Logger Middleware
 * Track request/response timing and information
 */

import logger from "../helpers/logger.js";

const requestLoggerMiddleware = (req, res, next) => {
  const startTime = Date.now();
  const { method, path: reqPath, headers } = req;

  const originalEnd = res.end;
  res.end = function (chunk, encoding) {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;

    // Only log non-static files
    if (!reqPath.includes("/uploads") && !reqPath.includes("/static")) {
      logger.request(method, reqPath, statusCode, duration, {
        ip: req.ip,
        origin: headers.origin || headers.referer || "unknown",
        userAgent: headers["user-agent"]?.substring(0, 50) || "unknown",
      });
    }

    originalEnd.call(this, chunk, encoding);
  };

  next();
};

export default requestLoggerMiddleware;
