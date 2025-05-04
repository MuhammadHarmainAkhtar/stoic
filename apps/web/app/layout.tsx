import type { Metadata } from "next";
import React, { JSX } from "react";
import "./globals.css";
import { ToastProvider } from "./components/Toast/ToastContext";
import Toast from "./components/Toast/Toast";

export const metadata: Metadata = {
  title: "Stoic",
  description: "Enter The Stoic World",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): JSX.Element {
  return (
    <html lang="en" className="md:overflow-hidden">
      <body className="md:overflow-hidden">
        <ToastProvider>
          {children}
          <Toast />
        </ToastProvider>
      </body>
    </html>
  );
}
