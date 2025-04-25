"use client";
import React from "react";
import Image from "next/image";

const navItems = [
  { name: "Home", icon: "/HomeIcon.png" },
  { name: "SageBot", icon: "/SageBot.png" },
  { name: "Tribe", icon: "/Tribe.png" },
  { name: "Profile", icon: "/Profile.png" },
  { name: "Settings", icon: "/settingsIcon.png" },
];

const Navbar = () => {
  return (
    <nav className="relative w-full shadow-md">
      {/* Background Container with full width */}
      <div
        className="absolute inset-0 bg-no-repeat bg-center"
        style={{
          backgroundImage: 'url("/ancientframe.png")',
          backgroundSize: "100% 100%",
          height: "100%",
          width: "100%",
        }}
      />

      {/* Overlay Content - Three-section layout with minimal spacing */}
      <div
        className="relative flex items-center justify-between w-full px-2 py-4 mx-auto"
        style={{
          minHeight: "150px",
          maxWidth: "75%",
        }}
      >
        {/* Logo Section - Left */}
        <div className="mt-4 flex-shrink-0 z-10 mr-1">
          <Image
            src="/navImage.jpg"
            alt="Nav Logo"
            height={70}
            width={70}
            className="z-10 rounded-full"
          />
        </div>

        {/* Navigation Menu - Center */}
        <div className="flex-grow flex justify-center mt-4 z-10 mx-0">
          <ul className="flex space-x-10 text-amber-900 font-semibold text-base">
            {navItems.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <li className="hover:text-amber-600 hover:underline cursor-pointer transition-colors duration-200">
                  {item.name}
                </li>
                <img
                  src={item.icon}
                  className="h-10 rounded-lg hover:scale-125 transition-transform duration-200"
                  alt={`${item.name} icon`}
                />
              </div>
            ))}
          </ul>
        </div>

        {/* Auth Buttons - Right */}
        <div className="mt-4 flex-shrink-0 flex items-center space-x-1 z-10 ml-1">
          <button className="px-2 py-1 text-amber-900 hover:text-amber-600 font-medium transition-colors duration-200">
            Login
          </button>
          <button className="px-2 py-1 bg-amber-800 text-white rounded-md hover:bg-amber-700 transition-colors duration-200">
            Signup
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
