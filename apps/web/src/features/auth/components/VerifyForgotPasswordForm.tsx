"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "../../../../app/components/Toast/ToastContext";
import CustomField from "../../../../app/components/CustomField";
import VintageButtons from "../../../../app/components/vintage-button";
import { validatePassword } from "../utils/validation";
import AuthLayout from "./AuthLayout";
import authService from "../services/authService";

/**
 * Component for verifying forgot password token and setting new password
 */
export default function VerifyForgotPasswordForm() {
  const router = useRouter();
  const { addToast } = useToast();

  // Form state
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  
  const [tokenError, setTokenError] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmNewPasswordError, setConfirmNewPasswordError] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [oldPassword, setOldPassword] = useState("");

  useEffect(() => {
    // Get email from localStorage
    const storedEmail = localStorage.getItem("resetPasswordEmail");
    // Get old password if available (set by backend in case of direct password reset)
    const storedOldPassword = localStorage.getItem("oldPasswordHash");
    
    if (storedEmail) {
      setEmail(storedEmail);
      if (storedOldPassword) {
        setOldPassword(storedOldPassword);
      }
    } else {
      // If no email is found, redirect to forgot password page
      router.push("/forgotPassword");
      addToast("Please enter your email first", "warning");
    }
  }, [router, addToast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate token
    if (!token) {
      setTokenError("Reset token is required");
      addToast("Please enter the reset token sent to your email", "error");
      return;
    }

    // Token format validation (assuming a 6-character alphanumeric token)
    if (!/^[a-zA-Z0-9]{6,}$/.test(token)) {
      setTokenError("Invalid token format. Please check your email for the correct token");
      addToast("Invalid token format", "error");
      return;
    }

    // Validate password
    const passwordValidationError = validatePassword(newPassword);
    if (passwordValidationError) {
      setNewPasswordError(passwordValidationError);
      return;
    }

    // Validate password confirmation
    if (newPassword !== confirmNewPassword) {
      setConfirmNewPasswordError("Passwords must match");
      addToast("Passwords don't match", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await authService.verifyForgotPassword({
        email,
        providedToken: token,
        newPassword
      });

      if (response.success) {
        // Clear stored email and any other stored data
        localStorage.removeItem("resetPasswordEmail");
        localStorage.removeItem("oldPasswordHash");
        
        addToast("Password has been reset successfully! You can now login.", "success");
        
        // Redirect to login page
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        // Handle specific errors
        if (response.message?.toLowerCase().includes("same")) {
          setNewPasswordError("New password cannot be the same as your old password");
          addToast("New password cannot be the same as your old password", "error");
        } else if (response.message?.toLowerCase().includes("token") && 
            response.message?.toLowerCase().includes("expired")) {
          setTokenError("Token has expired. Please request a new one.");
          addToast("Token has expired. Please request a new one", "error");
        } else if (response.message?.toLowerCase().includes("token") && 
                  response.message?.toLowerCase().includes("invalid")) {
          setTokenError("Invalid token. Please check and try again.");
          addToast("Invalid token. Please check the token in your email", "error");
        } else {
          addToast(response.message || "Failed to reset password", "error");
          setTokenError("Verification failed. Please check your token and try again.");
        }
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      addToast("An unexpected error occurred. Please try again later.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-6 w-full max-w-lg p-8 sm:p-10"
      >
        <div className="space-y-2 mb-4">
          <h2 className="text-5xl sm:text-6xl font-bold text-center font-[bruneyfont] text-black/80 mb-2">
            Hey Stoic
          </h2>
          <h3 className="text-xl sm:text-2xl font-[bruneyfont] text-center text-black/80">
            Reset Your Password
          </h3>
          {email && (
            <p className="text-center text-black/70 text-sm">
              {email}
            </p>
          )}
        </div>

        <div className="space-y-6 md:mx-14 lg:mx-14 mx-6">
          <div className="relative">
            <CustomField
              name="token"
              type="text"
              placeholder="Reset Token"
              value={token}
              onChange={(e) => {
                setToken(e.target.value);
                setTokenError("");
              }}
              className="w-full py-4 px-6 rounded-xl text-black placeholder:text-black/80 focus:outline-none transition-all duration-300"
            />
            {tokenError && (
              <div className="left-0 w-full">
                <p className="text-red-500 text-[10px] sm:text-xs px-2 leading-tight rounded-md py-0.5 mx-1">
                  {tokenError}
                </p>
              </div>
            )}
          </div>

          <div className="relative">
            <CustomField
              name="newPassword"
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setNewPasswordError("");
                if (confirmNewPassword) {
                  setConfirmNewPasswordError(
                    e.target.value !== confirmNewPassword ? "Passwords must match" : ""
                  );
                }
              }}
              className="w-full py-4 px-6 rounded-xl text-black placeholder:text-black/80 focus:outline-none transition-all duration-300"
            />
            {newPasswordError && (
              <div className="left-0 w-full">
                <p className="text-red-500 text-[10px] sm:text-xs px-2 leading-tight rounded-md py-0.5 mx-1">
                  {newPasswordError}
                </p>
              </div>
            )}
          </div>

          <div className="relative">
            <CustomField
              name="confirmNewPassword"
              type="password"
              placeholder="Confirm New Password"
              value={confirmNewPassword}
              onChange={(e) => {
                setConfirmNewPassword(e.target.value);
                setConfirmNewPasswordError(
                  e.target.value !== newPassword ? "Passwords must match" : ""
                );
              }}
              className="w-full py-4 px-6 rounded-xl text-black placeholder:text-black/80 focus:outline-none transition-all duration-300"
            />
            {confirmNewPasswordError && (
              <div className="left-0 w-full">
                <p className="text-red-500 text-[10px] sm:text-xs px-2 leading-tight rounded-md py-0.5 mx-1">
                  {confirmNewPasswordError}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-center pt-4">
          <VintageButtons
            type="submit"
            name="Reset Password"
            className={`text-black hover:text-amber-900 duration-300 text-xl sm:text-2xl px-6 font-[bruneyfont] ${isSubmitting ? "opacity-50" : ""}`}
          />
        </div>
      </form>
    </AuthLayout>
  );
}