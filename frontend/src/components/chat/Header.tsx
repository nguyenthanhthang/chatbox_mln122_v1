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
      <div className="absolute top-3 right-3 z-50">
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center justify-center w-11 h-11 rounded-full bg-red-600 text-white shadow-lg ring-2 ring-white/60 hover:brightness-110 transition-transform duration-150 hover:scale-[1.03]"
            title={user?.firstName || "Profile"}
          >
            <svg
              className="w-5 h-5"
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

                {/* Change Background and Reset buttons remain */}
                <button
                  onClick={() => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = "image/*";
                    input.onchange = async (e: any) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      // validation same as below implementation
                      const allowed = ["image/jpeg", "image/png", "image/webp"];
                      const maxSize = 8 * 1024 * 1024;
                      if (!allowed.includes(file.type) || file.size > maxSize)
                        return;
                      try {
                        const { chatService } = await import(
                          "../../services/chat.service"
                        );
                        const uploaded = await chatService.uploadImage(file);
                        const url =
                          (uploaded as any).secureUrl || (uploaded as any).url;
                        if (url) {
                          try {
                            const api = (await import("../../services/api"))
                              .apiService;
                            const res = await api.updateProfile({
                              backgroundUrl: url,
                            });
                            const { setUser } = await import(
                              "../../utils/helpers"
                            );
                            setUser(res.data);
                          } catch {}
                          localStorage.setItem("bgUrl", url);
                          document.documentElement.style.setProperty(
                            "--poster-image",
                            `url("${url}")`
                          );
                        }
                      } catch {}
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

        <ProfileModal
          open={profileOpen}
          onClose={() => setProfileOpen(false)}
        />
      </div>
    );
  }

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
                        // Basic validation before upload
                        const allowed = [
                          "image/jpeg",
                          "image/png",
                          "image/webp",
                        ];
                        const maxSize = 8 * 1024 * 1024; // 8MB
                        if (!allowed.includes(file.type)) {
                          toast.error(
                            "Unsupported image type. Use JPG/PNG/WebP."
                          );
                          return;
                        }
                        if (file.size > maxSize) {
                          toast.error("Image is too large. Max 8MB.");
                          return;
                        }
                        // Check dimensions >= 1200x700 for good cover quality
                        const dimsOk = await new Promise<boolean>((resolve) => {
                          const url = URL.createObjectURL(file);
                          const img = new Image();
                          img.onload = () => {
                            const ok = img.width >= 1200 && img.height >= 700;
                            URL.revokeObjectURL(url);
                            resolve(ok);
                          };
                          img.onerror = () => {
                            URL.revokeObjectURL(url);
                            resolve(false);
                          };
                          img.src = url;
                        });
                        if (!dimsOk) {
                          toast.error("Image too small. Minimum 1200×700.");
                          return;
                        }
                        try {
                          const { chatService } = await import(
                            "../../services/chat.service"
                          );
                          const uploaded = await chatService.uploadImage(file);
                          const url =
                            (uploaded as any).secureUrl ||
                            (uploaded as any).url;
                          if (url) {
                            // Persist per-user preference
                            try {
                              const res = await (
                                await import("../../services/api")
                              ).apiService.updateProfile({
                                backgroundUrl: url,
                              });
                              const { setUser } = await import(
                                "../../utils/helpers"
                              );
                              setUser(res.data);
                            } catch {
                              toast.warn("Saved locally. Will sync next time.");
                            }
                            localStorage.setItem("bgUrl", url); // fallback
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
                            toast.success("Background updated");
                          }
                        } catch (err) {
                          console.error("Change background failed", err);
                          toast.error("Failed to upload background");
                        }
                      };
                      input.click();
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Change Background
                  </button>

                  <div className="border-t border-gray-100">
                    {/* Reset Background to gradient */}
                    <button
                      onClick={async () => {
                        try {
                          const api = (await import("../../services/api"))
                            .apiService;
                          await api.updateProfile({ backgroundUrl: null });
                        } catch {}
                        localStorage.removeItem("bgUrl");
                        document.documentElement.style.removeProperty(
                          "--poster-image"
                        );
                        const el = document.querySelector(
                          ".poster-bg"
                        ) as HTMLElement | null;
                        if (el) el.style.removeProperty("--poster-image");
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Use Default Background
                    </button>
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
