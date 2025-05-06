"use client";

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
        const userJson = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        
        if (userJson && token) {
          const user = JSON.parse(userJson) as User;
          
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
      console.log("Login response:", response); // Debug log
      
      if (response.success) {
        // Check if the API returned data in the expected format
        // Some API endpoints might return user/token directly in response object
        // rather than inside a data property
        let userData = null;
        let tokenData = null;
        
        // Handle possible response formats
        if (response.data) {
          userData = response.data.user;
          tokenData = response.data.token;
        } else {
          // Try to get data from response directly - this requires type assertion
          // since our type definition doesn't match actual response
          const anyResponse = response as any;
          if (anyResponse.user) {
            userData = anyResponse.user;
          }
          if (anyResponse.token) {
            tokenData = anyResponse.token;
          }
        }
        
        if (userData) {
          // Store user data and token
          localStorage.setItem('user', JSON.stringify(userData));
          
          if (tokenData) {
            localStorage.setItem('token', tokenData);
          }
          
          setAuthState({
            user: userData,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
          
          return { success: true };
        }
      }
      
      // If we get here, either success was false or there was no user data
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: response.message || "Login failed"
      }));
      
      return { 
        success: false, 
        message: response.message
      };
    } catch (error) {
      const errorMessage = "Failed to connect to the server";
      console.error("Login error:", error);
      
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