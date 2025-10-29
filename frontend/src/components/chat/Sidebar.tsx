import React from "react";
import { ChatSession } from "../../context/ChatContext";
import LoadingSpinner from "../common/LoadingSpinner";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  sessionsLoading: boolean;
  currentSession: ChatSession | null;
  onNewChat: () => void;
  onLoadSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onClearSession: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  sessions,
  sessionsLoading,
  currentSession,
  onNewChat,
  onLoadSession,
  onDeleteSession,
  onClearSession,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 168) {
      // 7 days
      return date.toLocaleDateString([], { weekday: "short" });
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-80 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">
              Chat History
            </h2>
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* New Chat Button */}
          <div className="p-4">
            <button
              onClick={onNewChat}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span>New Chat</span>
            </button>
          </div>

          {/* Sessions List */}
          <div className="flex-1 overflow-y-auto">
            {sessionsLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : sessions.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <div className="text-4xl mb-2">💬</div>
                <p>No chat history yet</p>
                <p className="text-sm">Start a new conversation!</p>
              </div>
            ) : (
              <div className="space-y-1 p-2">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className={`group relative flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      currentSession?.id === session.id
                        ? "bg-blue-50 border border-blue-200"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => onLoadSession(session.id)}
                  >
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-gray-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          />
                        </svg>
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {session.title}
                      </p>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <span>{formatDate(session.lastMessageAt)}</span>
                        <span>•</span>
                        <span>{session.messageCount} messages</span>
                        {session.totalTokens > 0 && (
                          <>
                            <span>•</span>
                            <span>{session.totalTokens} tokens</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSession(session.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-100 text-red-600 transition-all"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {currentSession && (
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={onClearSession}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                <span>Clear Current Chat</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
