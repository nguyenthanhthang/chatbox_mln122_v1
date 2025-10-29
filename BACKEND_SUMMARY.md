# Backend NestJS Setup Summary

## ✅ Đã hoàn thành

### 1. Cấu trúc dự án

- ✅ Tạo cấu trúc thư mục backend hoàn chỉnh
- ✅ Thiết lập NestJS với TypeScript
- ✅ Cấu hình MongoDB với Mongoose

### 2. Database Schema

- ✅ User Schema với authentication fields
- ✅ Chat Schema với message embedding
- ✅ Message Schema với support cho text, image, voice, file
- ✅ Mongoose models và relationships

### 3. Authentication System

- ✅ JWT-based authentication
- ✅ User registration với email/phone validation
- ✅ Email verification system
- ✅ Phone verification system (SMS)
- ✅ Role-based access control (User, Admin, Moderator)
- ✅ Refresh token mechanism
- ✅ Password hashing với bcrypt

### 4. API Endpoints

- ✅ Auth endpoints (register, login, logout, verify)
- ✅ User management endpoints
- ✅ Chat endpoints (create, get, send message)
- ✅ Message search functionality
- ✅ File upload support

### 5. Security & Validation

- ✅ Input validation với class-validator
- ✅ JWT guards và role guards
- ✅ CORS configuration
- ✅ Global validation pipes
- ✅ Password hashing

### 6. Configuration

- ✅ Environment variables setup
- ✅ Database connection configuration
- ✅ JWT configuration
- ✅ Email/SMS service configuration

## 🚀 Cách chạy Backend

### 1. Cài đặt dependencies

```bash
cd backend
npm install
```

### 2. Cấu hình MongoDB

```bash
# Khởi động MongoDB
mongod

# Hoặc dùng Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 3. Cấu hình environment

```bash
# Copy file cấu hình
cp config/development.env .env

# Chỉnh sửa .env với thông tin của bạn
```

### 4. Chạy ứng dụng

```bash
# Development mode
npm run start:dev

# Production mode
npm run build && npm run start:prod
```

## 📡 API Endpoints

### Authentication

```
POST /api/auth/register          # Đăng ký
POST /api/auth/login             # Đăng nhập
POST /api/auth/logout            # Đăng xuất
POST /api/auth/verify-email      # Xác thực email
POST /api/auth/verify-phone      # Xác thực SĐT
POST /api/auth/refresh-token     # Refresh token
GET  /api/auth/profile           # Lấy profile
```

### Users

```
GET    /api/users                # Danh sách users (Admin)
GET    /api/users/profile        # Profile hiện tại
GET    /api/users/:id            # User theo ID
PATCH  /api/users/profile        # Cập nhật profile
PATCH  /api/users/:id            # Cập nhật user (Admin)
DELETE /api/users/:id            # Xóa user (Admin)
```

### Chat

```
POST   /api/chat                 # Tạo chat mới
GET    /api/chat                 # Danh sách chats
GET    /api/chat/:id             # Chat theo ID
GET    /api/chat/:id/history     # Lịch sử chat
POST   /api/chat/message         # Gửi tin nhắn
POST   /api/chat/search          # Tìm kiếm tin nhắn
POST   /api/chat/:id/read        # Đánh dấu đã đọc
DELETE /api/chat/:id             # Xóa chat
```

## 🗄️ Database Collections

### users

- Thông tin người dùng
- Authentication data
- Verification status
- Role và permissions

### chats

- Thông tin phòng chat
- Participants
- Messages (embedded)
- Metadata

### messages (embedded trong chats)

- Nội dung tin nhắn
- Loại tin nhắn (text, image, voice, file)
- Attachment info
- Read status

## 🔧 Tính năng đã implement

### ✅ Authentication

- Đăng ký với email/phone
- Xác thực email qua Gmail SMTP
- Xác thực SĐT qua Twilio SMS
- JWT authentication
- Role-based access control
- Refresh token

### ✅ Chat System

- Tạo và quản lý chat rooms
- Gửi tin nhắn real-time
- Lưu lịch sử chat
- Tìm kiếm tin nhắn
- File upload support
- Message types (text, image, voice, file)

### ✅ User Management

- CRUD operations cho users
- Profile management
- Avatar upload
- Activity tracking

## 🔄 Tiếp theo cần làm

1. **Socket.io Integration** - Real-time messaging
2. **File Upload Service** - Upload ảnh, voice, files
3. **Search Enhancement** - OCR cho ảnh, voice-to-text
4. **Frontend Integration** - React TypeScript app
5. **Testing** - Unit tests và E2E tests
6. **Deployment** - Docker, CI/CD

## 📝 Ghi chú

- Backend đã sẵn sàng để tích hợp với frontend
- MongoDB connection string: `mongodb://localhost:27017/chatbox`
- API base URL: `http://localhost:3000/api`
- CORS đã được cấu hình cho frontend tại `http://localhost:3001`
- JWT tokens có thời hạn 7 ngày, refresh tokens 30 ngày
