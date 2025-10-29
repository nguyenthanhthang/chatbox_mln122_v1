import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  Chat,
  Message,
  ChatContextType,
  CreateChatRequest,
  CreateMessageRequest,
  SearchMessagesRequest,
} from "../types/chat.types";
import { chatService } from "../services/chat.service";
import { socketService } from "../services/socket.service";
import { useAuth } from "./AuthContext";

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      socketService.connect();
      loadChats();
    } else {
      socketService.disconnect();
      setChats([]);
      setCurrentChat(null);
      setMessages([]);
    }

    return () => {
      socketService.disconnect();
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (currentChat) {
      socketService.joinChat(currentChat._id);
      loadMessages(currentChat._id);
    }

    return () => {
      if (currentChat) {
        socketService.leaveChat(currentChat._id);
      }
    };
  }, [currentChat]);

  useEffect(() => {
    // Socket event listeners
    const handleNewMessage = (message: Message) => {
      setMessages((prev) => [...prev, message]);

      // Update chat's last message
      setChats((prev) =>
        prev.map((chat) =>
          chat._id === message.chatId
            ? {
                ...chat,
                lastMessage: message,
                lastMessageAt: message.createdAt,
              }
            : chat
        )
      );
    };

    const handleMessageUpdated = (message: Message) => {
      setMessages((prev) =>
        prev.map((msg) => (msg._id === message._id ? message : msg))
      );
    };

    const handleMessageDeleted = (messageId: string) => {
      setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
    };

    const handleChatUpdated = (updatedChat: Chat) => {
      setChats((prev) =>
        prev.map((chat) => (chat._id === updatedChat._id ? updatedChat : chat))
      );

      if (currentChat?._id === updatedChat._id) {
        setCurrentChat(updatedChat);
      }
    };

    socketService.on("newMessage", handleNewMessage);
    socketService.on("messageUpdated", handleMessageUpdated);
    socketService.on("messageDeleted", handleMessageDeleted);
    socketService.on("chatUpdated", handleChatUpdated);

    return () => {
      socketService.off("newMessage", handleNewMessage);
      socketService.off("messageUpdated", handleMessageUpdated);
      socketService.off("messageDeleted", handleMessageDeleted);
      socketService.off("chatUpdated", handleChatUpdated);
    };
  }, [currentChat]);

  const loadChats = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      const chatList = await chatService.getChats();
      setChats(chatList);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (chatId: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      const { messages: chatMessages } = await chatService.getChatHistory(
        chatId
      );
      setMessages(chatMessages);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const createChat = async (chatData: CreateChatRequest): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      const newChat = await chatService.createChat(chatData);
      setChats((prev) => [newChat, ...prev]);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (
    messageData: CreateMessageRequest
  ): Promise<void> => {
    try {
      setError(null);
      // Optimistic update
      const tempMessage: Message = {
        _id: `temp-${Date.now()}`,
        senderId: "current-user", // This will be replaced by the actual message from server
        content: messageData.content,
        type: messageData.type || "text",
        attachmentUrl: messageData.attachmentUrl,
        attachmentName: messageData.attachmentName,
        attachmentSize: messageData.attachmentSize,
        isEdited: false,
        isDeleted: false,
        readBy: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, tempMessage]);

      // Send via socket for real-time delivery
      socketService.sendMessage(messageData);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const searchMessages = async (
    searchData: SearchMessagesRequest
  ): Promise<Message[]> => {
    try {
      setError(null);
      const results = await chatService.searchMessages(searchData);
      return results;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const selectChat = (chatId: string): void => {
    const chat = chats.find((c) => c._id === chatId);
    if (chat) {
      setCurrentChat(chat);
    }
  };

  const markAsRead = async (chatId: string): Promise<void> => {
    try {
      await chatService.markAsRead(chatId);
      // Update local state
      setMessages((prev) =>
        prev.map((msg) => ({
          ...msg,
          readBy: [...msg.readBy, "current-user"],
        }))
      );
    } catch (err: any) {
      setError(err.message);
    }
  };

  const deleteChat = async (chatId: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      await chatService.deleteChat(chatId);
      setChats((prev) => prev.filter((chat) => chat._id !== chatId));

      if (currentChat?._id === chatId) {
        setCurrentChat(null);
        setMessages([]);
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const value: ChatContextType = {
    chats,
    currentChat,
    messages,
    isLoading,
    error,
    createChat,
    sendMessage,
    searchMessages,
    selectChat,
    markAsRead,
    deleteChat,
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
