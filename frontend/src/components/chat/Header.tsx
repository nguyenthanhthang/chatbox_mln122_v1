import React, { useState } from "react";
import { toast } from "react-toastify";
import { User } from "../../types/auth.types";
import ProfileModal from "../auth/ProfileModal";

interface HeaderProps {
  user: User | null;
  onMenuClick: () => void;
  onLogout: () => void;
  onNewChat: () => void;
  variant?: "bar" | "iconOnly";
}

const Header: React.FC<HeaderProps> = ({
  user,
  onMenuClick,
  onLogout,
  onNewChat,
  variant = "bar",
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  if (variant === "iconOnly") {
    return (
      <div className="absolute top-6 right-6 z-50 animate-fade-in">
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="group relative flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-yellow-500 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
            title={user?.firstName || "Profile"}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-red-400 to-yellow-400 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
            <svg
              className="w-6 h-6 relative z-10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M4 21v-2a4 4 0 0 1 3-3.87" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-3 w-72 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 z-50 animate-slide-down overflow-hidden">
              <div className="p-4 bg-gradient-to-r from-red-500 to-yellow-500">
                <p className="text-base font-semibold text-white">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-sm text-white/90 truncate" title={user?.email || ""}>
                  {user?.email}
                </p>
              </div>

              <div className="py-2">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    setProfileOpen(true);
                  }}
                  className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-yellow-50 transition-all flex items-center space-x-3"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Cài đặt tài khoản</span>
                </button>

                <button
                  onClick={() => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = "image/*";
                    input.onchange = async (e: any) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const allowed = ["image/jpeg", "image/png", "image/webp"];
                      const maxSize = 8 * 1024 * 1024;
                      if (!allowed.includes(file.type) || file.size > maxSize) return;
                      try {
                        const { chatService } = await import("../../services/chat.service");
                        const uploaded = await chatService.uploadImage(file);
                        const url = (uploaded as any).secureUrl || (uploaded as any).url;
                        if (url) {
                          try {
                            const api = (await import("../../services/api")).apiService;
                            const res = await api.updateProfile({ backgroundUrl: url });
                            const { setUser } = await import("../../utils/helpers");
                            setUser(res.data);
                            (await import("../../utils/toast")).toastSuccess("Cập nhật ảnh nền thành công");
                          } catch (err: any) {
                            const errorMessage = err?.response?.data?.message || err?.message || "Không thể cập nhật ảnh nền";
                            (await import("../../utils/toast")).toastError(errorMessage);
                          }
                          localStorage.setItem("bgUrl", url);
                          document.documentElement.style.setProperty("--poster-image", `url("${url}")`);
                        }
                      } catch (err: any) {
                        const errorMessage = err?.response?.data?.message || err?.message || "Không thể tải ảnh lên";
                        (await import("../../utils/toast")).toastError(errorMessage);
                      }
                    };
                    input.click();
                  }}
                  className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-yellow-50 transition-all flex items-center space-x-3"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Đổi hình nền</span>
                </button>

                <div className="border-t border-gray-100 mt-2">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onLogout();
                    }}
                    className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-all flex items-center space-x-3"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Đăng xuất</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
      </div>
    );
  }

  return null;
};

export default Header;