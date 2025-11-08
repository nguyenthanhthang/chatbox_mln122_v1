export const API_BASE_URL =
  process.env.REACT_APP_API_URL || "https://chatbox-mln122-v1.onrender.com/api";

export const STORAGE_KEYS = {
  ACCESS_TOKEN: "accessToken",
  REFRESH_TOKEN: "refreshToken",
  USER: "user",
} as const;

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  CHAT: "/chat",
  PROFILE: "/profile",
  VERIFY_EMAIL: "/verify-email",
  VERIFY_PHONE: "/verify-phone",
} as const;

export const MESSAGE_TYPES = {
  TEXT: "text",
  IMAGE: "image",
  VOICE: "voice",
  FILE: "file",
} as const;

export const USER_ROLES = {
  USER: "user",
  ADMIN: "admin",
  MODERATOR: "moderator",
} as const;

export const VERIFICATION_STATUS = {
  PENDING: "pending",
  VERIFIED: "verified",
  REJECTED: "rejected",
} as const;

export const CHAT_SETTINGS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: [
    "image/jpeg",
    "image/png",
    "image/gif",
    "audio/mpeg",
    "audio/wav",
    "application/pdf",
  ],
  MESSAGES_PER_PAGE: 50,
} as const;
