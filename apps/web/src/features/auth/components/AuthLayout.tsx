"use client";

import React from "react";
import { useResponsive } from "../hooks/useResponsive";

interface AuthLayoutProps {
  children: React.ReactNode;
}

/**
 * Reusable layout component for authentication pages
 * Provides consistent styling and background for all auth pages
 */
export default function AuthLayout({ children }: AuthLayoutProps) {
  const { isMobile } = useResponsive();

  const backgroundImage = isMobile
    ? "url('/authBackgroundMobile.png')"
    : "url('/authDesktopBackground.jpg')";

  return (
    <div
      className="w-full h-screen relative"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage,
        backgroundSize: "100% 100%",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <div className="absolute inset-0 bg-black/30" />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        {children}
      </div>
    </div>
  );
}