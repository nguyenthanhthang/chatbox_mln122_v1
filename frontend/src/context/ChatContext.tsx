import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { chatService } from "../services/chat.service";

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

  // Create new session
  const createNewSession = useCallback(
    async (title?: string, model?: string) => {
      try {
        setIsLoading(true);
        const session = await chatService.createSession({
          title: title || "New Chat",
          model: model || "gpt-4",
        });

        // Normalize id in case backend returns _id
        const normalized: ChatSession = {
          ...(session as any),
          id: (session as any).id || (session as any)._id,
        } as ChatSession;

        setCurrentSession(normalized);
        setMessages([]);
        await loadSessions(); // Refresh sessions list
      } catch (error) {
        console.error("Failed to create session:", error);
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
    } catch (error) {
      console.error("Failed to load session:", error);
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

        // If deleted session is current, reset and create new one
        if (currentSession?.id === sessionId) {
          setCurrentSession(null);
          setMessages([]);
          await createNewSession();
        }
      } catch (error) {
        console.error("Failed to delete session:", error);
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
            title: "New Chat",
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

        // Send to AI
        const response = await chatService.sendMessage({
          message: content,
          sessionId: sessionIdForSend,
          model: model || currentSession?.aiModel || "gemini-1.5-flash",
          images: images,
        });

        // Replace placeholder with AI response
        setMessages((prev) =>
          prev.map((m) =>
            m.id === placeholderId
              ? {
                  id: `ai-${Date.now()}`,
                  role: "assistant",
                  content: response.aiMessage.content,
                  timestamp: new Date().toISOString(),
                  tokens: response.aiMessage.tokens,
                  model: response.aiMessage.model,
                }
              : m
          )
        );

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
    } catch (error) {
      console.error("Failed to clear session:", error);
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
    } catch (error) {
      console.error("Failed to clear all history:", error);
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
    } catch (error) {
      console.error("Failed to load sessions:", error);
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
      } catch (error) {
        console.error("Failed to update AI settings:", error);
        throw error;
      }
    },
    []
  );

  const loadAISettings = useCallback(async () => {
    try {
      const settings = await chatService.getAISettings();
      setAISettings(settings);
    } catch (error) {
      console.error("Failed to load AI settings:", error);
    }
  }, []);

  const loadAvailableModels = useCallback(async () => {
    try {
      const models = await chatService.getAvailableModels();
      setAvailableModels(models);
    } catch (error) {
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
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
