"use client";

import { useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "../../../../app/components/Toast/ToastContext";
import CustomField from "../../../../app/components/CustomField";
import VintageButtons from "../../../../app/components/vintage-button";
import { validateEmail, validatePassword } from "../utils/validation";
import AuthLayout from "./AuthLayout";
import authService from "../services/authService";

/**
 * LoginForm component handling user authentication
 */
export default function LoginForm() {
  const router = useRouter();
  const { addToast } = useToast();

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate inputs
    const emailValidationError = validateEmail(email);
    const passwordValidationError = validatePassword(password);

    setEmailError(emailValidationError);
    setPasswordError(passwordValidationError);

    if (emailValidationError || passwordValidationError) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await authService.login({ email, password });

      if (response.success) {
        addToast("Login successful!", "success");
        router.push("/dashboard");
      } else {
        // Handle specific error cases
        if (response.message?.toLowerCase().includes("credentials")) {
          addToast("Invalid email or password", "error");
        } else if (!response.message?.toLowerCase().includes("verified")) {
          addToast("Please verify your email before logging in", "warning");
          try {
            // Make sure we're passing the email correctly
            console.log(email);
            const sendEmailAgain =
              await authService.sendVerificationEmail(email);

            if (sendEmailAgain.success) {
              addToast(
                "A new verification email has been sent. Please check your inbox.",
                "success"
              );
              router.push("/verifyEmail");
            } else {
              addToast(
                sendEmailAgain.message ||
                  "Error sending the verification email. Please try again.",
                "error"
              );
            }
          } catch (error) {
            console.error("Error sending verification email:", error);
            addToast("Failed to send verification email", "error");
          }
        } else {
          addToast(response.message || "Login failed", "error");
        }
      }
    } catch (error) {
      addToast(
        "Failed to connect to the server. Please try again later.",
        "error"
      );
      console.error("Login error:", error);
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
          <h2 className="text-6xl sm:text-7xl font-bold text-center font-[bruneyfont] text-black/80 mb-2">
            Hey Stoic
          </h2>
          <h3 className="text-2xl sm:text-3xl font-[bruneyfont] text-center text-black/80">
            Enter Your Credentials
          </h3>
        </div>

        <div className="space-y-6 mx-12">
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

          <div className="relative">
            <CustomField
              name="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError("");
              }}
              className="w-full py-4 px-6 rounded-xl text-black placeholder:text-black/80 focus:outline-none transition-all duration-300"
            />
            {passwordError && (
              <div className=" left-0 w-full">
                <p className="text-red-500 text-[10px] sm:text-xs px-2 leading-tight rounded-md py-0.5 mx-1">
                  {passwordError}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-center lg:justify-start lg:ml-32">
          <VintageButtons
            type="submit"
            name="Sign In"
            className={`text-black hover:text-amber-900 duration-300 text-xl sm:text-2xl px-6 font-[bruneyfont] ${isSubmitting ? "opacity-50" : ""}`}
          />
        </div>
      </form>
    </AuthLayout>
  );
}
