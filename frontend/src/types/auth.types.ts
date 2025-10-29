export interface User {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  avatar?: string;
  emailVerification: VerificationStatus;
  phoneVerification: VerificationStatus;
  phoneNumber?: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export enum UserRole {
  USER = "user",
  ADMIN = "admin",
  MODERATOR = "moderator",
}

export enum VerificationStatus {
  PENDING = "pending",
  VERIFIED = "verified",
  REJECTED = "rejected",
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
  phoneNumber?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface VerifyPhoneRequest {
  code: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
  verifyEmail: (token: string) => Promise<void>;
  verifyPhone: (code: string) => Promise<void>;
  refreshToken: () => Promise<void>;
}
