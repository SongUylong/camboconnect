"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { MainLayout } from "@/components/layout/main-layout";
import { Input } from "@/components/ui/input";
import { FriendsList } from "@/components/friends/friends-list";
import { FriendRequestsList } from "@/components/friends/friend-requests-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function FriendsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  // Show loading state while checking session
  if (status === "loading") {
    return (
      <MainLayout>
        <div className="container mx-auto py-8 px-4">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Only redirect if we're sure there's no session
  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900">Friends</h1>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search friends..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Tabs defaultValue="friends" className="w-full">
            <TabsList className="mb-8">
              <TabsTrigger value="friends">My Friends</TabsTrigger>
              <TabsTrigger value="requests">Friend Requests</TabsTrigger>
            </TabsList>

            <TabsContent value="friends">
              <FriendsList searchQuery={searchQuery} />
            </TabsContent>

            <TabsContent value="requests">
              <FriendRequestsList searchQuery={searchQuery} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
} 