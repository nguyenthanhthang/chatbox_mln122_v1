import React, { useState, useRef, useEffect } from "react";
import { useChat } from "../../context/ChatContext";
import { useAuth } from "../../context/AuthContext";
import MessageList from "./MessageList";
import InputBox from "./InputBox";
import Sidebar from "./Sidebar";
import Header from "./Header";
import LoadingSpinner from "../common/LoadingSpinner";

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

  // Load sessions on mount
  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Create new chat
  const handleNewChat = async () => {
    try {
      await createNewSession();
      setIsNewChat(true);
      setFocusInput(true);
      setSidebarOpen(false);
    } catch (error) {
      console.error("Failed to create new chat:", error);
    }
  };

  // Load existing session
  const handleLoadSession = async (sessionId: string) => {
    try {
      await loadSession(sessionId);
      setIsNewChat(false);
      setSidebarOpen(false);
    } catch (error) {
      console.error("Failed to load session:", error);
    }
  };

  // Delete session
  const handleDeleteSession = async (sessionId: string) => {
    try {
      await deleteSession(sessionId);
    } catch (error) {
      console.error("Failed to delete session:", error);
    }
  };

  // Send message
  const handleSendMessage = async (
    content: string,
    images?: { url?: string; base64?: string; mimeType: string }[]
  ) => {
    try {
      // Convert images to the format expected by the backend (url or base64)
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
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  // Clear current session
  const handleClearSession = async () => {
    if (!currentSession) return;
    try {
      await clearCurrentSession();
    } catch (error) {
      console.error("Failed to clear session:", error);
    }
  };

  return (
    <div className="relative flex h-screen app-frame text-slate-800 bg-[var(--bg)]">
      <div
        className="poster-bg rounded-3xl shadow-2xl absolute top-5 bottom-5 right-5 z-0"
        style={{ left: "22rem" }}
      />
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
      <div className="flex-1 flex flex-col z-10 pl-[22rem] pr-5 pt-5 pb-5">
        {/* Floating profile icon (headerless) */}
        <Header
          user={user}
          onMenuClick={() => setSidebarOpen(true)}
          onLogout={logout}
          onNewChat={handleNewChat}
          variant="iconOnly"
        />

        {/* Messages Area */}
        <div className="relative flex-1">
          {messages.length === 0 && !currentSession ? (
            <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-4 w-full max-w-3xl z-10">
              <div className="text-center max-w-xl">
                <div className="text-6xl mb-4">🤖</div>
                <h1 className="text-3xl font-semibold text-blue-800 mb-2">
                  Chào mừng đến với MLN_AI
                </h1>
                <p className="text-blue-700 mb-6">
                  Start a conversation with AI. Ask anything you want to learn!
                </p>
                <button
                  onClick={handleNewChat}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
                >
                  Start chatting
                </button>
              </div>
            </div>
          ) : (
            <div className="px-4 py-6 min-h-[70vh] grid place-items-center">
              <div className="w-full max-w-3xl parchment gold-frame px-4 py-6 max-h-[65vh] overflow-y-auto">
                <MessageList messages={messages} />
                {isLoading && (
                  <div className="flex justify-center py-4">
                    <LoadingSpinner />
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
          )}
        </div>

        {/* Input Area: centered and docked to bottom */}
        <div className="fixed left-1/2 -translate-x-1/2 bottom-6 w-full max-w-3xl px-4 z-20">
          <div className="p-3 bg-card border border-token rounded-2xl shadow-md">
            <InputBox
              onSendMessage={handleSendMessage}
              disabled={isLoading}
              placeholder="Type your message here..."
              autoFocus={focusInput || Boolean(currentSession)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
