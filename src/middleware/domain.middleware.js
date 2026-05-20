/**
 * Domain Configuration Middleware
 * (từ configPerDomain.js - tác vụ tương tự)
 */

import configMap from "../config/domain/index.js";
import { getDbConnection } from "../config/database/mongoConnectionPool.js";
import logger from "../helpers/logger.js";

// Helper: Normalize domain
function normalizeDomain(domain) {
  if (!domain) return domain;
  return domain.replace(/^www\./, "").toLowerCase();
}

export async function configPerDomain(req, res, next) {
  const { referer, origin, host } = req.headers;
  let domainKey;

  if (referer) {
    try {
      domainKey = new URL(referer).host;
    } catch (err) {
      logger.warn("Invalid referer URL", { referer, error: err.message });
    }
  }

  if (!domainKey && origin) {
    try {
      domainKey = new URL(origin).host;
    } catch (err) {
      logger.warn("Invalid origin URL", { origin, error: err.message });
    }
  }

  if (!domainKey) {
    domainKey = host;
  }

  const normalizedDomain = normalizeDomain(domainKey);
  let config = configMap[normalizedDomain];

  if (!config) {
    logger.domain("CONFIG_NOT_FOUND", {
      original: domainKey,
      normalized: normalizedDomain,
      availableDomains: Object.keys(configMap),
      ip: req.ip,
    });

    return res.status(400).json({
      success: false,
      message: `Domain unknown: ${domainKey}`,
      timestamp: new Date().toISOString(),
    });
  }

  logger.domain("CONFIG_LOADED", {
    domain: normalizedDomain,
    ip: req.ip,
  });

  req.app.locals.config = config;

  try {
    const startTime = Date.now();
    req.db = await getDbConnection(config.DATABASE_URI);
    const duration = Date.now() - startTime;

    logger.database("CONNECTED", {
      domain: normalizedDomain,
      duration: `${duration}ms`,
    });

    next();
  } catch (err) {
    logger.error("DATABASE_CONNECTION_FAILED", err, {
      domain: normalizedDomain,
      errorCode: err.code,
      ip: req.ip,
    });

    res.status(500).json({
      success: false,
      message: "Cannot connect to database",
      timestamp: new Date().toISOString(),
    });
  }
}

export default { configPerDomain };
