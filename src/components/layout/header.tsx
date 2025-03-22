"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Bell, Menu, User, X, Bookmark, Users, Settings, LogOut, ChevronDown, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import NotificationCenter from "./notification-center";

interface NavigationItem {
  name: string;
  href: string;
  className?: string;
  icon?: React.ReactNode;
}

interface ProfileMenuItem {
  name: string;
  href?: string;
  onClick?: () => void;
  icon: React.ReactNode;
}

export function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [mobileProfileOpen, setMobileProfileOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [mobileMenuOpen]);

  const baseNavigation: NavigationItem[] = [
    { name: "Opportunities", href: "/opportunities" },
    { name: "Community", href: "/community" },
    { name: "Guide", href: "/guide" },
    { name: "About", href: "/about" },
  ];

  const navigation: NavigationItem[] = baseNavigation;

  // Close profile menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Only close if we're clicking outside the menu and not on the menu button
      if (
        mobileMenuOpen && 
        mobileMenuRef.current && 
        !mobileMenuRef.current.contains(event.target as Node) && 
        !(event.target as HTMLElement).closest('[data-mobile-menu-button]')
      ) {
        setMobileMenuOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobileMenuOpen]);

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      
      // Add a timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Sign out timed out")), 5000)
      );
      
      // Race between the signOut call and the timeout
      await Promise.race([
        signOut({ 
          callbackUrl: '/',
          redirect: false 
        }),
        timeoutPromise
      ]);
      
      // Force a hard refresh to clear any cached state
      window.location.href = '/';
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Failed to sign out. Please try again.");
      setIsSigningOut(false);
    }
  };

  const isActive = (path: string) => {
    return pathname === path;
  };

  // Profile menu items for logged in users
  const profileMenuItems: ProfileMenuItem[] = [
    { name: "Settings", href: "/settings", icon: <Settings className="h-5 w-5 mr-2" /> },
    { name: "Bookmarks", href: "/profile/bookmarks", icon: <Bookmark className="h-5 w-5 mr-2" /> },
    { name: "Friends", href: "/friends", icon: <Users className="h-5 w-5 mr-2" /> },
    { name: "Sign out", onClick: handleSignOut, icon: <LogOut className="h-5 w-5 mr-2" /> },
  ];

  // Add Admin option for admin users
  if (session?.user?.isAdmin) {
    profileMenuItems.unshift({ name: "Admin", href: "/admin", icon: <Settings className="h-5 w-5 mr-2 text-yellow-600" /> });
  }

  return (
    <header className="bg-white shadow relative z-30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image
                src="/images/logo.png"
                alt="CamboConnect"
                width={180}
                height={40}
                className="h-8 w-auto"
                priority
              />
              <span className="hidden md:block ml-2 font-medium text-gray-900">CamboConnect</span>
            </Link>
          </div>

          {/* Center Navigation */}
          <div className="hidden md:flex items-center justify-center flex-1">
            <div className="flex space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium ${
                    item.className ||
                    (isActive(item.href)
                      ? "border-blue-500 text-gray-900"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700")
                  }`}
                >
                  {item.icon}
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Right Side - Auth Controls or User Menu */}
          <div className="hidden md:flex items-center">
            {session ? (
              <div className="flex items-center space-x-4">
                {/* Notification center */}
                <NotificationCenter />

                {/* Profile dropdown */}
                <div className="relative" ref={profileMenuRef}>
                  <button
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    className="flex items-center space-x-1 rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <span className="sr-only">Open user menu</span>
                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="h-5 w-5 text-gray-500" />
                    </div>
                    <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${profileMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Profile dropdown menu */}
                  {profileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-800">
                          {session.user.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {session.user.email}
                        </p>
                      </div>
                      
                      {profileMenuItems.map((item) => (
                        item.href ? (
                          <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left ${
                              item.name === "Admin" ? "text-yellow-600 font-medium" : ""
                            }`}
                            onClick={() => setProfileMenuOpen(false)}
                          >
                            {item.icon}
                            {item.name}
                          </Link>
                        ) : (
                          <button
                            key={item.name}
                            onClick={() => {
                              setProfileMenuOpen(false);
                              item.onClick?.();
                            }}
                            disabled={isSigningOut && item.name === "Sign out"}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left disabled:opacity-50"
                          >
                            {item.icon}
                            {isSigningOut && item.name === "Sign out" ? "Signing out..." : item.name}
                          </button>
                        )
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex space-x-4">
                <Link href="/login" className="btn btn-outline">
                  Log in
                </Link>
                <Link href="/register" className="btn btn-primary">
                  Sign up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              type="button"
              data-mobile-menu-button
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile slide-in menu */}
      <div 
        className={`fixed inset-0 bg-gray-800 bg-opacity-75 z-40 transition-opacity duration-300 ${
          mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
      ></div>

      <div 
        ref={mobileMenuRef}
        className={`fixed top-0 right-0 bottom-0 w-72 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Mobile Menu Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Menu</h2>
          <button 
            type="button" 
            className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
            onClick={() => setMobileMenuOpen(false)}
          >
            <span className="sr-only">Close menu</span>
            <X className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        {/* Mobile Menu Content */}
        <div className="overflow-y-auto h-full pb-16">
          {session ? (
            <>
              {/* User profile section */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="h-6 w-6 text-gray-500" />
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="text-base font-medium text-gray-800">{session.user.name}</div>
                    <div className="text-sm text-gray-500 truncate">{session.user.email}</div>
                  </div>
                  <NotificationCenter />
                </div>

                {/* Profile dropdown toggle */}
                <button 
                  onClick={() => setMobileProfileOpen(!mobileProfileOpen)}
                  className="flex items-center justify-between w-full mt-4 px-2 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100"
                >
                  <span>Profile Settings</span>
                  <ChevronDown 
                    className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${
                      mobileProfileOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Collapsible profile options */}
                {mobileProfileOpen && (
                  <div className="mt-2 space-y-1 pl-2">
                    {profileMenuItems.map((item) => (
                      item.href ? (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={`flex items-center px-4 py-2 text-sm rounded-md ${
                            item.name === "Admin" 
                              ? "text-yellow-600 font-medium hover:bg-yellow-50" 
                              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                          }`}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {item.icon}
                          {item.name}
                        </Link>
                      ) : (
                        <button
                          key={item.name}
                          onClick={() => {
                            setMobileMenuOpen(false);
                            item.onClick?.();
                          }}
                          disabled={isSigningOut && item.name === "Sign out"}
                          className="flex items-center px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-md w-full text-left disabled:opacity-50"
                        >
                          {item.icon}
                          {isSigningOut && item.name === "Sign out" ? "Signing out..." : item.name}
                        </button>
                      )
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="p-4 border-b border-gray-200">
              <div className="flex flex-col space-y-2">
                <Link 
                  href="/login" 
                  className="btn btn-outline w-full"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Log in
                </Link>
                <Link 
                  href="/register" 
                  className="btn btn-primary w-full"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign up
                </Link>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="px-2 py-4">
            <ul className="space-y-2">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center px-4 py-3 text-base font-medium rounded-md ${
                      isActive(item.href)
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.icon}
                    {item.name}
                    <ChevronRight className="ml-auto h-5 w-5 text-gray-400" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}