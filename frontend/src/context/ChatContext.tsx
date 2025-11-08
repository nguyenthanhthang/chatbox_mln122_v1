import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { chatService } from "../services/chat.service";
import { websocketService } from "../services/websocket.service";
import { toastError, toastSuccess } from "../utils/toast";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  tokens?: number;
  model?: string;
  images?: any[];
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

interface ChatContextType {
  // Current session
  currentSession: ChatSession | null;
  messages: Message[];
  isLoading: boolean;
  isStreaming: boolean;

  // Sessions
  sessions: ChatSession[];
  sessionsLoading: boolean;
  loadSessions: () => Promise<void>;

  // AI Settings
  aiSettings: AISettings | null;
  availableModels: any[];

  // Actions
  createNewSession: (title?: string, model?: string) => Promise<void>;
  loadSession: (sessionId: string) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  sendMessage: (
    content: string,
    model?: string,
    images?: any[]
  ) => Promise<void>;
  clearCurrentSession: () => Promise<void>;
  clearAllHistory: () => Promise<void>;

  // AI Settings
  updateAISettings: (settings: Partial<AISettings>) => Promise<void>;
  loadAISettings: () => Promise<void>;
  loadAvailableModels: () => Promise<void>;
}

export const ChatContext = createContext<ChatContextType | undefined>(
  undefined
);

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(
    null
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);

  const [aiSettings, setAISettings] = useState<AISettings | null>(null);
  const [availableModels, setAvailableModels] = useState<any[]>([]);

  // WebSocket integration for realtime AI responses
  useEffect(() => {
    // Connect WebSocket
    websocketService.connect();

    // Handle AI response events
    const handleAIResponse = (data: {
      sessionId: string;
      messageId: string;
      content: string;
      tokens?: number;
      model?: string;
      status: 'processing' | 'completed' | 'error';
      error?: string;
    }) => {
      // Only update if it's for current session
      if (currentSession?.id === data.sessionId) {
        if (data.status === 'completed') {
          // Update or add AI message
          setMessages((prev) => {
            const existingIndex = prev.findIndex(
              (m) => m.id === data.messageId || m.id.startsWith('ai-pending-')
            );
            if (existingIndex !== -1) {
              // Replace placeholder
              const updated = [...prev];
              updated[existingIndex] = {
                id: data.messageId,
                role: 'assistant',
                content: data.content,
                timestamp: new Date().toISOString(),
                tokens: data.tokens,
                model: data.model,
              };
              return updated;
            } else {
              // Add new message
              return [
                ...prev,
                {
                  id: data.messageId,
                  role: 'assistant',
                  content: data.content,
                  timestamp: new Date().toISOString(),
                  tokens: data.tokens,
                  model: data.model,
                },
              ];
            }
          });
          setIsStreaming(false);
        } else if (data.status === 'error') {
          // Show error message
          setMessages((prev) =>
            prev.map((m) =>
              m.id.startsWith('ai-pending-')
                ? {
                    ...m,
                    id: `ai-error-${Date.now()}`,
                    content: data.error || 'Có lỗi khi tạo phản hồi',
                  }
                : m
            )
          );
          setIsStreaming(false);
          toastError(data.error || 'Có lỗi khi tạo phản hồi từ AI');
        }
      }
    };

    // Handle message status updates
    const handleMessageStatus = (data: {
      sessionId: string;
      messageId: string;
      status: 'pending' | 'processing' | 'completed' | 'error';
    }) => {
      if (currentSession?.id === data.sessionId) {
        if (data.status === 'processing') {
          setIsStreaming(true);
        } else if (data.status === 'completed' || data.status === 'error') {
          setIsStreaming(false);
        }
      }
    };

    // Subscribe to events
    websocketService.onAIResponse(handleAIResponse);
    websocketService.onMessageStatus(handleMessageStatus);

    // Cleanup on unmount
    return () => {
      websocketService.offAIResponse(handleAIResponse);
      websocketService.offMessageStatus(handleMessageStatus);
      websocketService.disconnect();
    };
  }, [currentSession?.id]);

  // Create new session
  const createNewSession = useCallback(
    async (title?: string, model?: string) => {
      try {
        setIsLoading(true);
        const session = await chatService.createSession({
          title: title || "Cuộc trò chuyện mới",
          model: model || "gemini-1.5-flash",
        });

        // Normalize id in case backend returns _id
        const normalized: ChatSession = {
          ...(session as any),
          id: (session as any).id || (session as any)._id,
        } as ChatSession;

        setCurrentSession(normalized);
        setMessages([]);
        await loadSessions(); // Refresh sessions list
        toastSuccess("Tạo cuộc trò chuyện mới thành công");
      } catch (error: any) {
        const errorMessage = error?.response?.data?.message || error?.message || "Không thể tạo cuộc trò chuyện mới";
        toastError(errorMessage);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Load session
  const loadSession = useCallback(async (sessionId: string) => {
    try {
      setIsLoading(true);
      const [session, history] = await Promise.all([
        chatService.getSession(sessionId),
        chatService.getSessionHistory(sessionId),
      ]);

      const normalized: ChatSession = {
        ...(session as any),
        id: (session as any).id || (session as any)._id,
      } as ChatSession;

      setCurrentSession(normalized);
      setMessages(history);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Không thể tải cuộc trò chuyện";
      toastError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Delete session
  const deleteSession = useCallback(
    async (sessionId: string) => {
      try {
        await chatService.deleteSession(sessionId);
        await loadSessions();
        toastSuccess("Xóa cuộc trò chuyện thành công");

        // If deleted session is current, reset and create new one
        if (currentSession?.id === sessionId) {
          setCurrentSession(null);
          setMessages([]);
          await createNewSession();
        }
      } catch (error: any) {
        const errorMessage = error?.response?.data?.message || error?.message || "Không thể xóa cuộc trò chuyện";
        toastError(errorMessage);
        throw error;
      }
    },
    [currentSession, createNewSession]
  );

  // Send message
  const sendMessage = useCallback(
    async (content: string, model?: string, images?: any[]) => {
      if (!content.trim() && (!images || images.length === 0)) return;

      try {
        setIsLoading(true);

        // ensure we have a session id to send into
        let sessionIdForSend: string | undefined = currentSession?.id;
        if (!sessionIdForSend) {
        const created = await chatService.createSession({
          title: "Cuộc trò chuyện mới",
        });
          const normalized: ChatSession = {
            ...(created as any),
            id: (created as any).id || (created as any)._id,
          } as ChatSession;
          setCurrentSession(normalized);
          sessionIdForSend = normalized.id;
          await loadSessions();
        }

        // Add user message immediately
        const userMessage: Message = {
          id: `user-${Date.now()}`,
          role: "user",
          content,
          timestamp: new Date().toISOString(),
          images: images,
        };

        setMessages((prev) => [...prev, userMessage]);

        // Add assistant placeholder (typing)
        const placeholderId = `ai-pending-${Date.now()}`;
        setMessages((prev) => [
          ...prev,
          {
            id: placeholderId,
            role: "assistant",
            content: "",
            timestamp: new Date().toISOString(),
          },
        ]);

        // Send to AI (response will come via WebSocket for realtime updates)
        // But we still wait for HTTP response as fallback
        const response = await chatService.sendMessage({
          message: content,
          sessionId: sessionIdForSend,
          model: model || currentSession?.aiModel || "gemini-1.5-flash",
          images: images,
        });

        // If WebSocket didn't update the message (fallback after 2 seconds), update manually
        // This ensures compatibility if WebSocket fails
        setTimeout(() => {
          setMessages((prev) => {
            const hasAIResponse = prev.some(
              (m) =>
                (m.id === response.aiMessage.id ||
                  m.id === response.aiMessage._id ||
                  m.id === placeholderId) &&
                m.content.length > 0
            );
            if (!hasAIResponse) {
              return prev.map((m) =>
                m.id === placeholderId
                  ? {
                      id:
                        response.aiMessage.id ||
                        response.aiMessage._id ||
                        `ai-${Date.now()}`,
                      role: "assistant",
                      content: response.aiMessage.content,
                      timestamp: new Date().toISOString(),
                      tokens: response.aiMessage.tokens,
                      model: response.aiMessage.model,
                    }
                  : m
              );
            }
            return prev;
          });
        }, 2000);

        // Update current session if it was created
        if (response.userMessage && !currentSession) {
          // This was a new session, load it
          await loadSessions();
          const newSession = sessions.find(
            (s) => s.id === response.userMessage.sessionId
          );
          if (newSession) {
            setCurrentSession(newSession);
          }
        }
      } catch (error) {
        console.error("Failed to send message:", error);
        // Replace placeholder with an error message
        const errorMessage = (error as any)?.response?.data?.message || (error as any)?.message || "Có lỗi khi gửi tin nhắn";
        toastError(errorMessage);
        setMessages((prev) =>
          prev.map((m) =>
            m.id.startsWith("ai-pending-")
              ? {
                  ...m,
                  id: `ai-${Date.now()}`,
                  content:
                    "Xin lỗi, có lỗi khi tạo phản hồi. Vui lòng thử lại sau.",
                }
              : m
          )
        );
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [currentSession, sessions]
  );

  // Clear current session
  const clearCurrentSession = useCallback(async () => {
    if (!currentSession) return;

    try {
      await chatService.clearSessionHistory(currentSession.id);
      setMessages([]);
      toastSuccess("Đã xóa lịch sử cuộc trò chuyện");
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Không thể xóa lịch sử";
      toastError(errorMessage);
      throw error;
    }
  }, [currentSession]);

  // Clear all history
  const clearAllHistory = useCallback(async () => {
    try {
      await chatService.clearAllHistory();
      setMessages([]);
      setCurrentSession(null);
      await loadSessions();
      toastSuccess("Đã xóa toàn bộ lịch sử");
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Không thể xóa lịch sử";
      toastError(errorMessage);
      throw error;
    }
  }, []);

  // Load sessions
  const loadSessions = useCallback(async () => {
    try {
      setSessionsLoading(true);
      const response = await chatService.getSessions();
      const normalized = response.sessions.map((s: any) => ({
        ...s,
        id: s.id || s._id,
      }));
      setSessions(normalized);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Không thể tải danh sách cuộc trò chuyện";
      toastError(errorMessage);
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  // AI Settings
  const updateAISettings = useCallback(
    async (settings: Partial<AISettings>) => {
      try {
        const updatedSettings = await chatService.updateAISettings(settings);
        setAISettings(updatedSettings);
        toastSuccess("Cập nhật cài đặt AI thành công");
      } catch (error: any) {
        const errorMessage = error?.response?.data?.message || error?.message || "Không thể cập nhật cài đặt AI";
        toastError(errorMessage);
        throw error;
      }
    },
    []
  );

  const loadAISettings = useCallback(async () => {
    try {
      const settings = await chatService.getAISettings();
      setAISettings(settings);
    } catch (error: any) {
      // Silent fail for loading settings - not critical
      console.error("Failed to load AI settings:", error);
    }
  }, []);

  const loadAvailableModels = useCallback(async () => {
    try {
      const models = await chatService.getAvailableModels();
      setAvailableModels(models);
    } catch (error: any) {
      // Silent fail for loading models - not critical
      console.error("Failed to load available models:", error);
    }
  }, []);

  const value: ChatContextType = {
    currentSession,
    messages,
    isLoading,
    isStreaming,
    sessions,
    sessionsLoading,
    loadSessions,
    aiSettings,
    availableModels,
    createNewSession,
    loadSession,
    deleteSession,
    sendMessage,
    clearCurrentSession,
    clearAllHistory,
    updateAISettings,
    loadAISettings,
    loadAvailableModels,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat phải được sử dụng trong ChatProvider");
  }
  return context;
};
