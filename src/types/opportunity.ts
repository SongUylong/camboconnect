import { Opportunity, OpportunityType, Organization, User } from "@prisma/client";

export type OpportunityWithRelations = Opportunity & {
  organization: Organization;
  applicants?: User[];
};

export interface OpportunityFormData {
  title: string;
  description: string;
  type: OpportunityType;
  location: string;
  requirements: string[];
  deadline: Date;
  organizationId: string;
  isRemote: boolean;
  compensation?: string;
  skills: string[];
}

export interface OpportunityFilters {
  type?: OpportunityType;
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
