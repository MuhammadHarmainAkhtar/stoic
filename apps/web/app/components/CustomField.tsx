"use client";
import { useState } from "react";

interface Props {
  className: string;
  name?: string;
  type: "text" | "email" | "password" | "textarea";
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  maxLength?: number;
}

export default function VintageInput({ className, type, placeholder, value, onChange, maxLength, name }: Props) {
  const [showPassword, setShowPassword] = useState(false);
  
  const inputStyles = {
    background: "transparent",
  };

  return (
    <div className="flex">
      <div className="relative left-.9" style={inputStyles}>
        {/* Outer hand-drawn border */}
        <svg
          className="absolute top-0 left-0 w-full h-full"
          style={{
            position: "absolute",
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

        {/* Input content */}
        <div className="relative px-5 py-3" style={{ zIndex: 2 }}>
          {type === "textarea" ? (
            <textarea
              name={name}
              placeholder={placeholder}
              value={value}
              onChange={onChange}
              maxLength={maxLength}
              className={`${className} w-full h-32 p-2 focus:outline-none`}
            />
          ) : (
            <div className="relative">
              <input
                name={name}
                type={type === "password" ? (showPassword ? "text" : "password") : type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                maxLength={maxLength}
                className={`${className} w-full p-2 focus:outline-none`}
                required
              />
              {type === "password" && (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-black/80"
                >
                  {showPassword ? "🔒" : "👁️"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
