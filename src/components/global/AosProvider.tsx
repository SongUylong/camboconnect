"use client";

import { useEffect } from 'react';

// Import AOS
import AOS from 'aos';
import 'aos/dist/aos.css';

export function AosProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize AOS
    AOS.init({
      // Global settings
      duration: 800, // Animation duration
      easing: 'ease-out-cubic', // Default easing
      once: true, // Whether animation should happen only once
      offset: 50, // Offset (in px) from the original trigger point
      delay: 0, // Default delay
      anchorPlacement: 'top-bottom', // Defines which position of the element regarding to window should trigger the animation
    });
  }, []);

  return <>{children}</>;
}