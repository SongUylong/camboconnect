"use client";

import { useState, useEffect } from "react";
import { 
  Bell, 
  X, 
  CheckCircle, 
  Users, 
  Building, 
  Star, 
  Clock, 
  FileText, 
  AlertCircle 
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";

type Notification = {
  id: string;
  type: string;
  message: string;
  isRead: boolean;
  relatedEntityId: string | null;
  createdAt: string;
};

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/notifications?unread=false&limit=10");
      const data = await response.json();
      
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
    
    // Set up polling for new notifications (every 30 seconds)
    const interval = setInterval(() => {
      if (!isOpen) {
        fetchNotifications();
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, [isOpen]);

  // Mark notification as read
  const markAsRead = async (id: string) => {
    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          notificationId: id,
          isRead: true,
        }),
      });
      
      // Update local state
      setNotifications(prevNotifications =>
        prevNotifications.map(notification =>
          notification.id === id
            ? { ...notification, isRead: true }
            : notification
        )
      );
      
      // Update unread count
      setUnreadCount(prevCount => Math.max(0, prevCount - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          markAllAsRead: true,
        }),
      });
      
      // Update local state
      setNotifications(prevNotifications =>
        prevNotifications.map(notification => ({
          ...notification,
          isRead: true,
        }))
      );
      
      // Update unread count
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "FRIEND_REQUEST":
        return <Users className="h-5 w-5 text-indigo-500" />;
      case "ORGANIZATION_UPDATE":
        return <Building className="h-5 w-5 text-emerald-500" />;
      case "NEW_OPPORTUNITY":
        return <Star className="h-5 w-5 text-yellow-500" />;
      case "DEADLINE_REMINDER":
        return <Clock className="h-5 w-5 text-orange-500" />;
      case "APPLICATION_UPDATE":
        return <FileText className="h-5 w-5 text-blue-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  // Get notification background color based on type
  const getNotificationColor = (type: string, isRead: boolean) => {
    if (isRead) return "";
    
    switch (type) {
      case "FRIEND_REQUEST":
        return "bg-indigo-50 border-l-4 border-indigo-400";
      case "ORGANIZATION_UPDATE":
        return "bg-emerald-50 border-l-4 border-emerald-400";
      case "NEW_OPPORTUNITY":
        return "bg-yellow-50 border-l-4 border-yellow-400";
      case "DEADLINE_REMINDER":
        return "bg-orange-50 border-l-4 border-orange-400";
      case "APPLICATION_UPDATE":
        return "bg-blue-50 border-l-4 border-blue-400";
      default:
        return "bg-gray-50 border-l-4 border-gray-400";
    }
  };

  // Handle notification click
  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
    
    // Navigate based on notification type and content
    if (notification.type === "FRIEND_REQUEST") {
      router.push(`/friends`);
    } else if (notification.type === "ORGANIZATION_UPDATE") {
      if (notification.relatedEntityId) {
        router.push(`/community/${notification.relatedEntityId}`);
      } else {
        router.push(`/community`);
      }
    } else if (notification.type === "NEW_OPPORTUNITY" || notification.type === "DEADLINE_REMINDER") {
      if (notification.relatedEntityId) {
        router.push(`/opportunities/${notification.relatedEntityId}`);
      } else {
        router.push(`/opportunities`);
      }
    } else if (notification.type === "APPLICATION_UPDATE") {
      // Check if the message contains "confirm" text
      if (notification.message.toLowerCase().includes("confirm")) {
        // Need to confirm application status
        if (notification.relatedEntityId) {
          router.push(`/opportunities/${notification.relatedEntityId}?confirm=true`);
        } else {
          router.push(`/profile/applications`);
        }
      } else if (notification.message.toLowerCase().includes("completed")) {
        // Completed application
        if (notification.relatedEntityId) {
          router.push(`/opportunities/${notification.relatedEntityId}`);
        } else {
          router.push(`/profile/applications`);
        }
      } else {
        // Default application route
        if (notification.relatedEntityId) {
          router.push(`/opportunities/${notification.relatedEntityId}`);
        } else {
          router.push(`/profile/applications`);
        }
      }
    } else {
      // Default fallback
      if (notification.relatedEntityId) {
        router.push(`/opportunities/${notification.relatedEntityId}`);
      } else {
        setIsOpen(false);
      }
    }
    
    setIsOpen(false);
  };

  // Format notification time
  const formatTime = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  // Toggle dropdown
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    
    // Fetch latest notifications when opening
    if (!isOpen) {
      fetchNotifications();
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={toggleDropdown}
        className="relative rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        <span className="sr-only">View notifications</span>
        <Bell className="h-6 w-6" aria-hidden="true" />
        
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-red-500 text-xs text-white text-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white shadow-lg rounded-md z-50">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
            <div className="flex space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Mark all as read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Notification List */}
          <div className="divide-y divide-gray-200">
            {loading ? (
              <div className="p-4 text-center text-gray-500">Loading notifications...</div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No notifications</div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 hover:bg-gray-50 cursor-pointer ${
                    getNotificationColor(notification.type, notification.isRead)
                  }`}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-3">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <p className={`text-sm ${!notification.isRead ? "font-medium" : ""}`}>
                          {notification.message}
                        </p>
                        {!notification.isRead && (
                          <span className="h-2 w-2 bg-blue-600 rounded-full ml-2 mt-1 flex-shrink-0"></span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatTime(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2 border-t border-gray-200 text-center">
            <Link
              href="/notifications"
              className="block w-full text-sm text-blue-600 hover:text-blue-800 py-2"
              onClick={() => setIsOpen(false)}
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}