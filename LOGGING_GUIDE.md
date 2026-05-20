# 📊 Logging System - Production Monitoring Guide

## 🎯 **Tổng quan Logging System**

Backend hiện tại có logging chi tiết cho production debugging:

### **File logs được tạo**

```
logs/
  ├── info.log          # Thông tin chung
  ├── warn.log          # Cảnh báo
  ├── error.log         # Lỗi server
  ├── cors.log          # CORS requests/blocks
  ├── domain.log        # Domain config issues
  ├── database.log      # Database connections
  ├── request.log       # HTTP requests (method, path, status, duration)
  ├── auth.log          # Authentication attempts
  └── server.log        # Server lifecycle events
```

---

## 📝 **Log Format**

Mỗi log entry là JSON format:

```json
{
  "timestamp": "2026-03-08T10:30:45.123Z",
  "level": "ERROR|INFO|WARN",
  "message": "Chi tiết sự kiện",
  "data": {
    "field1": "value1",
    "field2": "value2"
  },
  "env": "production|development",
  "pid": 12345
}
```

---

## 🔍 **Các loại Log chi tiết**

### **1. CORS Logs** (`cors.log`)

**Khi:** Request bị block hoặc allow từ origin khác nhau

```
✅ [CORS] CORS ALLOWED from https://datxetietkiem.com
🚫 [CORS] CORS BLOCKED from https://unknown-domain.com
```

**Log data:**

- `action`: "ALLOWED" | "BLOCKED"
- `origin`: Domain nguồn
- `allowed`: true | false

**Use case:** Xác định frontend domain nào bị block

---

### **2. Domain Logs** (`domain.log`)

**Khi:** Domain config được load hoặc không tìm thấy

#### Khi config thành công:

```
🌐 [DOMAIN] Config Loaded: datxetietkiem.com
```

#### Khi config failed:

```
⚠️  [DOMAIN] CONFIG_NOT_FOUND
  - original: www.datxetietkiem.com
  - normalized: datxetietkiem.com
  - availableDomains: [...]
```

**Use case:** Xác định domain nào chưa được config

---

### **3. Database Logs** (`database.log`)

**Khi:** Kết nối hoặc mất kết nối database

```
🗄️  [DB] CONNECTED: datxetietkiem.com (245ms)
```

**Log data:**

- `domain`: Domain tương ứng
- `duration`: Thời gian kết nối
- Error details nếu fail

**Use case:** Monitor database performance, connection issues

---

### **4. Request Logs** (`request.log`)

**Khi:** Mỗi HTTP request hoàn thành

#### Successful request:

```
✅ [200] GET /api/posts (156ms)
```

#### Client error:

```
🟡 [400] POST /api/user (89ms)
```

#### Server error:

```
❌ [500] DELETE /api/post/123 (2456ms)
```

**Log data:**

- `method`: HTTP method
- `path`: Request path
- `statusCode`: Response status
- `duration`: Milliseconds
- `ip`: Client IP
- `origin`: Referer
- `userAgent`: Browser/client info

**Use case:** Track slow requests, frequent errors, abnormal traffic

---

### **5. Error Logs** (`error.log`)

**Khi:** Exception hoặc error xảy ra

```
❌ [ERROR] DATABASE_CONNECTION_FAILED
  - domain: taxinhanh247.pro.vn
  - error: ECONNREFUSED
  - errorCode: "ECONNREFUSED"
  - ip: 192.168.1.1
```

**Log data:**

- Stack trace
- Error code
- Request details (path, method, IP)

**Use case:** Root cause analysis, debugging issues

---

### **6. Auth Logs** (`auth.log`)

**Khi:** Login, token verification, auth failures

```
🔓 [AUTH] Login - User: user@domain.com (Success)
🔒 [AUTH] Token Verification - User: 123 (Failed)
```

**Use case:** Security monitoring, suspicious login attempts

---

### **7. Server Logs** (`server.log`)

**Khi:** Server startup, shutdown, lifecycle events

```
🚀 [SERVER] STARTUP: Node environment: production
🚀 [SERVER] STARTED: Server is running on port 3002
```

**Use case:** Identify restarts, deployments, runtime issues

---

## 🛠️ **Cách sử dụng Logger trong code**

### **Trong file khác (controllers, services, etc.)**

