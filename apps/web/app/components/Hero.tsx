import React, { useEffect, useState } from "react";
import ThreeDModel from "./ThreeDModel";
import VintageButtons from "./vintage-button";

const Hero = () => {
  // Add state to track if we're on a mobile device
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
    <section className={`h-full flex flex-col md:flex-row items-center justify-center px-4 sm:px-6 md:px-12 lg:px-28 py-2 md:py-4 ${isMobile ? 'relative' : ''}`}>
      {/* Left Side: Text and Buttons */}
      <div className="z-10 w-full md:w-[45%] flex flex-col justify-center items-center md:items-start text-center md:text-left space-y-4 md:pr-8">
        <div className="space-y-4 w-full max-w-2xl md:max-w-none">
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold tracking-tight text-black bg-clip-text font-[bruneyfont] leading-tight md:mt-[-2rem]">
            Welcome to Stoic Tribe
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-black leading-relaxed font-medium">
            Embrace the Ancient Spirit. Forge Your Modern Journey. Within these
            sacred halls, timeless wisdom and modern mastery intertwine. The
            Stoic Tribe is not just a community — it is a calling for those who
            seek strength, clarity, and purpose in a chaotic world.
            <br className="hidden sm:block" />
            <br className="hidden sm:block" />
            Discover philosophies that have shaped empires. Master disciplines
            that fuel legends. Connect with a brotherhood and sisterhood of
            thinkers, doers, and dreamers.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap justify-center md:justify-start gap-3 w-full">
          <VintageButtons
            name="Purpose"
            className="text-black p-3 sm:p-4 lg:p-6 hover:text-amber-900 duration-300 text-base sm:text-lg"
            href="/purpose"
          />
          <VintageButtons
            name="Get Started"
            className="text-black p-3 sm:p-4 lg:p-6 hover:text-amber-900 duration-300 text-base sm:text-lg"
            href="/getstarted"
          />
        </div>
      </div>

      {/* Right Side: 3D Model */}
      <div className="w-full md:w-[45%] h-[400px] sm:h-[450px] md:h-[600px] lg:h-[650px] md:ml-8">
        <div className="w-full h-full">
          <ThreeDModel />
        </div>
      </div>
    </section>
  );
};

export default Hero;
