"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { formatRelativeTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Notification {
  id: string;
  type: "INFO" | "SUCCESS" | "WARNING" | "ERROR";
  title: string;
  message: string;
  createdAt: Date;
  read: boolean;
}

export default function NotificationsPage() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch("/api/notifications");
        if (!response.ok) throw new Error("Failed to fetch notifications");
        const data = await response.json();
        setNotifications(data);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) {
      fetchNotifications();
    }
  }, [session]);

  const markAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to mark notification as read");
      
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const getNotificationBadge = (type: Notification["type"]) => {
    switch (type) {
      case "SUCCESS":
        return <Badge variant="success">Success</Badge>;
      case "WARNING":
        return <Badge variant="warning">Warning</Badge>;
      case "ERROR":
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="info">Info</Badge>;
    }
  };

  if (!session) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <p className="text-muted-foreground">Please sign in to view notifications</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
      </CardHeader>
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : notifications.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No notifications yet
            </CardContent>
          </Card>
        ) : (
          notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`transition-colors ${
                !notification.read ? "bg-accent/10" : ""
              }`}
              onClick={() => !notification.read && markAsRead(notification.id)}
            >
              <CardContent className="flex items-start justify-between p-6">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    {getNotificationBadge(notification.type)}
                    <h3 className="font-semibold">{notification.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatRelativeTime(notification.createdAt)}
                  </p>
                </div>
                {!notification.read && (
                  <div className="h-2 w-2 rounded-full bg-primary"></div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
