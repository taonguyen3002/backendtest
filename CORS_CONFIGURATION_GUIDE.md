# 📋 CORS Configuration Guide - Multi-Domain Setup

## 🔴 **Vấn đề tìm được và cách sửa**

### 1. **Domain Mismatch (Lỗi chính)**

**Vấn đề:** Khi frontend request từ `www.datxetietkem.com`:

- ✅ CORS middleware allow (có trong whitelist)
- ❌ `configPerDomain` middleware fail (config map key là `datxetietkem.com` không có `www.`)

**Sửa lỗi:**

- Thêm hàm `normalizeDomain()` trong [src/middleware/configPerDomain.js](src/middleware/configPerDomain.js) để loại bỏ `www.` prefix
- Giờ đây: `www.datxetietkem.com` → `datxetietkem.com` ✅

### 2. **Incomplete CORS Whitelist**

**Vấn đề:**

- CORS whitelist có: `https://goixegiare.pro.vn`, `https://xegrabdongnai.pro.vn`
- Nhưng domain config map **KHÔNG CÓ** 2 domain này
- → Request sẽ fail tại `configPerDomain` middleware

**Sửa lỗi:**

- Xóa 2 domain không config khỏi CORS whitelist
- Nếu cần hỗ trợ 2 domain này, thêm vào domain config map trước

### 3. **Missing www. versions**

**Vấn đề:** Domain config map chỉ có non-`www.` versions, nhưng frontend có thể request từ `www.` version

**Sửa lỗi:**

- CORS whitelist giờ có cả `www.` và non-`www.` versions
- Middleware `normalizeDomain()` xử lý chuyển đổi domain keys

---

## 📦 **Domain Configuration Hiện tại**

| Domain                | CORS Whitelist | Domain Config Map | Trạng thái |
| --------------------- | -------------- | ----------------- | ---------- |
| localhost:3000        | ✅             | ✅                | Hoạt động  |
| datxetietkiem.com     | ✅ (+ www.)    | ✅                | Hoạt động  |
| taxinhanh247.pro.vn   | ✅ (+ www.)    | ✅                | Hoạt động  |
| datxenhanh-24h.pro.vn | ✅ (+ www.)    | ✅                | Hoạt động  |
| taxisieure.com        | ✅ (+ www.)    | ✅                | Hoạt động  |
| hotrodatxesieure.com  | ✅ (+ www.)    | ✅                | Hoạt động  |
| tongdatdatxe24gio.top | ✅ (+ www.)    | ✅                | Hoạt động  |

---

## 🚀 **Hướng dẫn thêm Domain mới**

### Bước 1: Thêm vào CORS Whitelist

File: [src/index.js](src/index.js) - tìm phần CORS configuration

```javascript
const allowedOrigins = [
  // ... existing domains ...
  "https://mynewdomain.com",
  "https://www.mynewdomain.com",
];
```

### Bước 2: Thêm vào Domain Config Map

File: [src/configs/domain/index.js](src/configs/domain/index.js)

```javascript
const configMap = {
  // ... existing configs ...
  "mynewdomain.com": {
    DATABASE_URI: process.env.MONGODB_URI_MYNEWDOMAIN,
    DISCORD_WEBHOOK: process.env.DISCORD_WEBHOOK_URL_MYNEWDOMAIN,
    JWT_SECRET: process.env.JWT_SECRET_MYNEWDOMAIN,
    JWT_SECRET_RERESH: process.env.JWT_SECRET_RERESH_MYNEWDOMAIN,
    HOST: process.env.HOST,
    EMAIL_USER: process.env.EMAIL_USER_MYNEWDOMAIN,
    EMAIL_PASS: process.env.EMAIL_PASS_MYNEWDOMAIN,
    DOMAIN: process.env.DOMAIN_MYNEWDOMAIN,
    PROMPT: `... nội dung prompt ...`,
  },
};
```

### Bước 3: Thêm Environment Variables

File: `.env`

```
MONGODB_URI_MYNEWDOMAIN=mongodb://...
DISCORD_WEBHOOK_URL_MYNEWDOMAIN=https://...
JWT_SECRET_MYNEWDOMAIN=your_secret_key
JWT_SECRET_RERESH_MYNEWDOMAIN=your_refresh_secret
EMAIL_USER_MYNEWDOMAIN=user@mynewdomain.com
EMAIL_PASS_MYNEWDOMAIN=password
DOMAIN_MYNEWDOMAIN=https://mynewdomain.com
```

### Bước 4: Khởi động lại server

```bash
npm start
```

---

## ✅ **Testing CORS**

### 1. Test từ Postman / cURL

```bash
curl -X GET http://localhost:3002/api/endpoint \
  -H "Origin: https://datxetietkiem.com"
```

### 2. Check logs

Nếu có lỗi CORS, logs sẽ hiện:

```
❌ CORS blocked: https://unknown-domain.com
⚠️ Domain not found in configMap: www.domain.com
```

### 3. Check Headers khi request

Browser DevTools → Network → Response Headers:

```
access-control-allow-origin: https://datxetietkiem.com
access-control-allow-credentials: true
access-control-expose-headers: X-Total-Count, X-Page-Count
```

---

## 🔧 **Troubleshooting**

### ❌ "Not allowed by CORS" error

**Nguyên nhân:** Frontend domain không có trong CORS whitelist

**Giải pháp:**

1. Kiểm tra exact domain (với/không `www.`)
2. Thêm vào `allowedOrigins` array trong [src/index.js](src/index.js)
3. Restart server

### ❌ "Domain unknown: xxx" error

**Nguyên nhân:** Domain qua CORS nhưng không có trong domain config map

**Giải pháp:**

1. Kiểm tra logs: `⚠️ Domain not found in configMap:`
2. Thêm domain vào config map (Bước 2 ở trên)
3. Thêm env variables tương ứng

### ❌ Port issues

Nếu frontend chạy ở port khác (3001, 5173, etc.):

```javascript
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001", // ← Thêm port mới
  "http://localhost:5173", // ← Vite dev server
];
```

---

## 📝 **Notes**

- **Normalize Domain:** Middleware tự động xóa `www.` prefix khi lookup config
- **Case Insensitive:** Domain được convert thành lowercase
- **Postman/cURL:** Request không có Origin header được allow (test tools)
- **Credentials:** `credentials: true` cho phép cookies được gửi qua CORS requests
- **Maxage:** 24 hours (86400 seconds) - browser cache preflight requests

---

Generated: 2026-03-08
