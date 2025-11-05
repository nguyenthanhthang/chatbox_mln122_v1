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

### 🚀 Deploy Backend lên Render

#### Bước 1: Chuẩn bị GitHub Repository
- Đảm bảo code đã được push lên GitHub
- Đảm bảo không có secrets trong code (đã check `.gitignore`)

#### Bước 2: Tạo Web Service trên Render

1. Truy cập https://render.com và đăng nhập
2. Click **"New +"** → **"Web Service"**
3. Connect GitHub repository của bạn
4. Cấu hình như sau:
   - **Name**: `chatbox-backend` (hoặc tên bạn muốn)
   - **Region**: Chọn region gần nhất
   - **Branch**: `master` hoặc `main`
   - **Root Directory**: `backend` ⚠️ **QUAN TRỌNG**
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start:prod`
   - **Plan**: Chọn plan phù hợp (Starter plan miễn phí)

5. **Environment Variables** - Thêm các biến sau trong Render Dashboard:

   **Bắt buộc:**
   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-chatbot?retryWrites=true&w=majority
   DB_NAME=ai-chatbot
   JWT_SECRET=your-super-secret-jwt-key-min-32-chars
   JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars
   GOOGLE_AI_API_KEY=your-google-ai-api-key
   CORS_ORIGIN=https://your-frontend-domain.vercel.app
   FRONTEND_URL=https://your-frontend-domain.vercel.app
   SOCKET_CORS_ORIGIN=https://your-frontend-domain.vercel.app
   ```

   **Tùy chọn:**
   ```
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ```

6. Click **"Create Web Service"**

7. **Lưu URL backend**: Sau khi deploy xong, Render sẽ cung cấp URL như `https://chatbox-backend.onrender.com`. Lưu URL này để cấu hình frontend.

#### Bước 3: Cập nhật CORS sau khi có Frontend URL
- Sau khi deploy frontend, quay lại Render Dashboard
- Update `CORS_ORIGIN`, `FRONTEND_URL`, `SOCKET_CORS_ORIGIN` với URL frontend thật
- Click **"Manual Deploy"** → **"Deploy latest commit"**

---

### 🎨 Deploy Frontend lên Vercel

#### Bước 1: Chuẩn bị
- Đảm bảo đã có backend URL từ Render (ví dụ: `https://chatbox-backend.onrender.com`)

#### Bước 2: Deploy lên Vercel

1. Truy cập https://vercel.com và đăng nhập (có thể dùng GitHub)
2. Click **"Add New..."** → **"Project"**
3. Import GitHub repository của bạn
4. Cấu hình project:
   - **Framework Preset**: `Create React App`
   - **Root Directory**: `frontend` ⚠️ **QUAN TRỌNG**
   - **Build Command**: `npm run build` (hoặc để mặc định)
   - **Output Directory**: `build`
   - **Install Command**: `npm install`

5. **Environment Variables** - Thêm các biến sau:
   ```
   REACT_APP_API_URL=https://chatbox-backend.onrender.com/api
   REACT_APP_SOCKET_URL=https://chatbox-backend.onrender.com
   ```
   ⚠️ **Thay thế URL** bằng URL backend thật của bạn!

6. Click **"Deploy"**

7. Sau khi deploy xong, Vercel sẽ cung cấp URL như `https://chatbox-frontend.vercel.app`

#### Bước 3: Cập nhật Backend CORS
- Quay lại Render Dashboard
- Update `CORS_ORIGIN`, `FRONTEND_URL`, `SOCKET_CORS_ORIGIN` với URL Vercel của bạn
- Redeploy backend

#### Bước 4: Custom Domain (Tùy chọn)
- Vercel cho phép thêm custom domain miễn phí
- Render cũng hỗ trợ custom domain (có thể cần upgrade plan)

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

## 📝 Checklist Deploy Render + Vercel

### Trước khi Deploy

#### Backend (Render)
- [ ] Code đã push lên GitHub (không có secrets)
- [ ] Đã build thành công local: `cd backend && npm run build`
- [ ] Đã chuẩn bị MongoDB Atlas connection string
- [ ] Đã chuẩn bị Google AI API key
- [ ] Đã chuẩn bị JWT secrets (min 32 ký tự, không dùng default)

#### Frontend (Vercel)
- [ ] Code đã push lên GitHub
- [ ] Đã build thành công local: `cd frontend && npm run build`
- [ ] Đã có backend URL từ Render (để set environment variables)

### Sau khi Deploy Backend (Render)

- [ ] Backend deploy thành công (check logs)
- [ ] Backend URL hoạt động (ví dụ: `https://chatbox-backend.onrender.com/api`)
- [ ] Test health endpoint (nếu có)
- [ ] Lưu backend URL để cấu hình frontend

### Sau khi Deploy Frontend (Vercel)

