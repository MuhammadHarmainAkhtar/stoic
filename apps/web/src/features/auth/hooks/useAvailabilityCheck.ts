"use client";

import { useState } from 'react';
import authService from '../services/authService';
import { debounce } from '../utils/validation';

/**
 * Custom hook to check username or email availability
 */
export const useAvailabilityCheck = () => {
  const [isChecking, setIsChecking] = useState(false);

  /**
   * Check if a username or email is available
   * @param type The type of check to perform (username or email)
   * @param value The value to check
   * @param setError Function to set the error message if not available
   * @returns Promise with the check result
   */
  const checkAvailability = async (
    type: "username" | "email",
    value: string,
    setError: (message: string) => void
  ) => {
    if (!value) return;
    
    setIsChecking(true);
    try {
      const result = await authService.checkAvailability(type, value);
      
      if (!result.available) {
        setError(result.message || `This ${type} is already taken`);
      } else {
        setError("");
      }
      
      return result;
    } catch (error) {
      setError(`Error checking ${type} availability`);
      console.error(`Error checking ${type} availability:`, error);
    } finally {
      setIsChecking(false);
    }
  };

  // Create debounced versions of the check function
  const debouncedUsernameCheck = debounce(
    (username: string, setError: (message: string) => void) => 
      checkAvailability("username", username, setError),
    500
  );

  const debouncedEmailCheck = debounce(
    (email: string, setError: (message: string) => void) => 
      checkAvailability("email", email, setError),
    500
  );

  return {
    debouncedUsernameCheck,
    debouncedEmailCheck,
    isChecking
  };
};