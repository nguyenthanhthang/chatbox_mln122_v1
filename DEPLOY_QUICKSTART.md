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
   - **Root Directory**: `backend` ⚠️ **QUAN TRỌNG - phải đúng**
   - **Build Command**: `npm install && npm run build` ⚠️
   - **Start Command**: `npm run start:prod` ⚠️ **KHÔNG phải `node index.js`**

   ⚠️ **LƯU Ý QUAN TRỌNG:**

   - Start Command phải là `npm run start:prod`, **KHÔNG** dùng `node index.js`
   - Nếu thấy Start Command là `node index.js`, phải sửa ngay!

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
   REACT_APP_API_URL=https://chatbox-mln122-v1.onrender.com/api
   REACT_APP_SOCKET_URL=https://chatbox-mln122-v1.onrender.com
   ```
   ⚠️ **Backend URL của bạn**: `https://chatbox-mln122-v1.onrender.com`
5. Click **"Deploy"**
6. **Lưu frontend URL** (ví dụ: `https://chatbox-frontend.vercel.app`)

## 🔄 Cập nhật CORS (QUAN TRỌNG!)

Sau khi deploy frontend lên Vercel thành công, bạn sẽ có URL như: `https://chatbox-frontend.vercel.app`

### Bước 1: Lấy Frontend URL từ Vercel

1. Vào Vercel Dashboard → chọn project
2. Copy **Production URL** (ví dụ: `https://chatbox-frontend.vercel.app`)

### Bước 2: Cập nhật CORS trong Render

1. Quay lại **Render Dashboard** → chọn backend service
2. Vào tab **Environment** (hoặc **Environment Variables**)
3. Tìm và **Edit** các biến sau (click icon bút ✏️ bên cạnh mỗi biến):

   **Biến có sẵn - cần Edit:**

   - `CORS_ORIGIN` → Click Edit → Thay bằng: `https://chatbox-mln122-v1-pis1ultwx.vercel.app`

   **Biến chưa có - cần Add:**

   - Nếu không thấy `FRONTEND_URL`, click **"Edit"** (hoặc **"+"** nếu có) → Add:
     - KEY: `FRONTEND_URL`
     - VALUE: `https://chatbox-mln122-v1-pis1ultwx.vercel.app`
   - Nếu không thấy `SOCKET_CORS_ORIGIN`, click **"Edit"** (hoặc **"+"** nếu có) → Add:
     - KEY: `SOCKET_CORS_ORIGIN`
     - VALUE: `https://chatbox-mln122-v1-pis1ultwx.vercel.app`

   ⚠️ **Lưu ý**:

   - URL không có `/` ở cuối!
   - Nếu biến đã có, click icon ✏️ để edit
   - Nếu biến chưa có, click nút **"Add"** hoặc **"+"** để thêm mới

4. **Save Changes** hoặc **Save**

### Bước 3: Redeploy Backend

1. Vào tab **Manual Deploy** (hoặc **Deploys**)
2. Click **"Deploy latest commit"**
3. Đợi deploy hoàn thành (1-2 phút)

### Bước 4: Test

1. Mở frontend URL trên Vercel
2. Test đăng nhập/đăng ký
3. Nếu vẫn lỗi CORS, kiểm tra lại URL đã đúng chưa (có `https://` và không có `/` ở cuối)

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
