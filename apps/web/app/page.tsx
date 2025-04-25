import React from "react";
import VintageButtons from "./components/vintage-button";

const page = () => {
  return (
    <>
      <main className="w-full h-full">
        <h1
          style={{ fontFamily: "Germania" }}
          className="text-8xl text-[#5C3810] text-center mt-20"
        >
         welcome to the page
        </h1>
        <div className="mt-20 flex flex-col gap-5">
          <VintageButtons className="font-bold text-3xl" name="get started" />
          <VintageButtons className="font-bold text-3xl" name="learn more" />
        </div>
      </main>
    </>
  );
};

export default page;
