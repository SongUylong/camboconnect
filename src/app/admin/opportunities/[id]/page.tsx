"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  Briefcase, 
  Users, 
  Activity, 
  MapPin, 
  Building2, 
  Calendar,
  Clock,
  Edit,
  Trash,
  CheckCircle,
  XCircle
} from "lucide-react";

interface OpportunityData {
  id: string;
  title: string;
  description: string;
  type: string;
  location: string;
  status: "active" | "closed" | "draft";
  startDate: Date;
  endDate?: Date;
  deadline?: Date;
  requirements: string[];
  organization: {
    id: string;
    name: string;
    logo?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  applicantCount: number;
}

interface Applicant {
  id: string;
  name: string;
  image?: string;
  email: string;
  appliedAt: Date;
  status: "pending" | "reviewing" | "accepted" | "rejected";
  matchScore?: number;
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

export default function AdminOpportunityDetailPage() {
  const router = useRouter();
  const params = useParams();
  const opportunityId = params.id as string;
  
  const [opportunity, setOpportunity] = useState<OpportunityData | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOpportunityData = async () => {
      try {
        setIsLoading(true);
        // In a real app, fetch opportunity data from API
        // const response = await fetch(`/api/admin/opportunities/${opportunityId}`);
        // const data = await response.json();
        // setOpportunity(data);
        
        // Mock data for demonstration
        setOpportunity({
          id: opportunityId,
          title: "Web Development Workshop",
          description: "A three-day intensive workshop on modern web development techniques, focusing on React, Node.js, and responsive design principles. Participants will build a complete web application from scratch.",
          type: "Workshop",
          location: "Phnom Penh, Cambodia",
          status: "active",
          startDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days from now
          endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 9), // 9 days from now
          deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3), // 3 days from now
          requirements: [
            "Basic knowledge of HTML, CSS, and JavaScript",
            "Own laptop with Node.js installed",
            "Interest in web development",
            "Commitment to attend all three days"
          ],
          organization: {
            id: "org1",
            name: "Cambodia Tech Association",
            logo: "https://api.dicebear.com/7.x/initials/svg?seed=CTA"
          },
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14), // 14 days ago
          updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 7 days ago
          applicantCount: 45
        });
        
