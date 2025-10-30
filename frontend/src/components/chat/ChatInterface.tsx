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
    <div className="flex h-screen poster-bg text-slate-800">
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
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Header
          user={user}
          onMenuClick={() => setSidebarOpen(true)}
          onLogout={logout}
          onNewChat={handleNewChat}
        />

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 && !currentSession ? (
            <div className="flex items-center justify-center h-full px-4">
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
            <div className="max-w-4xl mx-auto px-4 py-6 parchment gold-frame">
              <MessageList messages={messages} />
              {isLoading && (
                <div className="flex justify-center py-4">
                  <LoadingSpinner />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t bg-gradient-to-r from-slate-50 to-white">
          <div className="max-w-4xl mx-auto px-4 py-4">
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
