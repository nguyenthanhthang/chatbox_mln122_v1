# Hướng dẫn Deploy Chatbox V1

## 📋 Tổng quan

Dự án này bao gồm:
- **Backend**: NestJS API (port 3000)
- **Frontend**: React TypeScript (port 3001)
- **Database**: MongoDB

## ⚠️ QUAN TRỌNG: Thông tin cần bảo mật

**KHÔNG BAO GIỜ commit các thông tin sau lên Git:**

### Backend Environment Variables:
- `GOOGLE_AI_API_KEY` - Google AI API key
- `MONGODB_URI` - MongoDB connection string (nếu có credentials)
- `JWT_SECRET` - JWT secret key
- `JWT_REFRESH_SECRET` - JWT refresh secret
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary API secret
- `EMAIL_PASS` - Email app password
- `TWILIO_AUTH_TOKEN` - Twilio auth token

### Frontend Environment Variables:
- `REACT_APP_API_URL` - Backend API URL (có thể public)
- `REACT_APP_SOCKET_URL` - Socket.io URL (có thể public)

## 🚀 Deploy với Docker (Recommended)

### 1. Chuẩn bị Environment Variables

Tạo file `.env` ở root project (không commit file này lên Git!):

```env
# Backend
NODE_ENV=production
PORT=3000

# MongoDB Atlas (Production)
# ⚠️ Sử dụng MongoDB Atlas connection string của bạn
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-chatbot?retryWrites=true&w=majority
DB_NAME=ai-chatbot

# JWT Secrets (CHANGE THESE!)
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Google AI API
GOOGLE_AI_API_KEY=your-google-ai-api-key-here

# CORS Configuration
CORS_ORIGIN=http://localhost:3001
FRONTEND_URL=http://localhost:3001
SOCKET_CORS_ORIGIN=http://localhost:3001

# Frontend (for docker build)
REACT_APP_API_URL=http://localhost:3000/api
REACT_APP_SOCKET_URL=http://localhost:3000
```

**⚠️ QUAN TRỌNG:**
- File `.env` đã được ignore trong `.gitignore`
- **KHÔNG BAO GIỜ** commit file `.env` lên Git
- Nếu đã share MongoDB connection string công khai, hãy **đổi password ngay** trong MongoDB Atlas

### 2. Build và chạy với Docker Compose

```bash
# Build và start tất cả services
docker-compose up -d

# Xem logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop và xóa volumes (xóa data)
docker-compose down -v
```

### 3. Truy cập ứng dụng

- Frontend: http://localhost:3001
- Backend API: http://localhost:3000/api
- MongoDB: localhost:27017

## 🌐 Deploy lên Cloud Platforms

### Option 1: Deploy Backend lên Railway/Render

1. **Railway** (https://railway.app)
   - Connect GitHub repo
   - Chọn `backend` folder
   - Set environment variables trong dashboard
   - Railway tự động detect NestJS và deploy

2. **Render** (https://render.com)
   - New Web Service
   - Connect repo
   - Root Directory: `backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run start:prod`
   - Set environment variables

### Option 2: Deploy Frontend lên Vercel/Netlify

1. **Vercel** (https://vercel.com)
   - Import project
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `build`
   - Environment Variables:
     - `REACT_APP_API_URL`: URL của backend API
     - `REACT_APP_SOCKET_URL`: URL của backend Socket.io

2. **Netlify** (https://netlify.com)
   - Tương tự Vercel
   - Build command: `cd frontend && npm install && npm run build`
   - Publish directory: `frontend/build`

### Option 3: Deploy MongoDB lên MongoDB Atlas

1. Tạo cluster tại https://www.mongodb.com/cloud/atlas
2. Tạo database user với username và password
3. Whitelist IP address (hoặc 0.0.0.0/0 cho development)
4. Lấy connection string từ "Connect" → "Connect your application"
5. Update `MONGODB_URI` trong environment variables (file `.env` hoặc platform settings)
6. **⚠️ KHÔNG BAO GIỜ** commit connection string có password vào Git

**Format MongoDB Atlas connection string:**
```
mongodb+srv://username:password@cluster.mongodb.net/database-name?retryWrites=true&w=majority
```

## 📝 Checklist trước khi Deploy

### Backend
- [ ] Đã build thành công: `npm run build`
- [ ] Đã set tất cả environment variables
- [ ] `NODE_ENV=production`
- [ ] JWT secrets đã được thay đổi (không dùng default)
- [ ] CORS_ORIGIN đã set đúng frontend URL
- [ ] MongoDB connection string đã đúng

### Frontend
- [ ] Đã build thành công: `npm run build`
- [ ] `REACT_APP_API_URL` đã set đúng backend URL
- [ ] `REACT_APP_SOCKET_URL` đã set đúng socket URL
- [ ] Đã test kết nối với backend

### Git
- [ ] Đã xóa tất cả API keys thật khỏi code
- [ ] Đã commit `.env.example` files
- [ ] Đã verify `.gitignore` đã ignore `.env` files
- [ ] Không có secrets trong git history

## 🔧 Cấu hình Production

### Backend Production Environment

Tạo file `.env.production` hoặc set environment variables:

```env
NODE_ENV=production
PORT=3000
API_PREFIX=/api

# MongoDB (production)
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/ai-chatbot?retryWrites=true&w=majority
DB_NAME=ai-chatbot

# JWT (CHANGE THESE!)
JWT_SECRET=your-production-jwt-secret-min-32-chars
JWT_REFRESH_SECRET=your-production-refresh-secret-min-32-chars
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# CORS (set đúng frontend URL)
CORS_ORIGIN=https://your-frontend-domain.com
FRONTEND_URL=https://your-frontend-domain.com
SOCKET_CORS_ORIGIN=https://your-frontend-domain.com

# AI Services
GOOGLE_AI_API_KEY=your-production-google-ai-api-key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@yourdomain.com
```

### Frontend Production Environment

Set environment variables khi build:

```env
REACT_APP_API_URL=https://your-backend-api.com/api
REACT_APP_SOCKET_URL=https://your-backend-api.com
```

## 🐛 Troubleshooting

### Backend không kết nối được MongoDB
- Kiểm tra `MONGODB_URI` đúng format
- Kiểm tra network/firewall rules
- Với MongoDB Atlas: whitelist IP address

### CORS errors
- Đảm bảo `CORS_ORIGIN` đúng với frontend URL
- Kiểm tra protocol (http vs https)

### Frontend không kết nối backend
- Kiểm tra `REACT_APP_API_URL` đúng
- Đảm bảo backend đã chạy và accessible
- Kiểm tra CORS settings

### Socket.io không kết nối
- Kiểm tra `REACT_APP_SOCKET_URL` đúng
- Backend phải enable CORS cho Socket.io
- Kiểm tra firewall/network rules

## 📚 Tài liệu tham khảo

- [NestJS Deployment](https://docs.nestjs.com/deployment)
- [React Deployment](https://create-react-app.dev/docs/deployment/)
- [Docker Compose](https://docs.docker.com/compose/)
- [MongoDB Atlas](https://www.mongodb.com/docs/atlas/)

## 🔐 Security Best Practices

1. **Luôn sử dụng HTTPS** trong production
2. **Rotate API keys** thường xuyên
3. **Sử dụng strong JWT secrets** (min 32 characters)
4. **Enable MongoDB authentication**
5. **Set up rate limiting** cho API
6. **Monitor logs** để detect suspicious activities
7. **Backup database** thường xuyên

