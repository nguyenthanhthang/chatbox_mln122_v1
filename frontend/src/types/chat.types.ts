import { User } from "./auth.types";

export interface Message {
  _id: string;
  senderId: string | User;
  content: string;
  type: MessageType;
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentSize?: number;
  isEdited: boolean;
  editedAt?: string;
  isDeleted: boolean;
  deletedAt?: string;
  readBy: string[];
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export enum MessageType {
  TEXT = "text",
  IMAGE = "image",
  VOICE = "voice",
  FILE = "file",
}

export interface Chat {
  _id: string;
  name: string;
  participants: string[] | User[];
  createdBy: string | User;
  messages: Message[];
  lastMessage?: Message;
  lastMessageAt?: string;
  isGroup: boolean;
  avatar?: string;
  isActive: boolean;
  settings?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateChatRequest {
  name: string;
  participants: string[];
  isGroup?: boolean;
  avatar?: string;
}

export interface CreateMessageRequest {
  chatId: string;
  content: string;
  type?: MessageType;
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentSize?: number;
}

export interface SearchMessagesRequest {
  query: string;
  chatId?: string;
  type?: MessageType;
  limit?: number;
  offset?: number;
}

export interface ChatContextType {
  chats: Chat[];
  currentChat: Chat | null;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  createChat: (chatData: CreateChatRequest) => Promise<void>;
  sendMessage: (messageData: CreateMessageRequest) => Promise<void>;
  searchMessages: (searchData: SearchMessagesRequest) => Promise<Message[]>;
  selectChat: (chatId: string) => void;
  markAsRead: (chatId: string) => Promise<void>;
  deleteChat: (chatId: string) => Promise<void>;
}
