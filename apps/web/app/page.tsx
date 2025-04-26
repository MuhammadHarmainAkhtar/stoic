"use client";
import React from "react";
import Hero from "./components/Hero";
import Navbar from "./components/Navbar";
import Image from "next/image";

const Page = () => {
  return (
    <main className="min-h-screen w-full relative overflow-hidden">
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
      <div className="absolute inset-0 w-full h-full z-0 hidden md:block">
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
      <div className="relative z-10">
        <Navbar />
        <Hero />
      </div>
    </main>
  );
};

export default Page;
