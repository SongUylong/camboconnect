import { Opportunity, Organization, User } from "@prisma/client";

export type OpportunityWithRelations = Opportunity & {
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

export type OpportunityWithOrganization = Opportunity & {
  organization: Organization;
};

export type OpportunityCard = Pick<
  Opportunity,
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

export interface ApplicationData {
  opportunityId: string;
  userId: string;
  coverLetter?: string;
  resumeUrl?: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
}
