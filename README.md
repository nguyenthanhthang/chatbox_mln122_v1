# Chatbox V1

Web chatbox được xây dựng với React TypeScript + NestJS + MongoDB

## Tính năng

- ✅ Đăng ký tài khoản (xác thực qua Gmail hoặc số điện thoại)
- ✅ Đăng nhập/Đăng xuất với phân quyền
- ✅ Lưu lịch sử chat
- ✅ Tìm kiếm bằng text, ảnh và voice

## Cấu trúc dự án

```
chatboxV1/
├── backend/          # NestJS API
├── frontend/         # React TypeScript
├── shared/           # Shared types và utilities
└── docs/            # Documentation
```

## Cài đặt

1. Cài đặt dependencies cho toàn bộ dự án:

```bash
npm run install:all
```

2. Thiết lập MongoDB và cấu hình environment variables

3. Chạy development server:

```bash
npm run dev
```

## API Endpoints

### Authentication

- `POST /auth/register` - Đăng ký tài khoản
- `POST /auth/login` - Đăng nhập
- `POST /auth/logout` - Đăng xuất
- `POST /auth/verify-email` - Xác thực email
- `POST /auth/verify-phone` - Xác thực số điện thoại

### Chat

- `GET /chat/history` - Lấy lịch sử chat
- `POST /chat/send` - Gửi tin nhắn
- `GET /chat/search` - Tìm kiếm tin nhắn

## Tech Stack

### Backend

- NestJS
- MongoDB với Mongoose
- JWT Authentication
- Socket.io cho real-time chat
- Multer cho file upload

### Frontend

- React 18 với TypeScript
- Material-UI hoặc Ant Design
- Socket.io-client
- React Router
- Axios

### Database

- MongoDB
- Mongoose ODM
