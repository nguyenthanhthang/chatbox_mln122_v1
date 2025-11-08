import { apiService } from "./api";
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
  VerifyEmailRequest,
  VerifyPhoneRequest,
} from "../types/auth.types";
import { setTokens, setUser, removeTokens } from "../utils/helpers";

export class AuthService {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await apiService.login(credentials);
      const { accessToken, refreshToken, user } = response.data;

      setTokens(accessToken, refreshToken);
      setUser(user);

      return response.data;
    } catch (error: any) {
      // Xử lý các loại lỗi khác nhau
      const status = error.response?.status;
      const message = error.response?.data?.message;

      if (status === 401) {
        // Unauthorized - Email hoặc mật khẩu sai, hoặc tài khoản bị vô hiệu hóa
        // Luôn hiển thị message từ server (có thể là "Email hoặc mật khẩu không đúng" hoặc "Tài khoản đã bị vô hiệu hóa")
        throw new Error(message || "Email hoặc mật khẩu không đúng");
      } else if (status === 404) {
        // Not Found - Backend không nên trả về 404 nữa, nhưng nếu có thì vẫn báo chung
        throw new Error("Email hoặc mật khẩu không đúng");
      } else if (status === 400) {
        // Bad Request - Dữ liệu không hợp lệ
        throw new Error(message || "Dữ liệu đăng nhập không hợp lệ");
      } else if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
        // Timeout
        throw new Error("Kết nối quá thời gian. Vui lòng thử lại");
      } else if (!error.response) {
        // Network error
        throw new Error("Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng");
      } else {
        // Other errors
        throw new Error(message || "Đăng nhập thất bại. Vui lòng thử lại");
      }
    }
  }

  async register(
    userData: RegisterRequest
  ): Promise<{ message: string; userId: string }> {
    try {
      const response = await apiService.register(userData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Đăng ký thất bại");
    }
  }

  async logout(): Promise<void> {
    try {
      await apiService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      removeTokens();
    }
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    try {
      const response = await apiService.verifyEmail(token);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Xác thực email thất bại"
      );
    }
  }

  async verifyPhone(code: string): Promise<{ message: string }> {
    try {
      const response = await apiService.verifyPhone(code);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Xác thực số điện thoại thất bại"
      );
    }
  }

  async getProfile(): Promise<User> {
    try {
      const response = await apiService.getProfile();
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Lấy thông tin profile thất bại"
      );
    }
  }

  async refreshToken(): Promise<{ accessToken: string }> {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        throw new Error("Không có refresh token");
      }

      const response = await apiService.refreshToken(refreshToken);
      const { accessToken } = response.data;

      localStorage.setItem("accessToken", accessToken);

      return response.data;
    } catch (error: any) {
      removeTokens();
      throw new Error(
        error.response?.data?.message || "Refresh token thất bại"
      );
    }
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem("accessToken");
    return !!token;
  }

  getCurrentUser(): User | null {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  }
}

export const authService = new AuthService();
