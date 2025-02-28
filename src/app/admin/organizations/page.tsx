"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface Organization {
  id: string;
  name: string;
  industry: string;
  location: string;
  size: "SMALL" | "MEDIUM" | "LARGE";
  status: "PENDING" | "ACTIVE" | "SUSPENDED";
  verified: boolean;
  createdAt: Date;
  memberCount: number;
  opportunityCount: number;
}

export default function AdminOrganizationsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [industryFilter, setIndustryFilter] = useState("all");

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const response = await fetch("/api/admin/organizations");
        if (!response.ok) throw new Error("Failed to fetch organizations");
        const data = await response.json();
        setOrganizations(data);
      } catch (error) {
        console.error("Error fetching organizations:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) {
      fetchOrganizations();
    }
  }, [session]);

  const handleVerify = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/organizations/${id}/verify`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to verify organization");

      setOrganizations((prev) =>
        prev.map((org) =>
          org.id === id ? { ...org, verified: true } : org
        )
      );
    } catch (error) {
      console.error("Error verifying organization:", error);
    }
  };

  const handleStatusChange = async (id: string, status: Organization["status"]) => {
    try {
      const response = await fetch(`/api/admin/organizations/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error("Failed to update organization status");

      setOrganizations((prev) =>
        prev.map((org) =>
          org.id === id ? { ...org, status } : org
        )
      );
    } catch (error) {
      console.error("Error updating organization status:", error);
    }
  };

  const filteredOrganizations = organizations.filter((org) => {
    const matchesSearch = org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || org.status === statusFilter;
    const matchesIndustry = industryFilter === "all" || org.industry === industryFilter;

    return matchesSearch && matchesStatus && matchesIndustry;
  });

  if (!session) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <p className="text-muted-foreground">Please sign in to manage organizations</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Organizations</h1>
        <Button onClick={() => router.push("/admin/organizations/new")}>
          Add Organization
        </Button>
      </div>

      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              placeholder="Search organizations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Select
              options={[
                { value: "all", label: "All Status" },
                { value: "ACTIVE", label: "Active" },
                { value: "PENDING", label: "Pending" },
                { value: "SUSPENDED", label: "Suspended" },
              ]}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full md:w-48"
            />
            <Select
              options={[
                { value: "all", label: "All Industries" },
                ...Array.from(
                  new Set(organizations.map((org) => org.industry))
                ).map((industry) => ({
                  value: industry,
                  label: industry,
                })),
              ]}
              value={industryFilter}
              onChange={(e) => setIndustryFilter(e.target.value)}
              className="w-full md:w-48"
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredOrganizations.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No organizations found
            </CardContent>
          </Card>
        ) : (
          filteredOrganizations.map((org) => (
            <Card key={org.id} className="hover:bg-accent/5">
              <CardContent className="flex items-center justify-between p-6">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-medium hover:underline cursor-pointer" onClick={() => router.push(`/admin/organizations/${org.id}`)}>
                      {org.name}
                    </h3>
                    <Badge variant={org.status === "ACTIVE" ? "success" : org.status === "SUSPENDED" ? "destructive" : "warning"}>
                      {org.status}
                    </Badge>
                    {org.verified && <Badge variant="secondary">Verified</Badge>}
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>{org.industry} • {org.location} • {org.size}</p>
                    <p>{org.memberCount} members • {org.opportunityCount} opportunities</p>
                    <p>Created {new Date(org.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {!org.verified && (
                    <Button variant="outline" onClick={() => handleVerify(org.id)}>
                      Verify
                    </Button>
                  )}
                  <Select
                    options={[
                      { value: "ACTIVE", label: "Set Active" },
                      { value: "SUSPENDED", label: "Suspend" },
                      { value: "PENDING", label: "Set Pending" },
                    ]}
                    value={org.status}
                    onChange={(e) => handleStatusChange(org.id, e.target.value as Organization["status"])}
                  />
                  <Button variant="outline" onClick={() => router.push(`/admin/organizations/${org.id}`)}>
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
