"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  Menu,
  User,
  X,
  Bookmark,
  Users,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  Briefcase,
  Users2,
  HelpCircle,
  Info,
  ShieldAlert,
  Home
} from "lucide-react";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import NotificationCenter from "./notification-center";
import { motion, AnimatePresence } from "framer-motion";

interface NavigationItem {
  name: string;
  href: string;
  className?: string;
  icon: React.ReactNode;
}

interface ProfileMenuItem {
  name: string;
  href?: string;
  onClick?: () => void;
  icon: React.ReactNode;
}

// Animation variants for the expandable tabs
const tabVariants = {
  initial: {
    gap: 0,
    paddingLeft: "0.75rem",
    paddingRight: "0.75rem",
  },
  animate: (isExpanded: boolean) => ({
    gap: isExpanded ? ".5rem" : 0,
    paddingLeft: isExpanded ? "1rem" : "0.75rem",
    paddingRight: isExpanded ? "1rem" : "0.75rem",
    backgroundColor: isExpanded ? "rgb(243, 244, 246)" : "transparent",
  }),
};

const textVariants = {
  initial: { width: 0, opacity: 0 },
  animate: { width: "auto", opacity: 1 },
  exit: { width: 0, opacity: 0, transition: { duration: 0.15, opacity: { duration: 0.1 } } },
};

// Faster spring animation for better responsiveness
const transition = {
  type: "spring",
  stiffness: 500,
  damping: 25,
  mass: 0.5,
  duration: 0.25
};

