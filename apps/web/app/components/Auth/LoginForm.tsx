"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CustomField from "../CustomField";
import VintageButtons from "../vintage-button";

export default function AuthForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
      className="flex items-center justify-center w-full h-screen bg-cover bg-no-repeat"
      style={{
        backgroundImage: "url('/authDesktopBackground.jpg')",
        backgroundSize: "cover", // Ensures image covers the screen
        backgroundPosition: "center", // Keeps the image centered
        backgroundAttachment: "fixed", // Keeps the background fixed on scroll for a more polished effect
      }}
    >
      {/* <div>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 max-w-sm mx-auto p-10"
        >
          <h2 className="text-8xl font-bold text-center font-[bruneyfont]">
            Hey Stoic Enter Your Credentials
          </h2>

          <CustomField type="email" placeholder="elon@musk.com" className="p-10" />
          <CustomField type="password" placeholder="Password" className="p-10 text-black" />
          <VintageButtons href="submit" name="Sign In" className="text-black p-6 sm:p-8 md:p-10" />
        </form>
      </div> */}
    </div>
  );
}
