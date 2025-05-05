"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import VintageButtons from "./vintage-button";
import { useAuthContext } from "../../src/features/auth/context/AuthContext";

const navItems = [
  { name: "home", icon: "/HomeIcon.png", href: "/" },
  { name: "sage bot", icon: "/SageBot.png", href: "/sagebot" },
  { name: "tribe", icon: "/Tribe.png", href: "/tribe" },
  { name: "profile", icon: "/Profile.png", href: "/profile" },
  { name: "settings", icon: "/settingsIcon.png", href: "/settings" },
];

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const auth = useAuthContext();
  const [mounted, setMounted] = useState(false);

  // Use useEffect to handle client-side rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleNavItemClick = (name: string) => {
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    auth.logout();
    setIsMenuOpen(false);
  };

  // Get user initials for the avatar
  const getUserInitials = () => {
    if (auth.user?.username) {
      return auth.user.username.slice(0, 2).toUpperCase();
    }
    return "ST"; // Default - Stoic Tribe
  };
  
  // Separate the authentication state check into a clear function
  const isUserLoggedIn = () => {
    return mounted && auth.isAuthenticated();
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
          <Link href="/">
            <Image
              src="/navImage.jpg"
              alt="Nav Logo"
              height={70}
              width={70}
              className="z-10 rounded-xl cursor-pointer"
            />
          </Link>
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
                <Link href={item.href}>
                  <li className="text-xl text-black hover:text-amber-600 cursor-pointer transition-colors duration-200 font-[bruneyfont]">
                    {item.name}
                  </li>
                </Link>
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
        <div className="hidden lg:flex mt-4 flex-shrink-0 items-center space-x-2 z-10 ml-1">
          {isUserLoggedIn() ? (
            <>
              <VintageButtons
                className="text-black hover:text-amber-900 transition-colors"
                name="Dashboard"
                href="/dashboard"
              />
              <button
                onClick={handleLogout}
                className="w-10 h-10 rounded-full border-2 border-amber-800 overflow-hidden flex items-center justify-center bg-amber-50 hover:border-amber-600 transition-colors ml-2"
                title="Click to logout"
              >
                <span className="font-[bruneyfont] text-lg text-black">{getUserInitials()}</span>
              </button>
            </>
          ) : (
            <>
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
            </>
          )}
        </div>

        {/* Mobile Menu Overlay */}
        <div
          className={`fixed inset-0 bg-opacity-50 z-30 lg:hidden transition-opacity duration-300 ${
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
              {/* User Profile Display - Mobile */}
              {isUserLoggedIn() && (
                <div className="flex items-center space-x-3 mb-6 mt-6 border-b border-amber-200 pb-4">
                  <div className="w-12 h-12 rounded-full border-2 border-amber-800 overflow-hidden flex items-center justify-center bg-amber-50">
                    <span className="font-[bruneyfont] text-xl text-black">{getUserInitials()}</span>
                  </div>
                  <div>
                    <Link
                      href="/profile"
                      className="font-[bruneyfont] text-black hover:text-amber-700 transition-colors"
                    >
                      My Profile
                    </Link>
                  </div>
                </div>
              )}
              
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
                    <Link href={item.href}>
                      <li className="text-lg text-black hover:text-amber-600 cursor-pointer transition-colors duration-200 font-[bruneyfont]">
                        {item.name}
                      </li>
                    </Link>
                  </div>
                ))}
              </ul>
              <div className="mt-8 space-y-4">
                {isUserLoggedIn() ? (
                  <>
                    <Link
                      href="/dashboard"
                      onClick={() => setIsMenuOpen(false)}
                      className="text-black px-2 hover:text-amber-600 font-medium transition-colors duration-200 flex items-center gap-2"
                    >
                      <span className="font-[bruneyfont] text-xl">Dashboard</span>
                    </Link>
                    <VintageButtons
                      className="text-black hover:text-amber-900 transition-colors w-full"
                      name="Logout"
                      onClick={handleLogout}
                    />
                  </>
                ) : (
                  <>
                    <Link
                      onClick={() => setIsMenuOpen(false)}
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
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
