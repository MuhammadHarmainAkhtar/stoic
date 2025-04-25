"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import VintageButtons from "./vintage-button";

const navItems = [
  { name: "home", icon: "/HomeIcon.png" },
  { name: "sage bot", icon: "/SageBot.png" },
  { name: "tribe", icon: "/Tribe.png" },
  { name: "profile", icon: "/Profile.png" },
  { name: "settings", icon: "/settingsIcon.png" },
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
                <li className="text-xl text-black hover:text-amber-600 cursor-pointer transition-colors duration-200 font-[bruneyfont]">
                  {item.name}
                </li>
                <Image
                  src={item.icon}
                  className="h-10 rounded-lg hover:scale-125 transition-transform duration-200"
                  alt={`${item.name} icon`}
                  height={40}
                  width={40}
                />
              </div>
            ))}
          </ul>
        </div>

        {/* Auth Buttons - Right */}
        <div className="mt-4 flex-shrink-0 flex items-center space-x-1 z-10 ml-1">
          <Link
            href={"#"}
            className="text-black px-2 hover:text-amber-600 font-medium transition-colors duration-200"
          >
            Login
          </Link>
          <VintageButtons
            className="text-black transition-colors"
            name="Signup"
          />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
