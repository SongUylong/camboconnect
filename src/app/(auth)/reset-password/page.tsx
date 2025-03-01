"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Check, Eye, EyeOff, X, AlertTriangle } from "lucide-react";

const resetPasswordSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  token: z.string().min(1, { message: "Token is required" }),
  newPassword: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
    .regex(/[0-9]/, { message: "Password must contain at least one number" })
    .regex(/[^A-Za-z0-9]/, { message: "Password must contain at least one special character" }),
  confirmNewPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "Passwords do not match",
  path: ["confirmNewPassword"],
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    hasMinLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });
  
  const email = searchParams.get("email") || "";
  const token = searchParams.get("token") || "";
  
  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email,
      token,
      newPassword: "",
      confirmNewPassword: "",
    },
  });
  
  useEffect(() => {
    // If no token or email is provided, redirect to forgot password page
    if (!token || !email) {
      toast.error("Invalid or expired password reset link");
      router.push("/forgot-password");
    }
  }, [token, email, router]);
  
  const validatePassword = (password: string) => {
    const hasMinLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[^A-Za-z0-9]/.test(password);
    
    let score = 0;
    if (hasMinLength) score++;
    if (hasUppercase) score++;
    if (hasLowercase) score++;
    if (hasNumber) score++;
    if (hasSpecialChar) score++;
    
    setPasswordStrength({
      score,
      hasMinLength,
      hasUppercase,
      hasLowercase,
      hasNumber,
      hasSpecialChar,
    });
  };
  
  const onSubmit = async (data: ResetPasswordFormValues) => {
    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        // Check if token has expired
        if (result.error && result.error.includes("expired")) {
          setIsExpired(true);
          throw new Error(result.error);
        }
        throw new Error(result.error || "Failed to reset password");
      }
      
      setIsSuccess(true);
      toast.success("Password reset successful");
      
      // Redirect to login page after 3 seconds
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (error) {
      console.error("Error resetting password:", error);
      setErrorMessage((error as Error).message || "Failed to reset password. Please try again.");
      toast.error((error as Error).message || "Failed to reset password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isExpired) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4 py-12">
        <Card className="w-full max-w-md mx-auto shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Link Expired</CardTitle>
            <CardDescription className="text-sm text-gray-500">
              Your password reset link has expired
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6 space-y-4">
              <div className="bg-yellow-100 mx-auto rounded-full p-4 w-fit">
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="font-medium text-lg">Password Reset Link Expired</h3>
              <p className="text-muted-foreground">
                For security reasons, password reset links expire after 1 hour.
              </p>
              <Button 
                className="w-full h-10 mt-4" 
                onClick={() => router.push("/forgot-password")}
              >
                Request New Reset Link
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => router.push("/login")}
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to login</span>
            </Button>
            <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
          </div>
          <CardDescription className="text-sm text-gray-500">
            Create a new password for your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSuccess ? (
            <div className="text-center py-6 space-y-4">
              <div className="bg-green-100 mx-auto rounded-full p-4 w-fit">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-medium text-lg">Password Reset Successful</h3>
              <p className="text-muted-foreground">
                Your password has been reset successfully. You will be redirected to the login page.
              </p>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {errorMessage && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                    {errorMessage}
                  </div>
                )}
                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input 
                            placeholder="Enter your new password" 
                            type={showPassword ? "text" : "password"} 
                            className="h-10"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              validatePassword(e.target.value);
                            }}
                          />
                        </FormControl>
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" aria-hidden="true" />
                          ) : (
                            <Eye className="h-4 w-4" aria-hidden="true" />
                          )}
                        </button>
                      </div>
                      <div className="mt-2 space-y-2">
                        <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${
                              passwordStrength.score === 0 ? 'bg-gray-200' :
                              passwordStrength.score < 3 ? 'bg-red-500' :
                              passwordStrength.score < 5 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${passwordStrength.score * 20}%` }}
                          />
                        </div>
                        <ul className="text-xs space-y-1">
                          <li className="flex items-center gap-1">
                            {passwordStrength.hasMinLength ? 
                              <Check className="h-3 w-3 text-green-500" /> : 
                              <X className="h-3 w-3 text-red-500" />}
                            At least 8 characters
                          </li>
                          <li className="flex items-center gap-1">
                            {passwordStrength.hasUppercase ? 
                              <Check className="h-3 w-3 text-green-500" /> : 
                              <X className="h-3 w-3 text-red-500" />}
                            At least one uppercase letter
                          </li>
                          <li className="flex items-center gap-1">
                            {passwordStrength.hasLowercase ? 
                              <Check className="h-3 w-3 text-green-500" /> : 
                              <X className="h-3 w-3 text-red-500" />}
                            At least one lowercase letter
                          </li>
                          <li className="flex items-center gap-1">
                            {passwordStrength.hasNumber ? 
                              <Check className="h-3 w-3 text-green-500" /> : 
                              <X className="h-3 w-3 text-red-500" />}
                            At least one number
                          </li>
                          <li className="flex items-center gap-1">
                            {passwordStrength.hasSpecialChar ? 
                              <Check className="h-3 w-3 text-green-500" /> : 
                              <X className="h-3 w-3 text-red-500" />}
                            At least one special character
                          </li>
                        </ul>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmNewPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm New Password</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input 
                            placeholder="Confirm your new password" 
                            type={showConfirmPassword ? "text" : "password"} 
                            className="h-10"
                            {...field} 
                          />
                        </FormControl>
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" aria-hidden="true" />
                          ) : (
                            <Eye className="h-4 w-4" aria-hidden="true" />
                          )}
                        </button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="text-xs text-muted-foreground mt-2">
                  <p>Password reset links expire after 1 hour for security reasons.</p>
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-10 mt-2" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Resetting..." : "Reset Password"}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
        <CardFooter className="flex justify-center border-t pt-6">
          <div className="text-sm text-muted-foreground">
            Remember your password?{" "}
            <Link href="/login" className="text-primary font-medium hover:underline">
              Back to login
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
} 