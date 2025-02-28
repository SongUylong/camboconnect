import { MainLayout } from "@/components/layout/main-layout";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/prisma";
import Link from "next/link";
import { 
  MessageSquare, 
  Users, 
  Clock, 
  Search, 
  Edit, 
  User as UserIcon 
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import MessageList from "@/components/messages/message-list";

export default async function MessagesPage() {
  const session = await getServerSession(authOptions);

  // Check if user is authenticated
  if (!session || !session.user.id) {
    redirect("/login");
  }

  // Get user friends for new conversation
  const friends = await db.friendship.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      friend: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          profileImage: true,
        },
      },
    },
  });

  return (
    <MainLayout>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        </div>
        
        <div className="flex h-[calc(100vh-250px)] min-h-[500px] bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          {/* Conversation List */}
          <div className="w-full md:w-1/3 border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search conversations..."
                  className="input w-full pl-10"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
            
            {/* New Message Button */}
            <div className="p-4 border-b border-gray-200">
              <button 
                type="button"
                className="btn btn-primary w-full"
                data-modal-target="new-message-modal"
              >
                <Edit className="h-4 w-4 mr-2" />
                New Message
              </button>
            </div>
            
            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto">
              <MessageList userId={session.user.id} />
            </div>
          </div>
          
          {/* Message Content */}
          <div className="hidden md:flex md:flex-col md:w-2/3 bg-gray-50 items-center justify-center">
            <div className="text-center p-8">
              <div className="mx-auto h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <MessageSquare className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Your Messages</h3>
              <p className="mt-2 text-sm text-gray-500 max-w-sm">
                Select a conversation or start a new one to begin messaging with friends and organizations.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* New Message Modal */}
      <div id="new-message-modal" className="fixed inset-0 z-50 hidden overflow-y-auto">
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
          <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
          <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
            <div>
              <div className="mt-3 text-center sm:mt-0 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-gray-900">New Message</h3>
                <div className="mt-4">
                  <div className="mb-4">
                    <label htmlFor="recipient" className="block text-sm font-medium text-gray-700 mb-1">
                      Send to
                    </label>
                    <select id="recipient" className="input w-full">
                      <option value="">Select a friend</option>
                      {friends.map((friendship) => (
                        <option key={friendship.friend.id} value={friendship.friend.id}>
                          {friendship.friend.firstName} {friendship.friend.lastName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                      Message
                    </label>
                    <textarea
                      id="message"
                      rows={4}
                      className="input w-full"
                      placeholder="Type your message here..."
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                className="btn btn-primary sm:ml-3"
              >
                Send Message
              </button>
              <button
                type="button"
                className="btn btn-outline mt-3 sm:mt-0"
                data-modal-close="new-message-modal"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}