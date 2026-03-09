import React, { useState, useRef, useEffect } from "react";
import { useChat } from "../../context/ChatContext";
import { useAuth } from "../../context/AuthContext";
import { getDisplayName } from "../../utils/helpers";
import { ImageMetadata } from "../../types/image.types";
import MessageList from "./MessageList";
import InputBox from "./InputBox";
import Sidebar from "./Sidebar";
import Header from "./Header";

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
      setFocusInput(true);
      setSidebarOpen(false);
    } catch {
      // Lỗi đã được hiển thị trong ChatContext
    }
  };

  const handleLoadSession = async (sessionId: string) => {
    try {
      await loadSession(sessionId);
      setSidebarOpen(false);
    } catch {
      // Lỗi đã được hiển thị trong ChatContext
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await deleteSession(sessionId);
    } catch {
      // Lỗi đã được hiển thị trong ChatContext
    }
  };

  const handleSendMessage = async (
    content: string,
    images?: ImageMetadata[]
  ) => {
    try {
      const imageData = images
        ?.map((img) => {
          const mimeType = img.mimeType || "image/jpeg";
          if (img.url || img.publicId) {
            return { url: img.url, publicId: img.publicId, mimeType };
          }
          if (img.base64) {
            return {
              base64: img.base64.includes(",")
                ? img.base64.split(",")[1]
                : img.base64,
              mimeType,
            };
          }
          return undefined as any;
        })
        .filter(Boolean);

      await sendMessage(content, undefined, imageData);
    } catch {
      // Lỗi đã được hiển thị trong ChatContext (toast + message inline)
    }
  };

  const handleClearSession = async () => {
    if (!currentSession) return;
    try {
      await clearCurrentSession();
    } catch {
      // Lỗi đã được hiển thị trong ChatContext
    }
  };

  return (
    <div className="relative flex h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-red-200/30 dark:bg-red-900/20 rounded-full blur-3xl animate-blob top-0 -left-48"></div>
        <div className="absolute w-96 h-96 bg-yellow-200/30 dark:bg-yellow-900/20 rounded-full blur-3xl animate-blob animation-delay-2000 top-0 right-0"></div>
        <div className="absolute w-96 h-96 bg-orange-200/30 dark:bg-orange-900/20 rounded-full blur-3xl animate-blob animation-delay-4000 bottom-0 left-1/2"></div>
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
            // Màn hình landing khi chưa có phiên chat nào
            <div className="flex items-center justify-center h-full animate-fade-in">
              <div className="text-center max-w-2xl px-4">
                <div className="w-32 h-32 mx-auto mb-6 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-yellow-500 rounded-full animate-pulse"></div>
                  <div className="absolute inset-2 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center">
                    <span className="text-6xl">🤖</span>
                  </div>
                </div>
                <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-red-600 to-yellow-600 dark:from-red-400 dark:to-yellow-400 bg-clip-text text-transparent animate-slide-up">
                  Chatbot MLN131
                </h1>
                <p className="text-xl text-gray-700 dark:text-gray-300 mb-8 animate-slide-up animation-delay-200">
                  Bắt đầu cuộc trò chuyện với AI MLN131
                </p>
                <button
                  onClick={handleNewChat}
                  className="px-8 py-4 bg-gradient-to-r from-red-500 to-yellow-500 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 animate-slide-up animation-delay-400"
                >
                  Bắt đầu trò chuyện
                </button>
              </div>
            </div>
          ) : messages.length === 0 && currentSession ? (
            // Lời chào cho phiên chat mới (ẩn sau tin nhắn đầu)
            <div className="flex items-center justify-center h-full animate-fade-in">
              <div className="relative max-w-3xl w-full">
                <div className="absolute -inset-1 bg-gradient-to-r from-red-500 via-orange-400 to-yellow-400 opacity-60 blur-2xl rounded-3xl animate-pulse" />
                <div className="relative bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-3xl px-8 py-10 shadow-2xl border border-white/60 dark:border-gray-700">
                  <div className="flex items-center justify-center mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-yellow-500 flex items-center justify-center shadow-lg animate-bounce">
                      <span className="text-3xl">🤖</span>
                    </div>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-semibold text-center mb-3 text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 animate-slide-up">
                    Tôi có thể giúp được gì, {getDisplayName(user)}?
                  </h2>
                  <p className="text-center text-gray-600 dark:text-gray-300 mb-6 animate-slide-up animation-delay-200">
                    Hãy nhập câu hỏi đầu tiên của bạn ở bên dưới. Tôi có thể hỗ trợ bạn tóm tắt tài liệu, giải thích khái niệm, gợi ý ý tưởng, hoặc cùng bạn debug code.
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 text-sm animate-slide-up animation-delay-400">
                    <span className="px-3 py-1 rounded-full bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-200 border border-red-100 dark:border-red-800">
                      Gợi ý 📚: “Tóm tắt giúp mình tài liệu này…”
                    </span>
                    <span className="px-3 py-1 rounded-full bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-200 border border-yellow-100 dark:border-yellow-800">
                      Hỏi đáp 💡: “Giải thích đơn giản cho mình…”
                    </span>
                    <span className="px-3 py-1 rounded-full bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-200 border border-orange-100 dark:border-orange-800">
                      Lập trình 🧑‍💻: “Giúp mình sửa lỗi này…”
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              <MessageList messages={messages} />
              {isLoading && (
                <div className="flex justify-center py-8 animate-fade-in">
                  <div className="flex items-center space-x-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg">
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
        <div className="sticky bottom-0 left-0 right-0 px-4 py-6 bg-gradient-to-t from-white dark:from-gray-900 via-white/95 dark:via-gray-900/95 to-transparent">
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