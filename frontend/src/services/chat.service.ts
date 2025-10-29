import { api } from "./api";

export interface SendMessageRequest {
  message: string;
  sessionId?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
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
    const response = await api.post("/chat/sessions", data);
    return response.data;
  }

  async getSessions(
    page: number = 1,
    limit: number = 10
  ): Promise<{ sessions: ChatSession[]; total: number }> {
    const response = await api.get(
      `/chat/sessions?page=${page}&limit=${limit}`
    );
    return response.data;
  }

  async getSession(sessionId: string): Promise<ChatSession> {
    const response = await api.get(`/chat/sessions/${sessionId}`);
    return response.data;
  }

  async deleteSession(sessionId: string): Promise<void> {
    await api.delete(`/chat/sessions/${sessionId}`);
  }

  // Messages
  async sendMessage(
    data: SendMessageRequest
  ): Promise<{ userMessage: Message; aiMessage: Message }> {
    const response = await api.post("/chat/send", data);
    return response.data;
  }

  async getSessionHistory(
    sessionId: string,
    limit: number = 50
  ): Promise<Message[]> {
    const response = await api.get(`/chat/history/${sessionId}?limit=${limit}`);
    return response.data;
  }

  async clearSessionHistory(sessionId: string): Promise<void> {
    await api.delete(`/chat/history/${sessionId}`);
  }

  async clearAllHistory(): Promise<void> {
    await api.post("/chat/clear");
  }

  async exportHistory(format: string = "json"): Promise<any> {
    const response = await api.get(`/chat/export?format=${format}`);
    return response.data;
  }

  // AI Configuration
  async getAvailableModels(): Promise<AIModel[]> {
    const response = await api.get("/chat/ai/models");
    return response.data;
  }

  async getAISettings(): Promise<AISettings> {
    const response = await api.get("/chat/ai/settings");
    return response.data;
  }

  async updateAISettings(
    settings: UpdateAISettingsRequest
  ): Promise<AISettings> {
    const response = await api.patch("/chat/ai/settings", settings);
    return response.data;
  }
}

export const chatService = new ChatService();