```javascript
import logger from "./helpers/logger.js";

// Info log
logger.info("Bắt đầu xử lý", { userId: 123, action: "create_post" });

// Warning log
logger.warn("User không tìm thấy", { userId: 999 });

// Error log
logger.error("Gửi email failed", error, { email: "user@domain.com" });

// CORS log
logger.cors("ALLOWED", "https://domain.com", true);

// Domain log
logger.domain("CONFIG_LOADED", { domain: "datxetietkiem.com" });

// Database log
logger.database("CONNECTED", { domain: "datxetietkiem.com", duration: "245ms" });

// Request log
logger.request("GET", "/api/posts", 200, 156, { ip: "192.168.1.1" });

// Auth log
logger.auth("Login", "user@domain.com", true, { method: "jwt" });

// Server log
logger.server("STARTUP", "Config loaded", { configCount: 8 });
```

---

## 📊 **Monitoring & Analysis**

### **Real-time monitoring**

```bash
# Watch logs in real-time
tail -f logs/error.log

# Count errors by type
grep -o '"error":"[^"]*"' logs/error.log | sort | uniq -c | sort -rn
```

### **Check specific domain issues**

```bash
# Domain errors
grep "datxetietkiem.com" logs/domain.log

# CORS blocks for domain
grep "datxetietkiem.com" logs/cors.log | grep "BLOCKED"
```

### **Performance analysis**

```bash
# Find slow requests (> 1000ms)
jq 'select(.data.duration > 1000)' logs/request.log

# Count requests by status code
grep '"statusCode"' logs/request.log | grep -o '"statusCode":[0-9]*' | sort | uniq -c
```

### **Error analysis**

```bash
# Top 10 most common errors
jq '.message' logs/error.log | sort | uniq -c | sort -rn | head -10

# Errors from specific IP
grep "192.168.1.1" logs/error.log
```

---

## ⚙️ **Configuration & Control**

### **Logs chỉ được tạo ở Production**

```javascript
// In logger.js
if (process.env.NODE_ENV === "production") {
  writeToFile("error.log", logData);  // Chỉ production
}

// Console logs xuất hiện cả development lẫn production
console.log(...)  // Luôn in ra
```

### **Kích hoạt Production Mode**

```bash
# .env file
NODE_ENV=production

# Hoặc command line
NODE_ENV=production npm start
```

### **Rotate logs** (tùy chọn - có thể thêm)

```bash
# Cài đặt logrotate trên server
# Sẽ tự động compress, rotate, delete old logs
```

---

## 🎯 **Best Practices**

### **1. Thêm logging khi xử lý business logic**

```javascript
// ✅ Good
logger.info("Processing order", { orderId: 123, status: "pending" });
try {
  // ... process order
  logger.info("Order processed", { orderId: 123, status: "completed" });
} catch (err) {
  logger.error("Order processing failed", err, { orderId: 123 });
}

// ❌ Avoid
console.log("Order processing..."); // Không có context
```

### **2. Log informative data**

```javascript
// ✅ Good - Có đủ context để debug
logger.error("User not found", err, {
  userId: req.params.userId,
  domain: req.app.locals.config?.DOMAIN,
  ip: req.ip,
});

// ❌ Avoid - Không có context
logger.error("Error:", err);
```

### **3. Avoid logging sensitive data**

```javascript
// ❌ Bad
logger.info("User login", {
  email: "user@domain.com",
  password: "secret123", // ← Never!
});

// ✅ Good
logger.info("User login", {
  email: "user@domain.com",
  timestamp: new Date().toISOString(),
});
```

### **4. Use appropriate log levels**

- **INFO**: Normal operation, successful actions
- **WARN**: Unexpected but recoverable situations
- **ERROR**: Failures that need attention

---

## 📈 **Monitoring Stack** (Optional)

Có thể integrate với:

- **PM2**: Process management + monitoring
- **Sentry**: Error tracking
- **ELK Stack**: Elasticsearch + Logstash + Kibana
- **DataDog**: APM + logging
- **Papertrail**: Log aggregation

---

## 🚨 **Alert Triggers** (Recommendations)

Nên cảnh báo khi:

- ❌ More than 10 CORS blocks trong 5 phút
- ❌ More than 5 DATABASE connection failures trong 10 phút
- ❌ More than 20 HTTP 500 errors trong 5 phút
- ❌ Average request duration > 5 seconds
- ❌ More than 3 failed login attempts từ cùng IP

---

Generated: 2026-03-08
