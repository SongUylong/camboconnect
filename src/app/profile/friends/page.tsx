"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FriendCard } from "@/components/profile/friend-card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Search, Users } from "lucide-react";

interface Friend {
  id: string;
  name: string;
  image?: string;
  location?: string;
  role?: string;
  company?: string;
  connectionDate: Date;
  mutualConnections: number;
}

export default function FriendsPage() {
  const router = useRouter();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const filteredFriends = friends.filter((friend) => {
    const matchesSearch = friend.name
      .toLowerCase()
      .includes(search.toLowerCase()) ||
      (friend.company && friend.company.toLowerCase().includes(search.toLowerCase()));
    const matchesFilter = filter === "all" || friend.role === filter;
    return matchesSearch && matchesFilter;
  });

  const handleViewProfile = (id: string) => {
    router.push(`/profile/${id}`);
  };

  const handleRemoveConnection = async (id: string) => {
    try {
      // API call to remove connection
      await fetch(`/api/connections/${id}`, {
        method: "DELETE",
      });
      setFriends((prev) => prev.filter((f) => f.id !== id));
    } catch (error) {
      console.error("Failed to remove connection:", error);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">My Connections</h1>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Users className="w-5 h-5" />
            <span>{friends.length}</span>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search connections..."
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
            <option value="all">All Roles</option>
            <option value="student">Students</option>
            <option value="professional">Professionals</option>
            <option value="recruiter">Recruiters</option>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? (
          <div className="col-span-2 text-center py-8">
            Loading connections...
          </div>
        ) : filteredFriends.length === 0 ? (
          <div className="col-span-2 text-center py-8">
            <p className="text-gray-500">No connections found</p>
          </div>
        ) : (
          filteredFriends.map((friend) => (
            <FriendCard
              key={friend.id}
              friend={friend}
              onViewProfile={handleViewProfile}
              onRemoveConnection={handleRemoveConnection}
            />
          ))
        )}
      </div>
    </div>
  );
}
