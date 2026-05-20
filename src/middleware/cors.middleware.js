/**
 * CORS Middleware
 * Tách CORS configuration từ index.js
 */

import cors from "cors";
import logger from "../helpers/logger.js";

const corsMiddleware = cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // Allow Postman/cURL

    const allowedOrigins = [
      // localhost
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:5173",
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
      logger.cors("ALLOWED", origin, true);
      return callback(null, true);
    } else {
      logger.cors("BLOCKED", origin, false);
      return callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "Authorization"],
  exposedHeaders: ["X-Total-Count", "X-Page-Count"],
  maxAge: 86400,
});

export default corsMiddleware;
