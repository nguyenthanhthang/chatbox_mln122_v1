# Hướng dẫn cấu hình Google AI API Key

## Lỗi: API key not valid

Nếu bạn gặp lỗi `API key not valid. Please pass a valid API key.`, hãy làm theo các bước sau:

## 1. Lấy Google AI API Key

1. Truy cập: https://aistudio.google.com/apikey
2. Đăng nhập bằng tài khoản Google
3. Click "Create API Key"
4. Copy API key (bắt đầu với `AIza...`)

## 2. Cấu hình trên Render (Production)

1. Vào Render Dashboard: https://dashboard.render.com
2. Chọn service backend của bạn
3. Vào tab **Environment**
4. Thêm hoặc cập nhật biến môi trường:
   - **Key**: `GOOGLE_AI_API_KEY`
   - **Value**: Dán API key bạn đã copy (ví dụ: `AIzaSyCgJ91PQQKlJEvN31_ywLxOH5bKCtkGRzA`)
5. Click **Save Changes**
6. Render sẽ tự động redeploy

## 3. Cấu hình local (Development)

1. Tạo hoặc mở file `.env` trong thư mục `backend/`
2. Thêm dòng:
   ```
   GOOGLE_AI_API_KEY=AIzaSyCgJ91PQQKlJEvN31_ywLxOH5bKCtkGRzA
   ```
   (Thay bằng API key thực của bạn)
3. Lưu file
4. Restart server

## 4. Kiểm tra

Sau khi cấu hình, kiểm tra logs:
- Nếu thấy: `Google AI API Key loaded: AIza...xxxx (length: 39)` → ✅ Thành công
- Nếu thấy: `GOOGLE_AI_API_KEY chưa được cấu hình` → ❌ Chưa set đúng
- Nếu thấy: `API key không có định dạng chuẩn` → ⚠️ API key có thể sai

## Lưu ý

- API key phải bắt đầu với `AIza`
- Không có khoảng trắng ở đầu/cuối
- API key phải có quyền truy cập Gemini API
- Kiểm tra quota/limits trên Google AI Studio

