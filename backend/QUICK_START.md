# 🚀 Quick Start - Local Development

## Setup trong 3 bước

### 1️⃣ Tạo file `.env`
```bash
cd backend
copy env.example .env    # Windows
# hoặc
cp env.example .env       # Linux/Mac
```

### 2️⃣ Cập nhật API key trong `.env`
Mở `backend/.env` và thay dòng này:
```env
GOOGLE_AI_API_KEY=AIzaSyCgJ91PQQKlJEvN31_ywLxOH5bKCtkGRzA
```

### 3️⃣ Chạy server
```bash
npm install
npm run start:dev
```

## ✅ Kiểm tra

Server chạy tại: `http://localhost:3000/api`

Nếu thấy log:
```
Google AI API Key loaded: AIza...GRzA (length: 39)
```
→ ✅ Setup thành công!

## 📝 Lưu ý

- **Local**: Dùng file `.env` (đã được ignore trong Git)
- **Render**: Dùng Environment Variables trong Dashboard
- **KHÔNG BAO GIỜ** commit file `.env` vào Git!

## 🔧 Troubleshooting

**Lỗi: "GOOGLE_AI_API_KEY chưa được cấu hình"**
→ Kiểm tra file `.env` có tồn tại và có API key không

**Lỗi: "API key không hợp lệ"**
→ Kiểm tra API key có đúng format (bắt đầu với `AIza...`)

Xem chi tiết: [LOCAL_SETUP.md](./LOCAL_SETUP.md)

