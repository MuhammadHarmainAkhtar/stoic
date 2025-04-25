"use client";

import { useState } from "react";
import Link from "next/link";

interface Props {
  name: string;
  className: string;
}

export default function VintageButtons({ className ,name }: Props) {
  const [hoverButton, setHoverButton] = useState(false);

  return (
    <>
      <div className="flex flex-col items-center justify-center">
        <Link
          href="#get-started"
          className="relative w-full max-w-xs transition-transform duration-200 font-[MorrisRoman]"
          onMouseEnter={() => setHoverButton(true)}
          onMouseLeave={() => setHoverButton(false)}
          style={{ transform: hoverButton ? "scale(1.01)" : "scale(1)" }}
        >
          <div
            className="relative"
            style={{
              background: "linear-gradient(to bottom, #d9b77f, #c9a76a)",
              backgroundImage: `
          linear-gradient(to bottom, #d9b77f, #c9a76a),
          url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")
        `,
              backgroundBlendMode: "multiply",
              padding: "12px",
            }}
          >
            {/* Outer hand-drawn border */}
            <svg
              className="absolute top-0 left-0 w-full h-full"
              style={{
                width: "100%",
                height: "100%",
                position: "absolute",
                top: 0,
                left: 0,
                zIndex: 1,
              }}
              viewBox="0 0 300 80"
              preserveAspectRatio="none"
            >
              <path
                d="M2,2 
             C2,1.5 30,2.5 60,2 
             C90,1.5 120,3 150,2 
             C180,1 210,2.5 240,2 
             C270,1.5 298,2 298,2 
             L298,30 
             C298.5,30 297.5,40 298,50 
             C298.5,60 298,78 298,78 
             C298,78 270,77.5 240,78 
             C210,78.5 180,77 150,78 
             C120,79 90,77.5 60,78 
             C30,78.5 2,78 2,78 
             L2,50 
             C1.5,50 2.5,40 2,30 
             C1.5,20 2,2 2,2 Z"
                fill="none"
                stroke="#2A1A0D"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            {/* Inner hand-drawn border */}
            <svg
              style={{
                width: "calc(100% - 16px)",
                height: "calc(100% - 16px)",
                position: "absolute",
                top: "8px",
                left: "8px",
                zIndex: 1,
              }}
              viewBox="0 0 280 60"
              preserveAspectRatio="none"
            >
              <path
                d="M2,2 
             C2,1.5 28,2.5 56,2 
             C84,1.5 112,3 140,2 
             C168,1 196,2.5 224,2 
             C252,1.5 278,2 278,2 
             L278,20 
             C278.5,20 277.5,30 278,40 
             C278.5,50 278,58 278,58 
             C278,58 252,57.5 224,58 
             C196,58.5 168,57 140,58 
             C112,59 84,57.5 56,58 
             C28,58.5 2,58 2,58 
             L2,40 
             C1.5,40 2.5,30 2,20 
             C1.5,10 2,2 2,2 Z"
                fill="none"
                stroke="#2A1A0D"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            {/* Button content */}
            <div
              className="relative px-6 py-3 text-center"
              style={{ zIndex: 2 }}
            >
              <span className= {`${className}text-amber-950`}>
                {name}
              </span>
            </div>
          </div>
        </Link>
      </div>
    </>
  );
}
