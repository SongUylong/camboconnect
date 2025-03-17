import { MainLayout } from "@/components/layout/main-layout";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/prisma";
import { Award, Bookmark, Briefcase, Calendar, Edit, Eye, GraduationCap, Link as LinkIcon, Settings, User, Users, Building, Mail, Phone, MapPin, Link2, Plus, Trash2, Share2 } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import dynamic from "next/dynamic";
import { Organization, Follow, Education, Experience, Skill, SocialLink, Application, Participation, Bookmark as BookmarkType, Opportunity } from "@prisma/client";
import { FollowingOrgCard } from "@/components/profile/following-org-card";
import { ParticipationPrivacyToggle } from "@/components/profile/participation-privacy-toggle";
import Image from "next/image";
import { FriendCount } from "@/components/profile/friend-count";

// Import the WelcomeModal component with dynamic import
const ProfileClientWrapper = dynamic(() => import("@/components/profile/profile-client-wrapper"), { ssr: false });

// Import the SettingsPopover component with dynamic import to avoid SSR issues
const SettingsPopover = dynamic(() => import("./settings-popover"), { ssr: false });

// Import the ShareProfileButton component
const ShareProfileButton = dynamic(() => import("@/components/profile/share-profile-button"), { ssr: false });

type ExtendedOrganization = Organization & {
  _count: {
    followers: number;
    opportunities: number;
  };
};

type ExtendedOpportunity = Opportunity & {
  organization: Organization;
  category: {
    id: string;
    name: string;
  };
};

type ExtendedFollow = Follow & {
  organization: ExtendedOrganization;
};

