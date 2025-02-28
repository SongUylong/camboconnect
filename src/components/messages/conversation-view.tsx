"use client";

import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { User, Send } from "lucide-react";

interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
    profileImage: string | null;
  };
}

interface ConversationParticipant {
  id: string;
  firstName: string;
  lastName: string;
  profileImage: string | null;
}

interface ConversationViewProps {
  conversationId: string;
  userId: string;
}

export default function ConversationView({ conversationId, userId }: ConversationViewProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [participants, setParticipants] = useState<ConversationParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Fetch conversation data and messages
  useEffect(() => {
    async function fetchConversation() {
      try {
        setLoading(true);
        const response = await fetch(`/api/messages/${conversationId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch conversation');
        }
        const data = await response.json();
        setMessages(data.messages);
        setParticipants(data.conversation.participants);
      } catch (error) {
        console.error('Error fetching conversation:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchConversation();
    
    // Poll for new messages every 5 seconds
    const interval = setInterval(fetchConversation, 5000);
    return () => clearInterval(interval);
  }, [conversationId]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Send message
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    try {
      setSending(true);
      const response = await fetch(`/api/messages/${conversationId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: newMessage }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      const data = await response.json();
      
      // Add new message to the list
      setMessages((prev) => [...prev, data]);
      
      // Clear input
      setNewMessage("");
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };
  
  // Format message time
  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'h:mm a');
  };
  
  // Get recipient name
  const getRecipientName = () => {
    if (participants.length === 0) return 'Loading...';
    
    const recipient = participants[0];
    return `${recipient.firstName} ${recipient.lastName}`;
  };
  
  if (loading && messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <div className="animate-pulse text-gray-500">Loading conversation...</div>
      </div>
    );
  }
  
  return (
    <>
      {/* Conversation Header */}
      <div className="border-b border-gray-200 bg-white p-4 flex items-center sticky top-0 z-10">
        <div className="flex-shrink-0">
          {participants[0]?.profileImage ? (
            <img 
              src={participants[0].profileImage} 
              alt={getRecipientName()}
              className="h-10 w-10 rounded-full"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="h-5 w-5 text-gray-500" />
            </div>
          )}
        </div>
        <div className="ml-3">
          <h2 className="text-lg font-medium text-gray-900">{getRecipientName()}</h2>
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>No messages yet</p>
            <p className="text-sm">Send a message to start the conversation</p>
          </div>
        ) : (
          messages.map((message) => (
            <div 
              key={message.id}
              className={`flex ${message.senderId === userId ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs lg:max-w-md ${
                message.senderId === userId 
                  ? 'bg-blue-600 text-white rounded-tl-lg rounded-tr-lg rounded-bl-lg' 
                  : 'bg-gray-200 text-gray-900 rounded-tl-lg rounded-tr-lg rounded-br-lg'
              } px-4 py-2 shadow-sm`}>
                <p className="text-sm">{message.content}</p>
                <p className={`text-xs mt-1 text-right ${
                  message.senderId === userId ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {formatMessageTime(message.createdAt)}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message Input */}
      <div className="border-t border-gray-200 bg-white p-4">
        <form onSubmit={sendMessage} className="flex">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="input flex-1 mr-2"
            disabled={sending}
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={sending || !newMessage.trim()}
          >
            {sending ? (
              <div className="h-5 w-5 border-t-2 border-blue-200 border-r-0 border-b-0 border-l-2 rounded-full animate-spin"></div>
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </form>
      </div>
    </>
  );
}