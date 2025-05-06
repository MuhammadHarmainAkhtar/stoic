"use client";

import { ProtectedRoute } from "../../src/features/auth";

export default function TribeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      {children}
    </ProtectedRoute>
  );
}