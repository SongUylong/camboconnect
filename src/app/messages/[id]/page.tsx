import { MainLayout } from "@/components/layout/main-layout";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/prisma";
import MessageList from "@/components/messages/message-list";
import ConversationView from "@/components/messages/conversation-view";

interface ConversationPageProps {
  params: {
    id: string;
  };
}

export default async function ConversationPage({ params }: ConversationPageProps) {
  const session = await getServerSession(authOptions);

  // Check if user is authenticated
  if (!session || !session.user.id) {
    redirect("/login");
  }

  // Verify that the user is a participant in this conversation
  const participant = await db.conversationParticipant.findFirst({
    where: {
      userId: session.user.id,
      conversationId: params.id,
    },
  });

  if (!participant) {
    notFound();
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
          <div className="hidden md:flex md:w-1/3 border-r border-gray-200 flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search conversations..."
                  className="input w-full pl-10"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
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
                <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                New Message
              </button>
            </div>
            
            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto">
              <MessageList userId={session.user.id} />
            </div>
          </div>
          
          {/* Message Content */}
          <div className="w-full md:w-2/3 flex flex-col bg-gray-50">
            <ConversationView conversationId={params.id} userId={session.user.id} />
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