"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Search, Bookmark, Building2, MapPin, Calendar } from "lucide-react";

interface BookmarkedOpportunity {
  id: string;
  title: string;
  organization: {
    id: string;
    name: string;
    logo?: string;
  };
  type: string;
  location: string;
  deadline?: Date;
  tags: string[];
  bookmarkedAt: Date;
}

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<BookmarkedOpportunity[]>([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const filteredBookmarks = bookmarks.filter((bookmark) => {
    const matchesSearch = bookmark.title
      .toLowerCase()
      .includes(search.toLowerCase()) ||
      bookmark.organization.name
        .toLowerCase()
        .includes(search.toLowerCase());
    const matchesFilter = filter === "all" || bookmark.type === filter;
    return matchesSearch && matchesFilter;
  });

  const handleRemoveBookmark = async (id: string) => {
    try {
      // API call to remove bookmark
      setBookmarks((prev) => prev.filter((b) => b.id !== id));
    } catch (error) {
      console.error("Failed to remove bookmark:", error);
    }
  };

  return (
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
            <option value="all">All Types</option>
            <option value="job">Jobs</option>
            <option value="internship">Internships</option>
            <option value="volunteer">Volunteer</option>
            <option value="event">Events</option>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">Loading bookmarks...</div>
        ) : filteredBookmarks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No bookmarks found</p>
          </div>
        ) : (
          filteredBookmarks.map((bookmark) => (
            <Card key={bookmark.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium">{bookmark.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <Building2 className="w-4 h-4" />
                    <span>{bookmark.organization.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{bookmark.location}</span>
                  </div>
                  {bookmark.deadline && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Deadline:{" "}
                        {new Date(bookmark.deadline).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="outline">{bookmark.type}</Badge>
                    {bookmark.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveBookmark(bookmark.id)}
                  >
                    <Bookmark className="w-4 h-4 fill-current" />
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    Saved{" "}
                    {new Date(bookmark.bookmarkedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
