import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Providers from "../src/features/auth/context/Providers";
import { ToastProvider } from "./components/Toast/ToastContext";
import Toast from "./components/Toast/Toast";
import Navbar from "./components/Navbar";
import Image from "next/image";

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
            <main className="min-h-screen w-full relative md:h-screen md:overflow-hidden">
              {/* Background Image for small screens */}
              <div className="absolute inset-0 w-full h-full z-0 block md:hidden">
                <Image
                  src="/bgimg2.jpg"
                  alt="Stoic background mobile"
                  fill
                  priority
                  className="object-cover"
                  quality={100}
                />
              </div>

              {/* Background Image for medium and larger screens */}
              <div className="fixed inset-0 w-full h-full z-0 hidden md:block">
                <Image
                  src="/stoicbackground.png"
                  alt="Stoic background desktop"
                  fill
                  priority
                  className="object-cover"
                  quality={100}
                />
              </div>
              
              {/* Content */}
              <div className="relative z-10 min-h-screen flex flex-col">
                <Navbar />
                <div className="flex-1">
                  {children}
                </div>
              </div>
            </main>
            <Toast />
          </ToastProvider>
        </Providers>
      </body>
    </html>
  );
}
