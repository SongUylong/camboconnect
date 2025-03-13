"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Search, Bookmark, AlertCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MainLayout } from "@/components/layout/main-layout";
import { useBookmarkStore } from "@/store/bookmarkStore";
import { OpportunityCard } from "@/components/opportunities/opportunity-card";
import { Opportunity, OpportunityStatus } from "@/types";

// Extended version of Opportunity with bookmark-specific fields
interface BookmarkedOpportunity extends Opportunity {
  bookmarkId: string;
  bookmarkedAt: Date;
}

export default function BookmarksPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState<BookmarkedOpportunity[]>([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | null;
  }>({ message: "", type: null });
  const { removeBookmark, setInitialBookmarks } = useBookmarkStore();

  useEffect(() => {
    // Redirect if not logged in
    if (!session && !isLoading) {
      router.push("/login");
      return;
    }

    // Fetch bookmarks from API
    const fetchBookmarks = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/profile/bookmarks");
        if (!response.ok) {
          throw new Error("Failed to fetch bookmarks");
        }
        const data = await response.json();
        
        // Transform dates to Date objects
        const transformedData = data.map((bookmark: BookmarkedOpportunity) => ({
          ...bookmark,
          deadline: new Date(bookmark.deadline),
          bookmarkedAt: new Date(bookmark.bookmarkedAt)
        }));
        
        setBookmarks(transformedData);
        
        // Initialize the global bookmark store with current bookmarks
        setInitialBookmarks(transformedData.map((bookmark: BookmarkedOpportunity) => bookmark.id));
        
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch bookmarks:", error);
        setIsLoading(false);
      }
    };

    if (session) {
      fetchBookmarks();
    }
  }, [session, router, setInitialBookmarks]);

  // Clear notification after 3 seconds
  useEffect(() => {
    if (notification.type) {
      const timer = setTimeout(() => {
        setNotification({ message: "", type: null });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const filteredBookmarks = bookmarks.filter((bookmark) => {
    const matchesSearch = bookmark.title
      .toLowerCase()
      .includes(search.toLowerCase()) ||
      bookmark.organization.name
        .toLowerCase()
        .includes(search.toLowerCase());
    const matchesFilter = filter === "all" || bookmark.category.name.toLowerCase() === filter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  // Get unique categories for filter
  const uniqueCategories = Array.from(new Set(bookmarks.map(b => b.category.name)));

  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My Bookmarks</h1>
          <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search bookmarks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={filter}
              onValueChange={setFilter}
              className="w-40"
            >
              <option value="all">All Categories</option>
              {uniqueCategories.map(category => (
                <option key={category} value={category.toLowerCase()}>
                  {category}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {/* Notification */}
        {notification.type && (
          <div 
            className={`mb-4 p-3 rounded-md ${
              notification.type === "success" 
                ? "bg-green-50 text-green-700 border border-green-200" 
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            <div className="flex items-center">
              {notification.type === "success" ? (
                <Bookmark className="h-5 w-5 mr-2" />
              ) : (
                <AlertCircle className="h-5 w-5 mr-2" />
              )}
              {notification.message}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            <div className="col-span-full text-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading bookmarks...</p>
            </div>
          ) : filteredBookmarks.length === 0 ? (
            <div className="col-span-full text-center py-8 bg-white rounded-lg border border-gray-200 p-6">
              <Bookmark className="h-12 w-12 text-gray-300 mx-auto" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No bookmarks found</h3>
              <p className="mt-1 text-gray-500">
                {search || filter !== "all" 
                  ? "Try adjusting your search or filter criteria."
                  : "Save opportunities you're interested in for later."}
              </p>
              {!search && filter === "all" && (
                <div className="mt-6">
                  <Link href="/opportunities" className="btn btn-primary">
                    Explore Opportunities
                  </Link>
                </div>
              )}
            </div>
          ) : (
            filteredBookmarks.map((bookmark) => (
              <OpportunityCard 
                key={bookmark.id} 
                opportunity={bookmark as any} 
              />
            ))
          )}
        </div>
      </div>
    </MainLayout>
  );
}
