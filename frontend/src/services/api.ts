import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { API_BASE_URL, STORAGE_KEYS } from "../utils/constants";
import { getToken, getRefreshToken, removeTokens } from "../utils/helpers";

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        const token = getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = getRefreshToken();
            if (refreshToken) {
              const response = await this.refreshToken(refreshToken);
              const newToken = response.data.accessToken;

              localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, newToken);

              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            removeTokens();
            window.location.href = "/login";
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(credentials: { email: string; password: string }) {
    return this.api.post("/auth/login", credentials);
  }

  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) {
    return this.api.post("/auth/register", userData);
  }

  async logout() {
    return this.api.post("/auth/logout");
  }

  async verifyEmail(token: string) {
    return this.api.post("/auth/verify-email", { token });
  }

  async verifyPhone(code: string) {
    return this.api.post("/auth/verify-phone", { code });
  }

  async refreshToken(refreshToken: string) {
    return this.api.post("/auth/refresh-token", { refreshToken });
  }

  async getProfile() {
    return this.api.get("/auth/profile");
  }

  // User endpoints
  async createUser(userData: any) {
    return this.api.post("/users", userData);
  }

  async getUsers() {
    return this.api.get("/users");
  }

  async getUserById(id: string) {
    return this.api.get(`/users/${id}`);
  }

  async updateProfile(userData: any) {
    return this.api.patch("/users/profile", userData);
  }

  async updateUser(id: string, userData: any) {
    return this.api.patch(`/users/${id}`, userData);
  }

  async deleteUser(id: string) {
    return this.api.delete(`/users/${id}`);
  }

  // Chat endpoints
  async sendMessage(messageData: {
    chatId: string;
    content: string;
    type?: string;
    attachmentUrl?: string;
    attachmentName?: string;
    attachmentSize?: number;
  }) {
    return this.api.post("/chat/send", messageData);
  }

  // Generic methods
  async get<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.api.get(url, config);
  }

  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.api.post(url, data, config);
  }

  async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.api.put(url, data, config);
  }

  async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.api.patch(url, data, config);
  }

  async delete<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.api.delete(url, config);
  }
}

export const apiService = new ApiService();
export default apiService;
