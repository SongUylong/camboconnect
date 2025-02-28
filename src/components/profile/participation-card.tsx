"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Building2, MapPin } from "lucide-react";

interface ParticipationCardProps {
  participation: {
    id: string;
    title: string;
    organization: {
      name: string;
      logo?: string;
    };
    location: string;
    startDate: Date;
    endDate?: Date;
    status: "active" | "completed" | "upcoming";
    role: string;
    description: string;
  };
  onViewDetails: (id: string) => void;
}

export function ParticipationCard({
  participation,
  onViewDetails,
}: ParticipationCardProps) {
  const statusColors = {
    active: "bg-green-100 text-green-800",
    completed: "bg-gray-100 text-gray-800",
    upcoming: "bg-blue-100 text-blue-800",
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-medium">{participation.title}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <Building2 className="w-4 h-4" />
              <span>{participation.organization.name}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{participation.location}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>
                {formatDate(participation.startDate)}
                {participation.endDate && ` - ${formatDate(participation.endDate)}`}
              </span>
            </div>
          </div>
          <Badge
            variant="secondary"
            className={statusColors[participation.status]}
          >
            {participation.status.charAt(0).toUpperCase() +
              participation.status.slice(1)}
          </Badge>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-1">Role</h4>
          <p className="text-sm text-muted-foreground">{participation.role}</p>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-1">Description</h4>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {participation.description}
          </p>
        </div>

        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(participation.id)}
          >
            View Details
          </Button>
        </div>
      </div>
    </Card>
  );
}
