"use client";

import { useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "../../../../app/components/Toast/ToastContext";
import CustomField from "../../../../app/components/CustomField";
import VintageButtons from "../../../../app/components/vintage-button";
import { useAvailabilityCheck } from "../hooks/useAvailabilityCheck";
import { 
  validateUsername, 
  validateEmail, 
  validatePassword, 
  validateConfirmPassword 
} from "../utils/validation";
import AuthLayout from "./AuthLayout";
import authService from "../services/authService";

/**
 * SignupForm component handling user registration
 */
export default function SignupForm() {
  const router = useRouter();
  const { debouncedUsernameCheck, debouncedEmailCheck } = useAvailabilityCheck();
  const { addToast } = useToast();
  
  // Form state
  const [user, setUser] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Validation states
  const [userError, setUserError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const handleUserChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    setUser(value);
    const validationError = validateUsername(value);
    setUserError(validationError);

    // Only check availability if there are no validation errors
    if (!validationError && value.length >= 5) {
      debouncedUsernameCheck(value, setUserError);
    }
  };

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    setEmail(value);
    const validationError = validateEmail(value);
    setEmailError(validationError);

    // Only check availability if there are no validation errors
    if (!validationError) {
      debouncedEmailCheck(value, setEmailError);
    }
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    setPassword(value);
    setPasswordError(validatePassword(value));
    
    // Update confirm password validation if already entered
    if (confirmPassword) {
      setConfirmPasswordError(validateConfirmPassword(value, confirmPassword));
    }
  };

  const handleConfirmPasswordChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    setConfirmPassword(value);
    setConfirmPasswordError(validateConfirmPassword(password, value));
  };

  const clearForm = () => {
    setUser("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setUserError("");
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if there are any validation errors
    if (userError || emailError || passwordError || confirmPasswordError) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await authService.signup({
        username: user,
        email,
        password,
        confirmPassword
      });

      if (response.success) {
        addToast("User created successfully!", "success");
        
        // Store email in localStorage before making the verification request
        localStorage.setItem("verificationEmail", email);
        
        try {
          const emailResponse = await authService.sendVerificationEmail(email);
          
          if (emailResponse.success) {
            addToast(emailResponse.message, "success");
            router.push("/verifyEmail");
          } else {
            addToast(emailResponse.message || "Failed to send verification email", "error");
          }
        } catch (error) {
          console.error("Verification email error:", error);
          addToast("Failed to send verification email", "error");
        }
        
        clearForm();
      } else {
        // Handle specific error cases
        if (response.message === "Username already exists") {
          setUserError("This username is already taken");
          addToast("This username is already taken", "error");
        } else if (response.message === "Email already exists") {
          setEmailError("This email is already registered");
          addToast("This email is already registered", "error");
        } else {
          // Show the exact error message from the backend
          addToast(response.message || "An error occurred during signup", "error");
        }
      }
    } catch (error) {
      addToast(
        "Failed to connect to the server. Please try again later.",
        "error"
      );
      console.error("Signup error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col lg:flex-row lg:items-center w-full max-w-md lg:max-w-5xl p-4 sm:p-6 lg:p-8 lg:gap-12"
      >
        {/* Welcome Text Section */}
        <div className="space-y-2 lg:mb-0 lg:flex-1/">
          <h2 className="text-4xl sm:text-7xl lg:text-8xl font-bold text-center lg:text-left font-[bruneyfont] text-black/80 mb-1 lg:mt-0 mt-4">
            Hey Stoic
          </h2>
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-[bruneyfont] text-center text-black/80">
            Welcome To Our Tribe
          </h3>
        </div>

        {/* Form Fields Section */}
        <div className="mx-12 lg:my-0 my-5">
          <div className="space-y-1 md:space-y-2 lg:space-y-2">
            <div className="relative pb-5">
              <CustomField
                name="username"
                type="text"
                placeholder="UserName"
                value={user}
                onChange={handleUserChange}
                className="w-full py-4 px-6 rounded-xl text-black placeholder:text-black/80 focus:outline-none transition-all duration-300"
              />
              {userError && (
                <div className="absolute left-0 w-full">
                  <p className="text-red-500 text-[10px] sm:text-xs px-2 leading-tight">
                    {userError}
                  </p>
                </div>
              )}
            </div>

            <div className="relative pb-5">
              <CustomField
                name="email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={handleEmailChange}
                className="w-full py-4 px-6 rounded-xl text-black placeholder:text-black/80 focus:outline-none transition-all duration-300"
              />
              {emailError && (
                <div className="absolute left-0 w-full">
                  <p className="text-red-500 text-[10px] sm:text-xs px-2 leading-tight">
                    {emailError}
                  </p>
                </div>
              )}
            </div>

            <div className="relative pb-5">
              <div className="relative">
                <CustomField
                  name="password"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={handlePasswordChange}
                  className="w-full py-4 px-6 rounded-xl text-black placeholder:text-black focus:outline-none transition-all duration-300"
                />
              </div>
              {passwordError && (
                <div className="absolute left-0 w-full">
                  <p className="text-red-500 text-[10px] sm:text-xs px-2 leading-tight">
                    {passwordError}
                  </p>
                </div>
              )}
            </div>

            <div className="relative pb-5">
              <div className="relative">
                <CustomField
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  className="w-full py-4 px-6 rounded-xl text-black placeholder:text-black focus:outline-none transition-all duration-300"
                />
              </div>
              {confirmPasswordError && (
                <div className="absolute left-0 w-full">
                  <p className="text-red-500 text-[10px] sm:text-xs px-2 leading-tight">
                    {confirmPasswordError}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-center lg:justify-center pt-2">
              <VintageButtons
                type="submit"
                name="Sign Up"
                className={`text-black hover:text-amber-900 transition-colors duration-300 text-xl sm:text-2xl px-6 font-[bruneyfont] ${isSubmitting ? 'opacity-50' : ''}`}
              />
            </div>
          </div>
        </div>
      </form>
    </AuthLayout>
  );
}