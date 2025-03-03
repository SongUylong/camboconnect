"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Search, Bookmark, Building2, MapPin, Calendar, ExternalLink } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { MainLayout } from "@/components/layout/main-layout";

interface BookmarkedOpportunity {
  id: string;
  bookmarkId: string;
  title: string;
  organization: {
    id: string;
    name: string;
    logo?: string;
  };
  category: {
    id: string;
    name: string;
  };
  status: string;
  deadline: Date;
  bookmarkedAt: Date;
}

export default function BookmarksPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState<BookmarkedOpportunity[]>([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

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
        setBookmarks(data);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch bookmarks:", error);
        setIsLoading(false);
      }
    };

    if (session) {
      fetchBookmarks();
    }
  }, [session, router]);

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

  const handleRemoveBookmark = async (bookmarkId: string) => {
    try {
      // API call to remove bookmark
      const response = await fetch(`/api/opportunities/${bookmarkId}/bookmark`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookmarked: false }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to remove bookmark");
      }
      
      // Remove from local state
      setBookmarks((prev) => prev.filter((b) => b.bookmarkId !== bookmarkId));
    } catch (error) {
      console.error("Failed to remove bookmark:", error);
    }
  };

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

        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading bookmarks...</p>
            </div>
          ) : filteredBookmarks.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-lg border border-gray-200 p-6">
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
              <Card key={bookmark.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-lg">
                      <Link 
                        href={`/opportunities/${bookmark.id}`}
                        className="hover:text-blue-600"
                      >
                        {bookmark.title}
                      </Link>
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Building2 className="w-4 h-4" />
                      <Link 
                        href={`/community/${bookmark.organization.id}`}
                        className="hover:text-blue-600"
                      >
                        {bookmark.organization.name}
                      </Link>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Deadline: {format(new Date(bookmark.deadline), 'PP')}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="outline">{bookmark.category.name}</Badge>
                      <Badge 
                        variant={
                          bookmark.status === "ACTIVE" 
                            ? "success" 
                            : bookmark.status === "CLOSING_SOON"
                            ? "warning"
                            : bookmark.status === "OPENING_SOON"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {bookmark.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveBookmark(bookmark.bookmarkId)}
                      title="Remove bookmark"
                    >
                      <Bookmark className="w-4 h-4 fill-current" />
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      Saved {format(new Date(bookmark.bookmarkedAt), 'PP')}
                    </p>
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <Link href={`/opportunities/${bookmark.id}`}>
                    <Button variant="outline" size="sm" className="flex items-center">
                      View Details
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </MainLayout>
  );
}