- [ ] Frontend deploy thành công
- [ ] Frontend URL hoạt động
- [ ] **QUAN TRỌNG**: Quay lại Render Dashboard
- [ ] Update `CORS_ORIGIN`, `FRONTEND_URL`, `SOCKET_CORS_ORIGIN` với URL Vercel
- [ ] Redeploy backend trên Render
- [ ] Test kết nối frontend → backend
- [ ] Test đăng nhập/đăng ký
- [ ] Test chat functionality

### Git Security
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

### Render Backend Issues

#### Build fails trên Render
- **Lỗi**: `npm install` fails
  - **Giải pháp**: Kiểm tra `package.json` có đúng không, đảm bảo `backend/package.json` tồn tại
- **Lỗi**: `npm run build` fails
  - **Giải pháp**: Test build local trước: `cd backend && npm run build`
  - Kiểm tra TypeScript errors trong logs
- **Lỗi**: Root Directory không đúng
  - **Giải pháp**: Đảm bảo Root Directory = `backend` trong Render settings

#### Backend không start được
- **Lỗi**: Port already in use
  - **Giải pháp**: Render tự động set PORT, không cần set manual. Đảm bảo code dùng `process.env.PORT`
- **Lỗi**: Cannot connect to MongoDB
  - **Giải pháp**: 
    - Kiểm tra MongoDB Atlas đã whitelist IP `0.0.0.0/0` (cho phép tất cả)
    - Kiểm tra connection string đúng format
    - Kiểm tra username/password trong connection string

#### Backend sleep sau 15 phút (Free plan)
- **Vấn đề**: Render free plan sẽ sleep service sau 15 phút không có traffic
- **Giải pháp**: 
  - Upgrade lên paid plan
  - Hoặc dùng service như UptimeRobot để ping backend mỗi 5 phút

### Vercel Frontend Issues

#### Build fails trên Vercel
- **Lỗi**: Build command fails
  - **Giải pháp**: 
    - Đảm bảo Root Directory = `frontend`
    - Đảm bảo Build Command = `npm run build`
    - Đảm bảo Output Directory = `build`
- **Lỗi**: Environment variables không được inject
  - **Giải pháp**: 
    - Đảm bảo biến bắt đầu với `REACT_APP_`
    - Redeploy sau khi thêm environment variables
- **Lỗi**: `REACT_APP_API_URL` undefined
  - **Giải pháp**: 
    - Set environment variables trong Vercel Dashboard
    - Redeploy project

#### Frontend không kết nối được Backend
- **Lỗi**: CORS errors
  - **Giải pháp**: 
    - Backend phải set `CORS_ORIGIN` = Vercel URL
    - Redeploy backend sau khi update CORS
- **Lỗi**: Network error khi call API
  - **Giải pháp**: 
    - Kiểm tra `REACT_APP_API_URL` đúng format (có `/api` ở cuối)
    - Kiểm tra backend đã chạy và accessible
    - Test backend URL trực tiếp trong browser

### MongoDB Atlas Issues

#### Cannot connect to MongoDB
- **Lỗi**: Authentication failed
  - **Giải pháp**: 
    - Kiểm tra username/password trong connection string
    - Tạo database user mới trong MongoDB Atlas
- **Lỗi**: IP not whitelisted
  - **Giải pháp**: 
    - Vào MongoDB Atlas → Network Access
    - Add IP Address: `0.0.0.0/0` (cho phép tất cả)
    - Hoặc add IP cụ thể của Render (check Render docs)

### CORS Errors

#### Frontend → Backend CORS error
- **Lỗi**: `Access-Control-Allow-Origin` header missing
  - **Giải pháp**: 
    1. Lấy Vercel URL (ví dụ: `https://chatbox-frontend.vercel.app`)
    2. Vào Render Dashboard → Environment Variables
    3. Update `CORS_ORIGIN` = Vercel URL
    4. Update `FRONTEND_URL` = Vercel URL
    5. Update `SOCKET_CORS_ORIGIN` = Vercel URL
    6. Redeploy backend

### Socket.io không kết nối
- **Vấn đề**: Socket.io connection failed
- **Giải pháp**: 
  - Kiểm tra `REACT_APP_SOCKET_URL` đúng (không có `/api`)
  - Backend phải enable CORS cho Socket.io
  - Kiểm tra WebSocket support trên Render (free plan có thể không support)

### Common Issues

#### Environment Variables không được load
- **Giải pháp**: 
  - Render: Environment variables phải set trong Dashboard, không dùng file `.env`
  - Vercel: Environment variables phải set trong Dashboard, không dùng file `.env`
  - Redeploy sau khi thêm/update environment variables

#### Build works local nhưng fails trên cloud
- **Giải pháp**: 
  - Kiểm tra Node version (Render/Vercel có thể dùng version khác)
  - Kiểm tra dependencies trong `package.json`
  - Xem build logs chi tiết trên platform

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

