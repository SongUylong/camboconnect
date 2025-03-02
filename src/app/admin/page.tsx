import { MainLayout } from "@/components/layout/main-layout";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/prisma";
import Link from "next/link";
import { 
  Plus, 
  Users, 
  Award, 
  Building, 
  Briefcase, 
  LibraryBigIcon,
  PaperclipIcon
} from "lucide-react";
import { format } from "date-fns";

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  // Check if user is authenticated and is an admin
  if (!session || !session.user.isAdmin) {
    redirect("/login");
  }

  // Fetch counts for dashboard
  const counts = await Promise.all([
    db.user.count(),
    db.opportunity.count(),
    db.organization.count(),
    db.application.count(),
    db.user.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
    }),
  ]);

  // Recent opportunities
  const recentOpportunities = await db.opportunity.findMany({
    take: 5,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      organization: true,
      category: true,
    },
  });

  return (
    <MainLayout>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

        {/* Quick Access Links */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Link 
              href="/admin/opportunities" 
              className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
            >
              <PaperclipIcon className="h-6 w-6 text-blue-600 mb-2"/>
              <span className="text-sm font-medium text-gray-700">Opportunity</span>
            </Link>
            
            <Link 
              href="/admin/organizations" 
              className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
            >
              <LibraryBigIcon className="h-6 w-6 text-blue-600 mb-2"/>
              <span className="text-sm font-medium text-gray-700">Organization</span>
            </Link>
            
            <Link 
              href="/admin/users" 
              className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
            >
              <Users className="h-6 w-6 text-indigo-600 mb-2" />
              <span className="text-sm font-medium text-gray-700">Manage Users</span>
            </Link>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <Users className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
                <p className="text-2xl font-semibold text-gray-900">{counts[0]}</p>
              </div>
            </div>
            <p className="mt-2 text-sm text-green-600">
              +{counts[4]} new in the last 7 days
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
                <Award className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Opportunities</h3>
                <p className="text-2xl font-semibold text-gray-900">{counts[1]}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <Building className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Organizations</h3>
                <p className="text-2xl font-semibold text-gray-900">{counts[2]}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-amber-100 text-amber-600">
                <Briefcase className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Applications</h3>
                <p className="text-2xl font-semibold text-gray-900">{counts[3]}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Opportunities */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Recent Opportunities</h2>
              <Link href="/admin/opportunities" className="text-sm text-blue-600 hover:text-blue-800">
                View all
              </Link>
            </div>
            
            <div className="divide-y divide-gray-200">
              {recentOpportunities.map((opportunity) => (
                <div key={opportunity.id} className="py-3">
                  <Link 
                    href={`/admin/opportunities/${opportunity.id}`}
                    className="block hover:bg-gray-50 -mx-3 px-3 py-2 rounded-md transition-colors"
                  >
                    <h3 className="text-sm font-medium text-gray-900">{opportunity.title}</h3>
                    <div className="mt-1 flex items-center text-xs text-gray-500">
                      <span>{opportunity.organization.name}</span>
                      <span className="mx-2">•</span>
                      <span>{opportunity.category.name}</span>
                      <span className="mx-2">•</span>
                      <span>Added {format(new Date(opportunity.createdAt), 'MMM d, yyyy')}</span>
                    </div>
                    <div className="mt-1">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        opportunity.status === 'ACTIVE' 
                          ? 'bg-green-100 text-green-800' 
                          : opportunity.status === 'CLOSING_SOON'
                          ? 'bg-yellow-100 text-yellow-800'
                          : opportunity.status === 'OPENING_SOON'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {opportunity.status.replace('_', ' ')}
                      </span>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}