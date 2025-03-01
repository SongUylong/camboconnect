"use client";

import { useState, useEffect, useRef } from "react";
import { Settings } from "lucide-react";
import Link from "next/link";

export default function SettingsPopover() {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  
  // Handle click outside to close the popover
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    // Add event listener when popover is open
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    // Clean up event listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);
  
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
  
  return (
    <div className="relative" ref={popoverRef}>
      <button
        onClick={toggleDropdown}
        className="rounded-full p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label="Settings"
      >
        <Settings className="h-5 w-5" />
      </button>
      
      {isOpen && (
        <div className="absolute left-0 mt-2 w-56 bg-white shadow-lg rounded-md z-50 border border-gray-200">
          <div className="py-1">
            <Link 
              href="/settings/privacy"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              onClick={() => setIsOpen(false)}
            >
              Privacy Settings
            </Link>
          </div>
        </div>
      )}
    </div>
  );
} 