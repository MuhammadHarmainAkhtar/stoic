/**
 * Authentication validation utilities
 * Contains functions for validating usernames, emails, and passwords
 */

export const validateUsername = (username: string): string => {
  if (!username) {
    return "Username is required";
  }
  
  const errors = [];
  if (username.length < 5) {
    errors.push("At least 5 characters");
  }
  if (!/^[a-zA-Z]/.test(username)) {
    errors.push("Start with a letter");
  }
  if (!/^[a-zA-Z0-9 ]*$/.test(username)) {
    errors.push("Only letters, numbers, and spaces allowed");
  }
  if (username.length > 30) {
    errors.push("Maximum 30 characters");
  }
  
  return errors.length > 0 ? errors.join(" • ") : "";
};

export const validateEmail = (email: string): string => {
  if (!email) {
    return "Email is required";
  }
  
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Please enter a valid email address";
  }
  
  return "";
};

export const validatePassword = (password: string): string => {
  if (!password) {
    return "Password is required";
  }
  
  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password)) {
    return "8 characters, An uppercase letter, One lowercase letter, and one number";
  }
  
  return "";
};

export const validateConfirmPassword = (password: string, confirmPassword: string): string => {
  if (!confirmPassword) {
    return "Please confirm your password";
  }
  
  if (password !== confirmPassword) {
    return "Passwords do not match";
  }
  
  return "";
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