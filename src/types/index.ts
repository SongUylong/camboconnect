// Common type definitions for CamboConnect

// User related types
export type User = {
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
  };
  
  export type Friend = {
    id: string;
    firstName: string;
    lastName: string;
    profileImage?: string | null;
    privacyLevel: PrivacyLevel;
  };
  
  export type FriendRequest = {
    id: string;
    status: FriendRequestStatus;
    createdAt: Date;
    senderId: string;
    receiverId: string;
    sender: {
      id: string;
      firstName: string;
      lastName: string;
      profileImage?: string | null;
    };
    receiver: {
      id: string;
      firstName: string;
      lastName: string;
      profileImage?: string | null;
    };
  };
  
  // Organization related types
  export type Organization = {
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
  };
  
  // Opportunity related types
  export type Opportunity = {
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
    status: OpportunityStatus;
    categoryId: string;
    category: Category;
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
  };
  
  export type Category = {
    id: string;
    name: string;
    description?: string | null;
  };
  
  export type Application = {
    id: string;
    status: ApplicationStatusType;
    feedback?: string | null;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    opportunityId: string;
    opportunity: Opportunity;
  };
  
  export type ApplicationStatusType = {
    id: string;
    isApplied: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
  
  export type Participation = {
    id: string;
    year: number;
    feedback?: string | null;
    privacyLevel: PrivacyLevel;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    opportunityId: string;
    user?: User;
    opportunity?: Opportunity;
  };
  
  // Messaging related types
  export type Conversation = {
    id: string;
    participants: {
      id: string;
      firstName: string;
      lastName: string;
      profileImage?: string | null;
    }[];
    lastMessage?: Message | null;
    unreadCount: number;
    updatedAt: Date;
  };
  
  export type Message = {
    id: string;
    content: string;
    senderId: string;
    sender: {
      id: string;
      firstName: string;
      lastName: string;
      profileImage?: string | null;
    };
    conversationId: string;
    createdAt: Date;
    updatedAt: Date;
    isSystemMessage: boolean;
  };
  
  // Notification related types
  export type Notification = {
    id: string;
    type: NotificationType;
    message: string;
    isRead: boolean;
    createdAt: Date;
    userId: string;
    relatedEntityId?: string | null;
  };
  
  // Analytics related types
  export type PageView = {
    id: string;
    path: string;
    userId?: string | null;
    sessionId: string;
    referrer?: string | null;
    userAgent?: string | null;
    device?: string | null;
    createdAt: Date;
  };
  
  export type EventLog = {
    id: string;
    eventType: string;
    userId?: string | null;
    sessionId: string;
    entityId?: string | null;
    entityType?: string | null;
    metadata?: any;
    createdAt: Date;
  };
  
  export type DailyStats = {
    id: string;
    date: Date;
    pageViews: number;
    uniqueVisitors: number;
    newUsers: number;
    applications: number;
    bookmarks: number;
    opportunityViews?: Record<string, number>;
    categoryViews?: Record<string, number>;
    createdAt: Date;
    updatedAt: Date;
  };
  
  // Analytics dashboard types
  export type AnalyticsData = {
    periodStart: Date;
    periodEnd: Date;
    overview: {
      pageViews: number;
      uniqueVisitors: number;
      newUsers: number;
      applications: number;
      totalUsers: number;
      totalOpportunities: number;
    };
    dailyStats: DailyStats[];
    topOpportunities: {
      id: string;
      title: string;
      visitCount: number;
      organization: {
        name: string;
      };
    }[];
    devices: Record<string, number>;
  };
  
  // Enum types
  export enum PrivacyLevel {
    PUBLIC = "PUBLIC",
    ONLY_ME = "ONLY_ME",
    FRIENDS_ONLY = "FRIENDS_ONLY"
  }
  
  export enum TwoFactorMethod {
    EMAIL = "EMAIL"
  }
  
  export enum OpportunityStatus {
    OPENING_SOON = "OPENING_SOON",
    ACTIVE = "ACTIVE",
    CLOSING_SOON = "CLOSING_SOON",
    CLOSED = "CLOSED"
  }
  
  export enum FriendRequestStatus {
    PENDING = "PENDING",
    ACCEPTED = "ACCEPTED",
    DECLINED = "DECLINED"
  }
  
  export enum NotificationType {
    NEW_OPPORTUNITY = "NEW_OPPORTUNITY",
    DEADLINE_REMINDER = "DEADLINE_REMINDER",
    APPLICATION_UPDATE = "APPLICATION_UPDATE",
    FRIEND_REQUEST = "FRIEND_REQUEST",
    ORGANIZATION_UPDATE = "ORGANIZATION_UPDATE",
    NEW_MESSAGE = "NEW_MESSAGE"
  }

// Export all types from their respective files
export * from './opportunity';
// No need to export from category since it's already defined above
// export * from './category';
// No need to export from organization since it's already defined above
// export * from './organization';
// No need to export from user since it's already defined above
// export * from './user';