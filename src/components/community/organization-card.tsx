"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Building, Globe, Users } from "lucide-react";
import { FollowButton } from "@/components/community/follow-button";
import Image from "next/image";

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
  return (
    <Link
      href={`/community/${organization.id}`}
      className="card hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col h-full"
    >
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-center">
          <div className="h-12 w-12 rounded-md bg-gray-100 flex items-center justify-center overflow-hidden">
            {organization.logo ? (
              <Image
                src={organization.logo}
                alt={organization.name}
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
                width={48}
                height={48}
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
          
          <div onClick={(e) => e.preventDefault()}>
            <FollowButton organizationId={organization.id} />
          </div>
        </div>
      </div>
    </Link>
  );
}