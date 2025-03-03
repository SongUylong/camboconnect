"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { Building, Globe, Users } from "lucide-react";

type OrganizationCardProps = {
  organization: {
    id: string;
    name: string;
    description: string;
    logo?: string | null;
    website?: string | null;
    isFollowing?: boolean;
    opportunityCount?: number;
    followerCount?: number;
  };
};

export function OrganizationCard({ organization }: OrganizationCardProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isFollowing, setIsFollowing] = useState(organization.isFollowing || false);
  const [isLoading, setIsLoading] = useState(false);

  const handleFollow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!session) {
      router.push("/login");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/organizations/${organization.id}/follow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ following: !isFollowing }),
      });

      if (!response.ok) {
        throw new Error('Failed to update follow status');
      }

      setIsFollowing(!isFollowing);
      router.refresh();
    } catch (error) {
      console.error("Failed to update follow status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Link
      href={`/community/${organization.id}`}
      className="card hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col h-full"
    >
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-center">
          <div className="h-12 w-12 rounded-md bg-gray-100 flex items-center justify-center overflow-hidden">
            {organization.logo ? (
              <img
                src={organization.logo}
                alt={organization.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <Building className="h-6 w-6 text-gray-400" />
            )}
          </div>
          <div className="ml-4 flex-1">
            <h3 className="text-lg font-semibold text-gray-900">{organization.name}</h3>
            
            {organization.website && (
              <div className="mt-1 flex items-center text-sm text-gray-500">
                <Globe className="h-4 w-4 mr-1" />
                <span className="truncate">{organization.website.replace(/^https?:\/\//, '')}</span>
              </div>
            )}
          </div>
        </div>
        
        <p className="mt-4 text-sm text-gray-600 line-clamp-3 flex-grow">
          {organization.description}
        </p>
        
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-500">
            <Users className="h-4 w-4 mr-1" />
            <span>{organization.followerCount || 0} followers</span>
          </div>
          
          <button
            onClick={handleFollow}
            className={`btn btn-sm ${
              isFollowing 
                ? "bg-blue-50 text-blue-600 border-blue-600" 
                : "btn-outline"
            }`}
            disabled={isLoading}
          >
            {isLoading 
              ? "Loading..." 
              : isFollowing 
                ? "Following" 
                : "Follow"}
          </button>
        </div>
      </div>
    </Link>
  );
}