import React, { useMemo, useState } from "react";
import { ChatSession, useChat } from "../../context/ChatContext";
import { chatService } from "../../services/chat.service";
import { Modal, Input, Button } from "../common";

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
  const [filter, setFilter] = useState<"all" | "today" | "week" | "starred">("all");

  const filteredSessions = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);
    return sessions.filter((s) => {
      const title = (s.title || "").toLowerCase();
      const matches = title.includes(query.toLowerCase());
      if (!matches) return false;
      if (filter === "today") return new Date(s.lastMessageAt) >= startOfToday;
      if (filter === "week") return new Date(s.lastMessageAt) >= startOfWeek;
      if (filter === "starred") return /★|\*\]/.test(title);
      return true;
    });
  }, [sessions, query, filter]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } else if (diffInHours < 168) {
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
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 bottom-0 left-0 z-50 w-80 bg-white/95 backdrop-blur-xl shadow-2xl transform transition-all duration-500 ease-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="relative p-6 bg-gradient-to-r from-red-500 to-yellow-500 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-red-400/20 to-yellow-400/20"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Lịch sử</h2>
                <p className="text-sm text-white/90">Các cuộc trò chuyện</p>
              </div>
              <button
                onClick={onClose}
                className="lg:hidden p-2 rounded-xl hover:bg-white/20 text-white transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Search + Filters */}
          <div className="px-4 pt-4 pb-2">
            <div className="relative">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm kiếm cuộc trò chuyện..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-red-500 focus:ring-4 focus:ring-red-100 outline-none transition-all bg-white/80"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            <div className="mt-3 flex flex-wrap gap-2">
              {([
                { k: "all", label: "Tất cả", icon: "📚" },
                { k: "today", label: "Hôm nay", icon: "📅" },
                { k: "week", label: "Tuần", icon: "📆" },
                { k: "starred", label: "Yêu thích", icon: "⭐" },
              ] as const).map((f) => (
                <button
                  key={f.k}
                  onClick={() => setFilter(f.k)}
                  className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    filter === f.k
                      ? "bg-gradient-to-r from-red-500 to-yellow-500 text-white shadow-lg scale-105"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <span>{f.icon}</span>
                  <span>{f.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* New Chat Button */}
          <div className="px-4 py-3">
            <button
              onClick={onNewChat}
              className="group w-full flex items-center justify-center space-x-3 px-4 py-4 bg-gradient-to-r from-red-500 to-yellow-500 text-white rounded-2xl hover:shadow-2xl transition-all duration-300 hover:scale-105 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <svg className="w-6 h-6 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="font-semibold relative z-10">Trò chuyện mới</span>
            </button>
          </div>

          {/* Sessions List */}
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            {sessionsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-gray-100 to-gray-50 animate-pulse"
                  >
                    <div className="w-12 h-12 rounded-full bg-gray-200" />
                    <div className="flex-1">
                      <div className="h-4 w-3/4 rounded bg-gray-200 mb-2" />
                      <div className="h-3 w-1/2 rounded bg-gray-200" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredSessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center animate-fade-in">
                <div className="text-6xl mb-4">💬</div>
                <p className="text-gray-600 font-medium">Chưa có cuộc trò chuyện</p>
                <p className="text-sm text-gray-500 mt-1">Bắt đầu trò chuyện mới!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredSessions.map((session, index) => (
                  <div
                    key={session.id}
                    className={`group relative flex items-center space-x-3 p-4 rounded-2xl cursor-pointer transition-all duration-300 animate-slide-in ${
                      currentSession?.id === session.id
                        ? "bg-gradient-to-r from-red-50 to-yellow-50 shadow-lg scale-105 border-2 border-red-200"
                        : "hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:shadow-md"
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                    onClick={() => onLoadSession(session.id)}
                  >
                    <div className="flex-shrink-0">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                        currentSession?.id === session.id
                          ? "bg-gradient-to-br from-red-500 to-yellow-500 shadow-lg"
                          : "bg-gradient-to-br from-gray-200 to-gray-300 group-hover:from-red-300 group-hover:to-yellow-300"
                      }`}>
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{session.title}</p>
                      <div className="flex items-center space-x-2 text-xs text-gray-600 mt-1">
                        <span>{formatDate(session.lastMessageAt)}</span>
                        <span>•</span>
                        <span>{session.messageCount} tin nhắn</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setRenamingId(session.id);
                          setRenameValue(session.title || "");
                          setRenameOpen(true);
                        }}
                        className="p-2 rounded-lg hover:bg-white/80 text-gray-600 hover:text-red-600 transition-all"
                        title="Đổi tên"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6.232-6.232a2 2 0 112.828 2.828L11.828 15.828A4 4 0 018 17H7v-1a4 4 0 012-3.464z" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSession(session.id);
                        }}
                        className="p-2 rounded-lg hover:bg-red-100 text-gray-600 hover:text-red-600 transition-all"
                        title="Xóa"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {currentSession && (
            <div className="p-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
              <button
                onClick={onClearSession}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Xóa cuộc trò chuyện</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Rename Modal */}
      <Modal open={renameOpen} onClose={() => setRenameOpen(false)} title="Đổi tên cuộc trò chuyện">
        <div className="space-y-4">
          <Input
            label="Tên mới"
            type="text"
            value={renameValue}
            onChange={(e: any) => setRenameValue(e.target.value)}
          />
          <div className="flex justify-end space-x-2">
            <Button variant="text" onClick={() => setRenameOpen(false)}>
              Hủy
            </Button>
            <Button
              onClick={async () => {
                if (renamingId && renameValue.trim().length > 0) {
                  await chatService.renameSession(renamingId, renameValue.trim());
                  await loadSessions();
                }
                setRenameOpen(false);
              }}
            >
              Lưu
            </Button>
          </div>
        </div>
      </Modal>

      <style>{`
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-slide-in {
          animation: slide-in 0.3s ease-out forwards;
        }
      `}</style>
    </>
  );
};

export default Sidebar;