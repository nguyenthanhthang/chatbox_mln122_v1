import { apiService } from "./api";
import {
  Chat,
  Message,
  CreateChatRequest,
  CreateMessageRequest,
  SearchMessagesRequest,
} from "../types/chat.types";

export class ChatService {
  async createChat(chatData: CreateChatRequest): Promise<Chat> {
    try {
      const response = await apiService.createChat(chatData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Tạo chat thất bại");
    }
  }

  async getChats(): Promise<Chat[]> {
    try {
      const response = await apiService.getChats();
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Lấy danh sách chat thất bại"
      );
    }
  }

  async getChatById(id: string): Promise<Chat> {
    try {
      const response = await apiService.getChatById(id);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Lấy thông tin chat thất bại"
      );
    }
  }

  async getChatHistory(
    id: string,
    page: number = 1,
    limit: number = 50
  ): Promise<{ messages: Message[]; total: number }> {
    try {
      const response = await apiService.getChatHistory(id, page, limit);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Lấy lịch sử chat thất bại"
      );
    }
  }

  async sendMessage(messageData: CreateMessageRequest): Promise<Message> {
    try {
      const response = await apiService.sendMessage(messageData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Gửi tin nhắn thất bại");
    }
  }

  async searchMessages(searchData: SearchMessagesRequest): Promise<Message[]> {
    try {
      const response = await apiService.searchMessages(searchData);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Tìm kiếm tin nhắn thất bại"
      );
    }
  }

  async markAsRead(chatId: string): Promise<void> {
    try {
      await apiService.markAsRead(chatId);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Đánh dấu đã đọc thất bại"
      );
    }
  }

  async deleteChat(chatId: string): Promise<void> {
    try {
      await apiService.deleteChat(chatId);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Xóa chat thất bại");
    }
  }
}

export const chatService = new ChatService();
