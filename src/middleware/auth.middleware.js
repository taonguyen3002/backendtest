/**
 * Auth Middleware
 * JWT verification (tách từ checkToken.js)
 */

import jwt from "jsonwebtoken";
import logger from "../helpers/logger.js";

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const token = authHeader.split(" ")[1];
    const { JWT_SECRET } = req.app.locals.config;

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;

      logger.auth("TOKEN_VERIFIED", decoded.userId, true);
      next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        logger.warn("Token expired", { userId: decoded?.userId });
        return res.status(401).json({
          success: false,
          message: "Token expired",
        });
      }

      logger.warn("Invalid token", { error: error.message });
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }
  } catch (error) {
    logger.error("Auth middleware error", error);
    next(error);
  }
};

// Optional: Admin check
export const authAdmin = (req, res, next) => {
  auth(req, res, () => {
    if (req.user?.role === "admin") {
      next();
    } else {
      logger.warn("Unauthorized admin access", { userId: req.user?.userId });
      res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }
  });
};

export default auth;
