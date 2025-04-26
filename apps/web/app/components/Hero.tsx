import React from "react";
import ThreeDModel from "./ThreeDModel";
import VintageButtons from "./vintage-button";

const Hero = () => {
  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col md:flex-row items-start justify-center px-8 md:px-16 pt-10 md:pt-8">
      {/* Left Side: Text and Buttons */}
      <div className="z-10 flex-1 flex flex-col items-center text-center space-y-8 mt-10 md:mt-8">
        <div className="space-y-6 max-w-2xl lg:ml-10">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-black bg-clip-text font-[bruneyfont]">
            Welcome to Stoic Tribe
          </h1>
          <p className="text-xl md:text-2xl text-black leading-relaxed font-md p-3 rounded-lg">
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
        <div className="flex flex-wrap justify-center gap-4 pt-2">
          <VintageButtons name="Purpose" className="text-black p-10" />
          <VintageButtons name="Get Started" className="text-black p-9" />
        </div>
      </div>

      {/* Right Side: 3D Model */}
      <div className="flex-1 flex justify-center items-start mt-10 md:mt-15">
        <div className="w-[300px] h-[300px] md:w-[450px] md:h-[450px] lg:w-[600px] lg:h-[600px]">
          <ThreeDModel />
        </div>
      </div>
    </div>
  );
};

export default Hero;
