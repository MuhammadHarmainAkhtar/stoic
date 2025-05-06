"use client";

import React from "react";

interface AuthLayoutProps {
  children: React.ReactNode;
}

/**
 * Reusable layout component for authentication pages
 * Uses the default background from the root layout
 */
export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="mt-10 flex items-center justify-center p-4">
      {children}
    </div>
  );
}