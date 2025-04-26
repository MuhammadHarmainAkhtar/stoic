"use client"
import React, { useState, useEffect } from "react";
import Hero from "./components/Hero";
import Navbar from "./components/Navbar";
import Image from "next/image";

const Page = () => {
  const [windowSize, setWindowSize] = useState({
    width: 1920,
    height: 1080,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    handleResize(); // Set initial size
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <main className="min-h-screen w-full relative overflow-hidden">
      {/* Background Image */}
      <div className="fixed inset-0 z-0 flex justify-center items-center">
        <div
          style={{
            width: windowSize.width,
            height: windowSize.height,
            position: "relative",
          }}
        >
          <Image
            src="/stoicbackground.png"
            alt="Stoic background"
            fill
            priority
            className="object-cover"
            quality={100}
          />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <Navbar />
        <Hero />
      </div>
    </main>
  );
};

export default Page;
