import configMap from "../configs/domain/index.js";
import { getDbConnection } from "../configs/database/mongoConnectionPool.js";
import logger from "../helpers/logger.js";

// Helper: Normalize domain bằng cách loại bỏ 'www.' prefix
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

  // Normalize domain để xử lý 'www.' prefix
  const normalizedDomain = normalizeDomain(domainKey);
  let config = configMap[normalizedDomain];

  // Nếu không tìm được, log chi tiết cho debugging
  if (!config) {
    logger.domain("CONFIG_NOT_FOUND", {
      original: domainKey,
      normalized: normalizedDomain,
      availableDomains: Object.keys(configMap),
      referer,
      origin,
      host,
      userAgent: req.headers["user-agent"]?.substring(0, 50),
      ip: req.ip,
    });

    return res.status(400).json({
      message: `Domain unknown: ${domainKey}`,
      hint: "Contact administrator to add this domain",
      timestamp: new Date().toISOString(),
    });
  }

  req.app.locals.config = config;

  try {
    req.db = await getDbConnection(config.DATABASE_URI);
    next();
  } catch (err) {
    const errorData = {
      domain: normalizedDomain,
      error: err.message,
      errorCode: err.code,
      errorName: err.name,
      ip: req.ip,
      timestamp: new Date().toISOString(),
    };

    logger.error("DATABASE_CONNECTION_FAILED", err, errorData);

    res.status(500).json({
      message: "Cannot connect to database",
      timestamp: new Date().toISOString(),
    });
  }
}
