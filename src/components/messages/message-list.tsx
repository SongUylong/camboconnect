"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { User } from "lucide-react";
import Link from "next/link";

interface Conversation {
  id: string;
  participants: {
    id: string;
    firstName: string;
    lastName: string;
    profileImage: string | null;
  }[];
  lastMessage: {
    content: string;
    createdAt: string;
    sender: {
      id: string;
    }
  } | null;
  unreadCount: number;
  updatedAt: string;
}

interface MessageListProps {
  userId: string;
}

export default function MessageList({ userId }: MessageListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  
  // Determine active conversation from URL
  const activeConversationId = pathname.startsWith('/messages/') 
    ? pathname.split('/')[2] 
    : null;
  
  // Fetch conversations
  useEffect(() => {
    async function fetchConversations() {
      try {
        setLoading(true);
        const response = await fetch('/api/messages');
        if (!response.ok) {
          throw new Error('Failed to fetch conversations');
        }
        const data = await response.json();
        setConversations(data);
      } catch (error) {
        console.error('Error fetching conversations:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchConversations();
    
    // Poll for new messages every 10 seconds
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, []);
  
  // Handle conversation click
  const handleConversationClick = (conversationId: string) => {
    router.push(`/messages/${conversationId}`);
  };
  
  // Format message time
  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    
    // If less than 24 hours ago, show relative time
    if (Date.now() - date.getTime() < 24 * 60 * 60 * 1000) {
      return formatDistanceToNow(date, { addSuffix: false });
    }
    
    // If within current year, show month and day
    if (date.getFullYear() === new Date().getFullYear()) {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    
    // Otherwise show date with year
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  
  // Get recipient name
  const getRecipientName = (conversation: Conversation) => {
    const otherParticipant = conversation.participants[0];
    return `${otherParticipant.firstName} ${otherParticipant.lastName}`;
  };
  
  // Get last message preview
  const getMessagePreview = (conversation: Conversation) => {
    if (!conversation.lastMessage) {
      return "No messages yet";
    }
    
    // Check if current user is sender
    const isSentByCurrentUser = conversation.lastMessage.sender.id === userId;
    
    return isSentByCurrentUser
      ? `You: ${conversation.lastMessage.content}`
      : conversation.lastMessage.content;
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <div className="animate-pulse text-gray-500">Loading conversations...</div>
      </div>
    );
  }
  
  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
        <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-2">
          <User className="h-6 w-6 text-gray-400" />
        </div>
        <p className="text-gray-500 text-sm">No conversations yet</p>
        <p className="text-gray-400 text-xs mt-1">Start a new message to begin chatting</p>
      </div>
    );
  }
  
  return (
    <ul className="divide-y divide-gray-200">
      {conversations.map((conversation) => (
        <li 
          key={conversation.id}
          onClick={() => handleConversationClick(conversation.id)}
          className={`hover:bg-gray-50 cursor-pointer ${
            activeConversationId === conversation.id ? 'bg-blue-50' : ''
          }`}
        >
          <div className="px-4 py-4 sm:px-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {conversation.participants[0].profileImage ? (
                  <img 
                    src={conversation.participants[0].profileImage} 
                    alt={getRecipientName(conversation)}
                    className="h-10 w-10 rounded-full"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-500" />
                  </div>
                )}
              </div>
              <div className="ml-4 flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {getRecipientName(conversation)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {conversation.lastMessage 
                      ? formatMessageTime(conversation.lastMessage.createdAt) 
                      : formatMessageTime(conversation.updatedAt)}
                  </p>
                </div>
                <div className="flex mt-1">
                  <p className={`text-sm ${
                    conversation.unreadCount > 0 ? 'font-medium text-gray-900' : 'text-gray-500'
                  } truncate`}>
                    {getMessagePreview(conversation)}
                  </p>
                  {conversation.unreadCount > 0 && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {conversation.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}