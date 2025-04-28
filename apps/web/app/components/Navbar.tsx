"use client";
import React, { useState } from "react";
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavItemClick = (name: string) => {
    setIsMenuOpen(false);
    console.log(name);
    // Add your navigation logic here if needed
  };

  return (
    <nav className="relative w-full">
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
          <Link href="#home">
          <Image
            src="/navImage.jpg"
            alt="Nav Logo"
            height={70}
            width={70}
            className="z-10 rounded-xl cursor-pointer"
          /></Link>
        </div>

        {/* Hamburger Menu Button - Mobile Only */}
        <div className="lg:hidden z-20 relative top-[10]">
          <Image
            src="/Hamburger.png"
            alt="Menu"
            width={40}
            height={40}
            className="cursor-pointer transition-transform duration-200 hover:scale-110 rounded-lg"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          />
        </div>

        {/* Navigation Menu - Desktop */}
        <div className="hidden lg:flex flex-grow justify-center mt-4 z-10 mx-0">
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

        {/* Auth Buttons - Desktop */}
        <div className="hidden lg:flex mt-4 flex-shrink-0 items-center space-x-1 z-10 ml-1 ">
          <Link
            href={"/login"}
            className="text-black px-2 hover:text-amber-600 font-medium transition-colors duration-200"
          >
            Login
          </Link>
          <VintageButtons
            className="text-black hover:text-amber-900 transition-colors"
            name="Signup"
            href="/signup"
          />
        </div>

        {/* Mobile Menu Overlay */}
        <div
          className={`fixed inset-0  bg-opacity-50 z-30 lg:hidden transition-opacity duration-300 ${
            isMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setIsMenuOpen(false)}
        >
          <div
            className={`fixed right-0 top-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
              isMenuOpen ? "translate-x-0" : "translate-x-full"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4">
              {/* Close Button */}
              <button
                onClick={() => setIsMenuOpen(false)}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
              >
                <Image
                  src="/sword.avif"
                  alt="Close menu"
                  width={24}
                  height={24}
                  className="transition-transform duration-200 hover:scale-110"
                />
              </button>
              <ul className="space-y-4 mt-12">
                {navItems.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center gap-2 py-2"
                    onClick={() => handleNavItemClick(item.name)}
                  >
                    <Image
                      src={item.icon}
                      className="h-8 w-8 rounded-lg"
                      alt={`${item.name} icon`}
                      height={32}
                      width={32}
                    />
                    <li className="text-lg text-black hover:text-amber-600 cursor-pointer transition-colors duration-200 font-[bruneyfont]">
                      {item.name}
                    </li>
                  </div>
                ))}
              </ul>
              <div className="mt-8 space-y-4">
                <Link
                  href={"/login"}
                  className="block text-black px-2 hover:text-amber-600 font-medium transition-colors duration-200"
                >
                  Login
                </Link>
                <VintageButtons
                  className="text-black hover:text-amber-900 transition-colors w-full"
                  name="Signup"
                  href="/signup"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
