import React from "react";
import ThreeDModel from "./ThreeDModel";
// import VintageButtons from "./vintage-button";

const Hero = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-between px-8 md:px-16 py-20">
      {/* Left Side: Text and Button */}
      <div className="max-w-2xl z-10 space-y-8 ml-4 md:ml-24 lg:ml-32 animate-fade-in-slide">
        <div className="space-y-6">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-black bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)] font-[bruneyBold]">
            Welcome to Stoic Tribe
          </h1>
          <p className="text-xl md:text-2xl text-black leading-relaxed font-light  p-6 rounded-lg">
            Embrace the Ancient Spirit. Forge Your Modern Journey. Within these
            sacred halls, timeless wisdom and modern mastery intertwine. The
            Stoic Tribe is not just a community — it is a calling for those who
            seek strength, clarity, and purpose in a chaotic world.
            <br />
            Discover philosophies that have shaped empires. Master disciplines
            that fuel legends. Connect with a brotherhood and sisterhood of
            thinkers, doers, and dreamers.
          </p>
          <p className="text-xl md:text-2xl text-black leading-relaxed font-light drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]">
           
          </p>
        </div>
        <div className="space-x-4 pt-8">
          <button className="px-8 py-4 bg-gradient-to-r from-amber-500 to-yellow-600 text-white rounded-lg hover:from-amber-600 hover:to-yellow-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-semibold">
            Features
          </button>
          <button className="px-8 py-4 border-2 border-amber-500 text-amber-100 rounded-lg hover:bg-amber-500/10 transition-all duration-300 font-medium backdrop-blur-sm hover:scale-105">
            Get Started
          </button>
        </div>
      </div>

      {/* Right Side: 3D Model */}
      <div className="absolute right-[10%] top-0 w-[600px] h-[600px] md:relative md:w-[700px] md:h-[700px] opacity-80">
        <ThreeDModel />
      </div>
    </div>
  );
};

export default Hero;
