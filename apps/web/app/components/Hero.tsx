import React from "react";
import ThreeDModel from "./ThreeDModel";
import VintageButtons from "./vintage-button";

const Hero = () => {
  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col md:flex-row items-start justify-center px-4 sm:px-6 md:px-16 pt-6 sm:pt-8 md:pt-8">
      {/* Left Side: Text and Buttons */}
      <div className="z-10 flex-1 flex flex-col items-center text-center space-y-4 sm:space-y-6 md:space-y-8 mt-4 sm:mt-6 md:mt-8">
        <div className="space-y-4 sm:space-y-6 max-w-2xl lg:ml-10">
          <h1 className="text-3xl sm:text-4xl md:text-7xl font-bold tracking-tight text-black bg-clip-text font-[bruneyfont]">
            Welcome to Stoic Tribe
          </h1>
          <p className="text-base sm:text-lg md:text-2xl text-black leading-relaxed font-md p-2 sm:p-3 rounded-lg">
            Embrace the Ancient Spirit. Forge Your Modern Journey. Within these
            sacred halls, timeless wisdom and modern mastery intertwine. The
            Stoic Tribe is not just a community — it is a calling for those who
            seek strength, clarity, and purpose in a chaotic world.
            <br />
            Discover philosophies that have shaped empires. Master disciplines
            that fuel legends. Connect with a brotherhood and sisterhood of
            thinkers, doers, and dreamers.
          </p>
        </div>

        {/* Buttons centered properly */}
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4 pt-2">
          <VintageButtons
            name="Purpose"
            className="text-black p-6 sm:p-8 md:p-10"
          />
          <VintageButtons
            name="Get Started"
            className="text-black p-6 sm:p-8 md:p-9"
          />
        </div>
      </div>

      {/* Right Side: 3D Model */}
      <div className="flex-1 justify-center items-center h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px] w-full">
        <div className="w-full h-full max-w-[600px]">
          <ThreeDModel />
        </div>
      </div>
    </div>
  );
};

export default Hero;
