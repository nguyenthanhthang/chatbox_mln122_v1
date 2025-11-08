import { io, Socket } from 'socket.io-client';
import { getToken } from '../utils/helpers';

export interface AIResponseEvent {
  sessionId: string;
  messageId: string;
  content: string;
  tokens?: number;
  model?: string;
  status: 'processing' | 'completed' | 'error';
  error?: string;
}

export interface MessageStatusEvent {
  sessionId: string;
  messageId: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
}

export interface TypingEvent {
  sessionId: string;
  isTyping: boolean;
}

type AIResponseCallback = (data: AIResponseEvent) => void;
type MessageStatusCallback = (data: MessageStatusEvent) => void;
type TypingCallback = (data: TypingEvent) => void;

/**
 * WebSocket service for realtime AI responses
 */
class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second

  /**
   * Get WebSocket URL from environment or default
   */
  private getSocketUrl(): string {
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
    // Remove /api suffix if present, add /chat namespace
    const baseUrl = apiUrl.replace(/\/api$/, '');
    return `${baseUrl}/chat`;
  }

  /**
   * Connect to WebSocket server
   */
  connect(): void {
    if (this.socket?.connected) {
      return;
    }

    const token = getToken();
    if (!token) {
      console.warn('No access token, cannot connect to WebSocket');
      return;
    }

    const url = this.getSocketUrl();

    this.socket = io(url, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: this.reconnectDelay,
      reconnectionAttempts: this.maxReconnectAttempts,
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      this.reconnectDelay = 1000; // Reset delay
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.reconnectAttempts++;
      // Exponential backoff
      this.reconnectDelay = Math.min(
        this.reconnectDelay * 2,
        30000, // Max 30 seconds
      );
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Subscribe to AI response events
   */
  onAIResponse(callback: AIResponseCallback): void {
    if (!this.socket) {
      this.connect();
    }
    this.socket?.on('ai-response', callback);
  }

  /**
   * Unsubscribe from AI response events
   */
  offAIResponse(callback?: AIResponseCallback): void {
    if (callback) {
      this.socket?.off('ai-response', callback);
    } else {
      this.socket?.off('ai-response');
    }
  }

  /**
   * Subscribe to message status events
   */
  onMessageStatus(callback: MessageStatusCallback): void {
    if (!this.socket) {
      this.connect();
    }
    this.socket?.on('message-status', callback);
  }

  /**
   * Unsubscribe from message status events
   */
  offMessageStatus(callback?: MessageStatusCallback): void {
    if (callback) {
      this.socket?.off('message-status', callback);
    } else {
      this.socket?.off('message-status');
    }
  }

  /**
   * Subscribe to typing events
   */
  onTyping(callback: TypingCallback): void {
    if (!this.socket) {
      this.connect();
    }
    this.socket?.on('typing', callback);
  }

  /**
   * Unsubscribe from typing events
   */
  offTyping(callback?: TypingCallback): void {
    if (callback) {
      this.socket?.off('typing', callback);
    } else {
      this.socket?.off('typing');
    }
  }

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const websocketService = new WebSocketService();

