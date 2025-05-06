/**
 * Authentication types
 */

export interface User {
  id: string;
  username: string;
  email: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ChangePasswordData {
  oldPassword: string;
  newPassword: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface VerifyForgotPasswordData {
  email: string;
  providedToken: string;
  newPassword: string;
}

export interface VerifyEmailData {
  email: string;
  verificationToken: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user?: User;
    token?: string;
  };
}

export interface AvailabilityCheck {
  available: boolean;
  message: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}