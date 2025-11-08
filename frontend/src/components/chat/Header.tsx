import React, { useState, useEffect } from "react";
import { User } from "../../types/auth.types";
import ProfileModal from "../auth/ProfileModal";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../context/ThemeContext";

interface HeaderProps {
  user: User | null;
  onMenuClick: () => void;
  onLogout: () => void;
  onNewChat: () => void;
  variant?: "bar" | "iconOnly";
}

const Header: React.FC<HeaderProps> = ({
  user: userProp,
  onMenuClick,
  onLogout,
  onNewChat,
  variant = "bar",
}) => {
  const { user: userFromAuth } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  // Use user from AuthContext if available, fallback to prop
  const user = userFromAuth || userProp;
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Refresh user when profile modal closes (avatar might have changed)
  useEffect(() => {
    if (!profileOpen) {
      // Profile modal closed, user might have updated avatar
      // AuthContext will handle the update automatically
    }
  }, [profileOpen]);

  if (variant === "iconOnly") {
    const avatarUrl = user?.avatar || 
      `https://ui-avatars.com/api/?name=${encodeURIComponent(
        `${user?.firstName || ""} ${user?.lastName || ""}`
      )}&background=random&color=fff&size=192`;

    return (
      <div className="absolute top-6 right-6 z-50 animate-fade-in">
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="group relative flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-yellow-500 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden"
            title={user?.firstName || "Profile"}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-red-400 to-yellow-400 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
            {user?.avatar ? (
              <img
                src={avatarUrl}
                alt={user?.firstName || "Avatar"}
                className="w-full h-full object-cover relative z-10"
              />
            ) : (
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
            )}
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-3 w-72 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700/50 z-50 animate-slide-down overflow-hidden">
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
                  className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gradient-to-r hover:from-red-50 hover:to-yellow-50 dark:hover:bg-gray-700/50 transition-all flex items-center space-x-3"
                >
                  <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Cài đặt tài khoản</span>
                </button>

                {/* Dark Mode Toggle */}
                <button
                  onClick={() => {
                    toggleTheme();
                  }}
                  className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gradient-to-r hover:from-red-50 hover:to-yellow-50 dark:hover:bg-gray-700/50 transition-all flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    {isDark ? (
                      <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    )}
                    <span>Chế độ tối</span>
                  </div>
                  {/* Toggle Switch */}
                  <div className="relative inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={isDark}
                      onChange={toggleTheme}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 dark:peer-focus:ring-red-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-gradient-to-r peer-checked:from-red-500 peer-checked:to-yellow-500"></div>
                  </div>
                </button>

                <div className="border-t border-gray-100 dark:border-gray-700 mt-2">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onLogout();
                    }}
                    className="w-full text-left px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all flex items-center space-x-3"
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