"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Search, Bookmark, AlertCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MainLayout } from "@/components/layout/main-layout";
import { OpportunityCard } from "@/components/opportunities/opportunity-card";
import { useBookmarks } from "@/hooks/use-profile";

interface BookmarkedOpportunity {
  id: string;
  bookmarkId: string;
  title: string;
  shortDescription: string;
  deadline: Date;
  status: "OPENING_SOON" | "ACTIVE" | "CLOSING_SOON" | "CLOSED";
  visitCount: number;
  isPopular: boolean;
  isNew: boolean;
  organization: {
    id: string;
    name: string;
    logo?: string | null;
  };
  category: {
    id: string;
    name: string;
  };
  isBookmarked: boolean;
  bookmarkedAt: Date;
}

export default function BookmarksPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | null;
  }>({ message: "", type: null });

  // Use React Query to fetch bookmarks
  const { data: bookmarks, isLoading, error } = useBookmarks();

  // Redirect if not logged in
  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  // Clear notification after 3 seconds
  if (notification.type) {
    setTimeout(() => {
      setNotification({ message: "", type: null });
    }, 3000);
  }

  // Filter bookmarks based on search and filter
  const filteredBookmarks = useMemo(() => {
    if (!bookmarks) return [];
    
    return bookmarks.filter((bookmark: BookmarkedOpportunity) => {
      const matchesSearch = bookmark.title
        .toLowerCase()
        .includes(search.toLowerCase()) ||
        bookmark.organization.name
          .toLowerCase()
          .includes(search.toLowerCase());
      const matchesFilter = filter === "all" || bookmark.category.name.toLowerCase() === filter.toLowerCase();
      return matchesSearch && matchesFilter;
    });
  }, [bookmarks, filter, search]);

  // Get unique categories for filter
  const uniqueCategories = useMemo(() => {
    if (!bookmarks) return [] as string[];
    return Array.from(new Set(bookmarks.map((b: BookmarkedOpportunity) => b.category.name))) as string[];
  }, [bookmarks]);

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
              {uniqueCategories.map((category: string) => (
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
          ) : error ? (
            <div className="col-span-full text-center py-8 bg-white rounded-lg border border-gray-200 p-6">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">Failed to load bookmarks</h3>
              <p className="mt-1 text-gray-500">
                Please try refreshing the page
              </p>
              <button 
                onClick={() => window.location.reload()}
                className="btn btn-primary mt-4"
              >
                Refresh Page
              </button>
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
            filteredBookmarks.map((bookmark: BookmarkedOpportunity) => (
              <OpportunityCard key={bookmark.id} opportunity={bookmark} />
            ))
          )}
        </div>
      </div>
    </MainLayout>
  );
}
