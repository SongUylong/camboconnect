"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";

interface Application {
  id: string;
  opportunity: {
    id: string;
    title: string;
    organization: {
      name: string;
      logo?: string;
    };
    location: string;
    type: string;
  };
  status: "pending" | "reviewing" | "accepted" | "rejected";
  appliedAt: Date;
  lastUpdated: Date;
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    reviewing: "bg-blue-100 text-blue-800",
    accepted: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  };

  const filteredApplications = applications.filter((app) => {
    const matchesSearch = app.opportunity.title
      .toLowerCase()
      .includes(search.toLowerCase()) ||
      app.opportunity.organization.name
        .toLowerCase()
        .includes(search.toLowerCase());
    const matchesFilter = filter === "all" || app.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Applications</h1>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search applications..."
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
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="reviewing">Reviewing</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">Loading applications...</div>
        ) : filteredApplications.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No applications found</p>
          </div>
        ) : (
          filteredApplications.map((application) => (
            <Card key={application.id} className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium">{application.opportunity.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {application.opportunity.organization.name}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">
                      {application.opportunity.type}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {application.opportunity.location}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={statusColors[application.status]}>
                    {application.status.charAt(0).toUpperCase() +
                      application.status.slice(1)}
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-2">
                    Applied {new Date(application.appliedAt).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Last updated{" "}
                    {new Date(application.lastUpdated).toLocaleDateString()}
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
