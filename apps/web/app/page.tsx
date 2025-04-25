import React from "react";
import VintageButtons from "./components/vintage-button";

const page = () => {
  return (
    <>
      <main className="w-full h-full">
        <h1
          style={{ fontFamily: "MorrisRoman" }}
          className="text-8xl text-[#5C3810] text-center mt-20"
        >
         WELCOME TO THE PAGE
        </h1>
        <div className="mt-20 flex flex-col gap-5">
          <VintageButtons className="font-bold text-3xl" name="GET STARTED" />
          <VintageButtons className="font-bold text-3xl" name="LEARN MORE" />
        </div>
      </main>
    </>
  );
};

export default page;
