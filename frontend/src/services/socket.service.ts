import { io, Socket } from "socket.io-client";
import { SOCKET_URL } from "../utils/constants";
import { getToken } from "../utils/helpers";
import { Message, Chat } from "../types/chat.types";

export class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Function[]> = new Map();

  connect(): void {
    if (this.socket?.connected) {
      return;
    }

    const token = getToken();
    if (!token) {
      console.error("No token available for socket connection");
      return;
    }

    this.socket = io(SOCKET_URL, {
      auth: {
        token,
      },
      transports: ["websocket"],
    });

    this.setupEventListeners();
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("Connected to socket server");
      this.emit("connected");
    });

    this.socket.on("disconnect", () => {
      console.log("Disconnected from socket server");
      this.emit("disconnected");
    });

    this.socket.on("error", (error) => {
      console.error("Socket error:", error);
      this.emit("error", error);
    });

    this.socket.on("message:new", (message: Message) => {
      this.emit("message:new", message);
    });

    this.socket.on(
      "message:read",
      (data: { chatId: string; userId: string }) => {
        this.emit("message:read", data);
      }
    );

    this.socket.on(
      "chat:updated",
      (data: {
        chatId: string;
        lastMessage: Message;
        lastMessageAt: string;
      }) => {
        this.emit("chat:updated", data);
      }
    );

    this.socket.on(
      "user:joined",
      (data: { chatId: string; userId: string }) => {
        this.emit("user:joined", data);
      }
    );

    this.socket.on("user:left", (data: { chatId: string; userId: string }) => {
      this.emit("user:left", data);
    });

    this.socket.on(
      "typing:start",
      (data: { chatId: string; userId: string }) => {
        this.emit("typing:start", data);
      }
    );

    this.socket.on(
      "typing:stop",
      (data: { chatId: string; userId: string }) => {
        this.emit("typing:stop", data);
      }
    );

    this.socket.on("user:online", (data: { userId: string }) => {
      this.emit("user:online", data);
    });

    this.socket.on("user:offline", (data: { userId: string }) => {
      this.emit("user:offline", data);
    });

    this.socket.on("joined:room", (data: { chatId: string }) => {
      this.emit("joined:room", data);
    });

    this.socket.on("left:room", (data: { chatId: string }) => {
      this.emit("left:room", data);
    });

    this.socket.on("error", (error: any) => {
      this.emit("error", error);
    });
  }

  // Join a chat room
  joinChat(chatId: string): void {
    if (this.socket) {
      this.socket.emit("join:room", { chatId });
    }
  }

  // Leave a chat room
  leaveChat(chatId: string): void {
    if (this.socket) {
      this.socket.emit("leave:room", { chatId });
    }
  }

  // Send a message
  sendMessage(messageData: {
    chatId: string;
    content: string;
    type?: string;
    attachmentUrl?: string;
    attachmentName?: string;
    attachmentSize?: number;
  }): void {
    if (this.socket) {
      this.socket.emit("message:send", messageData);
    }
  }

  // Mark messages as read
  markAsRead(chatId: string): void {
    if (this.socket) {
      this.socket.emit("message:read", { chatId });
    }
  }

  // Typing indicators
  startTyping(chatId: string): void {
    if (this.socket) {
      this.socket.emit("typing:start", { chatId });
    }
  }

  stopTyping(chatId: string): void {
    if (this.socket) {
      this.socket.emit("typing:stop", { chatId });
    }
  }

  // Event listeners
  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => callback(data));
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();
