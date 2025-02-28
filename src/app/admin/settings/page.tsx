"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface PlatformSettings {
  general: {
    siteName: string;
    siteDescription: string;
    maintenanceMode: boolean;
    allowRegistration: boolean;
  };
  email: {
    fromName: string;
    fromEmail: string;
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPassword: string;
  };
  security: {
    maxLoginAttempts: number;
    sessionTimeout: number;
    passwordMinLength: number;
    requireEmailVerification: boolean;
  };
  features: {
    enableChat: boolean;
    enableNotifications: boolean;
    enableAnalytics: boolean;
    enableAPI: boolean;
  };
}

export default function AdminSettingsPage() {
  const { data: session } = useSession();
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/admin/settings");
        if (!response.ok) throw new Error("Failed to fetch settings");
        const data = await response.json();
        setSettings(data);
      } catch (error) {
        console.error("Error fetching settings:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) {
      fetchSettings();
    }
  }, [session]);

  const handleSave = async () => {
    if (!settings) return;

    setSaving(true);
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!response.ok) throw new Error("Failed to save settings");
    } catch (error) {
      console.error("Error saving settings:", error);
    } finally {
      setSaving(false);
    }
  };

  if (!session) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <p className="text-muted-foreground">Please sign in to manage settings</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <p className="text-muted-foreground">No settings data available</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Platform Settings</h1>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="min-w-[100px]"
        >
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>

      <div className="space-y-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div>
                <label className="text-sm font-medium">Site Name</label>
                <Input
                  value={settings.general.siteName}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      general: { ...settings.general, siteName: e.target.value },
                    })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Site Description</label>
                <Input
                  value={settings.general.siteDescription}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      general: {
                        ...settings.general,
                        siteDescription: e.target.value,
                      },
                    })
                  }
                />
              </div>
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium">Maintenance Mode</label>
                <Select
                  options={[
                    { value: "true", label: "Enabled" },
                    { value: "false", label: "Disabled" },
                  ]}
                  value={settings.general.maintenanceMode.toString()}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      general: {
                        ...settings.general,
                        maintenanceMode: e.target.value === "true",
                      },
                    })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Security Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div>
                <label className="text-sm font-medium">Max Login Attempts</label>
                <Input
                  type="number"
                  value={settings.security.maxLoginAttempts}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      security: {
                        ...settings.security,
                        maxLoginAttempts: parseInt(e.target.value),
                      },
                    })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Session Timeout (minutes)</label>
                <Input
                  type="number"
                  value={settings.security.sessionTimeout}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      security: {
                        ...settings.security,
                        sessionTimeout: parseInt(e.target.value),
                      },
                    })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feature Toggles */}
        <Card>
          <CardHeader>
            <CardTitle>Feature Toggles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              {Object.entries(settings.features).map(([key, value]) => (
                <div key={key} className="flex items-center space-x-4">
                  <label className="text-sm font-medium">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </label>
                  <Select
                    options={[
                      { value: "true", label: "Enabled" },
                      { value: "false", label: "Disabled" },
                    ]}
                    value={value.toString()}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        features: {
                          ...settings.features,
                          [key]: e.target.value === "true",
                        },
                      })
                    }
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
