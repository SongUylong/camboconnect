import { Organization as PrismaOrganization, Opportunity, User } from "@prisma/client";

export type OrganizationWithRelations = PrismaOrganization & {
  opportunities?: Opportunity[];
  members?: User[];
  admin?: User;
};

export interface OrganizationFormData {
  name: string;
  description: string;
  website?: string;
  logo?: string;
  location: string;
  size: "SMALL" | "MEDIUM" | "LARGE";
  industry: string;
  contactEmail: string;
  contactPhone?: string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
}

export interface OrganizationFilters {
  industry?: string;
  location?: string;
  size?: "SMALL" | "MEDIUM" | "LARGE";
  search?: string;
}

export interface OrganizationMembershipRequest {
  organizationId: string;
  userId: string;
  role: "MEMBER" | "ADMIN";
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  message?: string;
}

export interface Organization {
  id: string;
  name: string;
  description: string;
  logo?: string | null;
  website?: string | null;
  history?: string | null;
  termsOfService?: string | null;
  createdAt: Date;
  updatedAt: Date;
  isFollowing?: boolean;
  followerCount?: number;
  opportunityCount?: number;
}

export interface OrganizationWithStats extends Organization {
  _count: {
    opportunities: number;
    followers: number;
  };
}
