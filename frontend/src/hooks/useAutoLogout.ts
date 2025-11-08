import { useEffect, useRef, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { toastWarn } from "../utils/toast";

/**
 * Hook để tự động logout sau khi không có thao tác trong một khoảng thời gian
 * @param timeoutMinutes - Số phút không có thao tác trước khi logout (mặc định: 30 phút)
 * @param warningMinutes - Số phút trước khi logout để hiển thị cảnh báo (mặc định: 5 phút)
 */
export const useAutoLogout = (
  timeoutMinutes: number = 30,
  warningMinutes: number = 5
) => {
  const { user, logout } = useAuth();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const clearTimeouts = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
      warningTimeoutRef.current = null;
    }
  }, []);

  const handleLogout = useCallback(async () => {
    clearTimeouts();
    await logout();
    // Sử dụng window.location thay vì useNavigate để tránh lỗi Router context
    window.location.href = "/login";
    // Hiển thị thông báo
    toastWarn("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
  }, [clearTimeouts, logout]);

  const resetTimer = useCallback(() => {
    if (!user) return;

    clearTimeouts();
    lastActivityRef.current = Date.now();

    const timeoutMs = timeoutMinutes * 60 * 1000;
    const warningMs = (timeoutMinutes - warningMinutes) * 60 * 1000;

    // Set warning timeout (hiển thị cảnh báo trước khi logout)
    if (warningMinutes > 0 && warningMinutes < timeoutMinutes) {
      warningTimeoutRef.current = setTimeout(() => {
        const remainingMinutes = Math.ceil(
          (timeoutMs - (Date.now() - lastActivityRef.current)) / 60000
        );
        toastWarn(
          `Phiên đăng nhập sẽ hết hạn sau ${remainingMinutes} phút nữa. Vui lòng thao tác để tiếp tục.`
        );
      }, warningMs);
    }

    // Set logout timeout
    timeoutRef.current = setTimeout(() => {
      handleLogout();
    }, timeoutMs);
  }, [user, timeoutMinutes, warningMinutes, clearTimeouts, handleLogout]);

  useEffect(() => {
    if (!user) {
      clearTimeouts();
      return;
    }

    // Reset timer khi user đăng nhập
    resetTimer();

    // Track các sự kiện user activity
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    const handleActivity = () => {
      // Chỉ reset nếu đã qua ít nhất 1 phút từ lần activity cuối (tránh reset quá nhiều)
      const now = Date.now();
      if (now - lastActivityRef.current > 60000) {
        resetTimer();
      } else {
        lastActivityRef.current = now;
      }
    };

    // Thêm event listeners
    events.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Cleanup
    return () => {
      clearTimeouts();
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [user, resetTimer, clearTimeouts]);

  // Cleanup khi unmount
  useEffect(() => {
    return () => {
      clearTimeouts();
    };
  }, [clearTimeouts]);
};
