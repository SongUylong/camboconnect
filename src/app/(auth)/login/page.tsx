import { LoginForm } from "@/components/auth/login-form";
import Link from "next/link";
import { CheckCircle, AlertCircle } from "lucide-react";

interface LoginPageProps {
  searchParams: {
    registered?: string;
    callbackUrl?: string;
    error?: string;
  };
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  const registered = searchParams.registered === "true";
  const isOAuthCallback = searchParams.error === "OAuthCallback";

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex justify-center">
          <span className="text-2xl font-bold text-blue-600">CamboConnect</span>
        </Link>
        <h2 className="mt-6 text-center text-2xl font-bold text-gray-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{" "}
          <Link href="/register" className="font-medium text-blue-600 hover:text-blue-800">
            create a new account
          </Link>
        </p>
      </div>

      {registered && (
        <div className="sm:mx-auto sm:w-full sm:max-w-md mt-4">
          <div className="rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <CheckCircle className="h-5 w-5 text-green-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Registration successful</h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>
                    Your account has been created! Please sign in with your credentials.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isOAuthCallback && (
        <div className="sm:mx-auto sm:w-full sm:max-w-md mt-4">
          <div className="rounded-md bg-yellow-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-yellow-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Account Already Exists</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    This account already exists. Please sign in with your email and password instead.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8">
        <LoginForm />
      </div>
    </div>
  );
}