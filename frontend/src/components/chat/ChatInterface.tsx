import React, { useState, useRef, useEffect } from "react";
import { useChat } from "../../context/ChatContext";
import { useAuth } from "../../context/AuthContext";
import MessageList from "./MessageList";
import InputBox from "./InputBox";
import Sidebar from "./Sidebar";
import Header from "./Header";
import LoadingSpinner from "../common/LoadingSpinner";
import { toastError } from "../../utils/toast";

const ChatInterface: React.FC = () => {
  const { user, logout } = useAuth();
  const {
    currentSession,
    messages,
    isLoading,
    sessions,
    sessionsLoading,
    createNewSession,
    loadSession,
    deleteSession,
    sendMessage,
    clearCurrentSession,
    loadSessions,
  } = useChat();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isNewChat, setIsNewChat] = useState(false);
  const [focusInput, setFocusInput] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleNewChat = async () => {
    try {
      await createNewSession();
      setIsNewChat(true);
      setFocusInput(true);
      setSidebarOpen(false);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Không thể tạo cuộc trò chuyện mới";
      toastError(errorMessage);
    }
  };

  const handleLoadSession = async (sessionId: string) => {
    try {
      await loadSession(sessionId);
      setIsNewChat(false);
      setSidebarOpen(false);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Không thể tải cuộc trò chuyện";
      toastError(errorMessage);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await deleteSession(sessionId);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Không thể xóa cuộc trò chuyện";
      toastError(errorMessage);
    }
  };

  const handleSendMessage = async (
    content: string,
    images?: { url?: string; base64?: string; mimeType: string }[]
  ) => {
    try {
      const imageData = images
        ?.map((img) => {
          if (img.url) {
            return { url: img.url, mimeType: img.mimeType };
          }
          if (img.base64) {
            return {
              base64: img.base64.includes(",")
                ? img.base64.split(",")[1]
                : img.base64,
              mimeType: img.mimeType,
            };
          }
          return undefined as any;
        })
        .filter(Boolean);

      await sendMessage(content, undefined, imageData);
      setIsNewChat(false);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Không thể gửi tin nhắn";
      toastError(errorMessage);
    }
  };

  const handleClearSession = async () => {
    if (!currentSession) return;
    try {
      await clearCurrentSession();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Không thể xóa lịch sử";
      toastError(errorMessage);
    }
  };

  return (
    <div className="relative flex h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-red-200/30 rounded-full blur-3xl animate-blob top-0 -left-48"></div>
        <div className="absolute w-96 h-96 bg-yellow-200/30 rounded-full blur-3xl animate-blob animation-delay-2000 top-0 right-0"></div>
        <div className="absolute w-96 h-96 bg-orange-200/30 rounded-full blur-3xl animate-blob animation-delay-4000 bottom-0 left-1/2"></div>
      </div>

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        sessions={sessions}
        sessionsLoading={sessionsLoading}
        currentSession={currentSession}
        onNewChat={handleNewChat}
        onLoadSession={handleLoadSession}
        onDeleteSession={handleDeleteSession}
        onClearSession={handleClearSession}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col z-10 lg:pl-80 relative">
        {/* Header */}
        <Header
          user={user}
          onMenuClick={() => setSidebarOpen(true)}
          onLogout={logout}
          onNewChat={handleNewChat}
          variant="iconOnly"
        />

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          {messages.length === 0 && !currentSession ? (
            <div className="flex items-center justify-center h-full animate-fade-in">
              <div className="text-center max-w-2xl px-4">
                <div className="w-32 h-32 mx-auto mb-6 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-yellow-500 rounded-full animate-pulse"></div>
                  <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                    <span className="text-6xl">🤖</span>
                  </div>
                </div>
                <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-red-600 to-yellow-600 bg-clip-text text-transparent animate-slide-up">
                  Chatbot Triết Học
                </h1>
                <p className="text-xl text-gray-700 mb-8 animate-slide-up animation-delay-200">
                  Bắt đầu cuộc trò chuyện với trí tuệ nhân tạo
                </p>
                <button
                  onClick={handleNewChat}
                  className="px-8 py-4 bg-gradient-to-r from-red-500 to-yellow-500 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 animate-slide-up animation-delay-400"
                >
                  Bắt đầu trò chuyện
                </button>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              <MessageList messages={messages} />
              {isLoading && (
                <div className="flex justify-center py-8 animate-fade-in">
                  <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg">
                    <div className="w-3 h-3 bg-gradient-to-r from-red-500 to-yellow-500 rounded-full animate-bounce"></div>
                    <div className="w-3 h-3 bg-gradient-to-r from-red-500 to-yellow-500 rounded-full animate-bounce animation-delay-200"></div>
                    <div className="w-3 h-3 bg-gradient-to-r from-red-500 to-yellow-500 rounded-full animate-bounce animation-delay-400"></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="sticky bottom-0 left-0 right-0 px-4 py-6 bg-gradient-to-t from-white via-white/95 to-transparent">
          <div className="max-w-4xl mx-auto">
            <InputBox
              onSendMessage={handleSendMessage}
              disabled={isLoading}
              placeholder="Nhập câu hỏi của bạn..."
              autoFocus={focusInput || Boolean(currentSession)}
            />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(50px, 50px) scale(1.05); }
        }

        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slide-up {
          from { 
            opacity: 0;
            transform: translateY(30px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.8s ease-out;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
        }

        .animation-delay-400 {
          animation-delay: 0.4s;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default ChatInterface;