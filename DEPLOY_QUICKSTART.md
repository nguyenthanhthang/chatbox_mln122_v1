# 🚀 Quick Start Guide - Deploy Render + Vercel

Hướng dẫn nhanh để deploy Chatbox lên Render (Backend) và Vercel (Frontend).

## 📋 Chuẩn bị

1. **MongoDB Atlas**: Đã có connection string
2. **Google AI API Key**: Đã có API key
3. **GitHub Repository**: Code đã push lên GitHub

## ⚡ Deploy Backend lên Render (5 phút)

1. Truy cập https://render.com → **"New +"** → **"Web Service"**
2. Connect GitHub repo
3. Cấu hình:
   - **Name**: `chatbox-backend`
   - **Root Directory**: `backend` ⚠️
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start:prod`
4. Thêm Environment Variables (copy và paste vào Render Dashboard):

   ```
   NODE_ENV=production
   MONGODB_URI=<your-mongodb-connection-string>
   DB_NAME=ai-chatbot
   JWT_SECRET=<your-jwt-secret-min-32-chars>
   JWT_REFRESH_SECRET=<your-refresh-secret-min-32-chars>
   GOOGLE_AI_API_KEY=<your-google-ai-api-key>
   CORS_ORIGIN=https://your-frontend.vercel.app
   FRONTEND_URL=https://your-frontend.vercel.app
   SOCKET_CORS_ORIGIN=https://your-frontend.vercel.app
   ```

5. Click **"Create Web Service"**
6. **Lưu backend URL** (ví dụ: `https://chatbox-backend.onrender.com`)

## ⚡ Deploy Frontend lên Vercel (3 phút)

1. Truy cập https://vercel.com → **"Add New..."** → **"Project"**
2. Import GitHub repo
3. Cấu hình:
   - **Root Directory**: `frontend` ⚠️
   - **Framework Preset**: `Create React App`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
4. Thêm Environment Variables:
   ```
   REACT_APP_API_URL=https://chatbox-backend.onrender.com/api
   REACT_APP_SOCKET_URL=https://chatbox-backend.onrender.com
   ```
   ⚠️ Thay thế với backend URL thật của bạn!
5. Click **"Deploy"**
6. **Lưu frontend URL** (ví dụ: `https://chatbox-frontend.vercel.app`)

## 🔄 Cập nhật CORS (QUAN TRỌNG!)

1. Quay lại **Render Dashboard**
2. Vào **Environment Variables**
3. Update:
   - `CORS_ORIGIN` = Vercel URL của bạn
   - `FRONTEND_URL` = Vercel URL của bạn
   - `SOCKET_CORS_ORIGIN` = Vercel URL của bạn
4. **Manual Deploy** → **"Deploy latest commit"**

## ✅ Test

1. Mở frontend URL
2. Test đăng ký/đăng nhập
3. Test chat functionality

## ⚠️ Lưu ý

- **Render Free Plan**: Service sẽ sleep sau 15 phút không có traffic. Lần đầu access sẽ mất 30-60 giây để wake up.
- **MongoDB Atlas**: Whitelist IP `0.0.0.0/0` để cho phép tất cả IP kết nối.
- **CORS**: Phải update CORS sau khi có frontend URL, nếu không sẽ bị lỗi CORS.

## 📖 Chi tiết

Xem file `DEPLOY.md` để biết thêm chi tiết và troubleshooting.