        // Mock applicants data
        setApplicants([
          {
            id: "app1",
            name: "Sothea Prak",
            image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sothea",
            email: "sothea.prak@example.com",
            appliedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
            status: "accepted",
            matchScore: 92
          },
          {
            id: "app2",
            name: "Channarith Ly",
            image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Channarith",
            email: "channarith.ly@example.com",
            appliedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6), // 6 days ago
            status: "reviewing",
            matchScore: 85
          },
          {
            id: "app3",
            name: "Sovannara Meas",
            image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sovannara",
            email: "sovannara.meas@example.com",
            appliedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
            status: "pending",
            matchScore: 78
          },
          {
            id: "app4",
            name: "Kunthea Nhek",
            image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kunthea",
            email: "kunthea.nhek@example.com",
            appliedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4), // 4 days ago
            status: "rejected",
            matchScore: 45
          }
        ]);
        
        // Mock activity data
        setActivities([
          {
            id: "act1",
            type: "application_accepted",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
            details: "Accepted application from Sothea Prak",
            user: {
              id: "admin1",
              name: "Admin User"
            }
          },
          {
            id: "act2",
            type: "application_rejected",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
            details: "Rejected application from Kunthea Nhek",
            user: {
              id: "admin1",
              name: "Admin User"
            }
          },
          {
            id: "act3",
            type: "opportunity_updated",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 7 days ago
            details: "Updated opportunity details",
            user: {
              id: "admin2",
              name: "Manager User"
            }
          },
          {
            id: "act4",
            type: "opportunity_created",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14), // 14 days ago
            details: "Created new opportunity",
            user: {
              id: "admin2",
              name: "Manager User"
            }
          }
        ]);
        
      } catch (error) {
        console.error("Error fetching opportunity data:", error);
        toast.error("Failed to load opportunity data");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOpportunityData();
  }, [opportunityId]);

  const handleEditOpportunity = () => {
    router.push(`/admin/opportunities/${opportunityId}/edit`);
  };
  
  const handleDeleteOpportunity = () => {
    router.push(`/admin/opportunities/${opportunityId}/delete`);
  };
  
  const handleViewOrganization = () => {
    if (opportunity?.organization.id) {
      router.push(`/admin/organizations/${opportunity.organization.id}`);
    }
  };
  
  const handleViewApplicant = (id: string) => {
    router.push(`/admin/users/${id}`);
  };
  
  const handleUpdateApplicationStatus = (id: string, status: string) => {
    // In a real app, call API to update application status
    // For demo, update local state
    setApplicants(prev => 
      prev.map(app => 
        app.id === id ? { ...app, status: status as any } : app
      )
    );
    
    toast.success(`Application ${status === 'accepted' ? 'accepted' : 'rejected'}`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center py-12">Loading opportunity data...</div>
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">Opportunity not found</h2>
          <p className="text-muted-foreground mb-6">The requested opportunity could not be found.</p>
          <Button onClick={() => router.push('/admin/opportunities')}>
            Back to Opportunities
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
            onClick={() => router.push('/admin/opportunities')}
          >
            Back to Opportunities
          </Button>
          <h1 className="text-2xl font-bold">Opportunity Details</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleEditOpportunity}
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={handleDeleteOpportunity}
          >
            <Trash className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>
      
      <Card className="p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold">{opportunity.title}</h2>
                <div className="flex items-center gap-4 mt-1">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Briefcase className="w-4 h-4" />
                    <span>{opportunity.type}</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
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
            
            <div className="mt-4">
              <p className="text-muted-foreground">{opportunity.description}</p>
            </div>
            
            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <span className="text-sm font-medium">Dates: </span>
                  <span>
                    {opportunity.startDate.toLocaleDateString()} 
                    {opportunity.endDate && ` - ${opportunity.endDate.toLocaleDateString()}`}
                  </span>
                </div>
              </div>
              
              {opportunity.deadline && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <span className="text-sm font-medium">Application Deadline: </span>
                    <span>{opportunity.deadline.toLocaleDateString()}</span>
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <div>
                  <span className="text-sm font-medium">Applicants: </span>
                  <span>{opportunity.applicantCount}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="md:w-1/3 lg:w-1/4">
            <Card className="p-4 bg-muted/50">
              <h3 className="text-sm font-semibold mb-3">Organization</h3>
              <div className="flex items-center gap-3">
                {opportunity.organization.logo && (
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-background flex items-center justify-center">
                    <img 
                      src={opportunity.organization.logo} 
                      alt={opportunity.organization.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div>
                  <p className="font-medium">{opportunity.organization.name}</p>
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-sm"
                    onClick={handleViewOrganization}
                  >
                    View Organization
                  </Button>
                </div>
              </div>
            </Card>
            
            <div className="mt-4">
              <h3 className="text-sm font-semibold mb-3">Requirements</h3>
              <ul className="space-y-2">
                {opportunity.requirements.map((req, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-primary text-lg leading-none">•</span>
                    <span className="text-sm">{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Card>
      
      <Tabs defaultValue="applicants" className="space-y-6">
        <TabsList className="grid grid-cols-2 w-full max-w-md">
          <TabsTrigger value="applicants" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Applicants</span>
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <span>Activity</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="applicants" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Applicants ({applicants.length})</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Export List
              </Button>
              <Button variant="outline" size="sm">
                Send Message
              </Button>
            </div>
          </div>
          
          {applicants.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No applicants yet for this opportunity.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {applicants.map((applicant) => (
                <Card key={applicant.id} className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                      {applicant.image ? (
                        <img 
                          src={applicant.image} 
                          alt={applicant.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-lg font-semibold">{applicant.name[0]}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <h3 className="font-medium">{applicant.name}</h3>
                          <p className="text-sm text-muted-foreground">{applicant.email}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={
                            applicant.status === "accepted" 
                              ? "success" 
                              : applicant.status === "rejected" 
                                ? "destructive" 
                                : applicant.status === "reviewing"
                                  ? "secondary"
                                  : "outline"
                          }>
                            {applicant.status.charAt(0).toUpperCase() + applicant.status.slice(1)}
                          </Badge>
                          {applicant.matchScore && (
                            <Badge variant="outline" className="bg-background">
                              Match: {applicant.matchScore}%
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Applied on {applicant.appliedAt.toLocaleDateString()}
                      </p>
                      
                      <div className="flex flex-wrap justify-between items-center mt-4">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewApplicant(applicant.id)}
                        >
                          View Profile
                        </Button>
                        
                        {(applicant.status === "pending" || applicant.status === "reviewing") && (
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleUpdateApplicationStatus(applicant.id, "rejected")}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-success hover:text-success"
                              onClick={() => handleUpdateApplicationStatus(applicant.id, "accepted")}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Accept
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="activity" className="space-y-6">
          <h2 className="text-xl font-semibold">Opportunity Activity</h2>
          
          {activities.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No activity recorded for this opportunity.</p>
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
                            By: <span className="text-primary hover:underline cursor-pointer" onClick={() => handleViewApplicant(activity.user!.id)}>
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