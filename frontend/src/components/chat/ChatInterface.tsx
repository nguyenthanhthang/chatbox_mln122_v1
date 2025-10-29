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
    images?: { base64: string; mimeType: string }[]
  ) => {
    try {
      // Convert images to the format expected by the backend
      const imageData = images?.map((img) => ({
        base64: img.base64.split(",")[1], // Remove data URL prefix
        mimeType: img.mimeType,
      }));

      await sendMessage(content, undefined, undefined, imageData);
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
    <div className="flex h-screen bg-gradient-to-br from-blue-50 to-white">
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
        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-blue-50/30 to-white">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-6xl mb-4">🤖</div>
                <h1 className="text-2xl font-semibold text-blue-800 mb-2">
                  Welcome to AI Chatbot
                </h1>
                <p className="text-blue-600 mb-6">
                  Start a conversation with AI. Ask me anything!
                </p>
                <button
                  onClick={handleNewChat}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
                >
                  Start New Chat
                </button>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto px-4 py-6">
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
        <div className="border-t bg-gradient-to-r from-blue-50 to-white">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <InputBox
              onSendMessage={handleSendMessage}
              disabled={isLoading}
              placeholder="Type your message here..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
