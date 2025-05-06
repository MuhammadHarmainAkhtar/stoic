"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "../../../../app/components/Toast/ToastContext";
import CustomField from "../../../../app/components/CustomField";
import VintageButtons from "../../../../app/components/vintage-button";
import { validateEmail } from "../utils/validation";
import AuthLayout from "./AuthLayout";
import authService from "../services/authService";
import Link from "next/link";

/**
 * Form component for requesting a password reset
 */
export default function ForgotPasswordForm() {
  const router = useRouter();
  const { addToast } = useToast();

  // Form state
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate email
    const emailValidationError = validateEmail(email);
    setEmailError(emailValidationError);

    if (emailValidationError) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await authService.sendForgotPasswordToken({ email });

      if (response.success) {
        addToast("Password reset token has been sent to your email", "success");
        
        // Store email in localStorage for the verification page
        localStorage.setItem("resetPasswordEmail", email);
        
        // Redirect to verify token page
        router.push("/verifyForgotPassword");
      } else {
        // Handle errors
        if (response.message?.toLowerCase().includes("not found") || 
            response.message?.toLowerCase().includes("exist")) {
          setEmailError("No account found with this email");
          addToast("No account found with this email", "error");
        } else {
          addToast(response.message || "Failed to send reset token", "error");
        }
      }
    } catch (error) {
      console.error("Error sending forgot password token:", error);
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
            Forgot Your Password?
          </h3>
          <p className="text-center text-black/70 text-sm">
            Enter your email and we'll send you a token to reset your password
          </p>
        </div>

        <div className="space-y-6 md:mx-14 lg:mx-14 mx-6">
          <div className="relative">
            <CustomField
              name="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError("");
              }}
              className="w-full py-4 px-6 rounded-xl text-black placeholder:text-black/80 focus:outline-none transition-all duration-300"
            />
            {emailError && (
              <div className="left-0 w-full">
                <p className="text-red-500 text-[10px] sm:text-xs px-2 leading-tight rounded-md py-0.5 mx-1">
                  {emailError}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 pt-4">
          <VintageButtons
            type="submit"
            name="Send Reset Token"
            className={`text-black hover:text-amber-900 duration-300 text-xl sm:text-2xl px-6 font-[bruneyfont] ${isSubmitting ? "opacity-50" : ""}`}
          />
          
          <Link 
            href="/login"
            className="text-amber-900 hover:text-amber-700 text-sm underline mt-2"
          >
            Return to login
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}