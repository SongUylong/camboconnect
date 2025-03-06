"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { UserProfile } from "@/types/user";
import { ProfileHeader } from "@/components/profile/profile-header";
import { FriendCard } from "@/components/profile/friend-card";
import { ParticipationCard } from "@/components/profile/participation-card";
import { 
  User, 
  Settings, 
  Users, 
  Calendar, 
  Activity, 
  Shield, 
  Ban, 
  UserCheck 
} from "lucide-react";

interface UserData {
  id: string;
  name: string;
  email: string;
  image?: string;
  phone?: string;
  location?: string;
  role: "user" | "admin";
  status: "active" | "suspended" | "pending";
  createdAt: Date;
  lastActive?: Date;
  profile: UserProfile;
}

interface Friend {
  id: string;
  name: string;
  image?: string;
  location?: string;
  role?: string;
  company?: string;
  connectionDate: Date;
  mutualConnections?: number;
}

interface Participation {
  id: string;
  title: string;
  organization: {
    id: string;
    name: string;
    logo?: string;
  };
  location: string;
  startDate: Date;
  endDate?: Date;
  status: "active" | "completed" | "upcoming";
  role: string;
  description: string;
}

interface Activity {
  id: string;
  type: string;
  timestamp: Date;
  details: string;
}

export default function AdminUserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [participations, setParticipations] = useState<Participation[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch user data
        const userResponse = await fetch(`/api/admin/users/${userId}`);
        if (!userResponse.ok) throw new Error("Failed to fetch user data");
        const userData = await userResponse.json();
        setUser(userData);
        
        // Fetch friends data
        const friendsResponse = await fetch(`/api/admin/users/${userId}/friends`);
        if (friendsResponse.ok) {
          const friendsData = await friendsResponse.json();
          setFriends(friendsData.friends);
        }
        
        // Fetch participations data
        const participationsResponse = await fetch(`/api/admin/users/${userId}/participations`);
        if (participationsResponse.ok) {
          const participationsData = await participationsResponse.json();
          setParticipations(participationsData.participations);
        }
        
        // Fetch activity data
        const activitiesResponse = await fetch(`/api/admin/users/${userId}/activities`);
        if (activitiesResponse.ok) {
          const activitiesData = await activitiesResponse.json();
          setActivities(activitiesData.activities);
        }
        
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Failed to load user data");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, [userId]);

  const handleSuspendUser = async () => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/suspend`, { 
        method: 'POST' 
      });
      
      if (!response.ok) throw new Error("Failed to suspend user");
      
      toast.success("User has been suspended");
      setUser(prev => prev ? { ...prev, status: "suspended" } : null);
    } catch (error) {
      console.error("Error suspending user:", error);
      toast.error("Failed to suspend user");
    }
  };
  
  const handleActivateUser = async () => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/activate`, { 
        method: 'POST' 
      });
      
      if (!response.ok) throw new Error("Failed to activate user");
      
      toast.success("User has been activated");
      setUser(prev => prev ? { ...prev, status: "active" } : null);
    } catch (error) {
      console.error("Error activating user:", error);
      toast.error("Failed to activate user");
    }
  };
  
  const handlePromoteToAdmin = async () => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/promote`, { 
        method: 'POST' 
      });
      
      if (!response.ok) throw new Error("Failed to promote user");
      
      toast.success("User has been promoted to admin");
      setUser(prev => prev ? { ...prev, role: "admin" } : null);
    } catch (error) {
      console.error("Error promoting user:", error);
      toast.error("Failed to promote user");
    }
  };
  
  const handleViewProfile = (id: string) => {
    router.push(`/admin/users/${id}`);
  };
  
  const handleViewOrganization = (id: string) => {
    router.push(`/admin/organizations/${id}`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center py-12">Loading user data...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">User not found</h2>
          <p className="text-muted-foreground mb-6">The requested user could not be found.</p>
          <Button onClick={() => router.push('/admin/users')}>
            Back to Users
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => router.push('/admin/users')}
          >
            Back to Users
          </Button>
          <h1 className="text-2xl font-bold">User Details</h1>
        </div>
        <div className="flex items-center gap-2">
          {user.status === "active" ? (
            <Button 
              variant="destructive" 
              size="sm"
              onClick={handleSuspendUser}
            >
              <Ban className="w-4 h-4 mr-2" />
              Suspend User
            </Button>
          ) : (
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleActivateUser}
            >
              <UserCheck className="w-4 h-4 mr-2" />
              Activate User
            </Button>
          )}
          {user.role !== "admin" && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={handlePromoteToAdmin}
            >
              <Shield className="w-4 h-4 mr-2" />
              Promote to Admin
            </Button>
          )}
        </div>
      </div>
      
      <div className="mb-6">
        <Card className="p-4">
          <div className="flex flex-wrap gap-4 justify-between">
            <div>
              <p className="text-sm text-muted-foreground">User ID</p>
              <p className="font-medium">{user.id}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Role</p>
              <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                {user.role === "admin" ? "Admin" : "User"}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge 
                variant={
                  user.status === "active" 
                    ? "success" 
                    : user.status === "suspended" 
                      ? "destructive" 
                      : "outline"
                }
              >
                {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Joined</p>
              <p className="font-medium">{user.createdAt.toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Last Active</p>
              <p className="font-medium">
                {user.lastActive 
                  ? user.lastActive.toLocaleDateString() + ' ' + user.lastActive.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                  : 'Never'
                }
              </p>
            </div>
          </div>
        </Card>
      </div>
      
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>Profile</span>
          </TabsTrigger>
          <TabsTrigger value="connections" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Connections</span>
          </TabsTrigger>
          <TabsTrigger value="participations" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Participations</span>
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <span>Activity</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="space-y-6">
          <ProfileHeader 
            user={{
              id: user.id,
              name: user.name,
              email: user.email,
              image: user.image,
              phone: user.phone,
              location: user.location
            }}
            profile={user.profile}
            isOwnProfile={false}
          />
        </TabsContent>
        
        <TabsContent value="connections" className="space-y-6">
          <h2 className="text-xl font-semibold mb-4">User Connections</h2>
          {friends.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">This user has no connections yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {friends.map((friend) => (
                <FriendCard
                  key={friend.id}
                  friend={friend}
                  onViewProfile={handleViewProfile}
                  onRemoveConnection={() => {}}
                />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="participations" className="space-y-6">
          <h2 className="text-xl font-semibold mb-4">User Participations</h2>
          {participations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">This user has no participations yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {participations.map((participation) => (
                <ParticipationCard
                  key={participation.id}
                  participation={participation}
                  onViewDetails={() => handleViewOrganization(participation.organization.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="activity" className="space-y-6">
          <h2 className="text-xl font-semibold mb-4">User Activity</h2>
          {activities.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No activity recorded for this user.</p>
            </div>
          ) : (
            <Card>
              <div className="p-4">
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-4 pb-4 border-b last:border-0">
                      <div className="bg-muted rounded-full p-2">
                        <Activity className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <p className="font-medium">
                            {activity.type.split('_').map(word => 
                              word.charAt(0).toUpperCase() + word.slice(1)
                            ).join(' ')}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {activity.timestamp.toLocaleDateString()} at {activity.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {activity.details}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
