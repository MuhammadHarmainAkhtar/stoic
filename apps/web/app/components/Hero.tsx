import React from "react";
import VintageButtons from "./vintage-button";

const Hero = () => {
  return (
    <div className="mt-20 flex flex-col gap-5">
      <VintageButtons className="font-bold text-3xl" name="Get Started" />
      <VintageButtons className="font-bold text-3xl" name="Learn More" />
    </div>
  );
};

export default Hero;
