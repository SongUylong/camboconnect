import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import Link from "next/link";
import { Bell, User, Lock, Key } from "lucide-react";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  // Redirect to login if not authenticated
  if (!session?.user) {
    redirect("/login");
  }

  const settingsLinks = [
    {
      title: "Profile Settings",
      description: "Update your personal information and profile details",
      href: "/profile",
      icon: <User className="h-6 w-6 text-gray-400" />,
    },
    {
      title: "Notification Settings",
      description: "Manage how you receive notifications, including Telegram",
      href: "/settings/notifications",
      icon: <Bell className="h-6 w-6 text-gray-400" />,
    },
    {
      title: "Privacy Settings",
      description: "Control who can see your profile and activities",
      href: "/settings/privacy",
      icon: <Lock className="h-6 w-6 text-gray-400" />,
    },
 
  ];

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Settings</h1>
          
          <div className="grid gap-4 md:grid-cols-2">
            {settingsLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                className="group block p-6 bg-white rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-sm transition-all"
              >
                <div className="flex gap-4 items-start">
                  <div className="shrink-0 mt-1 group-hover:text-blue-500">
                    {link.icon}
                  </div>
                  <div>
                    <h2 className="text-lg font-medium text-gray-900 group-hover:text-blue-600">
                      {link.title}
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      {link.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 