import React from "react";
import ThreeDModel from "./ThreeDModel";
// import VintageButtons from "./vintage-button";

const Hero = () => {
  return (
    <div className="mt-20">
      {/* <video
        className="rounded-xl h-[500px] w-[800px]"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src="/StoicVideo.mp4" type="video/mp4" />
        <source src="/StoicVideo.webm" type="video/webm" />
        Your browser does not support the video tag.
      </video> */}
      <ThreeDModel />
    </div>
  );
};

export default Hero;
