# Hướng dẫn Setup Local Development

## Mục đích
- **Render (Production)**: Dùng Environment Variables trong Dashboard
- **Local (Development)**: Dùng file `.env` để fix bug và test

## Cách Setup

### 1. Tạo file `.env` trong thư mục `backend/`

**Cách 1: Dùng script tự động (khuyến nghị)**

**Windows:**
```bash
cd backend
setup-env.bat
```

**Linux/Mac:**
```bash
cd backend
chmod +x setup-env.sh
./setup-env.sh
```

**Cách 2: Copy thủ công**
```bash
cd backend
cp env.example .env
# hoặc trên Windows:
copy env.example .env
```

### 2. Cập nhật file `.env` với API key thật

Mở file `backend/.env` và thay thế các placeholder:

```env
# AI Services
GOOGLE_AI_API_KEY=AIzaSyCgJ91PQQKlJEvN31_ywLxOH5bKCtkGRzA

# MongoDB Atlas (nếu dùng)
MONGODB_URI=mongodb+srv://witchernguyen_chatbot:Ntthang1905@cluster0.b8hbogu.mongodb.net/ai-chatbot?retryWrites=true&w=majority&appName=ChatbotDev
DB_NAME=ai-chatbot

# JWT Secrets (dùng giá trị mạnh cho local)
JWT_ACCESS_SECRET=your-local-access-secret-key-2024
JWT_REFRESH_SECRET=your-local-refresh-secret-key-2024

# Cloudinary (nếu có)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

### 3. Đảm bảo `.env` đã được ignore trong Git

File `.env` **KHÔNG BAO GIỜ** được commit vào Git. Kiểm tra `.gitignore`:

```bash
# backend/.gitignore hoặc root .gitignore
.env
.env.local
.env.*.local
```

### 4. Chạy local

```bash
cd backend
npm install
npm run start:dev
```

## Cách hoạt động

### Local Development (`NODE_ENV=development`)
- Load từ: `.env` (ưu tiên) → `config/development.env` (fallback)
- File `.env` có API key thật → code chạy được

### Production trên Render (`NODE_ENV=production`)
- Load từ: Environment Variables trong Render Dashboard
- Không cần file `.env` → an toàn, không commit secret

## Lưu ý quan trọng

⚠️ **KHÔNG BAO GIỜ:**
- Commit file `.env` vào Git
- Push API key lên GitHub
- Share file `.env` với người khác

✅ **LUÔN LUÔN:**
- Dùng `env.example` làm template
- Kiểm tra `.gitignore` trước khi commit
- Dùng Environment Variables trên Render cho production

## Troubleshooting

### Lỗi: "GOOGLE_AI_API_KEY chưa được cấu hình"
- Kiểm tra file `backend/.env` có tồn tại không
- Kiểm tra `GOOGLE_AI_API_KEY` có giá trị không phải placeholder
- Kiểm tra không có khoảng trắng thừa

### Lỗi: "API key không hợp lệ"
- Kiểm tra API key có đúng format (bắt đầu với `AIza...`)
- Kiểm tra API key có còn hoạt động trên Google AI Studio
- Kiểm tra API key không bị trim (có khoảng trắng)

### Local chạy nhưng Render lỗi
- Kiểm tra Environment Variables trên Render Dashboard
- Đảm bảo tên biến đúng: `GOOGLE_AI_API_KEY` (không có khoảng trắng)
- Redeploy sau khi thay đổi env vars