export function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [mobileProfileOpen, setMobileProfileOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState<string | null>(null);
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

  const profileMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);

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

  // Set the active tab on page load
  useEffect(() => {
    // Find which navigation item matches the current path
    const currentRoute = baseNavigation.find(item => pathname === item.href);
    if (currentRoute) {
      setSelectedTab(currentRoute.href);
    } else {
      setSelectedTab(null);
    }
    // Reset hovered tab when changing pages
    setHoveredTab(null);
  }, [pathname]);

  const baseNavigation: NavigationItem[] = [
    { name: "Opportunities", href: "/opportunities", icon: <Briefcase className="h-5 w-5" /> },
    { name: "Community", href: "/community", icon: <Users2 className="h-5 w-5" /> },
    { name: "Guide", href: "/guide", icon: <HelpCircle className="h-5 w-5" /> },
    { name: "About", href: "/about", icon: <Info className="h-5 w-5" /> },
  ];

  const navigation: NavigationItem[] = baseNavigation;

  // Close tabs when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (tabsRef.current && !tabsRef.current.contains(event.target as Node)) {
        // Only reset selectedTab if it's not the active page
        const activeTab = baseNavigation.find(item => pathname === item.href);
        if (selectedTab && selectedTab !== activeTab?.href) {
          setSelectedTab(null);
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [pathname, selectedTab]);

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
    profileMenuItems.unshift({ name: "Admin", href: "/admin", icon: <ShieldAlert className="h-5 w-5 mr-2 text-yellow-600" /> });
  }

  // Get whether a tab should be expanded - either when hovered or when it's the selected/active tab
  const isTabExpanded = (href: string) => {
    // If any tab is being hovered, only that tab should be expanded
    if (hoveredTab !== null) {
      return hoveredTab === href;
    }
    // Otherwise, show the selected tab or the active page tab
    return selectedTab === href || isActive(href);
  };

  console.log(session?.user)

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
              <span className="hidden md:block ml-2 font-medium text-theme-navy">CamboConnect</span>
            </Link>
          </div>

          {/* Center Navigation - Expandable Tabs */}
          <div
            ref={tabsRef}
            className="hidden md:flex items-center justify-center flex-1"
            onMouseLeave={() => setHoveredTab(null)}
          >
            <div className="flex items-center space-x-2 rounded-xl border bg-white p-1.5 shadow-sm">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  passHref
                  className="focus:outline-none"
                >
                  <motion.div
                    variants={tabVariants}
                    initial="initial"
                    animate="animate"
                    custom={isTabExpanded(item.href)}
                    transition={transition}
                    className={`relative flex items-center rounded-lg ${isTabExpanded(item.href)
                        ? 'bg-gray-100 text-theme-navy'
                        : isActive(item.href)
                          ? 'text-theme-teal hover:bg-gray-50'
                          : 'text-theme-slate hover:bg-gray-50 hover:text-theme-navy'
                      } cursor-pointer py-2`}
                    onMouseEnter={() => setHoveredTab(item.href)}
                    onClick={() => {
                      // Only update selected tab if it's different from active page
                      if (!isActive(item.href)) {
                        setSelectedTab(item.href);
                      }
                    }}
                  >
                    <div className="flex items-center justify-center min-w-[20px]">
                      {/* Active dot indicator */}
                      {isActive(item.href) && !isTabExpanded(item.href) && (
                        <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-theme-teal"></span>
                      )}
                      {item.icon}
                    </div>
                    <AnimatePresence initial={false}>
                      {isTabExpanded(item.href) && (
                        <motion.span
                          variants={textVariants}
                          initial="initial"
                          animate="animate"
                          exit="exit"
                          transition={transition}
                          className="overflow-hidden ml-1 font-medium whitespace-nowrap"
                        >
                          {item.name}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.div>
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
                    className="flex items-center space-x-1 rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-theme-teal focus:ring-offset-2"
                  >
                    <span className="sr-only">Open user menu</span>
                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                      {session.user.image ? (
                        session.user.image.includes('googleusercontent.com') ? (
                          <Image
                            src={session.user?.image}
                            alt={`${session.user.name}`}
                            className="h-full w-full object-cover overflow-hidden rounded-full border-2 border-white"
                            referrerPolicy="no-referrer"
                            width={80}
                            height={80}
                          />
                        ) : (
                          <Image
                            src={session.user?.image}
                            alt={`${session.user.name}`}
                            className="h-full w-full object-cover overflow-hidden rounded-full border-2 border-white"
                            referrerPolicy="no-referrer"
                            width={80}
                            height={80}
                          />
                        )
                      ) : (
                        <User className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${profileMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {/* Profile dropdown menu */}
                  {profileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-800 capitalize ">
                          <Link
                            href={'/profile'}
                            className="text-sm font-semibold text-gray-800 capitalize "
                            >
                            <p className="hover:underline">{session.user.name}</p>  
                            </Link>
                        </p>
                        <p className="text-xs text-gray-500 truncate ">
                          {session.user.email}
                        </p>
                      </div>

                      {profileMenuItems.map((item) => (
                        item.href ? (
                          <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left ${item.name === "Admin" ? "text-yellow-600 font-medium" : ""
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
                <Link href="/login" className="btn border border-gray-300 bg-white hover:bg-gray-100 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Log in
                </Link>
                <Link href="/register" className="btn bg-theme-teal hover:bg-theme-teal text-white flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Sign up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <NotificationCenter />
            <button
              type="button"
              data-mobile-menu-button
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-theme-teal"
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
        className={`fixed inset-0 bg-gray-800 bg-opacity-75 z-40 transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        aria-hidden="true"
      ></div>

      <div
        ref={mobileMenuRef}
        className={`fixed top-0 right-0 bottom-0 w-72 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        {/* Mobile Menu Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-theme-navy">Menu</h2>
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

                    {session.user.image ? (
                      session.user.image.includes('googleusercontent.com') ? (
                        <Image
                          src={session.user?.image}
                          alt={`${session.user.name}`}
                          className="h-full w-full object-cover"
                          referrerPolicy="no-referrer"
                          width={80}
                          height={80}
                        />
                      ) : (
                        <Image
                          src={session.user?.image}
                          alt={`${session.user.name}`}
                          className="h-full w-full object-cover"
                          referrerPolicy="no-referrer"
                          width={80}
                          height={80}
                        />
                      )
                    ) : (
                      <User className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="text-base font-medium text-gray-800">{session.user.name}</div>
                  </div>
                </div>

                {/* Profile dropdown toggle */}
                <button
                  onClick={() => setMobileProfileOpen(!mobileProfileOpen)}
                  className="flex items-center justify-between w-full mt-4 px-2 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100"
                >
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-gray-500 mr-2" />
                    <span>Profile Settings</span>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${mobileProfileOpen ? 'rotate-180' : ''
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
                          className={`flex items-center px-4 py-2 text-sm rounded-md ${item.name === "Admin"
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
                  className="btn border border-gray-300 bg-white hover:bg-gray-100 w-full flex items-center justify-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="h-5 w-5 mr-2" />
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="btn bg-theme-teal hover:bg-theme-teal text-white w-full flex items-center justify-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="h-5 w-5 mr-2" />
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
                    className={`flex items-center px-4 py-3 text-base font-medium rounded-md ${isActive(item.href)
                        ? "bg-theme-red bg-opacity-10 text-theme-red"
                        : "text-theme-slate hover:bg-gray-50 hover:text-theme-navy"
                      }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.icon}
                    <span className="mx-2">{item.name}</span>
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