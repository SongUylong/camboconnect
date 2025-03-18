"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Check, Loader2, RefreshCw, X } from "lucide-react";
import { toast } from "sonner";
import QRCode from "react-qr-code";

interface TelegramBindingProps {
  telegramConnected: boolean;
  telegramUsername?: string | null;
}

export default function TelegramBinding({ telegramConnected, telegramUsername }: TelegramBindingProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [telegramLink, setTelegramLink] = useState("");
  const [bindCode, setBindCode] = useState("");
  const [expiryTime, setExpiryTime] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState<number>(0);
  
  // Function to generate a new binding code
  const generateBindingCode = async () => {
    try {
      setIsLoading(true);
      console.log("Generating binding code...");
      
      const response = await fetch("/api/user/telegram/generate-code");
      console.log("Response status:", response.status);
      
      if (!response.ok) {
        throw new Error("Failed to generate Telegram binding code");
      }
      
      const data = await response.json();
      console.log("Binding code data:", {
        telegramLink: data.telegramLink,
        code: data.code,
        expires: data.expires
      });
      
      setTelegramLink(data.telegramLink);
      setBindCode(data.code);
      setExpiryTime(new Date(data.expires));
      
      // Start countdown
      setCountdown(15 * 60); // 15 minutes in seconds
    } catch (error) {
      console.error("Error generating Telegram binding code:", error);
      toast.error("Failed to generate Telegram binding code");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to disconnect Telegram
  const disconnectTelegram = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch("/api/user/telegram/disconnect", {
        method: "POST",
      });
      
      if (!response.ok) {
        throw new Error("Failed to disconnect Telegram");
      }
      
      toast.success("Telegram disconnected successfully");
      
      // Refresh the page to update the UI
      window.location.reload();
    } catch (error) {
      console.error("Error disconnecting Telegram:", error);
      toast.error("Failed to disconnect Telegram");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Update countdown timer
  useEffect(() => {
    if (countdown <= 0 || !expiryTime) return;
    
    const timer = setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);
    
    return () => clearInterval(timer);
  }, [countdown, expiryTime]);
  
  // Format the countdown as mm:ss
  const formatCountdown = () => {
    const minutes = Math.floor(countdown / 60);
    const seconds = countdown % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };
  
  // Check if the URL has a telegram=success parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("telegram") === "success") {
      toast.success("Telegram connected successfully!");
      
      // Remove the query parameter
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
      
      // Refresh the page to update the UI
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  }, []);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MessageCircle className="w-5 h-5 mr-2 text-blue-500" />
          Telegram Notifications
        </CardTitle>
        <CardDescription>
          Connect your Telegram account to receive notifications via Telegram.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {telegramConnected ? (
          <div className="flex items-center space-x-2 text-sm">
            <Check className="w-4 h-4 text-green-500" />
            <span>
              Connected to Telegram
              {telegramUsername && (
                <span className="ml-1 text-gray-500">(@{telegramUsername})</span>
              )}
            </span>
          </div>
        ) : telegramLink ? (
          <div className="flex flex-col items-center space-y-4">
            <div className="bg-white p-3 rounded-md">
              <QRCode value={telegramLink} size={150} />
            </div>
            
            <div className="text-center space-y-2">
              <p className="text-sm font-medium">Scan this QR code or click the button below to connect</p>
              
              <div className="flex items-center justify-center">
                <span className="px-3 py-1 bg-gray-100 rounded-md font-mono text-sm">
                  {bindCode}
                </span>
              </div>
              
              <p className="text-xs text-gray-500">
                Code expires in {formatCountdown()}
              </p>
            </div>
            
            <Button
              variant="outline"
              className="flex items-center space-x-2"
              onClick={() => {
                try {
                  window.open(telegramLink, "_blank");
                } catch (error) {
                  console.error("Error opening Telegram link:", error);
                  toast.error("Could not open Telegram. Please try again or copy the code manually.");
                }
              }}
            >
              <MessageCircle className="w-4 h-4" />
              <span>Open Telegram</span>
            </Button>
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            Not connected to Telegram. Click the button below to connect.
          </p>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-end">
        {telegramConnected ? (
          <Button
            variant="destructive"
            onClick={disconnectTelegram}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Disconnect
          </Button>
        ) : telegramLink ? (
          <Button
            variant="outline"
            onClick={generateBindingCode}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Generate New Code
          </Button>
        ) : (
          <Button
            onClick={generateBindingCode}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Connect Telegram
          </Button>
        )}
      </CardFooter>
    </Card>
  );
} 