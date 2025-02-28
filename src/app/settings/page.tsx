"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { User, Bell, Shield, LogOut } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  // Account settings
  const [accountSettings, setAccountSettings] = useState({
    email: "user@example.com",
    name: "John Doe",
    username: "johndoe",
    phone: "+1 (555) 123-4567",
    language: "english",
    timezone: "UTC-5",
  });
  
  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    messageNotifications: true,
    applicationUpdates: true,
    opportunityAlerts: true,
    weeklyDigest: true,
    marketingEmails: false,
  });
  
  // Privacy settings
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: "public", // public, connections, private
    showEmail: false,
    showPhone: false,
    allowMessaging: true,
    allowTagging: true,
    showActivity: true,
    twoFactorAuth: false,
  });
  
  const handleAccountChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAccountSettings(prev => ({ ...prev, [name]: value }));
  };
  
  const handleNotificationToggle = (setting: string) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: !prev[setting],
    }));
  };
  
  const handlePrivacyChange = (setting: string, value: any) => {
    setPrivacySettings(prev => ({
      ...prev,
      [setting]: value,
    }));
  };
  
  const saveAccountSettings = async () => {
    setIsLoading(true);
    try {
      // API call to save account settings
      await fetch("/api/settings/account", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(accountSettings),
      });
      toast.success("Account settings saved successfully");
    } catch (error) {
      toast.error("Failed to save account settings");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const saveNotificationSettings = async () => {
    setIsLoading(true);
    try {
      // API call to save notification settings
      await fetch("/api/settings/notifications", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(notificationSettings),
      });
      toast.success("Notification settings saved successfully");
    } catch (error) {
      toast.error("Failed to save notification settings");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const savePrivacySettings = async () => {
    setIsLoading(true);
    try {
      // API call to save privacy settings
      await fetch("/api/settings/privacy", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(privacySettings),
      });
      toast.success("Privacy settings saved successfully");
    } catch (error) {
      toast.error("Failed to save privacy settings");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
      router.push("/login");
    } catch (error) {
      toast.error("Failed to log out");
      console.error(error);
    }
  };
  
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>
        
        <Tabs defaultValue="account" className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="account" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>Account</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span>Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>Privacy</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Account Settings */}
          <TabsContent value="account">
            <Card className="p-6">
              <h2 className="text-lg font-medium mb-4">Account Information</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={accountSettings.name}
                      onChange={handleAccountChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      name="username"
                      value={accountSettings.username}
                      onChange={handleAccountChange}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={accountSettings.email}
                      onChange={handleAccountChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={accountSettings.phone}
                      onChange={handleAccountChange}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <select
                      id="language"
                      name="language"
                      value={accountSettings.language}
                      onChange={handleAccountChange}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="english">English</option>
                      <option value="spanish">Spanish</option>
                      <option value="french">French</option>
                      <option value="german">German</option>
                      <option value="chinese">Chinese</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <select
                      id="timezone"
                      name="timezone"
                      value={accountSettings.timezone}
                      onChange={handleAccountChange}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="UTC-8">Pacific Time (UTC-8)</option>
                      <option value="UTC-7">Mountain Time (UTC-7)</option>
                      <option value="UTC-6">Central Time (UTC-6)</option>
                      <option value="UTC-5">Eastern Time (UTC-5)</option>
                      <option value="UTC+0">Greenwich Mean Time (UTC+0)</option>
                      <option value="UTC+1">Central European Time (UTC+1)</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-4 border-t">
                  <Button
                    variant="destructive"
                    onClick={handleLogout}
                    className="flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Log Out</span>
                  </Button>
                  
                  <Button
                    onClick={saveAccountSettings}
                    disabled={isLoading}
                  >
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>
          
          {/* Notification Settings */}
          <TabsContent value="notifications">
            <Card className="p-6">
              <h2 className="text-lg font-medium mb-4">Notification Preferences</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Email Notifications</h3>
                    <p className="text-sm text-gray-500">Receive notifications via email</p>
                  </div>
                  <Switch
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={() => handleNotificationToggle("emailNotifications")}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Push Notifications</h3>
                    <p className="text-sm text-gray-500">Receive notifications on your device</p>
                  </div>
                  <Switch
                    checked={notificationSettings.pushNotifications}
                    onCheckedChange={() => handleNotificationToggle("pushNotifications")}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Message Notifications</h3>
                    <p className="text-sm text-gray-500">Get notified when you receive messages</p>
                  </div>
                  <Switch
                    checked={notificationSettings.messageNotifications}
                    onCheckedChange={() => handleNotificationToggle("messageNotifications")}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Application Updates</h3>
                    <p className="text-sm text-gray-500">Get notified about your application status</p>
                  </div>
                  <Switch
                    checked={notificationSettings.applicationUpdates}
                    onCheckedChange={() => handleNotificationToggle("applicationUpdates")}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Opportunity Alerts</h3>
                    <p className="text-sm text-gray-500">Get notified about new opportunities matching your interests</p>
                  </div>
                  <Switch
                    checked={notificationSettings.opportunityAlerts}
                    onCheckedChange={() => handleNotificationToggle("opportunityAlerts")}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Weekly Digest</h3>
                    <p className="text-sm text-gray-500">Receive a weekly summary of activities</p>
                  </div>
                  <Switch
                    checked={notificationSettings.weeklyDigest}
                    onCheckedChange={() => handleNotificationToggle("weeklyDigest")}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Marketing Emails</h3>
                    <p className="text-sm text-gray-500">Receive promotional content and updates</p>
                  </div>
                  <Switch
                    checked={notificationSettings.marketingEmails}
                    onCheckedChange={() => handleNotificationToggle("marketingEmails")}
                  />
                </div>
                
                <div className="flex justify-end pt-4 border-t">
                  <Button
                    onClick={saveNotificationSettings}
                    disabled={isLoading}
                  >
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>
          
          {/* Privacy Settings */}
          <TabsContent value="privacy">
            <Card className="p-6">
              <h2 className="text-lg font-medium mb-4">Privacy & Security</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Profile Visibility</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="visibility-public"
                        name="profileVisibility"
                        value="public"
                        checked={privacySettings.profileVisibility === "public"}
                        onChange={() => handlePrivacyChange("profileVisibility", "public")}
                        className="h-4 w-4 text-blue-600"
                      />
                      <label htmlFor="visibility-public" className="ml-2 block text-sm">
                        Public - Anyone can view your profile
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="visibility-connections"
                        name="profileVisibility"
                        value="connections"
                        checked={privacySettings.profileVisibility === "connections"}
                        onChange={() => handlePrivacyChange("profileVisibility", "connections")}
                        className="h-4 w-4 text-blue-600"
                      />
                      <label htmlFor="visibility-connections" className="ml-2 block text-sm">
                        Connections Only - Only your connections can view your profile
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="visibility-private"
                        name="profileVisibility"
                        value="private"
                        checked={privacySettings.profileVisibility === "private"}
                        onChange={() => handlePrivacyChange("profileVisibility", "private")}
                        className="h-4 w-4 text-blue-600"
                      />
                      <label htmlFor="visibility-private" className="ml-2 block text-sm">
                        Private - Only you can view your profile
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Show Email Address</h3>
                    <p className="text-sm text-gray-500">Display your email on your profile</p>
                  </div>
                  <Switch
                    checked={privacySettings.showEmail}
                    onCheckedChange={(checked) => handlePrivacyChange("showEmail", checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Show Phone Number</h3>
                    <p className="text-sm text-gray-500">Display your phone number on your profile</p>
                  </div>
                  <Switch
                    checked={privacySettings.showPhone}
                    onCheckedChange={(checked) => handlePrivacyChange("showPhone", checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Allow Messaging</h3>
                    <p className="text-sm text-gray-500">Let others send you messages</p>
                  </div>
                  <Switch
                    checked={privacySettings.allowMessaging}
                    onCheckedChange={(checked) => handlePrivacyChange("allowMessaging", checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Allow Tagging</h3>
                    <p className="text-sm text-gray-500">Let others tag you in posts and comments</p>
                  </div>
                  <Switch
                    checked={privacySettings.allowTagging}
                    onCheckedChange={(checked) => handlePrivacyChange("allowTagging", checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Show Activity</h3>
                    <p className="text-sm text-gray-500">Show your activity to others</p>
                  </div>
                  <Switch
                    checked={privacySettings.showActivity}
                    onCheckedChange={(checked) => handlePrivacyChange("showActivity", checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Two-Factor Authentication</h3>
                    <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                  </div>
                  <Switch
                    checked={privacySettings.twoFactorAuth}
                    onCheckedChange={(checked) => handlePrivacyChange("twoFactorAuth", checked)}
                  />
                </div>
                
                <div className="flex justify-end pt-4 border-t">
                  <Button
                    onClick={savePrivacySettings}
                    disabled={isLoading}
                  >
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
