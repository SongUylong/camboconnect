import { User as PrismaUser, Organization, Opportunity } from "@prisma/client";

export type UserWithRelations = PrismaUser & {
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

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImage?: string | null;
  bio?: string | null;
  education?: string | null;
  skills?: string | null;
  createdAt: Date;
  updatedAt: Date;
  isAdmin: boolean;
  twoFactorEnabled: boolean;
  twoFactorMethod?: TwoFactorMethod | null;
  privacyLevel: PrivacyLevel;
}

export enum TwoFactorMethod {
  EMAIL = "EMAIL"
}

export enum PrivacyLevel {
  PUBLIC = "PUBLIC",
  ONLY_ME = "ONLY_ME",
  FRIENDS_ONLY = "FRIENDS_ONLY"
}
