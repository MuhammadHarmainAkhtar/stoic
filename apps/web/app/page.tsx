"use client";
import React, { useEffect, useState } from "react";
import Hero from "./components/Hero";
import Navbar from "./components/Navbar";
import Image from "next/image";

const Page = () => {
  const [isMobile, setIsMobile] = useState(false);
  
  // Check screen size on component mount and when window resizes
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkMobile();
    
    // Add resize listener
    window.addEventListener("resize", checkMobile);
    
    // Cleanup
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <main className="min-h-screen w-full relative md:h-screen md:overflow-hidden">
      {/* Background Image for small screens - using absolute instead of fixed for mobile */}
      <div className={`${isMobile ? 'absolute' : 'fixed'} inset-0 w-full h-full z-0 block md:hidden`}>
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
      <div className={`relative z-10 min-h-screen md:h-full flex flex-col ${isMobile ? '' : 'fixed inset-0'}`}>
        <Navbar />
        <div className="flex-1">
          <Hero />
        </div>
      </div>
    </main>
  );
};

export default Page;
