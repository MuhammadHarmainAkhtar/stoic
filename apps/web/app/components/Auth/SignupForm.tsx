"use client";

import { useState, useEffect } from "react";
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user, email, password }),
      });

      if (res.ok) {
        router.push("#home");
      } else {
        console.error("Registration failed");
      }
    } catch (err) {
      console.error("Something went wrong", err);
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
      <div className="absolute inset-0 bg-black/30 " />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-6 w-full max-w-lg p-8 sm:p-10"
        >
          <div className="space-y-2 mb-4">
            <h2 className="text-6xl sm:text-7xl font-bold text-center font-[bruneyfont] text-black/80 mb-2">
              Hey Stoic
            </h2>
            <h3 className="text-2xl sm:text-3xl font-[bruneyfont] text-center text-black/80">
              Welcome To Our Tribe
            </h3>
          </div>

          <div className="space-y-6 mx-3">
            <CustomField
              type="text"
              placeholder="UserName"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              className="w-full py-4 px-6 rounded-xl text-black placeholder:text-black/80 focus:outline-none transition-all duration-300 mr-10"
            />
            <CustomField
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full py-4 px-6 rounded-xl text-black placeholder:text-black/80 focus:outline-none transition-all duration-300 mr-10"
            />
            <CustomField
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full py-4 px-6 rounded-xl text-black placeholder:text-black focus:outline-none transition-all duration-300 mr-10"
            />
            <CustomField
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full py-4 px-6 rounded-xl text-black placeholder:text-black focus:outline-none transition-all duration-300 mr-10"
            />
          </div>

          <div className="flex justify-center lg:justify-start lg:ml-32">
            <VintageButtons
              type="submit"
              name="Sign Up"
              className="text-black hover:text-amber-900 transition-colors duration-300 text-xl sm:text-2xl py-3 w-100vw] px-6 rounded-xl font-[bruneyfont]"
            />
          </div>
        </form>
      </div>
    </div>
  );
}
