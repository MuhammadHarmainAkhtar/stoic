import React from "react";
import ThreeDModel from "./ThreeDModel";
// import VintageButtons from "./vintage-button";

const Hero = () => {
  return (
    <div className="flex items-center justify-between px-10 py-20">
    {/* Left Side: Text and Button */}
    <div className="max-w-md">
      <h1 className="text-4xl font-bold mb-6">
        Your Hero Heading
      </h1>
      <p className="text-lg mb-6">
        A short description or tagline that explains your product or service.
      </p>
      <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
        Get Started
      </button>
    </div>
  
    {/* Right Side: 3D Model */}
    <div className="w-[500px] h-[500px]">
      <ThreeDModel />
    </div>
  </div>
  
  );
};

export default Hero;
