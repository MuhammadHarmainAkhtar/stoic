import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Providers from "../src/features/auth/context/Providers";
import { ToastProvider } from "./components/Toast/ToastContext";
import Toast from "./components/Toast/Toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Stoic",
  description: "Stoic philosophy platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <ToastProvider>
            {children}
            <Toast />
          </ToastProvider>
        </Providers>
      </body>
    </html>
  );
}
