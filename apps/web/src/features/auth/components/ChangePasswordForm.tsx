"use client";

import { useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "../../../../app/components/Toast/ToastContext";
import CustomField from "../../../../app/components/CustomField";
import VintageButtons from "../../../../app/components/vintage-button";
import { validatePassword } from "../utils/validation";
import AuthLayout from "./AuthLayout";
import authService from "../services/authService";
import { useAuthContext } from "../context/AuthContext";

/**
 * Form component for changing user password
 */
export default function ChangePasswordForm() {
  const router = useRouter();
  const { addToast } = useToast();
  const { user } = useAuthContext();

  // Form state
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [oldPasswordError, setOldPasswordError] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmNewPasswordError, setConfirmNewPasswordError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate old password
    if (!oldPassword) {
      setOldPasswordError("Current password is required");
      return;
    }

    // Validate new password
    const passwordValidationError = validatePassword(newPassword);
    if (passwordValidationError) {
      setNewPasswordError(passwordValidationError);
      return;
    }

    // Check if new password is same as old password
    if (oldPassword === newPassword) {
      setNewPasswordError(
        "New password cannot be the same as your current password"
      );
      addToast(
        "New password cannot be the same as your current password",
        "error"
      );
      return;
    }

    // Validate password confirmation
    if (newPassword !== confirmNewPassword) {
      setConfirmNewPasswordError("Passwords must match");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await authService.changePassword({
        oldPassword,
        newPassword,
      });

      if (response.success) {
        addToast("Password changed successfully!", "success");
        // Clear form
        setOldPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
        // Redirect to dashboard
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      } else {
        // Handle errors
        if (
          response.message?.toLowerCase().includes("credentials") ||
          response.message?.toLowerCase().includes("invalid")
        ) {
          setOldPasswordError("Current password is incorrect");
          addToast("Current password is incorrect", "error");
        } else {
          addToast(response.message || "Failed to change password", "error");
        }
      }
    } catch (error) {
      console.error("Error changing password:", error);
      addToast(
        "An unexpected error occurred. Please try again later.",
        "error"
      );
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
            Change Your Password
          </h3>
        </div>

        <div className="space-y-6 md:mx-14 lg:mx-14 mx-6">
          <div className="relative">
            <CustomField
              name="oldPassword"
              type="password"
              placeholder="Current Password"
              value={oldPassword}
              onChange={(e) => {
                setOldPassword(e.target.value);
                setOldPasswordError("");
              }}
              className="w-full py-4 px-6 rounded-xl text-black placeholder:text-black/80 focus:outline-none transition-all duration-300"
            />
            {oldPasswordError && (
              <div className="left-0 w-full">
                <p className="text-red-500 text-[10px] sm:text-xs px-2 leading-tight rounded-md py-0.5 mx-1">
                  {oldPasswordError}
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
                // Update confirm password validation if already entered
                if (confirmNewPassword) {
                  setConfirmNewPasswordError(
                    e.target.value !== confirmNewPassword
                      ? "Passwords must match"
                      : ""
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
            name="Update Password"
            className={`text-black hover:text-amber-900 duration-300 text-xl sm:text-2xl px-6 font-[bruneyfont] ${isSubmitting ? "opacity-50" : ""}`}
          />
        </div>
      </form>
    </AuthLayout>
  );
}
