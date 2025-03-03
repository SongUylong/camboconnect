"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Bell, Menu, User, X, Bookmark } from "lucide-react";
import { useState } from "react";

interface NavigationItem {
  name: string;
  href: string;
  className?: string;
  icon?: React.ReactNode;
}

export function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const baseNavigation: NavigationItem[] = [
    { name: "Opportunities", href: "/opportunities" },
    { name: "Community", href: "/community" },
  ];

  // Add admin item if user is authenticated and has admin role
  const navigation: NavigationItem[] = session?.user?.isAdmin
    ? [
        ...baseNavigation,
        {
          name: "Admin",
          href: "/admin",
          className: "text-yellow-600 hover:text-yellow-700 font-semibold",
        },
      ]
    : baseNavigation;

  const userNavigation = [
    { name: "Profile", href: "/profile" },
    { name: "Settings", href: "/settings" },
  ];

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <header className="bg-white shadow">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <div className="flex flex-shrink-0 items-center">
              <Link href="/">
                <span className="text-xl font-bold text-blue-600">CamboConnect</span>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
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
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {session ? (
              <>
                {/* Bookmark button */}
                <Link
                  href="/profile/bookmarks"
                  className="relative rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 mr-2"
                >
                  <span className="absolute -inset-1.5" />
                  <span className="sr-only">View bookmarks</span>
                  <Bookmark className="h-6 w-6" aria-hidden="true" />
                </Link>

                {/* Notification bell */}
                <button
                  type="button"
                  className="relative rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <span className="absolute -inset-1.5" />
                  <span className="sr-only">View notifications</span>
                  <Bell className="h-6 w-6" aria-hidden="true" />
                </button>

                <div className="relative ml-3">
                  <div>
                    <Link
                      href="/profile"
                      className="flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      <span className="sr-only">Open user menu</span>
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-500" />
                      </div>
                    </Link>
                  </div>
                </div>

                <div className="ml-3">
                  <button
                    onClick={() => signOut()}
                    className="btn btn-outline"
                  >
                    Sign out
                  </button>
                </div>
              </>
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
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              type="button"
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

      {mobileMenuOpen && (
        <div className="sm:hidden">
          <div className="space-y-1 pb-3 pt-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`block border-l-4 py-2 pl-3 pr-4 text-base font-medium ${
                  item.className ||
                  (isActive(item.href)
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-transparent text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800")
                }`}
              >
                <div className="flex items-center">
                  {item.icon}
                  {item.name}
                </div>
              </Link>
            ))}
          </div>
          {session ? (
            <div className="border-t border-gray-200 pb-3 pt-4">
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="h-6 w-6 text-gray-500" />
                  </div>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">
                    {session.user.name}
                  </div>
                  <div className="text-sm font-medium text-gray-500">
                    {session.user.email}
                  </div>
                </div>
                <div className="ml-auto flex items-center space-x-2">
                  {/* Mobile bookmark button */}
                  <Link
                    href="/profile/bookmarks"
                    className="rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <span className="sr-only">View bookmarks</span>
                    <Bookmark className="h-6 w-6" aria-hidden="true" />
                  </Link>
                  
                  {/* Mobile notification bell */}
                  <button
                    type="button"
                    className="rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <span className="sr-only">View notifications</span>
                    <Bell className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                {userNavigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                  >
                    {item.name}
                  </Link>
                ))}
                <button
                  onClick={() => signOut()}
                  className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                >
                  Sign out
                </button>
              </div>
            </div>
          ) : (
            <div className="border-t border-gray-200 pt-4 pb-3">
              <div className="flex items-center px-4">
                <Link href="/login" className="btn btn-outline mr-2">
                  Log in
                </Link>
                <Link href="/register" className="btn btn-primary">
                  Sign up
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
}