type ExtendedUser = {
  id: string;
  email: string;
  password: string | null;
  firstName: string;
  lastName: string;
  profileImage: string | null;
  bio: string | null;
  createdAt: Date;
  updatedAt: Date;
  isAdmin: boolean;
  twoFactorEnabled: boolean;
  twoFactorMethod: string | null;
  privacyLevel: string;
  isSetup: boolean;
  followedOrgs: ExtendedFollow[];
  bookmarks: (BookmarkType & {
    opportunity: ExtendedOpportunity;
  })[];
  applications: (Application & {
    opportunity: ExtendedOpportunity;
    status: { 
      id: string; 
      isApplied: boolean;
      createdAt: Date;
      updatedAt: Date;
    };
  })[];
  participations: (Participation & {
    opportunity: ExtendedOpportunity;
  })[];
  educationEntries: Education[];
  experienceEntries: Experience[];
  skillEntries: Skill[];
  socialLinks: SocialLink[];
  _count: {
    bookmarks: number;
    applications: number;
    participations: number;
    friendsOf: number;
  };
};

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Fetch the user's full profile
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      followedOrgs: {
        include: {
          organization: {
            include: {
              _count: {
                select: {
                  followers: true,
                  opportunities: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      bookmarks: {
        include: {
          opportunity: {
            include: {
              organization: true,
              category: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
      },
      applications: {
        include: {
          opportunity: {
            include: {
              organization: true,
              category: true,
            },
          },
          status: true,
        },
        orderBy: {
          updatedAt: "desc",
        },
        take: 5,
      },
      participations: {
        include: {
          opportunity: {
            include: {
              organization: true,
              category: true,
            },
          },
        },
        orderBy: {
          year: "desc",
        },
      },
      educationEntries: {
        orderBy: {
          startDate: "desc",
        },
      },
      experienceEntries: {
        orderBy: {
          startDate: "desc",
        },
      },
      skillEntries: true,
      socialLinks: true,
      _count: {
        select: {
          bookmarks: true,
          applications: true,
          participations: true,
          friendsOf: true,
        },
      },
    },
  }) as unknown as ExtendedUser;

  if (!user) {
    redirect("/login");
  }

  // Check if the user is newly registered (no profile data)
  const isNewUser = !user.bio && 
                   (!user.skillEntries || user.skillEntries.length === 0) && 
                   (!user.educationEntries || user.educationEntries.length === 0) && 
                   (!user.experienceEntries || user.experienceEntries.length === 0);

  // Get all friend IDs for the user
  const friendships = await db.friendship.findMany({
    where: {
      OR: [
        { userId: session.user.id },
        { friendId: session.user.id }
      ]
    },
    select: {
      userId: true,
      friendId: true
    }
  });

  // Extract friend IDs from friendships
  const friendIds = friendships.map(friendship => 
    friendship.userId === session.user.id ? friendship.friendId : friendship.userId
  );

  return (
    <MainLayout>
      {/* Add the client wrapper component that will initialize the friend store */}
      <ProfileClientWrapper isNewUser={isNewUser} friendIds={friendIds} />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left sidebar (profile info) */}
          <div className="md:w-1/3">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-32 flex items-center justify-center">
                <div className="h-20 w-20 rounded-full bg-white border-4 border-white flex items-center justify-center overflow-hidden relative top-12">
                  {user.profileImage ? (
                    user.profileImage.includes('googleusercontent.com') ? (
                      <Image 
                        src={user.profileImage} 
                        alt={`${user.firstName} ${user.lastName}`} 
                        className="h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                        width={80}
                        height={80}
                      />
                    ) : (
                      <Image 
                        src={user.profileImage} 
                        alt={`${user.firstName} ${user.lastName}`} 
                        className="h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                        width={80}
                        height={80}
                      />
                    )
                  ) : (
                    <User className="h-10 w-10 text-gray-400" />
                  )}
                </div>
              </div>
              
              <div className="pt-16 p-6">
                <div className="text-center">
                  <h1 className="text-xl font-bold text-gray-900">
                    {user.firstName} {user.lastName}
                  </h1>
                  <p className="text-gray-500">{user.email}</p>
                  
                  <div className="mt-4 flex justify-center space-x-4 text-sm">
                    <div className="flex flex-col items-center">
                      <span className="font-medium text-gray-900">{user._count.participations}</span>
                      <span className="text-gray-500">Participations</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="font-medium text-gray-900">{user._count.applications}</span>
                      <span className="text-gray-500">Applications</span>
                    </div>
                    <FriendCount initialCount={user._count.friendsOf} />
                  </div>
                  
                  <div className="mt-6 flex justify-center gap-2">
                    <Link href="/profile/edit" className="btn btn-outline">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Link>
                    <ShareProfileButton userId={user.id} />
                  </div>
                </div>
                
                <div className="mt-6 border-t border-gray-200 pt-6">
                  <h2 className="text-lg font-semibold text-gray-900">Bio</h2>
                  <p className="mt-2 text-gray-600">
                    {user.bio || "No bio provided yet."}
                  </p>
                </div>
                
                <div className="mt-6 border-t border-gray-200 pt-6">
                  <div className="flex items-center mb-4">
                    <GraduationCap className="h-5 w-5 text-blue-600 mr-2" />
                    <h2 className="text-lg font-semibold text-gray-900">Education</h2>
                  </div>
                  {user.educationEntries.length > 0 ? (
                    <div className="space-y-4">
                      {user.educationEntries.map((edu) => (
                        <div key={edu.id} className="border-l-2 border-blue-200 pl-4">
                          <h3 className="font-medium text-gray-900">{edu.school}</h3>
                          <p className="text-sm text-gray-600">{edu.degree} in {edu.field}</p>
                          <p className="text-xs text-gray-500">
                            {format(new Date(edu.startDate), 'MMM yyyy')} - 
                            {edu.endDate ? format(new Date(edu.endDate), ' MMM yyyy') : ' Present'}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-gray-600">No education information provided yet.</p>
                  )}
                </div>
                
                <div className="mt-6 border-t border-gray-200 pt-6">
                  <div className="flex items-center mb-4">
                    <Briefcase className="h-5 w-5 text-blue-600 mr-2" />
                    <h2 className="text-lg font-semibold text-gray-900">Experience</h2>
                  </div>
                  {user.experienceEntries.length > 0 ? (
                    <div className="space-y-4">
                      {user.experienceEntries.map((exp) => (
                        <div key={exp.id} className="border-l-2 border-blue-200 pl-4">
                          <h3 className="font-medium text-gray-900">{exp.title}</h3>
                          <p className="text-sm text-gray-600">{exp.company}, {exp.location}</p>
                          <p className="text-xs text-gray-500">
                            {format(new Date(exp.startDate), 'MMM yyyy')} - 
                            {exp.endDate ? format(new Date(exp.endDate), ' MMM yyyy') : ' Present'}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">{exp.description}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-gray-600">No experience information provided yet.</p>
                  )}
                </div>
                
                <div className="mt-6 border-t border-gray-200 pt-6">
                  <h2 className="text-lg font-semibold text-gray-900">Skills</h2>
                  {user.skillEntries.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {user.skillEntries.map((skill) => (
                        <span key={skill.id} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-gray-600">No skills provided yet.</p>
                  )}
                </div>
                
                {user.socialLinks.length > 0 && (
                  <div className="mt-6 border-t border-gray-200 pt-6">
                    <div className="flex items-center mb-4">
                      <LinkIcon className="h-5 w-5 text-blue-600 mr-2" />
                      <h2 className="text-lg font-semibold text-gray-900">Links</h2>
                    </div>
                    <div className="space-y-2">
                      {user.socialLinks.map((link) => (
                        <a 
                          key={link.id}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-blue-600 hover:text-blue-800"
                        >
                          <span className="capitalize">{link.platform}</span>
                          <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Right content area */}
          <div className="md:w-2/3">
            {/* Following Section */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-blue-600 mr-2" />
                    <h2 className="text-lg font-semibold text-gray-900">Following</h2>
                  </div>
                </div>
                
                {user.followedOrgs.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {user.followedOrgs.map((follow) => (
                      <FollowingOrgCard
                        key={follow.organization.id}
                        organization={follow.organization}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-600 mb-4">You're not following any organizations yet.</p>
                    <Link href="/community" className="btn btn-outline">
                      Explore Organizations
                    </Link>
                  </div>
                )}
              </div>
            </div>
            
            {/* Participations */}
            <section>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Participation History
                  </h2>
                  <SettingsPopover />
                </div>
                {user.participations.length > 3 && (
                  <Link 
                    href="/profile/participations" 
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    View all
                    <span className="ml-1">→</span>
                  </Link>
                )}
              </div>
              
              {user.participations.length === 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
                  <Award className="h-12 w-12 text-gray-300 mx-auto" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900">No participations yet</h3>
                  <p className="mt-1 text-gray-500">
                    Your participation history will appear here once you've joined opportunities.
                  </p>
                  <div className="mt-6">
                    <Link href="/opportunities" className="btn btn-primary">
                      Explore Opportunities
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <ul className="divide-y divide-gray-200">
                    {user.participations.slice(0, 3).map((participation) => (
                      <li key={participation.id} className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">
                              <Link 
                                href={`/opportunities/${participation.opportunity.id}`}
                                className="hover:text-blue-600"
                              >
                                {participation.opportunity.title}
                              </Link>
                            </h3>
                            <div className="mt-1 flex items-center text-sm text-gray-500">
                              <Link 
                                href={`/community/${participation.opportunity.organization.id}`}
                                className="hover:text-blue-600"
                              >
                                {participation.opportunity.organization.name}
                              </Link>
                              <span className="mx-2">•</span>
                              <span>{participation.opportunity.category.name}</span>
                              <span className="mx-2">•</span>
                              <Calendar className="h-4 w-4 mr-1" />
                              <span>{participation.year}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <ParticipationPrivacyToggle
                              participationId={participation.id}
                              initialPrivacyLevel={participation.privacyLevel}
                            />
                          </div>
                        </div>
                        
                        {participation.feedback && (
                          <div className="mt-4">
                            <h4 className="text-sm font-medium text-gray-900">Your Feedback</h4>
                            <p className="mt-1 text-sm text-gray-600">{participation.feedback}</p>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
            
            {/* Applications */}
            <section className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Recent Applications
                </h2>
                {user.applications.length > 0 && (
                  <Link 
                    href="/profile/applications" 
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    View all
                    <span className="ml-1">→</span>
                  </Link>
                )}
              </div>
              
              {user.applications.length === 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
                  <Users className="h-12 w-12 text-gray-300 mx-auto" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900">No applications yet</h3>
                  <p className="mt-1 text-gray-500">
                    Apply to opportunities to track your applications here.
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <ul className="divide-y divide-gray-200">
                    {user.applications.map((application) => (
                      <li key={application.id} className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">
                              <Link 
                                href={`/opportunities/${application.opportunity.id}`}
                                className="hover:text-blue-600"
                              >
                                {application.opportunity.title}
                              </Link>
                            </h3>
                            <div className="mt-1 flex items-center text-sm text-gray-500">
                              <Link 
                                href={`/community/${application.opportunity.organization.id}`}
                                className="hover:text-blue-600"
                              >
                                {application.opportunity.organization.name}
                              </Link>
                              <span className="mx-2">•</span>
                              <span>{application.opportunity.category.name}</span>
                              <span className="mx-2">•</span>
                              <Calendar className="h-4 w-4 mr-1" />
                              <span>Applied on {format(new Date(application.createdAt), 'PP')}</span>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <div className={`badge ${
                              application.status.isApplied 
                                ? "badge-success" 
                                : "badge-warning"
                            }`}>
                              {application.status.isApplied ? "Applied" : "Not Applied"}
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
            
            {/* Recently Viewed Opportunities Section */}
            <section className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Recently Viewed
                  </h2>
                </div>
                <Link 
                  href="/profile/history" 
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                >
                  View all
                  <span className="ml-1">→</span>
                </Link>
              </div>
              
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <p className="text-gray-600 mb-4">
                  Track your browsing history and revisit opportunities you've viewed.
                </p>
                <Link 
                  href="/profile/history" 
                  className="btn btn-primary"
                >
                  View Browsing History
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}