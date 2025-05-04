import { useState, useEffect, useCallback } from 'react';
import { User, AuthState } from '../types';
import authService from '../services/authService';

/**
 * Custom hook for managing authentication state
 */
export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null
  });

  // Initialize auth state from localStorage or cookies
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check if user is logged in by verifying token or session
        // This depends on your authentication approach (JWT, session, etc.)
        const userJson = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        
        if (userJson && token) {
          const user = JSON.parse(userJson) as User;
          
          // Validate token/session with your backend if needed
          // const isValid = await authService.validateToken(token);
          
          setAuthState({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
        } else {
          // No user found in storage
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          });
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: "Failed to initialize authentication"
        });
      }
    };
    
    initAuth();
  }, []);

  /**
   * Log in a user
   */
  const login = useCallback(async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await authService.login({ email, password });
      
      if (response.success && response.data?.user) {
        // Store user data and token
        localStorage.setItem('user', JSON.stringify(response.data.user));
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
        }
        
        setAuthState({
          user: response.data.user,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
        
        return { success: true };
      } else {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: response.message || "Login failed"
        }));
        
        return { 
          success: false, 
          message: response.message
        };
      }
    } catch (error) {
      const errorMessage = "Failed to connect to the server";
      
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      
      return { 
        success: false, 
        message: errorMessage
      };
    }
  }, []);

  /**
   * Log out the current user
   */
  const logout = useCallback(() => {
    // Clear stored user data and token
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    
    // Reset auth state
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    });
  }, []);

  /**
   * Check if user is authenticated
   */
  const isAuthenticated = useCallback(() => {
    return authState.isAuthenticated;
  }, [authState.isAuthenticated]);

  return {
    ...authState,
    login,
    logout,
    isAuthenticated
  };
};