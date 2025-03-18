import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import TelegramBinding from "@/components/settings/telegram-binding";
import { db } from "@/lib/prisma";

export default async function NotificationSettingsPage() {
  const session = await getServerSession(authOptions);

  // Redirect to login if not authenticated
  if (!session?.user) {
    redirect("/login");
  }

  const userId = session.user.id;

  // Get user's Telegram information
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      telegramChatId: true,
      telegramUsername: true,
    },
  });

  // Determine if Telegram is connected
  const telegramConnected = !!user?.telegramChatId;

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Notification Settings</h1>
          
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-medium mb-4">Delivery Methods</h2>
              <div className="space-y-4">
                <TelegramBinding 
                  telegramConnected={telegramConnected} 
                  telegramUsername={user?.telegramUsername}
                />
              </div>
            </div>
            
            <div className="border-t pt-6">
              <h2 className="text-lg font-medium mb-4">Notification Preferences</h2>
              <p className="text-sm text-gray-500 mb-4">
                Choose which types of notifications you want to receive.
              </p>
              
              {/* Future implementation: notification preferences */}
              <div className="bg-yellow-50 border border-yellow-100 rounded-md p-4">
                <p className="text-sm text-yellow-800">
                  Notification preferences are coming soon. All notifications are currently enabled.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 