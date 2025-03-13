import { Opportunity as PrismaOpportunity, Organization, User } from "@prisma/client";

export type OpportunityWithRelations = PrismaOpportunity & {
  organization: Organization;
  category: {
    id: string;
    name: string;
  };
  participations: Array<{
    id: string;
    year: number;
    user: Pick<User, "id" | "firstName" | "lastName" | "profileImage" | "privacyLevel">;
  }>;
};

export type OpportunityWithOrganization = PrismaOpportunity & {
  organization: Organization;
};

export type OpportunityCard = Pick<
  PrismaOpportunity,
  | "id"
  | "title"
  | "shortDescription"
  | "deadline"
  | "status"
  | "isPopular"
  | "isNew"
> & {
  organization: Pick<Organization, "id" | "name" | "logo">;
  category: {
    id: string;
    name: string;
  };
};

export interface OpportunityFormData {
  title: string;
  description: string;
  type: string;
  location: string;
  requirements: string[];
  deadline: Date;
  organizationId: string;
  isRemote: boolean;
  compensation?: string;
  skills: string[];
}

export interface OpportunityFilters {
  type?: string;
  location?: string;
  isRemote?: boolean;
  organizationId?: string;
  skills?: string[];
  search?: string;
}

export interface OpportunityResponse {
  opportunities: Opportunity[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

export interface ApplicationData {
  opportunityId: string;
  userId: string;
  coverLetter?: string;
  resumeUrl?: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
}

// This is the type used by the OpportunityCard component
export interface Opportunity {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  eligibility: string;
  applicationProcess: string;
  benefits: string;
  contactInfo: string;
  externalLink?: string | null;
  deadline: Date;
  startDate?: Date | null;
  endDate?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  status: "OPENING_SOON" | "ACTIVE" | "CLOSING_SOON" | "CLOSED";
  categoryId: string;
  category: {
    id: string;
    name: string;
  };
  visitCount: number;
  isPopular: boolean;
  isNew: boolean;
  organizationId: string;
  organization: {
    id: string;
    name: string;
    logo?: string | null;
  };
  isBookmarked?: boolean;
}
