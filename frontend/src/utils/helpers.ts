import { STORAGE_KEYS } from "./constants";

export const getToken = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
};

export const getRefreshToken = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
};

export const setTokens = (accessToken: string, refreshToken: string): void => {
  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
  localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
};

export const removeTokens = (): void => {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER);
};

export const getUser = (): any => {
  const user = localStorage.getItem(STORAGE_KEYS.USER);
  return user ? JSON.parse(user) : null;
};

export const setUser = (user: any): void => {
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
};

export const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();

  // Less than 1 minute
  if (diff < 60000) {
    return "Just now";
  }

  // Less than 1 hour
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes}m ago`;
  }

  // Less than 24 hours
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours}h ago`;
  }

  // Less than 7 days
  if (diff < 604800000) {
    const days = Math.floor(diff / 86400000);
    return `${days}d ago`;
  }

  // More than 7 days
  return d.toLocaleDateString();
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

/** Lấy tên hiển thị của user (firstName, username, email prefix, hoặc "bạn") */
export const getDisplayName = (user: { firstName?: string; lastName?: string; username?: string; email?: string } | null): string => {
  if (!user) return "bạn";
  const first = (user.firstName || "").trim();
  const last = (user.lastName || "").trim();
  if (first || last) return [first, last].filter(Boolean).join(" ");
  if (user.username?.trim()) return user.username.trim();
  if (user.email) {
    const prefix = user.email.split("@")[0];
    if (prefix) return prefix;
  }
  return "bạn";
};

export const generateAvatarUrl = (username: string): string => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    username
  )}&background=random&color=fff&size=200`;
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^(\+84|84|0)[1-9][0-9]{8,9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ""));
};

/**
 * Chuyển lỗi kỹ thuật thành thông báo thân thiện cho người dùng
 */
export const getUserFriendlyErrorMessage = (error: any): string => {
  const msg = error?.message || "";
  const code = error?.code;

  if (code === "ECONNABORTED" || msg.includes("timeout") || msg.includes("exceeded")) {
    return "Máy chủ phản hồi quá chậm. Vui lòng thử lại sau.";
  }
  if (code === "ERR_NETWORK" || !error?.response) {
    return "Không thể kết nối. Kiểm tra mạng và thử lại.";
  }
  if (error?.response?.status === 503) {
    return "Máy chủ đang bận. Vui lòng thử lại sau vài phút.";
  }
  if (error?.response?.status === 429) {
    return "Bạn đã gửi quá nhiều yêu cầu. Vui lòng đợi một chút.";
  }
  if (error?.response?.status >= 500) {
    return "Lỗi máy chủ. Vui lòng thử lại sau.";
  }

  // Nếu server trả về message rõ ràng thì dùng
  const data = error?.response?.data;
  if (data) {
    if (typeof data === "string") return data;
    if (data.message) {
      return Array.isArray(data.message) ? data.message.join("; ") : data.message;
    }
    if (data.error) return data.error;
  }

  return msg || "Đã xảy ra lỗi. Vui lòng thử lại.";
};
