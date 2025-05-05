// Service for handling all authentication API calls
import { 
  LoginCredentials, 
  SignupData, 
  VerifyEmailData, 
  AvailabilityCheck,
  AuthResponse
} from '../types';

// Use environment variable with fallback for local development
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export const authService = {
  // Login user
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(credentials),
    });
    
    return await response.json();
  },

  // Register user
  signup: async (userData: SignupData): Promise<AuthResponse> => {
    const response = await fetch(`${API_URL}/api/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });
    
    return await response.json();
  },

  // Send verification email
  sendVerificationEmail: async (email: string): Promise<AuthResponse> => {
    const response = await fetch(`${API_URL}/api/auth/sendVerificationToken`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });
    
    return await response.json();
  },

  // Verify email token
  verifyEmail: async (data: VerifyEmailData): Promise<AuthResponse> => {
    const response = await fetch(`${API_URL}/api/auth/verifyToken`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    
    return await response.json();
  },

  // Check username or email availability
  checkAvailability: async (type: "username" | "email", value: string): Promise<AvailabilityCheck> => {
    const response = await fetch(
      `${API_URL}/api/auth/check-availability?${type}=${encodeURIComponent(value)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );
    
    return await response.json();
  },

  // Validate token
  validateToken: async (token: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/api/auth/validate-token`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      
      const data = await response.json();
      return data.success === true;
    } catch (error) {
      console.error("Token validation error:", error);
      return false;
    }
  },
};

export default authService;