"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, AlertCircle, Check, X } from "lucide-react";
import { signIn } from "next-auth/react";

export function RegisterForm() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    privacyLevel: "ONLY_ME" as "PUBLIC" | "ONLY_ME" | "FRIENDS_ONLY",
    termsAccepted: false,
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    hasMinLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  const validatePassword = (password: string) => {
    const hasMinLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
      
      if (name === 'password') {
        validatePassword(value);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    
    // Validate form
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }
    
    if (passwordStrength.score < 3) {
      setErrorMessage("Password is too weak");
      return;
    }
    
    if (!formData.termsAccepted) {
      setErrorMessage("You must accept the terms and conditions");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Send registration request to API
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          privacyLevel: formData.privacyLevel,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Registration failed');
      }
      
      // Sign in the user automatically after registration
      const signInResult = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
        callbackUrl: "/profile?from=register"
      });
      
      if (signInResult?.error) {
        console.error("Auto sign-in failed:", signInResult.error);
        // If auto sign-in fails, redirect to login page with callback
        router.push(`/login?callbackUrl=/profile?from=register&email=${encodeURIComponent(formData.email)}`);
        return;
      }
      
      // Add a small delay to ensure the session is established
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Clear any existing welcome modal flag to ensure it shows for new users
      localStorage.removeItem('welcomeModalShown');
      
      // Redirect to profile page with a query parameter indicating the user is coming from registration
      router.push("/profile?from=register");
    } catch (error) {
      setErrorMessage((error as Error).message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrengthText = (score: number) => {
    if (score === 0) return "Very Weak";
    if (score === 1) return "Weak";
    if (score === 2) return "Moderate";
    if (score === 3) return "Strong";
    if (score >= 4) return "Very Strong";
    return "";
  };

  const getPasswordStrengthColor = (score: number) => {
    if (score === 0) return "bg-red-500";
    if (score === 1) return "bg-red-500";
    if (score === 2) return "bg-yellow-500";
    if (score === 3) return "bg-green-500";
    if (score >= 4) return "bg-green-500";
    return "bg-gray-300";
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm p-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && (
            <div className="bg-red-50 rounded-md p-3 flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
              <p className="text-red-700 text-sm">{errorMessage}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                autoComplete="given-name"
                required
                value={formData.firstName}
                onChange={handleInputChange}
                className="input w-full"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                autoComplete="family-name"
                required
                value={formData.lastName}
                onChange={handleInputChange}
                className="input w-full"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              className="input w-full"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="input w-full pr-10"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <Eye className="h-5 w-5" aria-hidden="true" />
                )}
              </button>
            </div>
            
            {formData.password && (
              <div className="mt-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-medium text-gray-700">Password Strength</span>
                  <span className="text-xs font-medium text-gray-700">
                    {getPasswordStrengthText(passwordStrength.score)}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getPasswordStrengthColor(passwordStrength.score)} transition-all duration-300 ease-in-out`}
                    style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                  ></div>
                </div>
                
                <ul className="mt-2 space-y-1">
                  <li className="flex items-center text-xs">
                    {passwordStrength.hasMinLength ? (
                      <Check className="h-3.5 w-3.5 text-green-500 mr-1.5" />
                    ) : (
                      <X className="h-3.5 w-3.5 text-gray-400 mr-1.5" />
                    )}
                    <span className={passwordStrength.hasMinLength ? "text-gray-700" : "text-gray-400"}>
                      At least 8 characters
                    </span>
                  </li>
                  <li className="flex items-center text-xs">
                    {passwordStrength.hasUppercase ? (
                      <Check className="h-3.5 w-3.5 text-green-500 mr-1.5" />
                    ) : (
                      <X className="h-3.5 w-3.5 text-gray-400 mr-1.5" />
                    )}
                    <span className={passwordStrength.hasUppercase ? "text-gray-700" : "text-gray-400"}>
                      At least one uppercase letter
                    </span>
                  </li>
                  <li className="flex items-center text-xs">
                    {passwordStrength.hasLowercase ? (
                      <Check className="h-3.5 w-3.5 text-green-500 mr-1.5" />
                    ) : (
                      <X className="h-3.5 w-3.5 text-gray-400 mr-1.5" />
                    )}
                    <span className={passwordStrength.hasLowercase ? "text-gray-700" : "text-gray-400"}>
                      At least one lowercase letter
                    </span>
                  </li>
                  <li className="flex items-center text-xs">
                    {passwordStrength.hasNumber ? (
                      <Check className="h-3.5 w-3.5 text-green-500 mr-1.5" />
                    ) : (
                      <X className="h-3.5 w-3.5 text-gray-400 mr-1.5" />
                    )}
                    <span className={passwordStrength.hasNumber ? "text-gray-700" : "text-gray-400"}>
                      At least one number
                    </span>
                  </li>
                  <li className="flex items-center text-xs">
                    {passwordStrength.hasSpecialChar ? (
                      <Check className="h-3.5 w-3.5 text-green-500 mr-1.5" />
                    ) : (
                      <X className="h-3.5 w-3.5 text-gray-400 mr-1.5" />
                    )}
                    <span className={passwordStrength.hasSpecialChar ? "text-gray-700" : "text-gray-400"}>
                      At least one special character
                    </span>
                  </li>
                </ul>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="input w-full pr-10"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={toggleConfirmPasswordVisibility}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <Eye className="h-5 w-5" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex h-5 items-center">
              <input
                id="termsAccepted"
                name="termsAccepted"
                type="checkbox"
                checked={formData.termsAccepted}
                onChange={handleInputChange}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                required
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="termsAccepted" className="text-gray-700">
                I agree to the{" "}
                <Link href="/terms" className="text-blue-600 hover:text-blue-800">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-blue-600 hover:text-blue-800">
                  Privacy Policy
                </Link>
              </label>
            </div>
          </div>

          <div>
            <button type="submit" className="btn btn-primary w-full" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Create account"}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">Or sign up with</span>
            </div>
          </div>

          <div className="mt-6">
            <button
              type="button"
              className="btn btn-outline w-full"
              onClick={() => signIn("google", { callbackUrl: "/" })}
            >
              <svg
                className="h-5 w-5 mr-2"
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Sign up with Google
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-800">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}