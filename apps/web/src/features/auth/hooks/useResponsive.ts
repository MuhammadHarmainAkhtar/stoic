import { useState, useEffect } from 'react';

/**
 * Custom hook to handle responsive design checks
 * @param breakpoint Width breakpoint in pixels 
 * @returns Whether the current screen size is below the breakpoint
 */
export const useResponsive = (breakpoint = 768) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= breakpoint);
    };

    // Initial check
    checkMobile();

    // Add event listener for window resize
    window.addEventListener("resize", checkMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkMobile);
  }, [breakpoint]);

  return { isMobile };
};