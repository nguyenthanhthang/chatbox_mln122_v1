import React, { useMemo, useState } from "react";
import { ChatSession, useChat } from "../../context/ChatContext";
import { chatService } from "../../services/chat.service";
import LoadingSpinner from "../common/LoadingSpinner";
import { Modal, Input, Button } from "../common";
import StatsWidget from "../layout/StatsWidget";

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
  const { loadSessions } = useChat();
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "today" | "week" | "starred">(
    "all"
  );

  const filteredSessions = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);
    return sessions.filter((s) => {
      const title = (s.title || "").toLowerCase();
      const matches = title.includes(query.toLowerCase());
      if (!matches) return false;
      if (filter === "today") return new Date(s.lastMessageAt) >= startOfToday;
      if (filter === "week") return new Date(s.lastMessageAt) >= startOfWeek;
      // starred placeholder: if title contains ★ or [*]
      if (filter === "starred") return /★|\*\]/.test(title);
      return true;
    });
  }, [sessions, query, filter]);

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
        className={`absolute top-3 bottom-3 left-3 z-50 w-80 parchment rounded-2xl shadow transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-800">
              Chat History
            </h2>
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-lg hover:bg-blue-100"
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

          {/* Search + Filters */}
          <div className="px-4 pt-4">
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Tìm đoạn chat..."
                  className="w-full rounded-xl border border-slate-300 bg-white/70 px-3 py-2 text-sm focus-ring"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400">
                  ⌘K
                </span>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {(
                [
                  { k: "all", label: "All" },
                  { k: "today", label: "Today" },
                  { k: "week", label: "Week" },
                  { k: "starred", label: "Starred" },
                ] as const
              ).map((f) => (
                <button
                  key={f.k}
                  onClick={() => setFilter(f.k)}
                  className={`chip ${
                    filter === f.k
                      ? "border-[var(--primary)] text-[var(--primary)]"
                      : ""
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* New Chat Button */}
          <div className="p-4">
            <button
              onClick={onNewChat}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors shadow-lg"
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
              <div className="p-4 space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-lg border border-token bg-card"
                  >
                    <div className="w-8 h-8 rounded-full skeleton" />
                    <div className="flex-1">
                      <div className="h-3 w-1/2 rounded skeleton mb-2" />
                      <div className="h-3 w-1/3 rounded skeleton" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredSessions.length === 0 ? (
              <div className="p-4 text-center text-slate-600">
                <div className="text-4xl mb-2">💬</div>
                <p>No chat history yet</p>
                <p className="text-sm">Start a new conversation!</p>
              </div>
            ) : (
              <div className="space-y-1 p-2">
                {filteredSessions.map((session) => (
                  <div
                    key={session.id}
                    className={`group relative flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      currentSession?.id === session.id
                        ? "bg-slate-100 border border-slate-300 shadow-sm"
                        : "hover:bg-slate-50"
                    }`}
                    onClick={() => onLoadSession(session.id)}
                  >
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-slate-700"
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
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {session.title}
                      </p>
                      <div className="flex items-center space-x-2 text-xs text-slate-600">
                        <span>{formatDate(session.lastMessageAt)}</span>
                        <span>•</span>
                        <span>{session.messageCount} messages</span>
                      </div>
                    </div>

                    {/* Rename & Delete Buttons */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setRenamingId(session.id);
                        setRenameValue(session.title || "");
                        setRenameOpen(true);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-100 text-slate-700 transition-all mr-1"
                      title="Rename"
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
                          d="M15.232 5.232l3.536 3.536M9 13l6.232-6.232a2 2 0 112.828 2.828L11.828 15.828A4 4 0 018 17H7v-1a4 4 0 012-3.464z"
                        />
                      </svg>
                    </button>
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
          <div className="p-3 border-t border-blue-200">
            <StatsWidget />
            {currentSession && (
              <button
                onClick={onClearSession}
                className="mt-2 w-full flex items-center justify-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
            )}
          </div>
        </div>
      </div>

      {/* Rename Modal */}
      <Modal
        open={renameOpen}
        onClose={() => setRenameOpen(false)}
        title="Rename chat"
      >
        <div className="space-y-4">
          <Input
            label="Title"
            type="text"
            value={renameValue}
            onChange={(e: any) => setRenameValue(e.target.value)}
          />
          <div className="flex justify-end space-x-2">
            <Button variant="text" onClick={() => setRenameOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (renamingId && renameValue.trim().length > 0) {
                  await chatService.renameSession(
                    renamingId,
                    renameValue.trim()
                  );
                  await loadSessions();
                }
                setRenameOpen(false);
              }}
            >
              Save
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Sidebar;
