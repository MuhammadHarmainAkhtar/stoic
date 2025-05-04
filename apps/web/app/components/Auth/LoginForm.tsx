"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CustomField from "../CustomField";
import VintageButtons from "../vintage-button";
import { useToast } from "../Toast/ToastContext";

export default function AuthForm() {
  const router = useRouter();
  const { addToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    // Initial check
    checkMobile();

    // Add event listener for window resize
    window.addEventListener("resize", checkMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const validateEmail = (email: string) => {
    if (!email) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) ? "" : "Invalid email format";
  };

  const validatePassword = (password: string) => {
    if (!password) return "Password is required";
    return password.length >= 6 ? "" : "Password must be at least 6 characters";
  };

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate inputs
    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);

    setEmailError(emailValidation);
    setPasswordError(passwordValidation);

    if (emailValidation || passwordValidation) {
      return;
    }

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        addToast("Login successful!", "success");
        router.push("/dashboard");
      } else {
        // Handle specific error cases
        if (data.message.toLowerCase().includes("credentials")) {
          addToast("Invalid email or password", "error");
        } else if (data.message.toLowerCase().includes("verified")) {
          addToast("Please verify your email before logging in", "warning");
        } else {
          addToast(data.message || "Login failed", "error");
        }
      }
    } catch (error) {
      addToast("Failed to connect to the server. Please try again later.", "error");
      console.error("Login error:", error);
    }
  };

  return (
    <div
      className="w-full h-screen relative"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: isMobile
          ? "url('/authBackgroundMobile.png')"
          : "url('/authDesktopBackground.jpg')",
        backgroundSize: "100% 100%",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <div className="absolute inset-0 bg-black/30 " />{" "}
      {/* Overlay for better readability */}
      <div className="absolute inset-0 flex items-center justify-center p-4 md:p-6">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-6 w-full max-w-lg p-8 sm:p-10 "
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
                <div className="absolute -bottom-5 left-0 w-full">
                  <p className="text-red-500 text-[10px] sm:text-xs px-2 leading-tight bg-white/80 rounded-md py-0.5 mx-1">
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
                <div className="absolute -bottom-5 left-0 w-full">
                  <p className="text-red-500 text-[10px] sm:text-xs px-2 leading-tight bg-white/80 rounded-md py-0.5 mx-1">
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
              className="text-black hover:text-amber-900 duration-300 text-xl sm:text-2xl px-6 font-[bruneyfont]"
            />
          </div>
        </form>
      </div>
    </div>
  );
}
