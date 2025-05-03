"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import CustomField from "../CustomField";
import VintageButtons from "../vintage-button";

export default function SignupForm() {
  const router = useRouter();
  const [user, setUser] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  // Validation states
  const [userError, setUserError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Validation functions
  const validateUsername = (username: string) => {
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

  const validateEmail = (email: string) => {
    if (!email) {
      return "Email is required";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "Please enter a valid email address";
    }
    return "";
  };

  const validatePassword = (pass: string) => {
    if (!pass) {
      return "Password is required";
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(pass)) {
      return "8 characters, An uppercase letter, One lowercase letter, and one number";
    }
    return "";
  };

  const validateConfirmPassword = (pass: string, confirmPass: string) => {
    if (!confirmPass) {
      return "Please confirm your password";
    }
    if (pass !== confirmPass) {
      return "Passwords do not match";
    }
    return "";
  };

  const handleUserChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = e.target.value;
    setUser(value);
    setUserError(validateUsername(value));
  };

  const handleEmailChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = e.target.value;
    setEmail(value);
    setEmailError(validateEmail(value));
  };

  const handlePasswordChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = e.target.value;
    setPassword(value);
    setPasswordError(validatePassword(value));
    if (confirmPassword) {
      setConfirmPasswordError(validateConfirmPassword(value, confirmPassword));
    }
  };

  const handleConfirmPasswordChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = e.target.value;
    setConfirmPassword(value);
    setConfirmPasswordError(validateConfirmPassword(password, value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if there are any validation errors
    if (userError || emailError || passwordError || confirmPasswordError) {
      return;
    }

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: user,
          email,
          password,
          confirmPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message || "User created successfully!");
        router.push("/auth/login");
      } else {
        if (data.message.includes("exists")) {
          if (data.message.includes("email")) {
            setEmailError("This email is already registered");
          } else if (data.message.includes("username")) {
            setUserError("This username is already taken");
          }
        } else {
          alert(data.message || "An error occurred during signup.");
        }
      }
    } catch (error) {
      alert("An error occurred during signup. Please try again.");
      console.error("Signup error:", error);
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
      <div className="absolute inset-0 bg-black/30" />
      <div className="absolute inset-0 flex items-center justify-center p-2">
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
                  <div className="absolute  left-0 w-full">
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
                  <div className="absolute  left-0 w-full">
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
                  className="text-black hover:text-amber-900 transition-colors duration-300 text-xl sm:text-2xl px-6 font-[bruneyfont]"
                />
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
