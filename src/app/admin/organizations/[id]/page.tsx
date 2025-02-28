"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  Building2, 
  Users, 
  Briefcase, 
  Activity, 
  MapPin, 
  Globe, 
  Mail, 
  Phone,
  Calendar,
  Edit,
  Trash
} from "lucide-react";

interface OrganizationData {
  id: string;
  name: string;
  logo?: string;
  description: string;
  website?: string;
  email?: string;
  phone?: string;
  location: string;
  type: string;
  status: "active" | "inactive" | "pending";
  foundedYear: number;
  memberCount: number;
  createdAt: Date;
}

interface Member {
  id: string;
  name: string;
  image?: string;
  role: string;
  joinedAt: Date;
}

interface Opportunity {
  id: string;
  title: string;
  type: string;
  location: string;
  status: "active" | "closed" | "draft";
  startDate: Date;
  endDate?: Date;
  applicantCount: number;
}

interface ActivityItem {
  id: string;
  type: string;
  timestamp: Date;
  details: string;
  user?: {
    id: string;
    name: string;
  };
}

export default function AdminOrganizationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const organizationId = params.id as string;
  
  const [organization, setOrganization] = useState<OrganizationData | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrganizationData = async () => {
      try {
        setIsLoading(true);
        // In a real app, fetch organization data from API
        // const response = await fetch(`/api/admin/organizations/${organizationId}`);
        // const data = await response.json();
        // setOrganization(data);
        
        // Mock data for demonstration
        setOrganization({
          id: organizationId,
          name: "Cambodia Tech Association",
          logo: "https://api.dicebear.com/7.x/initials/svg?seed=CTA",
          description: "A non-profit organization dedicated to advancing technology education and innovation in Cambodia.",
          website: "https://cambodiatechassociation.org",
          email: "info@cambodiatechassociation.org",
          phone: "+855 23 456 789",
          location: "Phnom Penh, Cambodia",
          type: "Non-profit",
          status: "active",
          foundedYear: 2018,
          memberCount: 120,
          createdAt: new Date("2022-03-15")
        });
        
        // Mock members data
        setMembers([
          {
            id: "member1",
            name: "Sopheap Kim",
            image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sopheap",
            role: "Director",
            joinedAt: new Date("2022-03-15")
          },
          {
            id: "member2",
            name: "Dara Choun",
            image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Dara",
            role: "Program Manager",
            joinedAt: new Date("2022-04-10")
          },
          {
            id: "member3",
            name: "Bopha Meas",
            image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bopha",
            role: "Community Lead",
            joinedAt: new Date("2022-05-22")
          }
        ]);
        
        // Mock opportunities data
        setOpportunities([
          {
            id: "opp1",
            title: "Web Development Workshop",
            type: "Workshop",
            location: "Phnom Penh",
            status: "active",
            startDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days from now
            endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 9), // 9 days from now
            applicantCount: 45
          },
          {
            id: "opp2",
            title: "Tech Internship Program",
            type: "Internship",
            location: "Phnom Penh",
            status: "active",
            startDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days from now
            endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 120), // 120 days from now
            applicantCount: 78
          },
          {
            id: "opp3",
            title: "Hackathon 2023",
            type: "Event",
            location: "Siem Reap",
            status: "closed",
            startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30), // 30 days ago
            endDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 28), // 28 days ago
            applicantCount: 120
          }
        ]);
        
        // Mock activity data
        setActivities([
          {
            id: "act1",
            type: "opportunity_created",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
            details: "Created new opportunity: Web Development Workshop",
            user: {
              id: "member1",
              name: "Sopheap Kim"
            }
          },
          {
            id: "act2",
            type: "member_added",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
            details: "Added new member: Bopha Meas",
            user: {
              id: "member1",
              name: "Sopheap Kim"
            }
          },
          {
            id: "act3",
            type: "profile_updated",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10), // 10 days ago
            details: "Updated organization profile information",
            user: {
              id: "member2",
              name: "Dara Choun"
            }
          }
        ]);
        
      } catch (error) {
        console.error("Error fetching organization data:", error);
        toast.error("Failed to load organization data");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrganizationData();
  }, [organizationId]);

  const handleEditOrganization = () => {
    router.push(`/admin/organizations/${organizationId}/edit`);
  };
  
  const handleDeleteOrganization = () => {
    router.push(`/admin/organizations/${organizationId}/delete`);
  };
  
  const handleViewMember = (id: string) => {
    router.push(`/admin/users/${id}`);
  };
  
  const handleViewOpportunity = (id: string) => {
    router.push(`/admin/opportunities/${id}`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center py-12">Loading organization data...</div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">Organization not found</h2>
          <p className="text-muted-foreground mb-6">The requested organization could not be found.</p>
          <Button onClick={() => router.push('/admin/organizations')}>
            Back to Organizations
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
            onClick={() => router.push('/admin/organizations')}
          >
            Back to Organizations
          </Button>
          <h1 className="text-2xl font-bold">Organization Details</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleEditOrganization}
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={handleDeleteOrganization}
          >
            <Trash className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="md:col-span-2 p-6">
          <div className="flex items-start gap-4">
            {organization.logo && (
              <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                <img 
                  src={organization.logo} 
                  alt={organization.name} 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold">{organization.name}</h2>
                  <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{organization.location}</span>
                  </div>
                </div>
                <Badge variant={
                  organization.status === "active" 
                    ? "success" 
                    : organization.status === "inactive" 
                      ? "destructive" 
                      : "outline"
                }>
                  {organization.status.charAt(0).toUpperCase() + organization.status.slice(1)}
                </Badge>
              </div>
              <p className="mt-4 text-muted-foreground">{organization.description}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Organization Info</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Building2 className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Type</p>
                <p>{organization.type}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Founded</p>
                <p>{organization.foundedYear}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Users className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Members</p>
                <p>{organization.memberCount}</p>
              </div>
            </div>
            {organization.website && (
              <div className="flex items-start gap-3">
                <Globe className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Website</p>
                  <a 
                    href={organization.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {organization.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              </div>
            )}
            {organization.email && (
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <a 
                    href={`mailto:${organization.email}`}
                    className="text-primary hover:underline"
                  >
                    {organization.email}
                  </a>
                </div>
              </div>
            )}
            {organization.phone && (
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <a 
                    href={`tel:${organization.phone}`}
                    className="text-primary hover:underline"
                  >
                    {organization.phone}
                  </a>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
      
      <Tabs defaultValue="members" className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="members" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Members</span>
          </TabsTrigger>
          <TabsTrigger value="opportunities" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            <span>Opportunities</span>
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <span>Activity</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="members" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Organization Members</h2>
            <Button variant="outline" size="sm">
              <Users className="w-4 h-4 mr-2" />
              Manage Members
            </Button>
          </div>
          
          {members.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">This organization has no members yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {members.map((member) => (
                <Card key={member.id} className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                      {member.image ? (
                        <img 
                          src={member.image} 
                          alt={member.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-lg font-semibold">{member.name[0]}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{member.name}</h3>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                        <p className="text-xs text-muted-foreground">
                          Joined {member.joinedAt.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewMember(member.id)}
                    >
                      View Profile
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="opportunities" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Organization Opportunities</h2>
            <Button variant="outline" size="sm">
              <Briefcase className="w-4 h-4 mr-2" />
              Add Opportunity
            </Button>
          </div>
          
          {opportunities.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">This organization has no opportunities yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {opportunities.map((opportunity) => (
                <Card key={opportunity.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium">{opportunity.title}</h3>
                      <div className="flex items-center gap-4 mt-1">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Briefcase className="w-3 h-3" />
                          <span>{opportunity.type}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          <span>{opportunity.location}</span>
                        </div>
                      </div>
                    </div>
                    <Badge variant={
                      opportunity.status === "active" 
                        ? "success" 
                        : opportunity.status === "closed" 
                          ? "secondary" 
                          : "outline"
                    }>
                      {opportunity.status.charAt(0).toUpperCase() + opportunity.status.slice(1)}
                    </Badge>
                  </div>
                  
                  <div className="mt-4 flex flex-wrap justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                      <span>
                        {opportunity.startDate.toLocaleDateString()} 
                        {opportunity.endDate && ` - ${opportunity.endDate.toLocaleDateString()}`}
                      </span>
                      <span className="mx-2">•</span>
                      <span>{opportunity.applicantCount} applicants</span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewOpportunity(opportunity.id)}
                    >
                      View Details
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="activity" className="space-y-6">
          <h2 className="text-xl font-semibold">Organization Activity</h2>
          
          {activities.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No activity recorded for this organization.</p>
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
                        {activity.user && (
                          <p className="text-sm mt-1">
                            By: <span className="text-primary hover:underline cursor-pointer" onClick={() => handleViewMember(activity.user!.id)}>
                              {activity.user.name}
                            </span>
                          </p>
                        )}
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
