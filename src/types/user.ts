import { User, Organization, Opportunity } from "@prisma/client";

export type UserWithRelations = User & {
  organizations?: Organization[];
  appliedOpportunities?: Opportunity[];
  savedOpportunities?: Opportunity[];
};

export interface Education {
  id?: string;
  school: string;
  degree: string;
  field: string;
  startDate: string | Date;
  endDate?: string | Date | null;
}

export interface Experience {
  id?: string;
  title: string;
  company: string;
  location: string;
  startDate: string | Date;
  endDate?: string | Date | null;
  description: string;
}

export interface SocialLinks {
  portfolio?: string;
  linkedin?: string;
  github?: string;
  twitter?: string;
  [key: string]: string | undefined;
}

export interface UserProfile {
  bio?: string;
  skills: string[];
  education: Education[];
  experience: Experience[];
  links?: SocialLinks;
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
