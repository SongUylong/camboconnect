import { Building } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

type Participation = {
  id: string;
  year: number;
  privacyLevel: string;
  opportunity: {
    id: string;
    title: string;
    startDate: string;
    endDate: string | null;
    organization: {
      id: string;
      name: string;
      logo: string | null;
    };
    participations: Array<{
      id: string;
      year: number;
      privacyLevel: string;
      user: {
        id: string;
        firstName: string;
        lastName: string;
        profileImage: string | null;
        privacyLevel: string;
      };
    }>;
  };
  user: {
    id: string;
    firstName: string;
    lastName: string;
    profileImage: string | null;
    privacyLevel: string;
  };
};

interface UserParticipationsListProps {
  participations: Participation[];
}

export function UserParticipationsList({ participations }: UserParticipationsListProps) {
  const getOrganizationLogoUrl = (logo: string | null) => {
    if (!logo) return null;
    if (logo.startsWith('http')) return logo;
    if (!logo.startsWith('/')) return `/${logo}`; // Add leading slash if missing
    return logo;
  };

  const renderOrganizationLogo = (logo: string | null, orgName: string) => {
    if (!logo) {
      return <Building className="h-5 w-5 text-gray-500" />;
    }

    const logoUrl = getOrganizationLogoUrl(logo);
    if (!logoUrl) {
      return <Building className="h-5 w-5 text-gray-500" />;
    }

    return (
      <div className="relative h-10 w-10">
        <Image
          src={logoUrl}
          alt={`${orgName}'s logo`}
          fill
          className="object-contain"
          sizes="40px"
          onError={(e) => {
            // Replace broken image with Building icon
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              const icon = document.createElement('div');
              icon.className = 'h-full w-full flex items-center justify-center';
              icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-500"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path></svg>';
              parent.appendChild(icon);
            }
          }}
        />
      </div>
    );
  };

  if (participations.length === 0) {
    return (
      <div className="text-center py-8">
        <Building className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No participations yet</h3>
        <p className="mt-1 text-sm text-gray-500">
          No participation history available.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {participations.map((participation) => (
        <div
          key={participation.id}
          className="bg-white rounded-lg border border-gray-200 p-4 flex items-start space-x-4"
        >
          <div className="flex-shrink-0">
            <div className="relative h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center overflow-hidden">
              {renderOrganizationLogo(
                participation.opportunity.organization.logo,
                participation.opportunity.organization.name
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <Link
              href={`/opportunities/${participation.opportunity.id}`}
              className="text-sm font-medium text-gray-900 hover:text-blue-600 truncate block"
            >
              {participation.opportunity.title}
            </Link>
            <Link
              href={`/community/${participation.opportunity.organization.id}`}
              className="text-sm text-gray-500 hover:text-blue-600 truncate block mt-1"
            >
              {participation.opportunity.organization.name}
            </Link>
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-gray-500">
                {new Date(participation.opportunity.startDate).getFullYear()}
                {participation.opportunity.endDate && 
                  ` - ${new Date(participation.opportunity.endDate).getFullYear()}`}
              </p>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                participation.privacyLevel === 'PUBLIC' 
                  ? 'bg-green-100 text-green-800'
                  : participation.privacyLevel === 'FRIENDS_ONLY'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {participation.privacyLevel === 'PUBLIC' 
                  ? 'Public'
                  : participation.privacyLevel === 'FRIENDS_ONLY'
                  ? 'Friends'
                  : 'Private'}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 