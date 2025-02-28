import { MainLayout } from "@/components/layout/main-layout";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/prisma";
import { Award, Bookmark, Calendar, Edit, Eye, User, Users } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Fetch the user's full profile
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
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
      _count: {
        select: {
          bookmarks: true,
          applications: true,
          participations: true,
          friendsOf: true,
        },
      },
    },
  });

  if (!user) {
    // This shouldn't happen if the session is valid
    redirect("/login");
  }

  return (
    <MainLayout>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left sidebar (profile info) */}
          <div className="md:w-1/3">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-32 flex items-center justify-center">
                <div className="h-20 w-20 rounded-full bg-white border-4 border-white flex items-center justify-center overflow-hidden relative top-12">
                  {user.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={`${user.firstName} ${user.lastName}`}
                      className="h-full w-full object-cover"
                    />
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
                    <div className="flex flex-col items-center">
                      <span className="font-medium text-gray-900">{user._count.friendsOf}</span>
                      <span className="text-gray-500">Friends</span>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <Link href="/profile/edit" className="btn btn-outline">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Link>
                  </div>
                </div>
                
                <div className="mt-6 border-t border-gray-200 pt-6">
                  <h2 className="text-lg font-semibold text-gray-900">Bio</h2>
                  <p className="mt-2 text-gray-600">
                    {user.bio || "No bio provided yet."}
                  </p>
                </div>
                
                <div className="mt-6 border-t border-gray-200 pt-6">
                  <h2 className="text-lg font-semibold text-gray-900">Education</h2>
                  <p className="mt-2 text-gray-600">
                    {user.education || "No education information provided yet."}
                  </p>
                </div>
                
                <div className="mt-6 border-t border-gray-200 pt-6">
                  <h2 className="text-lg font-semibold text-gray-900">Skills</h2>
                  <p className="mt-2 text-gray-600">
                    {user.skills || "No skills provided yet."}
                  </p>
                </div>
                
                <div className="mt-6 border-t border-gray-200 pt-6">
                  <h2 className="text-lg font-semibold text-gray-900">Privacy Settings</h2>
                  <div className="mt-2 flex items-center">
                    <div className={`h-3 w-3 rounded-full ${
                      user.privacyLevel === "PUBLIC" 
                        ? "bg-green-500" 
                        : user.privacyLevel === "FRIENDS_ONLY" 
                        ? "bg-yellow-500" 
                        : "bg-red-500"
                    } mr-2`}></div>
                    <span className="text-gray-600">
                      {user.privacyLevel === "PUBLIC" 
                        ? "Public Profile" 
                        : user.privacyLevel === "FRIENDS_ONLY" 
                        ? "Friends Only"
                        : "Private Profile"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    {user.privacyLevel === "PUBLIC" 
                      ? "Anyone can see your profile and participation history."
                      : user.privacyLevel === "FRIENDS_ONLY"
                      ? "Only friends can see your detailed profile and participation history."
                      : "Only you can see your detailed profile and participation history."}
                  </p>
                  <div className="mt-2">
                    <Link href="/settings" className="text-sm text-blue-600 hover:text-blue-800">
                      Change privacy settings
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right content area */}
          <div className="md:w-2/3">
            {/* Participations */}
            <section>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Participation History
                </h2>
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
                          <div className="flex items-center">
                            <div className={`badge ${
                              participation.isPublic ? "badge-success" : "badge-secondary"
                            }`}>
                              {participation.isPublic ? "Public" : "Private"}
                            </div>
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
                              application.status.name === "Applied" 
                                ? "badge-primary" 
                                : application.status.name === "Not Applied"
                                ? "badge-danger"
                                : application.status.name === "Pending Confirmation"
                                ? "badge-warning"
                                : "badge-secondary"
                            }`}>
                              {application.status.name}
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
            
            {/* Bookmarks */}
            <section className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Bookmarked Opportunities
                </h2>
                {user.bookmarks.length > 0 && (
                  <Link 
                    href="/profile/bookmarks" 
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    View all
                    <span className="ml-1">→</span>
                  </Link>
                )}
              </div>
              
              {user.bookmarks.length === 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
                  <Bookmark className="h-12 w-12 text-gray-300 mx-auto" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900">No bookmarks yet</h3>
                  <p className="mt-1 text-gray-500">
                    Save opportunities you're interested in for later.
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
                    {user.bookmarks.map((bookmark) => (
                      <li key={bookmark.id} className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">
                              <Link 
                                href={`/opportunities/${bookmark.opportunity.id}`}
                                className="hover:text-blue-600"
                              >
                                {bookmark.opportunity.title}
                              </Link>
                            </h3>
                            <div className="mt-1 flex items-center text-sm text-gray-500">
                              <Link 
                                href={`/community/${bookmark.opportunity.organization.id}`}
                                className="hover:text-blue-600"
                              >
                                {bookmark.opportunity.organization.name}
                              </Link>
                              <span className="mx-2">•</span>
                              <span>{bookmark.opportunity.category.name}</span>
                              <span className="mx-2">•</span>
                              <Calendar className="h-4 w-4 mr-1" />
                              <span>Deadline: {format(new Date(bookmark.opportunity.deadline), 'PP')}</span>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <div className={`badge ${
                              bookmark.opportunity.status === "ACTIVE" 
                                ? "badge-success" 
                                : bookmark.opportunity.status === "CLOSING_SOON"
                                ? "badge-warning"
                                : bookmark.opportunity.status === "OPENING_SOON"
                                ? "badge-secondary"
                                : "badge-danger"
                            }`}>
                              {bookmark.opportunity.status.replace('_', ' ')}
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}