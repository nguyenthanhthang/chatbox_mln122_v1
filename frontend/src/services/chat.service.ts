import { apiService } from "./api";
import { ImageMetadata } from "../types/image.types";

export interface SendMessageRequest {
  message: string;
  sessionId?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
  images?: ImageMetadata[];
}

export interface CreateSessionRequest {
  title?: string;
  model?: string;
  systemPrompt?: string;
}

export interface UpdateAISettingsRequest {
  defaultModel?: string;
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
  enableStreaming?: boolean;
  enableHistory?: boolean;
  maxHistoryDays?: number;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  tokens?: number;
  model?: string;
  sessionId?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  aiModel: string;
  messageCount: number;
  totalTokens: number;
  lastMessageAt: string;
  createdAt: string;
}

export interface AISettings {
  defaultModel: string;
  maxTokens: number;
  temperature: number;
  systemPrompt: string;
  enableStreaming: boolean;
  enableHistory: boolean;
  maxHistoryDays: number;
}

export interface AIModel {
  id: string;
  name: string;
  provider: "openai" | "claude";
  maxTokens: number;
  costPerToken: number;
}

class ChatService {
  // Session Management
  async createSession(data: CreateSessionRequest): Promise<ChatSession> {
    const response = await apiService.post("/chat/sessions", data);
    return response.data;
  }

  async getSessions(
    page: number = 1,
    limit: number = 10
  ): Promise<{ sessions: ChatSession[]; total: number }> {
    const response = await apiService.get(
      `/chat/sessions?page=${page}&limit=${limit}`
    );
    return response.data;
  }

  async getSession(sessionId: string): Promise<ChatSession> {
    const response = await apiService.get(`/chat/sessions/${sessionId}`);
    return response.data;
  }

  async deleteSession(sessionId: string): Promise<void> {
    await apiService.delete(`/chat/sessions/${sessionId}`);
  }

  async renameSession(sessionId: string, title: string): Promise<ChatSession> {
    const response = await apiService.patch(`/chat/sessions/${sessionId}`, {
      title,
    });
    return response.data;
  }

  // Messages
  async sendMessage(
    data: SendMessageRequest
  ): Promise<{ userMessage: Message; aiMessage: Message }> {
    const response = await apiService.post("/chat/send", data);
    return response.data;
  }

  async getSessionHistory(
    sessionId: string,
    limit: number = 50
  ): Promise<Message[]> {
    const response = await apiService.get(
      `/chat/history/${sessionId}?limit=${limit}`
    );
    return response.data;
  }

  async clearSessionHistory(sessionId: string): Promise<void> {
    await apiService.delete(`/chat/history/${sessionId}`);
  }

  async clearAllHistory(): Promise<void> {
    await apiService.post("/chat/clear");
  }

  async exportHistory(format: string = "json"): Promise<any> {
    const response = await apiService.get(`/chat/export?format=${format}`);
    return response.data;
  }

  // AI Configuration
  async getAvailableModels(): Promise<AIModel[]> {
    const response = await apiService.get("/chat/ai/models");
    return response.data;
  }

  async getAISettings(): Promise<AISettings> {
    const response = await apiService.get("/chat/ai/settings");
    return response.data;
  }

  async updateAISettings(
    settings: UpdateAISettingsRequest
  ): Promise<AISettings> {
    const response = await apiService.patch("/chat/ai/settings", settings);
    return response.data;
  }

  /**
   * Upload image - sử dụng direct upload lên Cloudinary (nhanh hơn)
   * Fallback về legacy endpoint nếu direct upload thất bại
   */
  async uploadImage(
    file: File,
    onProgress?: (progress: number) => void,
    useDirectUpload: boolean = true, // Mặc định dùng direct upload
  ): Promise<{
    url: string;
    publicId?: string;
    width?: number;
    height?: number;
    size: number;
    format?: string;
    mimeType: string;
    filename: string;
  }> {
    // Thử direct upload trước (nhanh hơn, không qua BE)
    if (useDirectUpload) {
      try {
        const { cloudinaryUploadService } = await import(
          './cloudinary-upload.service'
        );
        const result = await cloudinaryUploadService.uploadDirect(
          file,
          onProgress,
        );

        return {
          url: result.secure_url || result.url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          size: result.bytes,
          format: result.format,
          mimeType: file.type,
          filename: file.name,
        };
      } catch (error) {
        console.warn('Direct upload failed, falling back to legacy:', error);
        // Fallback về legacy endpoint
      }
    }

    // Legacy: upload qua BE
    const formData = new FormData();
    formData.append('image', file);

    const response = await apiService.post('/chat/upload-image', formData, {
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          onProgress(progress);
        }
      },
    });
    return response.data;
  }
}

export const chatService = new ChatService();
