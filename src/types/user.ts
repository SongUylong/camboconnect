import { User, Organization, Opportunity } from "@prisma/client";

export type UserWithRelations = User & {
  organizations?: Organization[];
  appliedOpportunities?: Opportunity[];
  savedOpportunities?: Opportunity[];
};

export interface UserProfile {
  bio?: string;
  skills: string[];
  education: {
    school: string;
    degree: string;
    field: string;
    startDate: Date;
    endDate?: Date;
  }[];
  experience: {
    title: string;
    company: string;
    location: string;
    startDate: Date;
    endDate?: Date;
    description: string;
  }[];
  links?: {
    portfolio?: string;
    linkedin?: string;
    github?: string;
    twitter?: string;
  };
  resume?: string;
}

export interface UserSettings {
  emailNotifications: {
    opportunities: boolean;
    messages: boolean;
    applicationUpdates: boolean;
    organizationUpdates: boolean;
  };
  privacy: {
    showProfile: boolean;
    showEmail: boolean;
    showPhone: boolean;
  };
  theme: "light" | "dark" | "system";
  language: string;
}

export interface UserFilters {
  skills?: string[];
  location?: string;
  experience?: string;
  education?: string;
  search?: string;
}
