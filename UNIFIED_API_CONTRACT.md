# Unified API Contract - Frontend/Backend

## ✅ Đã thống nhất

### 1. API Base & Prefix

- **Backend**: Tất cả routes đều có prefix `/api`
- **Frontend**: API base URL = `http://localhost:3000/api`
- **CORS**: Backend cho phép `http://localhost:3001`

### 2. Chat Endpoints Structure

```
POST /api/chat/rooms          - Tạo chat room
GET  /api/chat/rooms          - Lấy danh sách chat rooms
GET  /api/chat/rooms/:id      - Lấy thông tin chat room
DELETE /api/chat/rooms/:id    - Xóa chat room

GET  /api/chat/rooms/:id/history - Lấy lịch sử chat

POST /api/chat/send           - Gửi tin nhắn
POST /api/chat/upload         - Upload file
POST /api/chat/search         - Tìm kiếm tin nhắn

POST /api/chat/rooms/:id/read - Đánh dấu đã đọc
```

### 3. Database Schema

**Quyết định: Tách collection để dễ mở rộng**

#### Collections:

- `users` - Thông tin người dùng
- `chats` - Thông tin chat rooms
- `messages` - Tin nhắn (tách riêng)
- `attachments` - File đính kèm

#### Indexes:

- Messages: `{ chatId: 1, createdAt: -1 }`, `{ searchableContent: 'text' }`
- Chats: `{ participants: 1 }`, `{ lastMessageAt: -1 }`
- Attachments: `{ messageId: 1 }`, `{ uploadedBy: 1 }`

### 4. Real-time Events (Socket.io)

**Namespace**: `/chat`

#### Client → Server Events:

- `join:room` - Tham gia chat room
- `leave:room` - Rời chat room
- `message:send` - Gửi tin nhắn
- `message:read` - Đánh dấu đã đọc
- `typing:start` - Bắt đầu gõ
- `typing:stop` - Dừng gõ

#### Server → Client Events:

- `message:new` - Tin nhắn mới
- `message:read` - Tin nhắn đã đọc
- `chat:updated` - Chat được cập nhật
- `user:joined` - User tham gia
- `user:left` - User rời khỏi
- `typing:start` - User đang gõ
- `typing:stop` - User dừng gõ
- `user:online` - User online
- `user:offline` - User offline

### 5. Authentication & JWT

- **Access Token**: 7 ngày
- **Refresh Token**: 30 ngày
- **Header**: `Authorization: Bearer <token>`
- **Auto refresh**: Frontend interceptor xử lý

### 6. Environment Configuration

#### Backend (.env):

```env
NODE_ENV=development
PORT=3000
API_PREFIX=/api
CORS_ORIGIN=http://localhost:3001

MONGODB_URI=mongodb://localhost:27017/chatbox

JWT_ACCESS_SECRET=change_me_access_secret_key_2024
JWT_REFRESH_SECRET=change_me_refresh_secret_key_2024
JWT_ACCESS_EXPIRES=7d
JWT_REFRESH_EXPIRES=30d

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=app_password

UPLOAD_DIR=./uploads
MAX_FILE_MB=20

FRONTEND_URL=http://localhost:3001
SOCKET_CORS_ORIGIN=http://localhost:3001
```

#### Frontend (.env):

```env
REACT_APP_API_URL=http://localhost:3000/api
REACT_APP_SOCKET_URL=http://localhost:3000
REACT_APP_MAX_FILE_SIZE=20971520
REACT_APP_ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,audio/mpeg,audio/wav,application/pdf
```

## 🔄 Data Flow

### 1. Authentication Flow

```
1. User login → POST /api/auth/login
2. Receive accessToken + refreshToken
3. Store tokens in localStorage
4. Add Authorization header to all requests
5. Auto refresh when 401 error
```

### 2. Chat Flow

```
1. Get chat rooms → GET /api/chat/rooms
2. Join room via socket → emit('join:room', { chatId })
3. Send message → POST /api/chat/send
4. Receive real-time → on('message:new', message)
5. Mark as read → POST /api/chat/rooms/:id/read
```

### 3. File Upload Flow

```
1. Select file → Frontend validation
2. Upload → POST /api/chat/upload (multipart/form-data)
3. Get file URL → Response
4. Send message with attachment → POST /api/chat/send
```

## 📝 API Response Format

### Success Response:

```json
{
  "data": { ... },
  "message": "Success message",
  "success": true
}
```

### Error Response:

```json
{
  "statusCode": 400,
  "message": "Error message",
  "error": "Bad Request"
}
```

## 🚀 Quick Start

### Backend:

```bash
cd backend
cp env.example .env
# Edit .env with your values
npm install
npm run start:dev
```

### Frontend:

```bash
cd frontend
cp env.example .env
npm install
npm start
```

### Test:

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Passw0rd!","username":"testuser"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Passw0rd!"}'
```

## 🔧 Development Notes

1. **Database**: Sử dụng MongoDB với Mongoose
2. **Real-time**: Socket.io với namespace `/chat`
3. **File Upload**: Multer với validation
4. **Search**: MongoDB text search với indexes
5. **Security**: JWT + bcrypt + CORS
6. **Validation**: class-validator cho DTOs
7. **Error Handling**: Global exception filter

## 📋 Next Steps

1. ✅ API contract thống nhất
2. ✅ Database schema tách collection
3. ✅ Socket.io events chuẩn hóa
4. ✅ Environment configuration
5. 🔄 Implement file upload service
6. 🔄 Add message search với OCR/voice
7. 🔄 Add push notifications
8. 🔄 Add message reactions
9. 🔄 Add message editing/deletion
10. 🔄 Add chat settings
