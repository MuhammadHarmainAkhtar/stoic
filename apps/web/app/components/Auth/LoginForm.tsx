"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CustomField from "../CustomField";
import VintageButtons from "../vintage-button";

export default function AuthForm() {
  const router = useRouter();
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
    window.addEventListener('resize', checkMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        router.push("#home"); // Redirect after successful login
      } else {
        console.error("Login failed");
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
      <div className="absolute inset-0 bg-black/30 " />{" "}
      {/* Overlay for better readability */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
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

          <div className="space-y-6 mx-3">
            <CustomField
              type="email"
              placeholder="Email"
              className="w-full py-4 px-6 rounded-xl text-black placeholder:text-black/80 focus:outline-none transition-all duration-300 font-[bruneyfont] mr-10"
            />
            <CustomField
              type="password"
              placeholder="Password"
              className="w-full py-4 px-6 rounded-xl text-black placeholder:text-black focus:outline-none transition-all duration-300 font-[bruneyfont] mr-10"
            />
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