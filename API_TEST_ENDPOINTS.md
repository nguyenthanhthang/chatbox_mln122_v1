# API Test Endpoints

## Cấu hình

- Backend: `http://localhost:3000/api`
- Frontend: `http://localhost:3001`
- Socket: `http://localhost:3000/chat`

## Test Authentication

### 1. Register User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Passw0rd!",
    "username": "testuser",
    "phoneNumber": "+84000000000"
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Passw0rd!"
  }'
```

**Response:**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id",
    "email": "test@example.com",
    "username": "testuser",
    "role": "user"
  }
}
```

### 3. Get Profile

```bash
curl http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Test Chat Endpoints

### 4. Create Chat Room

```bash
curl -X POST http://localhost:3000/api/chat/rooms \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "General Chat",
    "participants": ["USER_ID_2"],
    "isGroup": true
  }'
```

### 5. Get Chat Rooms

```bash
curl http://localhost:3000/api/chat/rooms \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 6. Get Chat by ID

```bash
curl http://localhost:3000/api/chat/rooms/CHAT_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 7. Get Chat History

```bash
curl "http://localhost:3000/api/chat/rooms/CHAT_ID/history?page=1&limit=50" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 8. Send Message

```bash
curl -X POST http://localhost:3000/api/chat/send \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "chatId": "CHAT_ID",
    "content": "Xin chào mọi người!",
    "type": "text"
  }'
```

### 9. Upload File

```bash
curl -X POST http://localhost:3000/api/chat/upload \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "file=@/path/to/file.jpg" \
  -F "chatId=CHAT_ID"
```

### 10. Search Messages

```bash
curl -X POST http://localhost:3000/api/chat/search \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "xin chào",
    "chatId": "CHAT_ID",
    "limit": 20
  }'
```

### 11. Mark as Read

```bash
curl -X POST http://localhost:3000/api/chat/rooms/CHAT_ID/read \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 12. Delete Chat

```bash
curl -X DELETE http://localhost:3000/api/chat/rooms/CHAT_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Test User Management

### 13. Get Users

```bash
curl http://localhost:3000/api/users \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 14. Get User by ID

```bash
curl http://localhost:3000/api/users/USER_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 15. Update Profile

```bash
curl -X PATCH http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newusername",
    "avatar": "https://example.com/avatar.jpg"
  }'
```

## Socket.io Events

### Connection

```javascript
const socket = io("http://localhost:3000/chat", {
  auth: {
    token: "YOUR_ACCESS_TOKEN",
  },
});
```

### Events to Listen

- `message:new` - New message received
- `message:read` - Message marked as read
- `chat:updated` - Chat updated
- `user:joined` - User joined chat
- `user:left` - User left chat
- `typing:start` - User started typing
- `typing:stop` - User stopped typing
- `user:online` - User came online
- `user:offline` - User went offline

### Events to Emit

- `join:room` - Join chat room
- `leave:room` - Leave chat room
- `message:send` - Send message
- `message:read` - Mark as read
- `typing:start` - Start typing
- `typing:stop` - Stop typing

## Error Responses

### 401 Unauthorized

```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

### 400 Bad Request

```json
{
  "statusCode": 400,
  "message": ["email must be an email"],
  "error": "Bad Request"
}
```

### 404 Not Found

```json
{
  "statusCode": 404,
  "message": "Chat not found",
  "error": "Not Found"
}
```

## Environment Variables

### Backend (.env)

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

### Frontend (.env)

```env
REACT_APP_API_URL=http://localhost:3000/api
REACT_APP_SOCKET_URL=http://localhost:3000
REACT_APP_MAX_FILE_SIZE=20971520
REACT_APP_ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,audio/mpeg,audio/wav,application/pdf
```
