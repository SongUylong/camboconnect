"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";

export default function TwoFactorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    // Redirect if no email is provided
    if (!email) {
      router.push("/login");
    }
  }, [email, router]);

  useEffect(() => {
    // Set up countdown timer for resending code
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Verify the 2FA code
      const verifyResponse = await fetch("/api/auth/two-factor/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, code }),
      });

      const verifyData = await verifyResponse.json();

      if (!verifyResponse.ok || !verifyData.success) {
        setErrorMessage(verifyData.message || "Invalid verification code");
        setIsLoading(false);
        return;
      }

      // If verification is successful, sign in
      const result = await signIn("credentials", {
        email,
        twoFactorVerified: "true",
        twoFactorToken: verifyData.twoFactorVerifiedToken,
        redirect: false,
      });

      if (!result?.ok) {
        setErrorMessage("Failed to sign in. Please try again.");
        setIsLoading(false);
        return;
      }

      // Redirect to callback URL
      toast.success("Successfully verified! Redirecting...");
      router.push(callbackUrl);
      router.refresh();
    } catch (error) {
      console.error("Error during 2FA verification:", error);
      setErrorMessage("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/auth/two-factor/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setErrorMessage(data.message || "Failed to send verification code");
        setIsLoading(false);
        return;
      }

      toast.success("A new verification code has been sent to your email");
      setCountdown(60); // Set 60-second countdown for resending
      setIsLoading(false);
    } catch (error) {
      console.error("Error resending 2FA code:", error);
      setErrorMessage("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex justify-center">
          <span className="text-2xl font-bold text-blue-600">CamboConnect</span>
        </Link>
        <h2 className="mt-6 text-center text-2xl font-bold text-gray-900">
          Two-Factor Authentication
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Please enter the verification code sent to your email
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {errorMessage && (
              <div className="bg-red-50 rounded-md p-3 flex items-start">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                <p className="text-red-700 text-sm">{errorMessage}</p>
              </div>
            )}

            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                Verification Code
              </label>
              <div className="mt-1">
                <input
                  id="code"
                  name="code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={4}
                  autoComplete="one-time-code"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ""))}
                  className="input w-full text-center text-2xl tracking-widest"
                  placeholder="0000"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={isLoading || code.length !== 4}
              >
                {isLoading ? "Verifying..." : "Verify"}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={handleResendCode}
              disabled={isLoading || countdown > 0}
              className="text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
            >
              {countdown > 0
                ? `Resend code in ${countdown}s`
                : "Didn't receive a code? Resend"}
            </button>
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 