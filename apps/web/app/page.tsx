import React from "react";
import Hero from "./components/Hero";
import Navbar from "./components/Navbar";
import Image from "next/image";

const Page = () => {
  return (
    <main className="min-h-screen w-full relative">
      {/* Background Image */}
      <div className="fixed inset-0 w-full h-full z-0">
        <Image
          src="/stoicbackground.png"
          alt="Stoic background"
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
