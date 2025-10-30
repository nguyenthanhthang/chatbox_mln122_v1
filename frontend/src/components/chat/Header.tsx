import React, { useState } from "react";
import { User } from "../../types/auth.types";
import ProfileModal from "../auth/ProfileModal";

interface HeaderProps {
  user: User | null;
  onMenuClick: () => void;
  onLogout: () => void;
  onNewChat: () => void;
}

const Header: React.FC<HeaderProps> = ({
  user,
  onMenuClick,
  onLogout,
  onNewChat,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <header className="bg-gradient-to-r from-red-700 to-red-800 text-white border-b border-red-300 px-4 py-3 shadow-lg">
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-blue-500"
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
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white rounded-full overflow-hidden flex items-center justify-center">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt="avatar"
                  className="w-8 h-8 object-cover"
                />
              ) : (
                <span className="text-blue-600 font-bold text-sm">AI</span>
              )}
            </div>
            <h1 className="text-xl font-semibold text-white font-serif-heading">
              MLN_AI
            </h1>
            {/* Theme toggle removed by request */}
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-3">
          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-blue-500"
            >
              <div className="w-8 h-8 bg-white rounded-full overflow-hidden flex items-center justify-center">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt="avatar"
                    className="w-8 h-8 object-cover"
                  />
                ) : (
                  <span className="text-blue-600 font-medium text-sm">
                    {user?.firstName?.charAt(0) || "U"}
                  </span>
                )}
              </div>
              <span className="hidden sm:block text-sm font-medium text-white">
                {user?.firstName || "User"}
              </span>
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="py-2">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p
                      className="text-xs text-gray-500 truncate max-w-full"
                      title={user?.email || ""}
                    >
                      {user?.email}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      setProfileOpen(true);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Profile Settings
                  </button>

                  {/* Change Background */}
                  <button
                    onClick={() => {
                      const input = document.createElement("input");
                      input.type = "file";
                      input.accept = "image/*";
                      input.onchange = async (e: any) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          const { chatService } = await import(
                            "../../services/chat.service"
                          );
                          const uploaded = await chatService.uploadImage(file);
                          const url =
                            (uploaded as any).secureUrl ||
                            (uploaded as any).url;
                          if (url) {
                            localStorage.setItem("bgUrl", url);
                            const apply = (u: string) => {
                              document.documentElement.style.setProperty(
                                "--poster-image",
                                `url("${u}")`
                              );
                              document.body.style.setProperty(
                                "--poster-image",
                                `url("${u}")`
                              );
                              const el = document.querySelector(
                                ".poster-bg"
                              ) as HTMLElement | null;
                              if (el) {
                                el.style.setProperty(
                                  "--poster-image",
                                  `url("${u}")`
                                );
                              }
                            };
                            apply(url);
                          }
                        } catch (err) {
                          console.error("Change background failed", err);
                        }
                      };
                      input.click();
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Change Background
                  </button>

                  <div className="border-t border-gray-100">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onLogout();
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}
      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
    </header>
  );
};

export default Header;
