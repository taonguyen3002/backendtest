# Hướng Dẫn Sử Dụng API V1

Tài liệu này cung cấp hướng dẫn chi tiết về cách sử dụng các endpoint của API V1 cho dự án Taxi Nhanh 247.

**Base URL**: `/api/v1`

---

## Mục Lục

1. [Xác Thực (Authentication)](#xác-thực-authentication)
2. [Người Dùng (Users)](#người-dùng-users)
3. [Bài Viết (Posts)](#bài-viết-posts)
4. [Đơn Hàng (Orders)](#đơn-hàng-orders)
5. [Bình Luận (Comments)](#bình-luận-comments)
6. [Hình Ảnh (Images)](#hình-ảnh-images)

---

## Xác Thực (Authentication)

### 1. Yêu Cầu OTP

**Endpoint**: `POST /api/v1/auth/request-otp`

Gửi mã OTP đến số điện thoại của người dùng để xác thực.

**Request Body**:

```json
{
  "phone": "0987654321"
}
```

**Response**:

```json
{
  "success": true,
  "message": "Mã OTP đã được gửi",
  "requestId": "req_123456"
}
```

---

### 2. Đăng Ký Tài Khoản

**Endpoint**: `POST /api/v1/auth/register`

Tạo tài khoản người dùng mới.

**Request Body**:

```json
{
  "phone": "0987654321",
  "password": "passwordString123",
  "fullName": "Nguyễn Văn A",
  "otp": "123456"
}
```

**Response**:

```json
{
  "success": true,
  "message": "Đăng ký thành công",
  "user": {
    "_id": "user_id",
    "phone": "0987654321",
    "fullName": "Nguyễn Văn A",
    "role": "user",
    "balance": 0
  },
  "token": "jwt_token_here",
  "refreshToken": "refresh_token_here"
}
```

---

### 3. Đăng Nhập

**Endpoint**: `POST /api/v1/auth/login`

Đăng nhập bằng số điện thoại và mật khẩu.

**Request Body**:

```json
{
  "phone": "0987654321",
  "password": "passwordString123"
}
```

**Response**:

```json
{
  "success": true,
  "message": "Đăng nhập thành công",
  "user": {
    "_id": "user_id",
    "phone": "0987654321",
    "fullName": "Nguyễn Văn A",
    "role": "user"
  },
  "token": "jwt_token_here",
  "refreshToken": "refresh_token_here"
}
```

---

### 4. Làm Mới Token

**Endpoint**: `POST /api/v1/auth/refresh-token`

Lấy token mới từ refresh token.

**Request Body**:

```json
{
  "refreshToken": "refresh_token_here"
}
```

**Response**:

```json
{
  "success": true,
  "token": "new_jwt_token",
  "refreshToken": "new_refresh_token"
}
```

---

### 5. Đăng Xuất

**Endpoint**: `POST /api/v1/auth/logout`

Xóa phiên đăng nhập hiện tại.

**Headers**: `Authorization: Bearer {token}`

**Response**:

```json
{
  "success": true,
  "message": "Đăng xuất thành công"
}
```

---

### 6. Xác Minh Token

**Endpoint**: `GET /api/v1/auth/verify`

Kiểm tra tính hợp lệ của token.

**Headers**: `Authorization: Bearer {token}`

**Response**:

```json
{
  "success": true,
  "valid": true,
  "user": {
    "_id": "user_id",
    "phone": "0987654321"
  }
}
```

---

### 7. Lấy Thông Tin Người Dùng Hiện Tại

**Endpoint**: `GET /api/v1/auth/me`

Lấy thông tin chi tiết của người dùng đang đăng nhập.

**Headers**: `Authorization: Bearer {token}`

**Response**:

```json
{
  "success": true,
  "user": {
    "_id": "user_id",
    "phone": "0987654321",
    "fullName": "Nguyễn Văn A",
    "email": "user@example.com",
    "role": "user",
    "balance": 500000,
    "avatar": "url_to_avatar",
    "isActive": true,
    "isVerified": true
  }
}
```

---

### 8. Yêu Cầu Đặt Lại Mật Khẩu

**Endpoint**: `POST /api/v1/auth/request-password-reset`

Gửi link đặt lại mật khẩu đến email.

**Request Body**:

```json
{
  "email": "user@example.com"
}
```

**Response**:

```json
{
  "success": true,
  "message": "Hướng dẫn đặt lại mật khẩu đã được gửi"
}
```

---

### 9. Đặt Lại Mật Khẩu

**Endpoint**: `POST /api/v1/auth/reset-password`

Đặt lại mật khẩu mới.

**Request Body**:

```json
{
  "token": "reset_token_from_email",
  "newPassword": "newPassword123"
}
```

**Response**:

```json
{
  "success": true,
  "message": "Mật khẩu đã được thay đổi thành công"
}
```

---

## Người Dùng (Users)

### 1. Lấy Danh Sách Tất Cả Người Dùng

**Endpoint**: `GET /api/v1/users`

Lấy danh sách tất cả người dùng trong hệ thống.

**Query Parameters**:

- `page`: Số trang (mặc định: 1)
- `limit`: Số bản ghi trên trang (mặc định: 10)

**Headers**: `Authorization: Bearer {token}`

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "_id": "user_id",
      "phone": "0987654321",
      "fullName": "Nguyễn Văn A",
      "role": "user",
      "balance": 500000,
      "isActive": true
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 10
}
```

---

### 2. Lấy Người Dùng Đang Hoạt Động

**Endpoint**: `GET /api/v1/users/filter/active`

Lấy danh sách người dùng đang hoạt động.

**Headers**: `Authorization: Bearer {token}`

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "_id": "user_id",
      "phone": "0987654321",
      "fullName": "Nguyễn Văn A",
      "isActive": true
    }
  ]
}
```

---

### 3. Lấy Người Dùng Theo Vai Trò

**Endpoint**: `GET /api/v1/users/role/:role`

Lấy danh sách người dùng theo vai trò cụ thể (user, driver, admin).

**URL Parameters**:

- `role`: `user` | `driver` | `admin`

**Headers**: `Authorization: Bearer {token}`

---

### 4. Lấy Thông Tin Người Dùng

**Endpoint**: `GET /api/v1/users/:id`

Lấy thông tin chi tiết của một người dùng.

**URL Parameters**:

- `id`: ID của người dùng

**Headers**: `Authorization: Bearer {token}`

**Response**:

```json
{
  "success": true,
  "user": {
    "_id": "user_id",
    "phone": "0987654321",
    "fullName": "Nguyễn Văn A",
    "email": "user@example.com",
    "role": "user",
    "balance": 500000,
    "avatar": "url_to_avatar",
    "isActive": true,
    "isVerified": true,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

### 5. Lấy Hồ Sơ Công Khai

**Endpoint**: `GET /api/v1/users/:id/profile`

Lấy hồ sơ công khai của người dùng (không cần xác thực).

**URL Parameters**:

- `id`: ID của người dùng

**Response**:

```json
{
  "success": true,
  "profile": {
    "fullName": "Nguyễn Văn A",
    "avatar": "url_to_avatar",
    "role": "driver",
    "rating": 4.8,
    "totalRides": 150
  }
}
```

---

### 6. Cập Nhật Hồ Sơ

**Endpoint**: `PUT /api/v1/users/:id`

Cập nhật thông tin hồ sơ người dùng.

**URL Parameters**:

- `id`: ID của người dùng

**Headers**: `Authorization: Bearer {token}`

**Request Body**:

```json
{
  "fullName": "Nguyễn Văn A",
  "email": "newemail@example.com",
  "phone": "0987654321",
  "avatar": "url_to_new_avatar"
}
```

**Response**:

```json
{
  "success": true,
  "message": "Hồ sơ đã được cập nhật",
  "user": {
    "_id": "user_id",
    "fullName": "Nguyễn Văn A",
    "email": "newemail@example.com"
  }
}
```

---

### 7. Cập Nhật Số Dư Tài Khoản

**Endpoint**: `PUT /api/v1/users/:id/balance`

Cập nhật số dư tiền trong tài khoản (chỉ admin).

**URL Parameters**:

- `id`: ID của người dùng

**Headers**: `Authorization: Bearer {admin_token}`

**Request Body**:

```json
{
  "amount": 500000,
  "type": "add" // "add" hoặc "subtract"
}
```

**Response**:

```json
{
  "success": true,
  "message": "Số dư đã được cập nhật",
  "newBalance": 1000000
}
```

---

### 8. Thay Đổi Vai Trò Người Dùng

**Endpoint**: `PUT /api/v1/users/:id/role`

Thay đổi vai trò của người dùng (chỉ admin).

**URL Parameters**:

- `id`: ID của người dùng

**Headers**: `Authorization: Bearer {admin_token}`

**Request Body**:

```json
{
  "role": "driver" // "user" | "driver" | "admin"
}
```

---

### 9. Xác Minh Người Dùng

**Endpoint**: `POST /api/v1/users/:id/verify`

Xác minh tài khoản người dùng.

**URL Parameters**:

- `id`: ID của người dùng

**Headers**: `Authorization: Bearer {admin_token}`

**Response**:

```json
{
  "success": true,
  "message": "Người dùng đã được xác minh"
}
```

---

### 10. Kích Hoạt Tài Khoản

**Endpoint**: `POST /api/v1/users/:id/activate`

Kích hoạt tài khoản đã bị vô hiệu hóa.

**URL Parameters**:

- `id`: ID của người dùng

**Headers**: `Authorization: Bearer {admin_token}`

---

### 11. Vô Hiệu Hóa Tài Khoản

**Endpoint**: `POST /api/v1/users/:id/deactivate`

Vô hiệu hóa tài khoản người dùng.

**URL Parameters**:

- `id`: ID của người dùng

**Headers**: `Authorization: Bearer {admin_token}`

**Request Body**:

```json
{
  "reason": "Vi phạm điều khoản dịch vụ"
}
```

---

### 12. Xóa Người Dùng

**Endpoint**: `DELETE /api/v1/users/:id`

Xóa tài khoản người dùng hoàn toàn (chỉ admin).

**URL Parameters**:

- `id`: ID của người dùng

**Headers**: `Authorization: Bearer {admin_token}`

**Response**:

```json
{
  "success": true,
  "message": "Người dùng đã được xóa"
}
```

---

## Bài Viết (Posts)

### 1. Lấy Tất Cả Bài Viết

**Endpoint**: `GET /api/v1/posts`

Lấy danh sách tất cả bài viết.

**Query Parameters**:

- `page`: Số trang (mặc định: 1)
- `limit`: Số bài viết trên trang (mặc định: 10)
- `status`: `published` | `draft` | `all`

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "_id": "post_id",
      "title": "Tiêu đề bài viết",
      "slug": "tieu-de-bai-viet",
      "content": "Nội dung bài viết...",
      "author": "Tên tác giả",
      "status": "published",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 50,
  "page": 1
}
```

---

### 2. Lấy Bài Viết Gần Đây

**Endpoint**: `GET /api/v1/posts/recent`

Lấy các bài viết được đăng gần đây nhất.

**Query Parameters**:

- `limit`: Số bài viết (mặc định: 5)

---

### 3. Tìm Kiếm Bài Viết

**Endpoint**: `GET /api/v1/posts/search`

Tìm kiếm bài viết theo từ khóa.

**Query Parameters**:

- `q`: Từ khóa tìm kiếm
- `limit`: Số bài viết trả về (mặc định: 10)

**Response**:

```json
{
  "success": true,
  "results": [
    {
      "_id": "post_id",
      "title": "Tiêu đề phù hợp",
      "slug": "tieu-de-phu-hop",
      "excerpt": "Tóm tắt nội dung..."
    }
  ],
  "count": 5
}
```

---

### 4. Lọc Bài Viết

**Endpoint**: `POST /api/v1/posts/filter`

Lọc bài viết theo nhiều tiêu chí.

**Request Body**:

```json
{
  "category": "du-lich",
  "status": "published",
  "year": 2024,
  "sortBy": "createdAt", // "createdAt" hoặc "views"
  "order": "desc",
  "page": 1,
  "limit": 10
}
```

---

### 5. Lấy Bài Viết Theo Tác Giả

**Endpoint**: `GET /api/v1/posts/author/:authorName`

Lấy tất cả bài viết của một tác giả.

**URL Parameters**:

- `authorName`: Tên tác giả

**Query Parameters**:

- `page`: Số trang (mặc định: 1)
- `limit`: Số bài viết trên trang (mặc định: 10)

---

### 6. Tạo Bài Viết Mới

**Endpoint**: `POST /api/v1/posts`

Tạo một bài viết mới.

**Headers**: `Authorization: Bearer {token}`

**Request Body**:

```json
{
  "title": "Tiêu đề bài viết",
  "content": "Nội dung bài viết...",
  "slug": "tieu-de-bai-viet",
  "category": "du-lich",
  "tags": ["tag1", "tag2"],
  "thumbnail": "url_to_image",
  "excerpt": "Tóm tắt bài viết"
}
```

**Response**:

```json
{
  "success": true,
  "message": "Bài viết đã được tạo",
  "post": {
    "_id": "new_post_id",
    "title": "Tiêu đề bài viết",
    "slug": "tieu-de-bai-viet",
    "status": "draft",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

### 7. Lấy Bài Viết Theo ID

**Endpoint**: `GET /api/v1/posts/:id`

Lấy thông tin chi tiết bài viết.

**URL Parameters**:

- `id`: ID của bài viết

**Response**:

```json
{
  "success": true,
  "post": {
    "_id": "post_id",
    "title": "Tiêu đề bài viết",
    "content": "Nội dung đầy đủ...",
    "slug": "tieu-de-bai-viet",
    "author": "Tên tác giả",
    "category": "du-lich",
    "tags": ["tag1", "tag2"],
    "views": 1250,
    "status": "published",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-16T15:20:00Z"
  }
}
```

---

### 8. Lấy Bài Viết Theo Slug

**Endpoint**: `GET /api/v1/posts/slug/:slug`

Lấy bài viết theo slug (thường dùng cho hiển thị trang công khai).

**URL Parameters**:

- `slug`: Slug của bài viết

---

### 9. Cập Nhật Bài Viết

**Endpoint**: `PUT /api/v1/posts/:id`

Cập nhật thông tin bài viết.

**URL Parameters**:

- `id`: ID của bài viết

**Headers**: `Authorization: Bearer {token}`

**Request Body**:

```json
{
  "title": "Tiêu đề mới",
  "content": "Nội dung mới...",
  "category": "du-lich",
  "tags": ["tag1", "tag2"]
}
```

---

### 10. Thay Đổi Slug Bài Viết

**Endpoint**: `PUT /api/v1/posts/:id/slug`

Thay đổi slug của bài viết.

**URL Parameters**:

- `id`: ID của bài viết

**Headers**: `Authorization: Bearer {token}`

**Request Body**:

```json
{
  "newSlug": "tieu-de-bai-viet-moi"
}
```

---

### 11. Xuất Bản Bài Viết

**Endpoint**: `POST /api/v1/posts/:id/publish`

Xuất bản bài viết (đổi trạng thái từ draft sang published).

**URL Parameters**:

- `id`: ID của bài viết

**Headers**: `Authorization: Bearer {token}`

**Request Body**:

```json
{
  "publishDate": "2024-01-15T10:30:00Z"
}
```

---

### 12. Xóa Bài Viết

**Endpoint**: `DELETE /api/v1/posts/:id`

Xóa bài viết.

**URL Parameters**:

- `id`: ID của bài viết

**Headers**: `Authorization: Bearer {token}`

**Response**:

```json
{
  "success": true,
  "message": "Bài viết đã được xóa"
}
```

---

## Đơn Hàng (Orders)

### 1. Lấy Tất Cả Đơn Hàng

**Endpoint**: `GET /api/v1/orders`

Lấy danh sách tất cả đơn hàng.

**Query Parameters**:

- `page`: Số trang (mặc định: 1)
- `limit`: Số đơn hàng trên trang (mặc định: 10)
- `status`: Lọc theo trạng thái

**Headers**: `Authorization: Bearer {token}`

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "_id": "order_id",
      "orderNumber": "ORD-20240115-001",
      "customerId": "customer_id",
      "driverId": "driver_id",
      "totalPrice": 150000,
      "status": "completed",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 100,
  "page": 1
}
```

---

### 2. Lấy Đơn Hàng Đang Chờ

**Endpoint**: `GET /api/v1/orders/pending`

Lấy danh sách các đơn hàng đang chờ xử lý.

**Headers**: `Authorization: Bearer {token}`

---

### 3. Lấy Thống Kê Đơn Hàng

**Endpoint**: `GET /api/v1/orders/stats`

Lấy thống kê tổng hợp về đơn hàng.

**Headers**: `Authorization: Bearer {token}`

**Response**:

```json
{
  "success": true,
  "stats": {
    "totalOrders": 1000,
    "completedOrders": 950,
    "cancelledOrders": 30,
    "pendingOrders": 20,
    "totalRevenue": 50000000,
    "averageOrderValue": 150000
  }
}
```

---

### 4. Tạo Đơn Hàng Mới

**Endpoint**: `POST /api/v1/orders`

Tạo một đơn hàng mới.

**Headers**: `Authorization: Bearer {token}`

**Request Body**:

```json
{
  "pickupLocation": {
    "address": "123 Đường Nguyễn Huệ, Q1, TP.HCM",
    "latitude": 10.7769,
    "longitude": 106.7009
  },
  "dropoffLocation": {
    "address": "456 Đường Trần Hưng Đạo, Q5, TP.HCM",
    "latitude": 10.7598,
    "longitude": 106.6952
  },
  "serviceType": "taxi", // "taxi" hoặc "bike"
  "estimatedPrice": 150000,
  "paymentMethod": "cash" // "cash", "wallet", "card"
}
```

**Response**:

```json
{
  "success": true,
  "message": "Đơn hàng đã được tạo",
  "order": {
    "_id": "order_id",
    "orderNumber": "ORD-20240115-001",
    "status": "pending",
    "estimatedPrice": 150000,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

### 5. Lấy Lịch Sử Đơn Hàng

**Endpoint**: `GET /api/v1/orders/history`

Lấy lịch sử đơn hàng của người dùng hiện tại.

**Query Parameters**:

- `page`: Số trang (mặc định: 1)
- `limit`: Số đơn hàng trên trang (mặc định: 10)

**Headers**: `Authorization: Bearer {token}`

---

### 6. Lấy Chi Tiết Đơn Hàng

**Endpoint**: `GET /api/v1/orders/:id`

Lấy thông tin chi tiết của một đơn hàng.

**URL Parameters**:

- `id`: ID của đơn hàng

**Headers**: `Authorization: Bearer {token}`

**Response**:

```json
{
  "success": true,
  "order": {
    "_id": "order_id",
    "orderNumber": "ORD-20240115-001",
    "customerId": "customer_id",
    "driverId": "driver_id",
    "pickupLocation": {
      /* chi tiết */
    },
    "dropoffLocation": {
      /* chi tiết */
    },
    "totalPrice": 150000,
    "status": "completed",
    "rating": 4.5,
    "estimatedTime": "15 phút",
    "actualTime": "14 phút",
    "createdAt": "2024-01-15T10:30:00Z",
    "completedAt": "2024-01-15T10:45:00Z"
  }
}
```

---

### 7. Cập Nhật Trạng Thái Đơn Hàng

**Endpoint**: `PUT /api/v1/orders/:id/status`

Cập nhật trạng thái của đơn hàng.

**URL Parameters**:

- `id`: ID của đơn hàng

**Headers**: `Authorization: Bearer {token}`

**Request Body**:

```json
{
  "status": "completed", // "pending", "accepted", "in-progress", "completed", "cancelled"
  "note": "Ghi chú về thay đổi trạng thái"
}
```

---

### 8. Hủy Đơn Hàng

**Endpoint**: `POST /api/v1/orders/:id/cancel`

Hủy một đơn hàng.

**URL Parameters**:

- `id`: ID của đơn hàng

**Headers**: `Authorization: Bearer {token}`

**Request Body**:

```json
{
  "reason": "Khách hàng không còn cần dịch vụ",
  "refundMethod": "wallet" // "wallet" hoặc "card"
}
```

**Response**:

```json
{
  "success": true,
  "message": "Đơn hàng đã được hủy",
  "refundAmount": 150000
}
```

---

### 9. Đánh Giá Đơn Hàng

**Endpoint**: `POST /api/v1/orders/:id/rate`

Đánh giá dịch vụ và lái xe sau khi hoàn thành đơn.

**URL Parameters**:

- `id`: ID của đơn hàng

**Headers**: `Authorization: Bearer {token}`

**Request Body**:

```json
{
  "rating": 4.5, // 1-5
  "comment": "Lái xe rất tuyệt vời!",
  "rateDriver": true,
  "rateCleanliness": 4
}
```

---

### 10. Xóa Đơn Hàng

**Endpoint**: `DELETE /api/v1/orders/:id`

Xóa hoàn toàn một đơn hàng (chỉ admin hoặc người tạo).

**URL Parameters**:

- `id`: ID của đơn hàng

**Headers**: `Authorization: Bearer {token}`

---

## Bình Luận (Comments)

### 1. Lấy Bình Luận Của Bai Viết

**Endpoint**: `GET /api/v1/comments/post/:postId`

Lấy tất cả bình luận của một bài viết.

**URL Parameters**:

- `postId`: ID của bài viết

**Query Parameters**:

- `page`: Số trang (mặc định: 1)
- `limit`: Số bình luận trên trang (mặc định: 10)
- `sortBy`: `newest` | `oldest` | `mostLiked`

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "_id": "comment_id",
      "postId": "post_id",
      "userId": "user_id",
      "userName": "Nguyễn Văn A",
      "content": "Bình luận rất tuyệt vời!",
      "likes": 5,
      "replies": 2,
      "status": "approved",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 20,
  "page": 1
}
```

---

### 2. Lấy Luồng Bình Luận

**Endpoint**: `GET /api/v1/comments/:id/thread`

Lấy bình luận và tất cả phản hồi của nó.

**URL Parameters**:

- `id`: ID của bình luận

---

### 3. Lấy Bình Luận Chưa Duyệt

**Endpoint**: `GET /api/v1/comments/pending`

Lấy danh sách bình luận chưa được duyệt (chỉ admin).

**Headers**: `Authorization: Bearer {admin_token}`

**Query Parameters**:

- `page`: Số trang (mặc định: 1)
- `limit`: Số bình luận trên trang (mặc định: 10)

---

### 4. Lấy Thống Kê Bình Luận

**Endpoint**: `GET /api/v1/comments/stats`

Lấy thống kê về bình luận (chỉ admin).

**Headers**: `Authorization: Bearer {admin_token}`

**Response**:

```json
{
  "success": true,
  "stats": {
    "totalComments": 5000,
    "approvedComments": 4900,
    "pendingComments": 50,
    "rejectedComments": 50,
    "averageCommentsPerPost": 10
  }
}
```

---

### 5. Tạo Bình Luận Mới

**Endpoint**: `POST /api/v1/comments`

Tạo một bình luận mới hoặc trả lời một bình luận.

**Headers**: `Authorization: Bearer {token}`

**Request Body**:

```json
{
  "postId": "post_id",
  "content": "Bình luận rất tuyệt vời!",
  "parentCommentId": "parent_comment_id" // Tuỳ chọn, dùng khi là trả lời
}
```

**Response**:

```json
{
  "success": true,
  "message": "Bình luận đã được tạo",
  "comment": {
    "_id": "comment_id",
    "postId": "post_id",
    "content": "Bình luận rất tuyệt vời!",
    "status": "pending",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

### 6. Cập Nhật Bình Luận

**Endpoint**: `PUT /api/v1/comments/:id`

Cập nhật nội dung bình luận.

**URL Parameters**:

- `id`: ID của bình luận

**Headers**: `Authorization: Bearer {token}`

**Request Body**:

```json
{
  "content": "Nội dung bình luận mới"
}
```

---

### 7. Thích Bình Luận

**Endpoint**: `POST /api/v1/comments/:id/like`

Thích hoặc bỏ thích một bình luận.

**URL Parameters**:

- `id`: ID của bình luận

**Headers**: `Authorization: Bearer {token}`

**Request Body**:

```json
{
  "action": "like" // "like" hoặc "unlike"
}
```

---

### 8. Duyệt Bình Luận

**Endpoint**: `POST /api/v1/comments/:id/approve`

Duyệt một bình luận (chỉ admin).

**URL Parameters**:

- `id`: ID của bình luận

**Headers**: `Authorization: Bearer {admin_token}`

---

### 9. Từ Chối Bình Luận

**Endpoint**: `DELETE /api/v1/comments/:id/reject`

Từ chối một bình luận chưa duyệt (chỉ admin).

**URL Parameters**:

- `id`: ID của bình luận

**Headers**: `Authorization: Bearer {admin_token}`

**Request Body**:

```json
{
  "reason": "Nội dung không phù hợp"
}
```

---

### 10. Xóa Bình Luận

**Endpoint**: `DELETE /api/v1/comments/:id`

Xóa một bình luận.

**URL Parameters**:

- `id`: ID của bình luận

**Headers**: `Authorization: Bearer {token}`

**Response**:

```json
{
  "success": true,
  "message": "Bình luận đã được xóa"
}
```

---

## Hình Ảnh (Images)

### 1. Lấy Hình Ảnh Công Khai

**Endpoint**: `GET /api/v1/images/public`

Lấy danh sách hình ảnh công khai.

**Query Parameters**:

- `page`: Số trang (mặc định: 1)
- `limit`: Số hình ảnh trên trang (mặc định: 10)
- `sortBy`: `newest` | `trending` | `popular`

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "_id": "image_id",
      "publicId": "public_id",
      "url": "https://...",
      "uploadedBy": "user_name",
      "uploaderId": "user_id",
      "description": "Mô tả hình ảnh",
      "views": 1000,
      "visibility": "public",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 1000,
  "page": 1
}
```

---

### 2. Lấy Thống Kê Hình Ảnh

**Endpoint**: `GET /api/v1/images/stats`

Lấy thống kê về hình ảnh (chỉ admin).

**Headers**: `Authorization: Bearer {admin_token}`

**Response**:

```json
{
  "success": true,
  "stats": {
    "totalImages": 10000,
    "publicImages": 9500,
    "privateImages": 500,
    "averageViewsPerImage": 500,
    "totalStorage": "50 GB"
  }
}
```

---

### 3. Lấy Hình Ảnh Của Người Dùng

**Endpoint**: `GET /api/v1/images/user/:uploaderId`

Lấy tất cả hình ảnh của một người dùng.

**URL Parameters**:

- `uploaderId`: ID của người dùng đã tải lên

**Query Parameters**:

- `page`: Số trang (mặc định: 1)
- `limit`: Số hình ảnh trên trang (mặc định: 10)

**Headers**: `Authorization: Bearer {token}`

---

### 4. Lấy Thông Tin Bộ Nhớ Người Dùng

**Endpoint**: `GET /api/v1/images/storage/:uploaderId`

Lấy thông tin dung lượng lưu trữ của người dùng.

**URL Parameters**:

- `uploaderId`: ID của người dùng

**Headers**: `Authorization: Bearer {token}`

**Response**:

```json
{
  "success": true,
  "storage": {
    "used": 2500, // MB
    "limit": 10000, // MB
    "remaining": 7500,
    "percentage": 25
  }
}
```

---

### 5. Tạo/Tải Lên Hình Ảnh

**Endpoint**: `POST /api/v1/images`

Tải lên một hình ảnh mới.

**Headers**:

- `Authorization: Bearer {token}`
- `Content-Type: multipart/form-data`

**Form Data**:

```
file: [image file]
description: "Mô tả hình ảnh"
visibility: "public" (hoặc "private")
tags: ["tag1", "tag2"]
```

**Response**:

```json
{
  "success": true,
  "message": "Hình ảnh đã được tải lên",
  "image": {
    "_id": "image_id",
    "publicId": "public_id",
    "url": "https://...",
    "size": 2048576,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

### 6. Tìm Kiếm Hình Ảnh

**Endpoint**: `POST /api/v1/images/search`

Tìm kiếm hình ảnh theo tiêu chí.

**Headers**: `Authorization: Bearer {token}`

**Request Body**:

```json
{
  "query": "đây là nội dung tìm kiếm",
  "tags": ["tag1", "tag2"],
  "uploadedBy": "tên người dùng",
  "visibility": "public",
  "sortBy": "newest",
  "page": 1,
  "limit": 10
}
```

---

### 7. Xóa Hàng Loạt Hình Ảnh

**Endpoint**: `POST /api/v1/images/bulk-delete`

Xóa nhiều hình ảnh cùng một lúc.

**Headers**: `Authorization: Bearer {token}`

**Request Body**:

```json
{
  "imageIds": ["image_id_1", "image_id_2", "image_id_3"]
}
```

**Response**:

```json
{
  "success": true,
  "message": "3 hình ảnh đã được xóa",
  "deleted": 3
}
```

---

### 8. Lấy Chi Tiết Hình Ảnh

**Endpoint**: `GET /api/v1/images/:id`

Lấy thông tin chi tiết của một hình ảnh.

**URL Parameters**:

- `id`: ID của hình ảnh

**Response**:

```json
{
  "success": true,
  "image": {
    "_id": "image_id",
    "publicId": "public_id",
    "url": "https://...",
    "description": "Mô tả hình ảnh",
    "uploadedBy": "user_name",
    "uploaderId": "user_id",
    "size": 2048576,
    "views": 1000,
    "tags": ["tag1", "tag2"],
    "visibility": "public",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

### 9. Lấy Hình Ảnh Theo Public ID

**Endpoint**: `GET /api/v1/images/public/:publicId`

Lấy hình ảnh công khai theo public ID.

**URL Parameters**:

- `publicId`: Public ID của hình ảnh

---

### 10. Cập Nhật Hình Ảnh

**Endpoint**: `PUT /api/v1/images/:id`

Cập nhật thông tin hình ảnh.

**URL Parameters**:

- `id`: ID của hình ảnh

**Headers**: `Authorization: Bearer {token}`

**Request Body**:

```json
{
  "description": "Mô tả mới",
  "tags": ["tag1_new", "tag2_new"]
}
```

---

### 11. Thay Đổi Tầm Nhìn Hình Ảnh

**Endpoint**: `PUT /api/v1/images/:id/visibility`

Thay đổi hình ảnh từ công khai sang riêng tư hoặc ngược lại.

**URL Parameters**:

- `id`: ID của hình ảnh

**Headers**: `Authorization: Bearer {token}`

**Request Body**:

```json
{
  "visibility": "private" // "public" hoặc "private"
}
```

---

### 12. Xóa Hình Ảnh

**Endpoint**: `DELETE /api/v1/images/:id`

Xóa một hình ảnh.

**URL Parameters**:

- `id`: ID của hình ảnh

**Headers**: `Authorization: Bearer {token}`

**Response**:

```json
{
  "success": true,
  "message": "Hình ảnh đã được xóa"
}
```

---

## Các Mã Lỗi Thường Gặp

| Mã      | Ý Nghĩa                                             |
| ------- | --------------------------------------------------- |
| **200** | Thành công                                          |
| **201** | Tạo mới thành công                                  |
| **400** | Yêu cầu không hợp lệ (dữ liệu lỗi, thiếu tham số)   |
| **401** | Chưa xác thực (thiếu token hoặc token không hợp lệ) |
| **403** | Từ chối truy cập (không có quyền hạn)               |
| **404** | Không tìm thấy tài nguyên                           |
| **409** | Xung đột (dữ liệu đã tồn tại)                       |
| **422** | Dữ liệu không được xác nhận                         |
| **429** | Quá nhiều yêu cầu (rate limiting)                   |
| **500** | Lỗi máy chủ nội bộ                                  |
| **503** | Dịch vụ không khả dụng                              |

---

## Cách Sử Dụng Token

### Thêm Token Vào Request

Đối với các endpoint yêu cầu xác thực, bạn cần thêm header `Authorization`:

```
Authorization: Bearer <token>
```

**Ví dụ sử dụng cURL**:

```bash
curl -X GET http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Ví dụ sử dụng Fetch API**:

```javascript
fetch("/api/v1/auth/me", {
  method: "GET",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
})
  .then((res) => res.json())
  .then((data) => console.log(data));
```

**Ví dụ sử dụng Axios**:

```javascript
axios
  .get("/api/v1/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  .then((res) => console.log(res.data))
  .catch((err) => console.error(err));
```

---

## Ví Dụ Thực Tế

### 1. Flow Đăng Ký và Đăng Nhập

```
1. Người dùng nhấn "Đăng Ký"
   ↓
2. POST /api/v1/auth/request-otp (phone)
   ↓
3. Người dùng nhập mã OTP
   ↓
4. POST /api/v1/auth/register (phone, password, otp, fullName)
   ↓
5. Nhận token và refreshToken
   ↓
6. Lưu token vào localStorage
```

### 2. Flow Tạo Đơn Hàng

```
1. Người dùng nhập địa chỉ đón và trả
   ↓
2. POST /api/v1/orders (pickupLocation, dropoffLocation, serviceType, paymentMethod)
   ↓
3. Nhìn thấy giá ước tính
   ↓
4. Xác nhận tạo đơn hàng
   ↓
5. Đơn hàng được tạo với status = "pending"
   ↓
6. Chờ lái xe chấp nhận
   ↓
7. Lái xe chọn → status = "accepted"
   ↓
8. Lái xe bắt đầu chuyến → status = "in-progress"
   ↓
9. Chuyến hoàn thành → status = "completed"
```

---

## Lưu Ý Quan Trọng

1. **Headers cần thiết**:
   - Luôn thêm `Content-Type: application/json` khi gửi JSON
   - Thêm `Authorization: Bearer {token}` cho các endpoint bảo mật

2. **Xử lý Lỗi**:
   - Kiểm tra response status code
   - Kiểm tra trường `success` trong response body
   - Ghi lại message lỗi để debug

3. **Rate Limiting**:
   - API có giới hạn 100 yêu cầu/phút per IP
   - Nếu nhận được 429, hãy chờ trước khi thử lại

4. **Token**:
   - Token hết hạn sau 1 giờ
   - Sử dụng refresh token để lấy token mới
   - Lưu token an toàn, không commit vào repository

5. **Pagination**:
   - Mặc định `page = 1` và `limit = 10`
   - Max limit là 100

---

Tài liệu này được cập nhật lần cuối vào **15/01/2024**.
Để biết thêm chi tiết, vui lòng liên hệ với team phát triển backend.
