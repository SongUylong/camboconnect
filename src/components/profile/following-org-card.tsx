"use client";

import { useState } from "react";
import { Building, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import Image from "next/image";
import { useToggleOrganizationFollow } from "@/hooks/use-profile";

type FollowingOrgCardProps = {
  organization: {
    id: string;
    name: string;
    logo?: string | null;
  };
};

export function FollowingOrgCard({ organization }: FollowingOrgCardProps) {
  const router = useRouter();
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  // Use React Query mutation
  const { mutate: toggleFollow, isPending: isLoading } = useToggleOrganizationFollow();

  const handleUnfollow = async () => {
    // Use React Query mutation to unfollow organization
    toggleFollow(
      { organizationId: organization.id, following: false },
      {
        onSuccess: () => {
          setShowConfirmation(false);
        }
      }
    );
  };

  return (
    <>
      <Link
        href={`/community/${organization.id}`}
        className="relative flex flex-col items-center p-2 rounded-lg border border-gray-200 hover:border-blue-500 transition-colors"
      >
        <h3 className="text-sm font-medium text-gray-900 mb-2">{organization.name}</h3>
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
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowConfirmation(true);
          }}
          className="absolute top-1 right-1 p-1 text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
          disabled={isLoading}
          aria-label="Unfollow organization"
        >
          <X className="h-4 w-4" />
        </button>
      </Link>

      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleUnfollow}
        title="Unfollow Organization"
        message={`Are you sure you want to unfollow ${organization.name}?`}
      />
    </>
  );
} 